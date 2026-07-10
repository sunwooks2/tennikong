import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface ChipSelectorProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  colors: (typeof Colors)['light'];
}

export function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  colors,
}: ChipSelectorProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.tint : colors.card,
                  borderColor: selected ? colors.tint : colors.muted,
                },
              ]}>
              <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
