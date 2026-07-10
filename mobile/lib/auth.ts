import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import type { Provider } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 'google' | 'kakao' | 'apple' | 'naver';

export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'tennikong',
    path: 'auth/callback',
  });
}

function parseAuthParams(url: string): Record<string, string> {
  const { params } = QueryParams.getQueryParams(url);

  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(url);
      const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
      const hashParams = Object.fromEntries(new URLSearchParams(hash).entries());
      return { ...hashParams, ...params };
    } catch {
      return params;
    }
  }

  return params;
}

export async function createSessionFromUrl(url: string) {
  const params = parseAuthParams(url);
  const errorCode = params.error || params.error_code;
  const errorDescription = params.error_description;

  if (errorCode) {
    throw new Error(errorDescription || errorCode);
  }

  const { code, access_token, refresh_token } = params;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  if (access_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token ?? '',
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}

async function signInWithOAuthProvider(provider: Provider | 'kakao') {
  const redirectTo = getAuthRedirectUri();

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('OAuth URL을 가져오지 못했습니다.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    await createSessionFromUrl(result.url);
    return;
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('로그인이 취소되었습니다.');
  }
}

export async function signInWithGoogle() {
  await signInWithOAuthProvider('google');
}

export async function signInWithKakao() {
  await signInWithOAuthProvider('kakao');
}

export async function signInWithApple() {
  if (Platform.OS === 'ios') {
    const available = await AppleAuthentication.isAvailableAsync();
    if (available) {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple 로그인 토큰을 받지 못했습니다.');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;
      return;
    }
  }

  await signInWithOAuthProvider('apple');
}

export async function signInWithNaver() {
  const clientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      '네이버 로그인 Client ID가 설정되지 않았습니다. mobile/.env에 EXPO_PUBLIC_NAVER_CLIENT_ID를 추가하세요.',
    );
  }

  const redirectUri = getAuthRedirectUri();
  const state = Math.random().toString(36).slice(2);
  const authUrl =
    `https://nid.naver.com/oauth2.0/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  if (Platform.OS === 'web') {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('naver_auth_pending', '1');
    }
    window.location.href = authUrl;
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success') {
    throw new Error('네이버 로그인이 취소되었습니다.');
  }

  const { params } = QueryParams.getQueryParams(result.url);
  const code = params.code;

  if (!code) {
    throw new Error('네이버 인증 코드를 받지 못했습니다.');
  }

  const { data, error } = await supabase.functions.invoke('naver-auth', {
    body: { code, redirect_uri: redirectUri },
  });

  if (error) throw error;
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error(data?.error ?? '네이버 로그인에 실패했습니다.');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  if (sessionError) throw sessionError;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function handleAuthCallbackUrl(url: string) {
  const {
    data: { session: existingSession },
  } = await supabase.auth.getSession();
  if (existingSession) return existingSession;

  const params = parseAuthParams(url);

  if (
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('naver_auth_pending') === '1' &&
    params.code
  ) {
    sessionStorage.removeItem('naver_auth_pending');
    const redirectUri = getAuthRedirectUri();
    const { data, error } = await supabase.functions.invoke('naver-auth', {
      body: { code: params.code, redirect_uri: redirectUri },
    });
    if (error) throw error;
    if (!data?.access_token || !data?.refresh_token) {
      throw new Error(data?.error ?? '네이버 로그인에 실패했습니다.');
    }
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (sessionError) throw sessionError;
    return (await supabase.auth.getSession()).data.session;
  }

  const hasAuthParams =
    params.code ||
    params.access_token ||
    url.includes('auth/callback') ||
    url.includes('code=') ||
    url.includes('access_token');

  if (!hasAuthParams) {
    return null;
  }

  const session = await createSessionFromUrl(url);
  if (session) return session;

  const {
    data: { session: recoveredSession },
  } = await supabase.auth.getSession();
  return recoveredSession;
}
