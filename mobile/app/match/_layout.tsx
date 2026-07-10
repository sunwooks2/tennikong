import { Stack } from 'expo-router';

export default function MatchLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: '경기 등록', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: '경기 상세' }} />
    </Stack>
  );
}
