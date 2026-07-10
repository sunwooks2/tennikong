# 테니콩(Teni콩) — 시작 가이드

## 스택

| 역할 | 도구 |
|------|------|
| 모바일 앱 | Expo (React Native) |
| DB · Auth · API | Supabase |

## 1. Supabase DB 스키마 적용

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **SQL Editor** → New query
3. `supabase/migrations/001_initial_schema.sql` 내용 붙여넣기 → Run

## 2. 환경 변수 설정

```bash
cd mobile
cp .env.example .env
```

`.env` 파일에 Supabase URL과 anon key 입력:

- Dashboard → **Project Settings** → **API**
- `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3. 앱 실행

```bash
cd mobile
npm start
```

- **Android**: `a` 키 또는 `npm run android`
- **iOS** (Mac): `i` 키
- **실기기**: Expo Go 앱 설치 후 QR 스캔

## 프로젝트 구조

```
app_tennikong/
├── README              # 요구사항 정의서
├── SETUP.md            # 이 파일
├── supabase/
│   └── migrations/     # DB 스키마
└── mobile/             # Expo 앱
    ├── app/(tabs)/     # 화면 (달력·통계·성장·마이)
    ├── lib/            # Supabase 클라이언트
    ├── types/          # TypeScript 타입
    └── utils/          # 승패 계산 등
```

## 4. SNS 로그인 설정

### Supabase Redirect URL 등록

Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**에 추가:

```
tennikong://auth/callback
http://localhost:8081/auth/callback
```

Expo Go 개발 시 터미널에 표시되는 `exp://...` 주소도 추가하세요.

### Google

1. Dashboard → **Authentication** → **Providers** → **Google** 활성화
2. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth Client ID 생성
3. Client ID / Secret을 Supabase에 입력

### Apple

1. Dashboard → **Authentication** → **Providers** → **Apple** 활성화
2. Apple Developer에서 Service ID, Key 설정
3. iOS 실기기/EAS 빌드에서 네이티브 Apple 로그인 사용

### Kakao

1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Dashboard → **Authentication** → **Providers** → **Kakao** 활성화
4. REST API Key, Client Secret 입력

### Naver

1. [네이버 개발자센터](https://developers.naver.com/)에서 애플리케이션 등록
2. `mobile/.env`에 `EXPO_PUBLIC_NAVER_CLIENT_ID` 추가
3. Callback URL: `tennikong://auth/callback` (웹: `http://localhost:8081/auth/callback`)
4. Edge Function 배포:

```bash
# Supabase CLI 설치 후
supabase functions deploy naver-auth
supabase secrets set NAVER_CLIENT_ID=your-id NAVER_CLIENT_SECRET=your-secret
```

## 다음 개발 단계 (Phase 1)

1. ~~Supabase Auth — 구글/Apple/카카오/네이버 로그인~~ ✅
2. ~~달력 UI + 월간 요약 데이터 연동~~ ✅
3. 경기 등록/수정/삭제 CRUD
4. 경기 목록 · 상세 화면

## 트러블슈팅

### "Database error saving new user"

Google 로그인 후 이 오류가 나면 `profiles` 트리거 문제입니다.

1. Supabase **SQL Editor**에서 `supabase/migrations/002_fix_handle_new_user.sql` 실행
2. **Authentication → Users**에서 실패한 사용자 삭제 (있으면)
3. 다시 Google 로그인 시도

## 참고

- `db.txt`의 Postgres pooler 정보는 **서버/마이그레이션용**입니다.
- 모바일 앱에는 **anon key**만 사용하세요 (`service_role` key 금지).
