-- 경기 점수를 matches 테이블에 직접 저장 (경기 1건 = 선수 + 점수)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS my_score INT CHECK (my_score IS NULL OR my_score >= 0),
  ADD COLUMN IF NOT EXISTS opponent_score INT CHECK (opponent_score IS NULL OR opponent_score >= 0);

-- 기존 match_games 1건 데이터를 matches로 이전
UPDATE matches m
SET
  my_score = g.my_score,
  opponent_score = g.opponent_score,
  result = g.result
FROM (
  SELECT DISTINCT ON (match_id)
    match_id,
    my_score,
    opponent_score,
    result
  FROM match_games
  ORDER BY match_id, game_number
) g
WHERE m.id = g.match_id
  AND m.my_score IS NULL
  AND g.my_score IS NOT NULL;
