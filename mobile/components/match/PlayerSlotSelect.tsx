import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface PlayerSlotSelectProps {
  positionLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  colors: (typeof Colors)['light'];
}

export function PlayerSlotSelect({
  positionLabel,
  value,
  options,
  onChange,
  colors,
}: PlayerSlotSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.slot, { borderColor: colors.muted, backgroundColor: colors.background }]}>
        <Text style={[styles.positionLabel, { color: colors.muted }]}>{positionLabel}</Text>
        <Text
          style={[styles.slotValue, { color: value ? colors.text : colors.muted }]}
          numberOfLines={1}>
          {value || '선택'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: colors.card }]}>
            {options.length === 0 ? (
              <Text style={[styles.empty, { color: colors.muted }]}>
                선택 가능한 선수가 없습니다.
              </Text>
            ) : (
              options.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  style={[styles.menuItem, value === name && { backgroundColor: `${colors.tint}22` }]}>
                  <Text style={{ color: colors.text, fontWeight: value === name ? '700' : '500' }}>
                    {name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  slotValue: {
    fontSize: 10,
    fontWeight: '700',
    maxWidth: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 32,
  },
  menu: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  empty: {
    padding: 16,
    textAlign: 'center',
  },
});
