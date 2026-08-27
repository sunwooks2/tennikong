import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface SuggestTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFetchSuggestions: (query: string) => Promise<string[]>;
  colors: (typeof Colors)['light'];
  placeholder?: string;
  compact?: boolean;
}

export function SuggestTextInput({
  label,
  value,
  onChange,
  onFetchSuggestions,
  colors,
  placeholder,
  compact = false,
}: SuggestTextInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const items = await onFetchSuggestions(value);
      setSuggestions(items.filter((name) => name !== value));
    }, 200);

    return () => clearTimeout(timer);
  }, [value, focused, onFetchSuggestions]);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <TextInput
        style={[
          compact ? styles.inputCompact : styles.input,
          { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
        ]}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
      />
      {focused && suggestions.length > 0 && (
        <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.muted }]}>
          {suggestions.map((name) => (
            <TrackedPressable
              key={name}
              eventName="suggest_text_input_select"
              onPress={() => {
                onChange(name);
                setFocused(false);
              }}
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
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputCompact: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
