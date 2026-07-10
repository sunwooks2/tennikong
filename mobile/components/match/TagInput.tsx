import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  colors: (typeof Colors)['light'];
}

export function TagInput({ tags, onChange, colors }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#+/, '');
    if (!tag || tags.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...tags, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => removeTag(tag)}
            style={[styles.chip, { backgroundColor: `${colors.tint}22` }]}>
            <Text style={[styles.chipText, { color: colors.tint }]}>#{tag} ✕</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
        ]}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => addTag(draft)}
        placeholder="#레슨 #대회 #야간"
        placeholderTextColor={colors.muted}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
});
