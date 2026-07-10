-- 등록 묶음 내 경기 표시 순서
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS registration_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_matches_registration_order
  ON matches (registration_id, registration_order)
  WHERE deleted_at IS NULL;

-- 기존 데이터: registration_id별 created_at 순으로 순번 부여
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY registration_id
      ORDER BY created_at ASC, id ASC
    ) AS ord
  FROM matches
  WHERE registration_id IS NOT NULL
    AND deleted_at IS NULL
)
UPDATE matches AS m
SET registration_order = ranked.ord
FROM ranked
WHERE m.id = ranked.id;

-- registration_id 없는 레거시: 같은 날짜·유형·선수·경기장·메모 묶음 내 순번
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        match_date,
        match_type,
        my_name,
        COALESCE(partner_name, ''),
        opponent1_name,
        COALESCE(opponent2_name, ''),
        COALESCE(venue_name, ''),
        COALESCE(memo, '')
      ORDER BY created_at ASC, id ASC
    ) AS ord
  FROM matches
  WHERE registration_id IS NULL
    AND deleted_at IS NULL
)
UPDATE matches AS m
SET registration_order = ranked.ord
FROM ranked
WHERE m.id = ranked.id
  AND m.registration_order IS NULL;
