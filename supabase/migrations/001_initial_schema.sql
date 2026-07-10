-- 테니콩(Teni콩) 초기 스키마
-- Supabase SQL Editor 또는 CLI로 실행

-- enums
CREATE TYPE match_type AS ENUM (
  'mens_doubles',
  'womens_doubles',
  'mixed',
  'doubles',
  'singles'
);

CREATE TYPE court_type AS ENUM (
  'hard',
  'clay',
  'artificial_grass',
  'indoor',
  'other'
);

CREATE TYPE position_type AS ENUM ('fore', 'back');
CREATE TYPE match_result AS ENUM ('win', 'loss');

-- profiles (auth.users 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '',
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 경기
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_type match_type NOT NULL,
  court_type court_type NOT NULL,
  venue_name TEXT,
  my_name TEXT NOT NULL,
  partner_name TEXT,
  opponent1_name TEXT NOT NULL,
  opponent2_name TEXT,
  position position_type,
  result match_result NOT NULL,
  memo TEXT CHECK (char_length(memo) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_matches_user_date ON matches(user_id, match_date DESC)
  WHERE deleted_at IS NULL;

-- 세트 점수
CREATE TABLE match_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  set_number INT NOT NULL CHECK (set_number >= 1),
  my_score INT NOT NULL CHECK (my_score >= 0),
  opponent_score INT NOT NULL CHECK (opponent_score >= 0),
  UNIQUE (match_id, set_number)
);

-- 태그
CREATE TABLE match_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  UNIQUE (match_id, tag_name)
);

-- 월간 목표
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  target_count INT NOT NULL CHECK (target_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

-- 자동완성: 선수명
CREATE TABLE player_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  use_count INT NOT NULL DEFAULT 1,
  UNIQUE (user_id, name)
);

-- 자동완성: 경기장
CREATE TABLE venue_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  use_count INT NOT NULL DEFAULT 1,
  UNIQUE (user_id, name)
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 신규 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, profile_image_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      '테니스인'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_aliases ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- matches
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "matches_insert_own" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "matches_update_own" ON matches
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "matches_delete_own" ON matches
  FOR DELETE USING (auth.uid() = user_id);

-- match_sets (경기 소유자만)
CREATE POLICY "match_sets_select" ON match_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_sets_insert" ON match_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_sets_update" ON match_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_sets_delete" ON match_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );

-- match_tags
CREATE POLICY "match_tags_select" ON match_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_tags_insert" ON match_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "match_tags_delete" ON match_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );

-- monthly_goals
CREATE POLICY "monthly_goals_all_own" ON monthly_goals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- player_aliases
CREATE POLICY "player_aliases_all_own" ON player_aliases
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- venue_aliases
CREATE POLICY "venue_aliases_all_own" ON venue_aliases
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 월간 요약 뷰 (달력 상단용)
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
