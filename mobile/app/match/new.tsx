import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MatchForm } from '@/components/match/MatchForm';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSession } from '@/hooks/useSession';
import { toDateKey } from '@/utils/date';

export default function MatchNewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { user, displayName, loading, isAuthenticated } = useSession();

  const initialDate = typeof date === 'string' && date.length > 0 ? date : toDateKey(new Date());

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.muted }]}>
          로그인 후 경기를 등록할 수 있습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MatchForm
        userId={user.id}
        defaultMyName={displayName}
        initialDate={initialDate}
        colors={colors}
        onSuccess={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
  },
});
