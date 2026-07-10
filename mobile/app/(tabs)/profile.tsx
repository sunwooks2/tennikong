import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSession } from '@/hooks/useSession';
import { signOut } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

const MENU_ITEMS = ['월간 목표', '데이터 백업', '데이터 복원', '문의하기'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, loading, displayName, user, profile } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const providerLabel = getProviderLabel(user?.app_metadata?.provider);

  const handleSignOut = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (error) {
            Alert.alert(
              '오류',
              error instanceof Error ? error.message : '로그아웃에 실패했습니다.',
            );
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>🎾</Text>
        </View>
        <Text style={[styles.nickname, { color: colors.text }]}>
          {isAuthenticated ? displayName : '테니콩'}
        </Text>
        <Text style={[styles.status, { color: colors.muted }]}>
          {!isSupabaseConfigured
            ? 'Supabase 연결 필요'
            : isAuthenticated
              ? `${providerLabel} 로그인 · ${user?.email ?? '이메일 없음'}`
              : '로그인하고 경기를 기록하세요'}
        </Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={[styles.notice, { backgroundColor: colors.card }]}>
          <Text style={[styles.noticeText, { color: colors.loss }]}>
            mobile/.env에 Supabase URL과 anon key를 설정해 주세요.
          </Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.loginSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>로그인</Text>
          <Text style={[styles.sectionDesc, { color: colors.muted }]}>
            SNS 계정으로 간편하게 시작하세요
          </Text>
          <SocialLoginButtons colors={colors} />
        </View>
      ) : (
        <>
          <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuText, { color: colors.text }]}>닉네임</Text>
            <Text style={[styles.menuValue, { color: colors.muted }]}>
              {profile?.nickname ?? displayName}
            </Text>
          </View>

          <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuText, { color: colors.text }]}>로그인 관리</Text>
            <Text style={[styles.menuValue, { color: colors.muted }]}>{providerLabel}</Text>
          </View>

          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item}
              style={[styles.menuItem, { backgroundColor: colors.card }]}>
              <Text style={[styles.menuText, { color: colors.text }]}>{item}</Text>
              <Text style={{ color: colors.muted }}>›</Text>
            </Pressable>
          ))}

          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={[styles.logoutButton, { borderColor: colors.loss }]}>
            {signingOut ? (
              <ActivityIndicator color={colors.loss} />
            ) : (
              <Text style={[styles.logoutText, { color: colors.loss }]}>로그아웃</Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function getProviderLabel(provider?: string): string {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'kakao':
      return '카카오';
    case 'naver':
      return '네이버';
    case 'apple':
      return 'Apple';
    default:
      return 'SNS';
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
  },
  status: {
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    borderRadius: 12,
    padding: 14,
  },
  noticeText: {
    fontSize: 13,
    textAlign: 'center',
  },
  loginSection: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
  },
  menuValue: {
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
