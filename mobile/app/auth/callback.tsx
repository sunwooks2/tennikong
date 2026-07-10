import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { handleAuthCallbackUrl } from '@/lib/auth';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const url =
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.href
            : null;

        if (!url) {
          throw new Error('콜백 URL을 찾을 수 없습니다.');
        }

        const session = await handleAuthCallbackUrl(url);

        if (!session) {
          throw new Error('세션을 생성하지 못했습니다. Redirect URL 설정을 확인해 주세요.');
        }

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/profile');
        }

        router.replace('/(tabs)/profile');
      } catch (error) {
        const text = error instanceof Error ? error.message : '로그인에 실패했습니다.';
        console.error('Auth callback error:', error);
        setMessage(text);
        Alert.alert('로그인 실패', text, [
          { text: '확인', onPress: () => router.replace('/(tabs)/profile') },
        ]);
      }
    };

    processCallback();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});
