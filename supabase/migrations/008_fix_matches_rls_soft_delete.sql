-- soft delete 후 UPDATE/검증이 막히지 않도록 RLS 정리
-- (deleted_at 필터는 앱 쿼리에서 처리)

DROP POLICY IF EXISTS "matches_select_own" ON matches;
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "matches_update_own" ON matches;
CREATE POLICY "matches_update_own" ON matches
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
