-- 세트 동점(예: 1승 1패) 경기를 '무'로 저장
ALTER TYPE match_result ADD VALUE IF NOT EXISTS 'draw';

CREATE OR REPLACE VIEW monthly_match_summary AS
SELECT
  user_id,
  EXTRACT(YEAR FROM match_date)::INT AS year,
  EXTRACT(MONTH FROM match_date)::INT AS month,
  COUNT(*)::INT AS total,
  COUNT(*) FILTER (WHERE result = 'win')::INT AS wins,
  COUNT(*) FILTER (WHERE result = 'loss')::INT AS losses,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'win')::NUMERIC / NULLIF(COUNT(*), 0) * 100
  )::INT AS win_rate
FROM matches
WHERE deleted_at IS NULL
GROUP BY user_id, EXTRACT(YEAR FROM match_date), EXTRACT(MONTH FROM match_date);
