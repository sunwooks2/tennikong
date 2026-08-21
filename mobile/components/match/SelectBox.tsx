import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface SelectBoxProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  colors: (typeof Colors)['light'];
}

export function SelectBox<T extends string>({
  options,
  value,
  onChange,
  colors,
}: SelectBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.box, { borderColor: colors.muted, backgroundColor: colors.card }]}>
        <Text style={[styles.boxText, { color: colors.text }]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Text style={[styles.chevron, { color: colors.muted }]}>▾</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <ScrollView bounces={false}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && { backgroundColor: `${colors.tint}18` }]}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: selected ? colors.tint : colors.text },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxText: {
    fontSize: 14,
    flexShrink: 1,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingVertical: 8,
    paddingBottom: 24,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
  },
});
