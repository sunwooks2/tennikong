import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface ScoreStepperProps {
  value: string;
  onChange: (value: string) => void;
  colors: (typeof Colors)['light'];
  min?: number;
  max?: number;
}

export function ScoreStepper({ value, onChange, colors, min = 0, max = 99 }: ScoreStepperProps) {
  const parsed = Number.parseInt(value, 10);
  const current = Number.isNaN(parsed) ? 0 : parsed;

  const decrement = () => {
    onChange(String(Math.max(min, current - 1)));
  };

  const increment = () => {
    onChange(String(Math.min(max, current + 1)));
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.muted, backgroundColor: colors.background },
      ]}>
      <Pressable
        onPress={decrement}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          pressed && { backgroundColor: `${colors.tint}22` },
        ]}>
        <Text style={[styles.buttonText, { color: colors.tint }]}>−</Text>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.muted }]} />

      <Text style={[styles.value, { color: colors.text }]}>{current}</Text>

      <View style={[styles.divider, { backgroundColor: colors.muted }]} />

      <Pressable
        onPress={increment}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          pressed && { backgroundColor: `${colors.tint}22` },
        ]}>
        <Text style={[styles.buttonText, { color: colors.tint }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 17,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: '60%',
    opacity: 0.5,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
