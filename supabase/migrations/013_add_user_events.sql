-- 유저별 화면 방문 / 버튼 탭 로그

CREATE TYPE user_event_type AS ENUM ('screen_view', 'button_tap');

CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type user_event_type NOT NULL,
  name TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX user_events_user_id_idx ON user_events(user_id);
CREATE INDEX user_events_created_at_idx ON user_events(created_at);
CREATE INDEX user_events_name_idx ON user_events(name);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_events_insert_own" ON user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
