import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MY_ROSTER_LABEL, type PlayerRoster } from '@/utils/matchForm';

interface PlayerRosterInputProps {
  roster: PlayerRoster;
  onChange: (roster: PlayerRoster) => void;
  colors: (typeof Colors)['light'];
  onFetchSuggestions: (query: string) => Promise<string[]>;
}

const OTHER_PLAYERS: { key: keyof PlayerRoster; placeholder: string }[] = [
  { key: 'player2', placeholder: '선수1' },
  { key: 'player3', placeholder: '선수2' },
  { key: 'player4', placeholder: '선수3' },
];

export function PlayerRosterInput({
  roster,
  onChange,
  colors,
  onFetchSuggestions,
}: PlayerRosterInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<keyof PlayerRoster | null>(null);

  const loadSuggestions = async (key: keyof PlayerRoster, value: string) => {
    onChange({ ...roster, [key]: value });
    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const data = await onFetchSuggestions(value);
    setSuggestions(data);
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
              onChangeText={(value) => loadSuggestions(key, value)}
              onFocus={() => setActiveField(key)}
              onBlur={() => setTimeout(() => setActiveField(null), 150)}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
            />
          </View>
        ))}
      </View>

      {activeField && suggestions.length > 0 && (
        <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.muted }]}>
          {suggestions.map((name) => (
            <Pressable
              key={name}
              onPress={() => {
                onChange({ ...roster, [activeField]: name });
                setSuggestions([]);
                setActiveField(null);
              }}
              style={styles.suggestionItem}>
              <Text style={{ color: colors.text }}>{name}</Text>
            </Pressable>
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
