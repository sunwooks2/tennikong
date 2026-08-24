import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(`카카오 인증 실패: ${error}`, { status: 400 });
  }
  if (!code) {
    return new Response('code가 없습니다.', { status: 400 });
  }

  const clientId = Deno.env.get('KAKAO_REST_API_KEY');
  const clientSecret = Deno.env.get('KAKAO_CLIENT_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response('서버 환경 변수가 설정되지 않았습니다.', { status: 500 });
  }

  const redirectUri = `${supabaseUrl}/functions/v1/kakao-oauth-callback`;

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return new Response(`토큰 발급 실패: ${JSON.stringify(tokenData)}`, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: dbError } = await admin.from('app_kakao_token').upsert({
    id: 1,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  if (dbError) {
    return new Response(`저장 실패: ${dbError.message}`, { status: 500 });
  }

  return new Response('카카오톡 알림 연동 완료! 이 창은 닫으셔도 됩니다.', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
});
