-- 경기별 포/백 라인업
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS our_fore_name TEXT,
  ADD COLUMN IF NOT EXISTS our_back_name TEXT,
  ADD COLUMN IF NOT EXISTS opponent_fore_name TEXT,
  ADD COLUMN IF NOT EXISTS opponent_back_name TEXT;

UPDATE matches
SET
  our_fore_name = CASE WHEN position = 'fore' THEN my_name ELSE partner_name END,
  our_back_name = CASE WHEN position = 'fore' THEN partner_name ELSE my_name END,
  opponent_fore_name = opponent1_name,
  opponent_back_name = opponent2_name
WHERE our_fore_name IS NULL
  AND partner_name IS NOT NULL
  AND opponent2_name IS NOT NULL;
