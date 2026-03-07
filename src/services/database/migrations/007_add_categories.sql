

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed categories
INSERT INTO categories (name) VALUES
('Mechanical'),
('Robotics'),
('Software'),
('Law'),
('Civil'),
('Innovation'),
('Project Competition'),
('Pharmacy'),
('Management')
ON CONFLICT (name) DO NOTHING;


-- Add category_id to events
ALTER TABLE events
ADD COLUMN IF NOT EXISTS category_id BIGINT
REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_category_id
ON events(category_id);


-- Mechanical
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Mechanical')
WHERE name IN (
'Battle of Design',
'Auto Quest'
);


-- Robotics
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Robotics')
WHERE name IN (
'ROBO Soccer',
'ROBO Race',
'Line Follower',
'ROBO Swim'
);


-- Civil
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Civil')
WHERE name IN (
'Arch Mania',
'Newspaper Tall Structure',
'ZENGA Block'
);


-- Software
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Software')
WHERE name IN (
'Codeology',
'The Tech - Commercial show',
'AI Image Story Creation',
'Build your own Chatbot',
'DesignVerse: UI/UX & AI Design Challenge',
'Prompt it Right – AI Image Prompt Battle',
'Tech Bingo (Tambola)'
);


-- Pharmacy
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Pharmacy')
WHERE name IN (
'Pharmathon',
'Pharma Model',
'Pharma Innoventia'
);


-- Project Competition
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Project Competition')
WHERE name IN (
'Project Competition-Software',
'Project Competition-Hardware'
);


-- Management
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Management')
WHERE name IN (
'Boardroom Battle',
'Reel to Deal',
'Clash of Titan',
'AI Slave',
'AD-MAD Show',
'Brand Quiz',
'Share Market Simulation',
'Business Ethics Decision Making'
);


-- Law
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Law')
WHERE name IN (
'Debate Competition',
'Youth Parliament'
);


-- Innovation
UPDATE events
SET category_id = (SELECT id FROM categories WHERE name = 'Innovation')
WHERE name IN (
'Reel Making Competition on CITRONICS 2K26 Theme',
'Shark Tank: AI theme Indore City Problem',
'INNOVATE 2026: Science Model Exhibition'
);