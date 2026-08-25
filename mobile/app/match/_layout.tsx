import { Stack } from 'expo-router';

import { FeedbackButton } from '@/components/brand/FeedbackButton';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSession } from '@/hooks/useSession';

export default function MatchLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useSession();

  const headerRight = () => <FeedbackButton colors={colors} userId={user?.id} />;

  return (
    <Stack screenOptions={{ headerRight }}>
      <Stack.Screen name="new" options={{ title: '경기 등록', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: '경기 상세' }} />
      <Stack.Screen name="edit/[id]" options={{ title: '경기 수정', presentation: 'modal' }} />
    </Stack>
  );
}
