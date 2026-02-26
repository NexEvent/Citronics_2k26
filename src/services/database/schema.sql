-- ============================================================================
-- Citronics — Full Database Schema
-- Generated: 2026-02-24
-- 
-- This is the canonical source-of-truth for the DB structure.
-- Individual changes should go through numbered migration files.
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('student', 'admin', 'organizer');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status   AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE event_status     AS ENUM ('draft', 'published', 'active', 'cancelled', 'completed');
CREATE TYPE event_visibility AS ENUM ('public', 'private', 'invite_only', 'college_only');

-- ── Users ──────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),              -- nullable for Google OAuth users
    role          user_role NOT NULL,
    verified      BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role);

-- ── Students ───────────────────────────────────────────────────────────────────
CREATE TABLE students (
    user_id     BIGINT PRIMARY KEY,
    student_id  VARCHAR(50) UNIQUE,
    college     VARCHAR(255) NOT NULL,
    city        VARCHAR(255) NOT NULL,
    referred_by    BIGINT,
    referral_code  VARCHAR(10) UNIQUE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)            ON DELETE CASCADE,
    FOREIGN KEY (referred_by) REFERENCES students(user_id)    ON DELETE SET NULL
);

CREATE INDEX idx_students_college       ON students(college);
CREATE INDEX idx_students_city          ON students(city);
CREATE INDEX idx_students_referred_by   ON students(referred_by);
CREATE INDEX idx_students_referral_code ON students(referral_code);

-- Enforce student role trigger
CREATE OR REPLACE FUNCTION enforce_student_role()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT role FROM users WHERE id = NEW.user_id) != 'student' THEN
        RAISE EXCEPTION 'User must have role ''student'' to be in students table';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_role
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION enforce_student_role();

-- ── Departments ────────────────────────────────────────────────────────────────
CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── Events ─────────────────────────────────────────────────────────────────────
CREATE TABLE events (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    tagline       VARCHAR(255),
    description   TEXT,
    start_time    TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time      TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
    venue         VARCHAR(255),
    max_tickets   INTEGER NOT NULL CHECK (max_tickets > 0),
    ticket_price  DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (ticket_price >= 0),
    registered    INTEGER NOT NULL DEFAULT 0 CHECK (registered >= 0),
    prize         VARCHAR(100),
    tags          TEXT[] NOT NULL DEFAULT '{}',
    featured      BOOLEAN NOT NULL DEFAULT FALSE,
    images        JSONB NOT NULL DEFAULT '[]'::jsonb,
    department_id BIGINT,
    created_by    BIGINT,
    status        event_status NOT NULL DEFAULT 'draft',
    visibility    event_visibility NOT NULL DEFAULT 'public',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)    REFERENCES users(id)       ON DELETE SET NULL
);

CREATE INDEX idx_events_department_id    ON events(department_id);
CREATE INDEX idx_events_start_time       ON events(start_time);
CREATE INDEX idx_events_status           ON events(status);
CREATE INDEX idx_events_created_by       ON events(created_by);
CREATE INDEX idx_events_active_published ON events(status, start_time) WHERE status IN ('published', 'active');
CREATE INDEX idx_events_featured         ON events(featured) WHERE featured = TRUE;
CREATE INDEX idx_events_registered       ON events(registered DESC);

-- ── Bookings ───────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    event_id         BIGINT NOT NULL,
    quantity         INTEGER NOT NULL CHECK (quantity > 0),
    price_at_booking DECIMAL(10, 2) NOT NULL CHECK (price_at_booking >= 0),
    total_amount     DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status           booking_status NOT NULL DEFAULT 'pending',
    expires_at       TIMESTAMP WITH TIME ZONE,
    booked_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (total_amount = quantity * price_at_booking),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_bookings_unique_confirmed ON bookings (user_id, event_id) WHERE status = 'confirmed';
CREATE INDEX idx_bookings_user_id            ON bookings(user_id);
CREATE INDEX idx_bookings_event_id_status    ON bookings(event_id, status);
CREATE INDEX idx_bookings_status_expires_at  ON bookings(status, expires_at);

-- ── Tickets ────────────────────────────────────────────────────────────────────
CREATE TABLE tickets (
    id           BIGSERIAL PRIMARY KEY,
    booking_id   BIGINT NOT NULL,
    qr_code      UUID NOT NULL UNIQUE,
    check_in_at  TIMESTAMP WITH TIME ZONE,
    check_in_by  BIGINT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (check_in_by) REFERENCES users(id)    ON DELETE SET NULL
);

CREATE INDEX idx_tickets_booking_id  ON tickets(booking_id);
CREATE INDEX idx_tickets_qr_code     ON tickets(qr_code);
CREATE INDEX idx_tickets_check_in_at ON tickets(check_in_at);
CREATE INDEX idx_tickets_check_in_by ON tickets(check_in_by);

-- ── Payments ───────────────────────────────────────────────────────────────────
CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    booking_id          BIGINT NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    gateway             VARCHAR(50) NOT NULL DEFAULT 'HDFC',
    gateway_version     VARCHAR(20),
    transaction_id      VARCHAR(255),
    idempotency_key     VARCHAR(255) NOT NULL UNIQUE,
    raw_payload         JSONB,
    webhook_signature   VARCHAR(255),
    webhook_received_at TIMESTAMP WITH TIME ZONE,
    status              payment_status NOT NULL DEFAULT 'pending',
    paid_at             TIMESTAMP WITH TIME ZONE,
    refund_amount       DECIMAL(10, 2) CHECK (refund_amount >= 0),
    refund_at           TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_booking_id      ON payments(booking_id);
CREATE INDEX idx_payments_status          ON payments(status);
CREATE INDEX idx_payments_idempotency_key ON payments(idempotency_key);

-- ── Migration tracking ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
