import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ChipSelector } from '@/components/match/ChipSelector';
import { MatchEntryEditor } from '@/components/match/MatchEntryEditor';
import { PlayerRosterInput } from '@/components/match/PlayerRosterInput';
import { SuggestTextInput } from '@/components/match/SuggestTextInput';
import { TagInput } from '@/components/match/TagInput';
import { Text } from '@/components/Themed';
import { COURT_TYPE_FORM_OPTIONS, COURT_TYPE_LABELS, MATCH_TYPE_LABELS } from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { CourtType, MatchType } from '@/types/database';
import {
  createMatches,
  fetchPlayerSuggestions,
  fetchVenueSuggestions,
  updateRegistration,
} from '@/services/matches';
import {
  createDefaultRoster,
  createEmptyEntry,
  parseEntries,
  validateMatchForm,
  type MatchEntryInput,
  type PlayerRoster,
} from '@/utils/matchForm';
import { toDateKey } from '@/utils/date';
import { getErrorMessage, showAlert } from '@/utils/alert';

interface MatchFormProps {
  userId: string;
  defaultMyName: string;
  initialDate?: string;
  matchId?: string;
  matchIds?: string[];
  registrationId?: string | null;
  initialValues?: {
    matchDate?: string;
    matchType?: MatchType;
    courtType?: CourtType;
    venueName?: string;
    memo?: string;
    tags?: string[];
    roster?: PlayerRoster;
    entryInputs?: MatchEntryInput[];
  };
  colors: (typeof Colors)['light'];
  onSuccess: () => void;
}

export function MatchForm({
  userId,
  defaultMyName,
  initialDate,
  matchId,
  matchIds,
  registrationId,
  initialValues,
  colors,
  onSuccess,
}: MatchFormProps) {
  const [matchDate, setMatchDate] = useState(
    initialValues?.matchDate ?? initialDate ?? toDateKey(new Date()),
  );
  const [matchType, setMatchType] = useState<MatchType>(
    initialValues?.matchType ?? 'mens_doubles',
  );
  const [courtType, setCourtType] = useState<CourtType>(initialValues?.courtType ?? 'hard');
  const [venueName, setVenueName] = useState(initialValues?.venueName ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [roster, setRoster] = useState<PlayerRoster>(
    initialValues?.roster ?? createDefaultRoster(defaultMyName),
  );
  const [entryInputs, setEntryInputs] = useState<MatchEntryInput[]>(
    initialValues?.entryInputs ?? [createEmptyEntry(1)],
  );
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!matchId || (matchIds?.length ?? 0) > 0;

  useEffect(() => {
    if (!isEdit && defaultMyName) {
      setRoster((current) =>
        current.player1 === defaultMyName ? current : { ...current, player1: defaultMyName },
      );
    }
  }, [defaultMyName, isEdit]);

  const loadVenueSuggestions = useCallback(async (query: string) => {
    const { data } = await fetchVenueSuggestions(query);
    return (data ?? []).map((row) => row.name);
  }, []);

  const loadPlayerSuggestions = useCallback(async (query: string) => {
    const { data } = await fetchPlayerSuggestions(query);
    return (data ?? []).map((row) => row.name);
  }, []);

  const handleSubmit = async () => {
    const validationError = validateMatchForm({
      match_date: matchDate,
      memo,
      roster,
      entryInputs,
    });

    if (validationError) {
      showAlert('입력 확인', validationError);
      return;
    }

    const entries = parseEntries(roster, entryInputs, defaultMyName);
    const shared = {
      match_date: matchDate,
      match_type: matchType,
      court_type: courtType,
      venue_name: venueName,
      memo,
      tags,
    };

    setSubmitting(true);
    try {
      if (isEdit && matchIds && matchIds.length > 0) {
        await updateRegistration(userId, matchIds, registrationId ?? null, {
          ...shared,
          entries,
        });
      } else {
        await createMatches(userId, { ...shared, entries });
      }
      onSuccess();
    } catch (error) {
      showAlert(
        isEdit ? '수정 실패' : '등록 실패',
        getErrorMessage(error, '저장에 실패했습니다.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <FormRow label="경기일" colors={colors}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
            ]}
            value={matchDate}
            onChangeText={setMatchDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
          />
        </FormRow>

        <FormRow label="경기유형" colors={colors}>
          <ChipSelector
            options={(Object.keys(MATCH_TYPE_LABELS) as MatchType[]).map((value) => ({
              value,
              label: MATCH_TYPE_LABELS[value],
            }))}
            value={matchType}
            onChange={setMatchType}
            colors={colors}
          />
        </FormRow>

        <FormRow label="코트종류" colors={colors}>
          <ChipSelector
            options={COURT_TYPE_FORM_OPTIONS.map((value) => ({
              value,
              label: COURT_TYPE_LABELS[value],
            }))}
            value={courtType}
            onChange={setCourtType}
            colors={colors}
          />
        </FormRow>

        <FormRow label="경기장" colors={colors}>
          <SuggestTextInput
            label=""
            value={venueName}
            onChange={setVenueName}
            onFetchSuggestions={loadVenueSuggestions}
            colors={colors}
            placeholder="경기장 이름"
            compact
          />
        </FormRow>

        <FormRow label="선수" colors={colors} align="top">
          <PlayerRosterInput
            roster={roster}
            onChange={setRoster}
            colors={colors}
            onFetchSuggestions={loadPlayerSuggestions}
          />
        </FormRow>

        <FormRow label="경기" colors={colors} align="top">
          <MatchEntryEditor
            entries={entryInputs}
            onChange={setEntryInputs}
            roster={roster}
            colors={colors}
            protectFirstEntry={isEdit}
          />
        </FormRow>

        <FormRow label="메모" colors={colors} align="top">
          <View style={styles.memoWrap}>
            <TextInput
              style={[
                styles.memoInput,
                { color: colors.text, borderColor: colors.muted, backgroundColor: colors.card },
              ]}
              value={memo}
              onChangeText={setMemo}
              placeholder="최대 200자"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={200}
            />
            <Text style={[styles.counter, { color: colors.muted }]}>{memo.length}/200</Text>
          </View>
        </FormRow>

        <FormRow label="태그" colors={colors} align="top">
          <TagInput tags={tags} onChange={setTags} colors={colors} />
        </FormRow>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={[
            styles.submitButton,
            { backgroundColor: colors.tint, opacity: submitting ? 0.7 : 1 },
          ]}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEdit ? '수정 저장' : '경기 등록'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormRow({
  label,
  colors,
  children,
  align = 'center',
}: {
  label: string;
  colors: (typeof Colors)['light'];
  children: ReactNode;
  align?: 'center' | 'top';
}) {
  return (
    <View style={[styles.row, align === 'top' && styles.rowTop]}>
      <Text style={[styles.rowLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.rowContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 12,
    gap: 10,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTop: {
    alignItems: 'flex-start',
  },
  rowLabel: {
    width: 56,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
    paddingTop: 2,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  memoWrap: {
    gap: 4,
  },
  memoInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    textAlign: 'right',
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
