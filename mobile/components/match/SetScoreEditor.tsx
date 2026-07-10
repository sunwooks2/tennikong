import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { SetScoreInput } from '@/utils/matchForm';

interface SetScoreEditorProps {
  sets: SetScoreInput[];
  onChange: (sets: SetScoreInput[]) => void;
  colors: (typeof Colors)['light'];
}

export function SetScoreEditor({ sets, onChange, colors }: SetScoreEditorProps) {
  const updateSet = (index: number, field: 'my_score' | 'opponent_score', value: string) => {
    const next = sets.map((set, i) => (i === index ? { ...set, [field]: value } : set));
    onChange(next);
  };

  const addSet = () => {
    onChange([...sets, { set_number: sets.length + 1, my_score: '', opponent_score: '' }]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    onChange(
      sets
        .filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, set_number: i + 1 })),
    );
  };

  return (
    <View style={styles.container}>
      {sets.map((set, index) => (
        <View key={set.set_number} style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.muted }]}>세트 {index + 1}</Text>
          <TextInput
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.muted }]}
            value={set.my_score}
            onChangeText={(v) => updateSet(index, 'my_score', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.colon, { color: colors.text }]}>:</Text>
          <TextInput
            style={[styles.scoreInput, { color: colors.text, borderColor: colors.muted }]}
            value={set.opponent_score}
            onChangeText={(v) => updateSet(index, 'opponent_score', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
          {sets.length > 1 && (
            <Pressable onPress={() => removeSet(index)} hitSlop={8}>
              <Text style={[styles.remove, { color: colors.loss }]}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable onPress={addSet} style={[styles.addButton, { borderColor: colors.tint }]}>
        <Text style={[styles.addText, { color: colors.tint }]}>+ 세트 추가</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  label: {
    width: 52,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreInput: {
    width: 44,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  colon: {
    fontSize: 18,
    fontWeight: '700',
  },
  remove: {
    fontSize: 16,
    marginLeft: 'auto',
    paddingHorizontal: 4,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
