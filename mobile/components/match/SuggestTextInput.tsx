import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface SuggestTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFetchSuggestions: (query: string) => Promise<string[]>;
  colors: (typeof Colors)['light'];
  placeholder?: string;
}

export function SuggestTextInput({
  label,
  value,
  onChange,
  onFetchSuggestions,
  colors,
  placeholder,
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
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
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
            <Pressable
              key={name}
              onPress={() => {
                onChange(name);
                setFocused(false);
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
