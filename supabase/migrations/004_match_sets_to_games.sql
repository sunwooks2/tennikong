-- 세트 점수 → 게임별 승/패/무
ALTER TYPE match_result ADD VALUE IF NOT EXISTS 'draw';

ALTER TABLE match_sets RENAME TO match_games;
ALTER TABLE match_games RENAME COLUMN set_number TO game_number;

ALTER TABLE match_games ADD COLUMN result match_result;

UPDATE match_games
SET result = CASE
  WHEN my_score > opponent_score THEN 'win'::match_result
  WHEN my_score < opponent_score THEN 'loss'::match_result
  ELSE 'draw'::match_result
END;

ALTER TABLE match_games ALTER COLUMN result SET NOT NULL;
ALTER TABLE match_games DROP COLUMN my_score;
ALTER TABLE match_games DROP COLUMN opponent_score;

-- 정책 이름 정리 (테이블 rename 후에도 동작하지만 가독성)
DROP POLICY IF EXISTS "match_sets_select" ON match_games;
DROP POLICY IF EXISTS "match_sets_insert" ON match_games;
DROP POLICY IF EXISTS "match_sets_update" ON match_games;
DROP POLICY IF EXISTS "match_sets_delete" ON match_games;

CREATE POLICY "match_games_select" ON match_games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_games_insert" ON match_games
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_games_update" ON match_games
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_games_delete" ON match_games
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
