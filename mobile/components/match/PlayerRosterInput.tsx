import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MY_ROSTER_LABEL, type PlayerRoster } from '@/utils/matchForm';

interface PlayerRosterInputProps {
  roster: PlayerRoster;
  onChange: (roster: PlayerRoster) => void;
  colors: (typeof Colors)['light'];
  onFetchSuggestions: (query: string) => Promise<string[]>;
}

const OTHER_PLAYERS: { key: keyof Pick<PlayerRoster, 'player2' | 'player3' | 'player4'>; placeholder: string }[] = [
  { key: 'player2', placeholder: '선수1' },
  { key: 'player3', placeholder: '선수2' },
  { key: 'player4', placeholder: '선수3' },
];

type ActiveField = 'player2' | 'player3' | 'player4' | number;

export function PlayerRosterInput({
  roster,
  onChange,
  colors,
  onFetchSuggestions,
}: PlayerRosterInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<ActiveField | null>(null);

  const loadSuggestions = async (nextRoster: PlayerRoster, value: string) => {
    onChange(nextRoster);
    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const data = await onFetchSuggestions(value);
    setSuggestions(data);
  };

  const addExtraPlayer = () => {
    onChange({ ...roster, extraPlayers: [...roster.extraPlayers, ''] });
  };

  const removeExtraPlayer = (index: number) => {
    onChange({ ...roster, extraPlayers: roster.extraPlayers.filter((_, i) => i !== index) });
  };

  const applySuggestion = (name: string) => {
    if (activeField === null) return;
    if (typeof activeField === 'number') {
      const next = [...roster.extraPlayers];
      next[activeField] = name;
      onChange({ ...roster, extraPlayers: next });
    } else {
      onChange({ ...roster, [activeField]: name });
    }
    setSuggestions([]);
    setActiveField(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.cell}>
          <View
            style={[
              styles.fixedSlot,
              {
                borderColor: colors.tint,
                backgroundColor: `${colors.tint}18`,
              },
            ]}>
            <Text style={[styles.fixedSlotText, { color: colors.tint }]}>{MY_ROSTER_LABEL}</Text>
          </View>
        </View>

        {OTHER_PLAYERS.map(({ key, placeholder }) => (
          <View key={key} style={styles.cell}>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
              ]}
              value={roster[key]}
              onChangeText={(value) => loadSuggestions({ ...roster, [key]: value }, value)}
              onFocus={() => setActiveField(key)}
              onBlur={() => setTimeout(() => setActiveField((f) => (f === key ? null : f)), 150)}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
            />
          </View>
        ))}
      </View>

      {roster.extraPlayers.length > 0 && (
        <View style={styles.extraGrid}>
          {roster.extraPlayers.map((name, index) => (
            <View key={index} style={styles.extraCell}>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
                ]}
                value={name}
                onChangeText={(value) => {
                  const next = [...roster.extraPlayers];
                  next[index] = value;
                  loadSuggestions({ ...roster, extraPlayers: next }, value);
                }}
                onFocus={() => setActiveField(index)}
                onBlur={() =>
                  setTimeout(() => setActiveField((f) => (f === index ? null : f)), 150)
                }
                placeholder={`선수${index + 4}`}
                placeholderTextColor={colors.muted}
              />
              <TrackedPressable
                eventName="player_roster_remove_extra"
                onPress={() => removeExtraPlayer(index)}
                hitSlop={8}
                style={[
                  styles.removeExtraBtn,
                  { backgroundColor: colors.card, borderColor: colors.loss },
                ]}>
                <Text style={[styles.removeExtraText, { color: colors.loss }]}>✕</Text>
              </TrackedPressable>
            </View>
          ))}
        </View>
      )}

      <TrackedPressable
        eventName="player_roster_add_extra"
        onPress={addExtraPlayer}
        style={[styles.addButton, { borderColor: colors.tint }]}>
        <Text style={[styles.addText, { color: colors.tint }]}>+ 선수 추가</Text>
      </TrackedPressable>

      {activeField !== null && suggestions.length > 0 && (
        <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.muted }]}>
          {suggestions.map((name) => (
            <TrackedPressable
              key={name}
              eventName="player_roster_suggestion_select"
              onPress={() => applySuggestion(name)}
              style={styles.suggestionItem}>
              <Text style={{ color: colors.text }}>{name}</Text>
            </TrackedPressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
  },
  fixedSlot: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedSlotText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  extraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  extraCell: {
    width: '23%',
    position: 'relative',
  },
  removeExtraBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeExtraText: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10,
  },
  addButton: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 8,
    alignItems: 'center',
  },
  addText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
