import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NaverProfile {
  id: string;
  email?: string;
  nickname?: string;
  profile_image?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code || !redirect_uri) {
      return jsonResponse({ error: 'code와 redirect_uri가 필요합니다.' }, 400);
    }

    const clientId = Deno.env.get('NAVER_CLIENT_ID');
    const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: '서버 환경 변수가 설정되지 않았습니다.' }, 500);
    }

    const tokenUrl =
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(clientSecret)}` +
      `&code=${encodeURIComponent(code)}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return jsonResponse({ error: '네이버 토큰 발급 실패' }, 400);
    }

    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileJson = await profileRes.json();
    const profile = profileJson.response as NaverProfile;

    if (!profile?.id) {
      return jsonResponse({ error: '네이버 프로필 조회 실패' }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = profile.email ?? `naver_${profile.id}@tennikong.oauth`;
    const metadata = {
      full_name: profile.nickname ?? '네이버 사용자',
      avatar_url: profile.profile_image,
      provider: 'naver',
      naver_id: profile.id,
    };

    const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;

    const existing = existingUsers.users.find(
      (u) => u.user_metadata?.naver_id === profile.id || u.email === email,
    );

    let userId = existing?.id;

    if (!userId) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (createError) throw createError;
      userId = created.user.id;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkError) throw linkError;

    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return jsonResponse({ error: '세션 생성 실패' }, 500);
    }

    const linkUrl = new URL(actionLink);
    const token = linkUrl.searchParams.get('token');
    const type = linkUrl.searchParams.get('type');

    if (!token || !type) {
      return jsonResponse({ error: '인증 토큰 파싱 실패' }, 500);
    }

    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ token_hash: token, type }),
    });

    const sessionData = await verifyRes.json();

    if (!sessionData.access_token) {
      return jsonResponse({ error: '세션 발급 실패' }, 500);
    }

    return jsonResponse({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
