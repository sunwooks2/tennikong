import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { handleAuthCallbackUrl, isNewUser } from '@/lib/auth';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('로그인 처리 중...');
  const nativeUrl = Linking.useURL();

  useEffect(() => {
    const processCallback = async () => {
      const url =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : nativeUrl;

      // On native, the deep-link URL may arrive a tick after this screen mounts.
      if (!url) return;

      try {
        const session = await handleAuthCallbackUrl(url);

        if (!session) {
          throw new Error('세션을 생성하지 못했습니다. Redirect URL 설정을 확인해 주세요.');
        }

        const isFirstLogin = isNewUser(session);

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/');
        }

        if (isFirstLogin) {
          router.replace({ pathname: '/(tabs)', params: { welcome: '1' } });
        } else {
          router.replace('/(tabs)');
        }
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
  }, [router, nativeUrl]);

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
