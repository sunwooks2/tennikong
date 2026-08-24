import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { category, content, contact } = await req.json();

    const clientId = Deno.env.get('KAKAO_REST_API_KEY');
    const clientSecret = Deno.env.get('KAKAO_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: '서버 환경 변수가 설정되지 않았습니다.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: tokenRow, error: tokenError } = await admin
      .from('app_kakao_token')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (tokenError || !tokenRow) {
      // 카카오 알림이 아직 연동되지 않은 상태. 개선제안 저장 자체는 이미 끝났으니 조용히 통과.
      return jsonResponse({ skipped: true });
    }

    let accessToken = tokenRow.access_token as string;

    if (new Date(tokenRow.expires_at).getTime() < Date.now() + 60_000) {
      const refreshRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenRow.refresh_token,
        }),
      });
      const refreshData = await refreshRes.json();

      if (!refreshData.access_token) {
        return jsonResponse({ error: '카카오 토큰 갱신 실패', detail: refreshData }, 500);
      }

      accessToken = refreshData.access_token;
      const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      await admin
        .from('app_kakao_token')
        .update({
          access_token: accessToken,
          refresh_token: refreshData.refresh_token ?? tokenRow.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
    }

    const categoryLabel =
      category === 'feature' ? '기능 추가' : category === 'bug' ? '버그 제보' : '기타';

    const text = [
      '🎾 테니콩 개선제안 도착',
      `유형: ${categoryLabel}`,
      `내용: ${content}`,
      contact ? `연락처: ${contact}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const sendRes = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        template_object: JSON.stringify({
          object_type: 'text',
          text,
          link: {
            web_url: 'https://tennikong.vercel.app',
            mobile_web_url: 'https://tennikong.vercel.app',
          },
        }),
      }),
    });

    const sendData = await sendRes.json();

    if (sendData.result_code !== 0) {
      return jsonResponse({ error: '카카오 메시지 전송 실패', detail: sendData }, 500);
    }

    return jsonResponse({ success: true });
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
