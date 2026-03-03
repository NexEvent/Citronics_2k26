-- ============================================================================
-- Migration 009: Populate event_details.prize from events.prize
-- Date: 2026-03-03
-- Description: Reads the prize string from events table (format:
--              "Total up to X: 1st Y, 2nd Z, 3rd W") and converts it
--              into a TEXT[] array on event_details. Also ensures every
--              event has a row in event_details.
-- ============================================================================

-- Step 1: Ensure every event has an event_details row
INSERT INTO event_details (event_id)
SELECT id FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_details ed WHERE ed.event_id = e.id
)
ON CONFLICT (event_id) DO NOTHING;

-- Step 2: Parse events.prize → event_details.prize as TEXT[]
-- Format: "Total up to 5000: 1st 2500, 2nd 1500, 3rd 1000"
-- Result: {'Total Prize Pool: ₹5,000', '1st Prize: ₹2,500', '2nd Prize: ₹1,500', '3rd Prize: ₹1,000'}
-- Entries with value 0 are excluded.
UPDATE event_details ed
SET prize = (
  SELECT array_remove(
    ARRAY[
      'Total Prize Pool: ₹' || trim(split_part(split_part(e.prize, 'Total up to ', 2), ':', 1)),
      CASE
        WHEN trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 1), ' ', 2)) != '0'
        THEN '1st Prize: ₹' || trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 1), ' ', 2))
        ELSE NULL
      END,
      CASE
        WHEN trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 2), ' ', 3)) != '0'
        THEN '2nd Prize: ₹' || trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 2), ' ', 3))
        ELSE NULL
      END,
      CASE
        WHEN trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 3), ' ', 3)) != '0'
        THEN '3rd Prize: ₹' || trim(split_part(split_part(split_part(e.prize, ': ', 2), ',', 3), ' ', 3))
        ELSE NULL
      END
    ],
    NULL
  )
  FROM events e
  WHERE e.id = ed.event_id
    AND e.prize IS NOT NULL
    AND e.prize != ''
)
WHERE EXISTS (
  SELECT 1 FROM events e
  WHERE e.id = ed.event_id
    AND e.prize IS NOT NULL
    AND e.prize != ''
);
