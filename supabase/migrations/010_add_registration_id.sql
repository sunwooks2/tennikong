-- 한 번의 등록(여러 경기)을 하나의 카드로 묶기 위한 배치 ID
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS registration_id UUID;

CREATE INDEX IF NOT EXISTS idx_matches_registration_id
  ON matches (registration_id)
  WHERE registration_id IS NOT NULL AND deleted_at IS NULL;
