import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import {
  isNewUser,
  signInWithGoogle,
  signInWithKakao,
  signInWithNaver,
  type SocialProvider,
} from '@/lib/auth';

interface SocialLoginButtonsProps {
  colors: (typeof Colors)['light'];
  onSuccess?: () => void;
}

const PROVIDERS: {
  id: SocialProvider;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}[] = [
  { id: 'kakao', label: '카카오로 시작하기', backgroundColor: '#FEE500', textColor: '#191919' },
  {
    id: 'google',
    label: 'Google로 시작하기',
    backgroundColor: '#FFFFFF',
    textColor: '#1B4332',
    borderColor: '#DEE2E6',
  },
  { id: 'naver', label: '네이버로 시작하기', backgroundColor: '#03C75A', textColor: '#FFFFFF' },
];

export function SocialLoginButtons({ colors, onSuccess }: SocialLoginButtonsProps) {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const handleSignIn = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    try {
      let session;
      switch (provider) {
        case 'google':
          session = await signInWithGoogle();
          break;
        case 'kakao':
          session = await signInWithKakao();
          break;
        case 'naver':
          session = await signInWithNaver();
          break;
      }

      if (session) {
        if (isNewUser(session)) {
          router.replace({ pathname: '/(tabs)', params: { welcome: '1' } });
        } else {
          router.replace('/(tabs)');
        }
      }
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      if (!message.includes('취소')) {
        Alert.alert('로그인 실패', message);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      {PROVIDERS.map((provider) => (
        <Pressable
          key={provider.id}
          onPress={() => handleSignIn(provider.id)}
          disabled={loadingProvider !== null}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: provider.backgroundColor,
              borderColor: provider.borderColor ?? provider.backgroundColor,
              opacity: pressed || loadingProvider !== null ? 0.85 : 1,
            },
          ]}>
          {loadingProvider === provider.id ? (
            <ActivityIndicator color={provider.textColor} />
          ) : (
            <Text style={[styles.buttonText, { color: provider.textColor }]}>
              {provider.label}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
