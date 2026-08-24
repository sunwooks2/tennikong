-- 개선제안(피드백) 저장 + 카카오톡 알림용 토큰 저장

CREATE TYPE feedback_category AS ENUM ('feature', 'bug', 'other');

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category feedback_category NOT NULL DEFAULT 'other',
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_own" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_select_own" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- 개발자 카카오 "나에게 보내기" 토큰 (단일 행, service_role만 접근 — RLS 활성화 + 정책 없음으로 전체 차단)
CREATE TABLE app_kakao_token (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_kakao_token ENABLE ROW LEVEL SECURITY;
