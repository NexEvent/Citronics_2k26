


-- 1. Add date column to events table
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS date VARCHAR(100);

-- 2. Populate all rows from start_time (e.g. "8 April", "9 April")
UPDATE events
SET date = TO_CHAR(start_time, 'FMDD Month')
WHERE date IS NULL;


UPDATE events SET date = '8-10 Apr'  WHERE name = 'ZENGA Block';
UPDATE events SET date = '8-9 April' WHERE name = 'ROBO Soccer';
UPDATE events SET date = '8-9 April' WHERE name = 'ROBO Race';
UPDATE events SET date = '8-10 Apr'  WHERE name = 'Arch Mania';
UPDATE events SET date = '8-9 April' WHERE name = 'Reel to Deal';
UPDATE events SET date = '8-9 April' WHERE name = 'AD-MAD Show';
UPDATE events SET date = '9-10 April' WHERE name = 'SUSTAINABILITY: The Smart Indore Pitch';



