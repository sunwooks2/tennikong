import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ChipSelector } from '@/components/match/ChipSelector';
import { SetScoreEditor } from '@/components/match/SetScoreEditor';
import { SuggestTextInput } from '@/components/match/SuggestTextInput';
import { TagInput } from '@/components/match/TagInput';
import { Text } from '@/components/Themed';
import {
  COURT_TYPE_LABELS,
  MATCH_TYPE_LABELS,
  POSITION_LABELS,
  RESULT_LABELS,
  isDoublesMatch,
} from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { CourtType, MatchType, PositionType } from '@/types/database';
import {
  createMatch,
  fetchPlayerSuggestions,
  fetchVenueSuggestions,
} from '@/services/matches';
import {
  createEmptySet,
  parseSets,
  validateMatchForm,
  type SetScoreInput,
} from '@/utils/matchForm';
import { calculateMatchResult } from '@/utils/matchResult';
import { toDateKey } from '@/utils/date';

interface MatchFormProps {
  userId: string;
  defaultMyName: string;
  initialDate?: string;
  colors: (typeof Colors)['light'];
  onSuccess: () => void;
}

export function MatchForm({
  userId,
  defaultMyName,
  initialDate,
  colors,
  onSuccess,
}: MatchFormProps) {
  const [matchDate, setMatchDate] = useState(initialDate ?? toDateKey(new Date()));
  const [matchType, setMatchType] = useState<MatchType>('mens_doubles');
  const [courtType, setCourtType] = useState<CourtType>('hard');
  const [venueName, setVenueName] = useState('');
  const [myName, setMyName] = useState(defaultMyName);
  const [partnerName, setPartnerName] = useState('');
  const [opponent1Name, setOpponent1Name] = useState('');
  const [opponent2Name, setOpponent2Name] = useState('');
  const [position, setPosition] = useState<PositionType>('fore');
  const [memo, setMemo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [setInputs, setSetInputs] = useState<SetScoreInput[]>([createEmptySet(1)]);
  const [submitting, setSubmitting] = useState(false);

  const isDoubles = isDoublesMatch(matchType);

  const predictedResult = useMemo(() => {
    try {
      const sets = parseSets(setInputs);
      if (sets.some((s) => Number.isNaN(s.my_score) || Number.isNaN(s.opponent_score))) {
        return null;
      }
      return calculateMatchResult(sets);
    } catch {
      return null;
    }
  }, [setInputs]);

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
      match_type: matchType,
      my_name: myName,
      partner_name: partnerName,
      opponent1_name: opponent1Name,
      opponent2_name: opponent2Name,
      memo,
      setInputs,
    });

    if (validationError) {
      Alert.alert('입력 확인', validationError);
      return;
    }

    setSubmitting(true);
    try {
      await createMatch(userId, {
        match_date: matchDate,
        match_type: matchType,
        court_type: courtType,
        venue_name: venueName,
        my_name: myName,
        partner_name: isDoubles ? partnerName : undefined,
        opponent1_name: opponent1Name,
        opponent2_name: isDoubles ? opponent2Name : undefined,
        position: isDoubles ? position : null,
        memo,
        sets: parseSets(setInputs),
        tags,
      });
      onSuccess();
    } catch (error) {
      Alert.alert(
        '등록 실패',
        error instanceof Error ? error.message : '경기 등록에 실패했습니다.',
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
        <FormSection title="경기일" colors={colors}>
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
        </FormSection>

        <FormSection title="경기유형" colors={colors}>
          <ChipSelector
            options={(Object.keys(MATCH_TYPE_LABELS) as MatchType[]).map((value) => ({
              value,
              label: MATCH_TYPE_LABELS[value],
            }))}
            value={matchType}
            onChange={setMatchType}
            colors={colors}
          />
        </FormSection>

        <FormSection title="코트종류" colors={colors}>
          <ChipSelector
            options={(Object.keys(COURT_TYPE_LABELS) as CourtType[]).map((value) => ({
              value,
              label: COURT_TYPE_LABELS[value],
            }))}
            value={courtType}
            onChange={setCourtType}
            colors={colors}
          />
        </FormSection>

        <FormSection title="경기장" colors={colors}>
          <SuggestTextInput
            label=""
            value={venueName}
            onChange={setVenueName}
            onFetchSuggestions={loadVenueSuggestions}
            colors={colors}
            placeholder="경기장 이름"
          />
        </FormSection>

        <FormSection title="선수" colors={colors}>
          <SuggestTextInput
            label="나"
            value={myName}
            onChange={setMyName}
            onFetchSuggestions={loadPlayerSuggestions}
            colors={colors}
          />
          {isDoubles && (
            <SuggestTextInput
              label="페어"
              value={partnerName}
              onChange={setPartnerName}
              onFetchSuggestions={loadPlayerSuggestions}
              colors={colors}
            />
          )}
          <SuggestTextInput
            label="상대1"
            value={opponent1Name}
            onChange={setOpponent1Name}
            onFetchSuggestions={loadPlayerSuggestions}
            colors={colors}
          />
          {isDoubles && (
            <SuggestTextInput
              label="상대2"
              value={opponent2Name}
              onChange={setOpponent2Name}
              onFetchSuggestions={loadPlayerSuggestions}
              colors={colors}
            />
          )}
        </FormSection>

        {isDoubles && (
          <FormSection title="포지션" colors={colors}>
            <ChipSelector
              options={(
                Object.keys(POSITION_LABELS) as PositionType[]
              ).map((value) => ({
                value,
                label: POSITION_LABELS[value],
              }))}
              value={position}
              onChange={setPosition}
              colors={colors}
            />
          </FormSection>
        )}

        <FormSection title="세트 점수" colors={colors}>
          <SetScoreEditor sets={setInputs} onChange={setSetInputs} colors={colors} />
          <View style={[styles.resultBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultLabel, { color: colors.muted }]}>결과</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color: predictedResult
                    ? predictedResult === 'win'
                      ? colors.win
                      : colors.loss
                    : colors.muted,
                },
              ]}>
              {predictedResult ? RESULT_LABELS[predictedResult] : '입력 중'}
            </Text>
          </View>
        </FormSection>

        <FormSection title="메모" colors={colors}>
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
        </FormSection>

        <FormSection title="태그" colors={colors}>
          <TagInput tags={tags} onChange={setTags} colors={colors} />
        </FormSection>

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
            <Text style={styles.submitText}>경기 등록</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormSection({
  title,
  colors,
  children,
}: {
  title: string;
  colors: (typeof Colors)['light'];
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  memoInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 12,
    textAlign: 'right',
  },
  resultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
