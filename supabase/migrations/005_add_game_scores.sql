-- 게임별 점수 (몇 대 몇)
ALTER TABLE match_games
  ADD COLUMN IF NOT EXISTS my_score INT CHECK (my_score IS NULL OR my_score >= 0),
  ADD COLUMN IF NOT EXISTS opponent_score INT CHECK (opponent_score IS NULL OR opponent_score >= 0);
