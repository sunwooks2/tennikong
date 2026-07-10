import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PlayerSlotSelect } from '@/components/match/PlayerSlotSelect';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MatchEntryInput, PlayerRoster } from '@/utils/matchForm';
import { getSelectableRosterOptions } from '@/utils/matchForm';
import { getGameResultFromInputs } from '@/utils/matchResult';
import { getResultColor, getResultLabel } from '@/utils/resultDisplay';

interface MatchEntryEditorProps {
  entries: MatchEntryInput[];
  onChange: (entries: MatchEntryInput[]) => void;
  roster: PlayerRoster;
  colors: (typeof Colors)['light'];
  allowAdd?: boolean;
  protectFirstEntry?: boolean;
}

const LINEUP_FIELDS = ['our_fore', 'our_back', 'opponent_fore', 'opponent_back'] as const;
type LineupField = (typeof LINEUP_FIELDS)[number];

export function MatchEntryEditor({
  entries,
  onChange,
  roster,
  colors,
  allowAdd = true,
  protectFirstEntry = false,
}: MatchEntryEditorProps) {
  const updateEntry = (index: number, patch: Partial<MatchEntryInput>) => {
    const next = entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    onChange(next);
  };

  const updateLineupSlot = (index: number, field: LineupField, value: string) => {
    const entry = entries[index];
    const previous = entry[field];
    const patch: Partial<MatchEntryInput> = { [field]: value };

    for (const otherField of LINEUP_FIELDS) {
      if (otherField !== field && entry[otherField] === value) {
        patch[otherField] = previous;
        break;
      }
    }

    updateEntry(index, patch);
  };

  const rosterOptions = getSelectableRosterOptions(roster);

  const addEntry = () => {
    const last = entries[entries.length - 1];
    onChange([
      ...entries,
      {
        entry_number: entries.length + 1,
        our_fore: last?.our_fore ?? '',
        our_back: last?.our_back ?? '',
        opponent_fore: last?.opponent_fore ?? '',
        opponent_back: last?.opponent_back ?? '',
        my_score: '',
        opponent_score: '',
      },
    ]);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    onChange(
      entries
        .filter((_, i) => i !== index)
        .map((entry, i) => ({ ...entry, entry_number: i + 1 })),
    );
  };

  return (
    <View style={styles.container}>
      {entries.map((entry, index) => {
        const result = getGameResultFromInputs(entry.my_score, entry.opponent_score);
        const resultColor = result ? getResultColor(result, colors) : colors.muted;
        const canRemove = entries.length > 1 && !(protectFirstEntry && index === 0);

        return (
          <View key={entry.entry_number} style={[styles.card, { backgroundColor: colors.card }]}>
            {canRemove ? (
              <Pressable
                onPress={() => removeEntry(index)}
                hitSlop={8}
                style={styles.removeBtn}>
                <Text style={[styles.remove, { color: colors.loss }]}>✕</Text>
              </Pressable>
            ) : null}

            <Text style={[styles.index, { color: colors.muted }]}>{index + 1}</Text>

            <View style={styles.lineupArea}>
              <View style={styles.slots}>
                <PlayerSlotSelect
                  positionLabel="포"
                  value={entry.our_fore}
                  options={rosterOptions}
                  onChange={(value) => updateLineupSlot(index, 'our_fore', value)}
                  colors={colors}
                />
                <PlayerSlotSelect
                  positionLabel="백"
                  value={entry.our_back}
                  options={rosterOptions}
                  onChange={(value) => updateLineupSlot(index, 'our_back', value)}
                  colors={colors}
                />
              </View>

              <Text style={[styles.vs, { color: colors.muted }]}>vs</Text>

              <View style={styles.slots}>
                <PlayerSlotSelect
                  positionLabel="포"
                  value={entry.opponent_fore}
                  options={rosterOptions}
                  onChange={(value) => updateLineupSlot(index, 'opponent_fore', value)}
                  colors={colors}
                />
                <PlayerSlotSelect
                  positionLabel="백"
                  value={entry.opponent_back}
                  options={rosterOptions}
                  onChange={(value) => updateLineupSlot(index, 'opponent_back', value)}
                  colors={colors}
                />
              </View>
            </View>

            <View style={[styles.scoreArea, { borderLeftColor: colors.muted }]}>
              <TextInput
                style={[styles.scoreInput, { color: colors.text, borderColor: colors.muted }]}
                value={entry.my_score}
                onChangeText={(value) =>
                  updateEntry(index, { my_score: value.replace(/[^0-9]/g, '') })
                }
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
                placeholderTextColor={colors.muted}
              />
              <Text style={[styles.colon, { color: colors.text }]}>:</Text>
              <TextInput
                style={[styles.scoreInput, { color: colors.text, borderColor: colors.muted }]}
                value={entry.opponent_score}
                onChangeText={(value) =>
                  updateEntry(index, { opponent_score: value.replace(/[^0-9]/g, '') })
                }
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
                placeholderTextColor={colors.muted}
              />
              {result ? (
                <Text style={[styles.result, { color: resultColor }]}>
                  {getResultLabel(result)}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}

      {allowAdd && (
        <Pressable onPress={addEntry} style={[styles.addButton, { borderColor: colors.tint }]}>
          <Text style={[styles.addText, { color: colors.tint }]}>+ 경기 추가</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    paddingRight: 22,
    gap: 6,
    width: '100%',
    overflow: 'hidden',
  },
  index: {
    width: 14,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  lineupArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slots: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 4,
  },
  vs: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  scoreArea: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    marginLeft: 2,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  scoreInput: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
  },
  colon: {
    fontSize: 14,
    fontWeight: '700',
  },
  result: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
    minWidth: 14,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    padding: 2,
  },
  remove: {
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
