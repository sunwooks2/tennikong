import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { APP_NAME } from '@/constants/app';
import Colors from '@/constants/Colors';
import { useSession } from '@/hooks/useSession';

import { BeanIcon } from './BeanIcon';
import { FeedbackButton } from './FeedbackButton';

export function AppHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: `${colors.muted}22`,
          paddingTop: Math.max(insets.top, 12),
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.side} />
        <View style={styles.brandRow}>
          <BeanIcon size={36} tone="brand" />
          <Text style={[styles.title, { color: colors.tint }]}>{APP_NAME}</Text>
        </View>
        <View style={[styles.side, styles.sideRight]}>
          <FeedbackButton colors={colors} userId={user?.id} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    flex: 1,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
});
