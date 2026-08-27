import { StyleSheet, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { PlayerSlotSelect } from '@/components/match/PlayerSlotSelect';
import { ScoreStepper } from '@/components/match/ScoreStepper';
import { SelectBox } from '@/components/match/SelectBox';
import { Text } from '@/components/Themed';
import { MATCH_TYPE_FORM_OPTIONS, MATCH_TYPE_LABELS } from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { MatchEntryInput, PlayerRoster } from '@/utils/matchForm';
import { MY_ROSTER_LABEL, getSelectableRosterOptions } from '@/utils/matchForm';
import { calculateGameResult } from '@/utils/matchResult';
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

const MATCH_TYPE_OPTIONS = MATCH_TYPE_FORM_OPTIONS.map((value) => ({
  value,
  label: MATCH_TYPE_LABELS[value],
}));

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

  const rosterOptions = getSelectableRosterOptions(roster);

  const updateLineupSlot = (index: number, field: LineupField, value: string) => {
    const entry = entries[index];
    const previous = entry[field];
    const patch: Partial<MatchEntryInput> = { [field]: value };

    const ourOtherField: LineupField | null =
      field === 'our_fore' ? 'our_back' : field === 'our_back' ? 'our_fore' : null;

    if (ourOtherField && previous === MY_ROSTER_LABEL && value !== MY_ROSTER_LABEL) {
      // 우리팀 포/백 중 '나'였던 자리를 다른 사람으로 바꾸면, '나'는 반대편 자리로 옮겨간다.
      patch[ourOtherField] = MY_ROSTER_LABEL;
    } else {
      for (const otherField of LINEUP_FIELDS) {
        if (otherField !== field && entry[otherField] === value) {
          patch[otherField] = previous;
          break;
        }
      }
    }

    // 선수가 딱 4명이면 3자리가 채워지는 순간 마지막 자리는 정해져 있으므로 자동으로 채운다.
    if (rosterOptions.length === 4) {
      const next = { ...entry, ...patch };
      const filled = LINEUP_FIELDS.map((f) => next[f]).filter((v) => v.length > 0);
      const emptyFields = LINEUP_FIELDS.filter((f) => next[f].length === 0);

      if (filled.length === 3 && emptyFields.length === 1) {
        const remaining = rosterOptions.find((name) => !filled.includes(name));
        if (remaining) {
          patch[emptyFields[0]] = remaining;
        }
      }
    }

    updateEntry(index, patch);
  };

  const addEntry = () => {
    const last = entries[entries.length - 1];
    onChange([
      ...entries,
      {
        entry_number: entries.length + 1,
        match_type: last?.match_type ?? 'mens_doubles',
        our_fore: last?.our_fore ?? '',
        our_back: last?.our_back ?? '',
        opponent_fore: last?.opponent_fore ?? '',
        opponent_back: last?.opponent_back ?? '',
        my_score: '0',
        opponent_score: '0',
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
        const displayedMyScore = Number.parseInt(entry.my_score, 10) || 0;
        const displayedOpponentScore = Number.parseInt(entry.opponent_score, 10) || 0;
        const result = calculateGameResult(displayedMyScore, displayedOpponentScore);
        const resultColor = getResultColor(result, colors);
        const canRemove = entries.length > 1 && !(protectFirstEntry && index === 0);

        // 상대팀에는 '나'를 선택할 수 없다. 우리팀(포/백) 중 하나가 반드시 '나'이도록
        // 하는 제약은 옵션 목록이 아니라 updateLineupSlot의 자동 스왑으로 지킨다
        // (옵션 자체를 제한하면 '나'의 위치를 절대 바꿀 수 없는 순환 잠금이 생긴다).
        const ourForeOptions = rosterOptions;
        const ourBackOptions = rosterOptions;
        const opponentOptions = rosterOptions.filter((name) => name !== MY_ROSTER_LABEL);

        return (
          <View key={entry.entry_number} style={[styles.card, { backgroundColor: colors.card }]}>
            {canRemove ? (
              <TrackedPressable
                eventName="match_entry_remove"
                onPress={() => removeEntry(index)}
                hitSlop={8}
                style={styles.removeBtn}>
                <Text style={[styles.remove, { color: colors.loss }]}>✕</Text>
              </TrackedPressable>
            ) : null}

            <View style={styles.entryTypeRow}>
              <Text style={[styles.index, { color: colors.muted }]}>{index + 1}</Text>

              <View style={styles.entryTypeSelect}>
                <SelectBox
                  options={MATCH_TYPE_OPTIONS}
                  value={entry.match_type}
                  onChange={(value) => updateEntry(index, { match_type: value })}
                  colors={colors}
                />
              </View>
            </View>

            <View style={styles.entryMainRow}>
              <View style={styles.indexSpacer} />

              <View style={styles.lineupArea}>
                <View style={styles.teamGroup}>
                  <View style={styles.teamLabelWrap}>
                    <Text style={[styles.teamLabelInline, { color: colors.muted }]}>{'우\n리\n팀'}</Text>
                  </View>
                  <View style={styles.slots}>
                    <PlayerSlotSelect
                      positionLabel="포"
                      value={entry.our_fore}
                      options={ourForeOptions}
                      onChange={(value) => updateLineupSlot(index, 'our_fore', value)}
                      colors={colors}
                    />
                    <PlayerSlotSelect
                      positionLabel="백"
                      value={entry.our_back}
                      options={ourBackOptions}
                      onChange={(value) => updateLineupSlot(index, 'our_back', value)}
                      colors={colors}
                    />
                  </View>
                </View>

                <Text style={[styles.lineupColon, { color: colors.muted }]}>:</Text>

                <View style={styles.teamGroup}>
                  <View style={styles.teamLabelWrap}>
                    <Text style={[styles.teamLabelInline, { color: colors.muted }]}>{'상\n대\n팀'}</Text>
                  </View>
                  <View style={styles.slots}>
                    <PlayerSlotSelect
                      positionLabel="포"
                      value={entry.opponent_fore}
                      options={opponentOptions}
                      onChange={(value) => updateLineupSlot(index, 'opponent_fore', value)}
                      colors={colors}
                    />
                    <PlayerSlotSelect
                      positionLabel="백"
                      value={entry.opponent_back}
                      options={opponentOptions}
                      onChange={(value) => updateLineupSlot(index, 'opponent_back', value)}
                      colors={colors}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.entryMainRow}>
              <View style={styles.indexSpacer} />

              <View style={styles.scoreArea}>
                <View style={styles.scoreCell}>
                  <View style={styles.teamLabelWrap} />
                  <View style={styles.scoreStepperWrap}>
                    <ScoreStepper
                      value={entry.my_score}
                      onChange={(value) => updateEntry(index, { my_score: value })}
                      colors={colors}
                    />
                  </View>
                </View>

                <Text style={[styles.scoreColon, { color: colors.text }]}>:</Text>

                <View style={styles.scoreCell}>
                  <View style={styles.teamLabelWrap} />
                  <View style={styles.scoreStepperWrap}>
                    <ScoreStepper
                      value={entry.opponent_score}
                      onChange={(value) => updateEntry(index, { opponent_score: value })}
                      colors={colors}
                    />
                  </View>
                </View>
              </View>

              <Text style={[styles.result, { color: resultColor }]}>
                {getResultLabel(result)}
              </Text>
            </View>
          </View>
        );
      })}

      {allowAdd && (
        <TrackedPressable
          eventName="match_entry_add"
          onPress={addEntry}
          style={[styles.addButton, { borderColor: colors.tint }]}>
          <Text style={[styles.addText, { color: colors.tint }]}>+ 경기 추가</Text>
        </TrackedPressable>
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
    flexDirection: 'column',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    paddingRight: 22,
    gap: 8,
    width: '100%',
    overflow: 'hidden',
  },
  entryTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTypeSelect: {
    flex: 1,
    minWidth: 0,
  },
  entryMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  index: {
    width: 14,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  indexSpacer: {
    width: 14,
    flexShrink: 0,
  },
  lineupArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  teamLabelWrap: {
    width: 14,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLabelInline: {
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 9,
  },
  slots: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 4,
  },
  lineupColon: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  scoreArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  scoreStepperWrap: {
    flex: 1,
    minWidth: 0,
  },
  scoreColon: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
  },
  result: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    minWidth: 14,
    textAlign: 'center',
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
