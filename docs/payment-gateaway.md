# Payment Gateway — HDFC SmartGateway (Juspay)

## Overview

Citronics uses **HDFC SmartGateway** powered by **Juspay** for payment processing. The integration uses the `expresscheckout-nodejs` SDK with JWE/JWS RSA key authentication.

**Sandbox URL:** `https://smartgateway.hdfcuat.bank.in`  
**Production URL:** `https://smartgateway.hdfcbank.com`  
**Docs:** [https://docs.hdfcbank.juspay.in](https://docs.hdfcbank.juspay.in)

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Frontend   │────►│  Next.js API      │────►│  Juspay (HDFC)      │
│  (React/MUI) │     │  /api/payment/*   │     │  SmartGateway       │
└──────────────┘     └──────────────────┘     └─────────────────────┘
       │                      │                         │
       │              ┌───────┴────────┐                │
       │              │   PostgreSQL   │◄───────────────┘
       │              │   (payments,   │          (webhook)
       │              │    bookings,   │
       │              │    tickets)    │
       │              └────────────────┘
       │                      │
       ◄──────────────────────┘
         (verified tickets)
```

### Payment Flow

1. **User clicks "Pay Now"** → Frontend calls `POST /api/payment/initiate`
2. **Server creates pending bookings** → Reserves seats with 15-min expiry
3. **Server creates Juspay order session** → Gets SDK payload / payment URL
4. **User redirected to Juspay payment page** → UPI, Cards, Net Banking, Wallets
5. **User completes payment** → Juspay redirects to `GET /api/payment/callback`
6. **Server verifies payment with Juspay API** → NEVER trusts frontend
7. **On CHARGED**: Bookings confirmed, tickets generated with QR codes
8. **On FAILED**: Bookings cancelled, seats released
9. **User sees payment status page** with tickets (on success)

---

## Environment Variables

```env
# Required
JUSPAY_MERCHANT_ID=your_merchant_id
JUSPAY_KEY_UUID=your_key_uuid
JUSPAY_PAYMENT_PAGE_CLIENT_ID=your_payment_page_client_id
JUSPAY_ENV=sandbox                        # 'sandbox' or 'production'

# RSA Keys (PEM format, newlines escaped as \n)
JUSPAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
JUSPAY_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
```

---

## API Endpoints

### `POST /api/payment/initiate`

Creates pending bookings and initiates a Juspay payment session.

**Request:**
```json
{
  "userId": 42,
  "items": [
    { "eventId": 1, "quantity": 2 },
    { "eventId": 3, "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "CIT-1709123456789-A3B2C1",
    "sdkPayload": { "payment_links": { "web": "https://..." } },
    "paymentId": 15,
    "amount": 500.00,
    "bookings": [
      { "bookingId": 22, "eventId": 1, "eventTitle": "...", "quantity": 2, "totalAmount": 400 },
      { "bookingId": 23, "eventId": 3, "eventTitle": "...", "quantity": 1, "totalAmount": 100 }
    ]
  }
}
```

### `POST /api/payment/verify`

Verifies payment status with Juspay (server-side). Confirms bookings and generates tickets on success.

**Request:**
```json
{ "orderId": "CIT-1709123456789-A3B2C1" }
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "message": "Payment confirmed successfully",
    "payment": { "id": 15, "status": "success", "transactionId": "TXN123" },
    "tickets": [
      {
        "ticketId": 1,
        "qrCode": "uuid-v4-here",
        "eventTitle": "Coding Contest",
        "venue": "Hall A",
        "startTime": "2026-03-15T10:00:00Z"
      }
    ]
  }
}
```

### `GET /api/payment/callback`

Juspay redirects here after payment. Verifies payment and redirects to `/checkout/payment-status`.

### `GET /api/payment/status?orderId=xxx`

Quick status check for frontend polling (uses DB, not Juspay API).

### `GET /api/payment/tickets?userId=xxx`

Fetch all tickets for a user.

### `POST /api/payment/webhook`

Juspay webhook for async payment notifications. Processes payment even if user closes browser.

---

## Database Schema

### payments table (additional Juspay columns)

```sql
ALTER TABLE payments
  ADD COLUMN juspay_order_id VARCHAR(255) UNIQUE,
  ADD COLUMN payment_method VARCHAR(100),
  ADD COLUMN payment_method_type VARCHAR(50),
  ADD COLUMN gateway_status VARCHAR(50),
  ADD COLUMN gateway_response_code VARCHAR(50),
  ADD COLUMN gateway_response_message TEXT,
  ADD COLUMN sdk_payload JSONB;
```

### tickets table

Each ticket has a UUID `qr_code` for check-in scanning. One ticket per quantity unit.

---

## Security Principles

1. **Never trust frontend amounts** — All prices are re-computed from DB during booking creation
2. **Server-side verification** — Payment status is ALWAYS verified via Juspay API (`juspay.order.status()`)
3. **Idempotent operations** — Each payment has a unique `idempotency_key`; re-verification is safe
4. **Seat reservation with expiry** — Pending bookings expire after 15 minutes
5. **Transaction safety** — All booking + payment + ticket operations use DB transactions
6. **Webhook backup** — Even if redirect fails, webhook processes the payment

---

## File Structure

```
src/
  lib/
    juspay.js                    # Juspay SDK initialization (singleton)
  services/
    payment-service.js           # Payment business logic
    checkout-service.js          # Checkout validation & registration
  pages/
    api/
      payment/
        initiate.js              # Create order session
        verify.js                # Verify payment (source of truth)
        callback.js              # Juspay redirect handler
        status.js                # Quick status check
        tickets.js               # User ticket retrieval
        webhook.js               # Async webhook handler
    checkout/
      payment-status.js          # Post-payment status page
  store/
    slices/
      checkoutSlice.js           # Redux state (includes payment flow)
  views/
    checkout/
      CheckoutView.js            # Checkout UI (Pay Now button)
```

---

## Testing (Sandbox)

1. Set `JUSPAY_ENV=sandbox` in `.env`
2. Use sandbox credentials from HDFC SmartGateway dashboard
3. Test card numbers from [Juspay sandbox docs](https://docs.hdfcbank.juspay.in)
4. Verify payment status appears correctly on `/checkout/payment-status`

---

## Free Events

Events with `ticket_price = 0` skip the payment flow entirely and use direct booking confirmation via `PATCH /api/checkout`. The frontend auto-detects this based on `grandTotal`.

