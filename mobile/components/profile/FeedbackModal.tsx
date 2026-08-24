import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { SelectBox } from '@/components/match/SelectBox';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { submitFeedback, type FeedbackCategory } from '@/services/feedback';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  colors: (typeof Colors)['light'];
}

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'feature', label: '기능 추가' },
  { value: 'bug', label: '버그 제보' },
  { value: 'other', label: '기타' },
];

function notify(message: string, title = '알림') {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
}

export function FeedbackModal({ visible, onClose, userId, colors }: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCategory('feature');
    setContent('');
    setContact('');
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      notify('내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({ userId, category, content, contact: contact || undefined });
      notify('소중한 의견 감사합니다!', '전송 완료');
      reset();
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : '전송에 실패했습니다.', '오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>개선제안</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Text style={[styles.close, { color: colors.muted }]}>✕</Text>
            </Pressable>
          </View>

          <Text style={[styles.desc, { color: colors.muted }]}>
            개선사항이나 추가 요구사항을 알려주세요.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>유형</Text>
            <SelectBox
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              colors={colors}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>내용</Text>
            <TextInput
              style={[
                styles.textarea,
                { color: colors.text, borderColor: colors.muted, backgroundColor: colors.background },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="어떤 점이 불편했는지, 어떤 기능이 필요한지 적어주세요."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={1000}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>연락처 (선택)</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.muted, backgroundColor: colors.background },
              ]}
              value={contact}
              onChangeText={setContact}
              placeholder="이메일, 카카오톡 ID 등"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={handleClose}
              disabled={submitting}
              style={[styles.cancelButton, { borderColor: colors.muted }]}>
              <Text style={[styles.cancelText, { color: colors.text }]}>취소</Text>
            </Pressable>
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
                <Text style={styles.submitText}>보내기</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    marginTop: -8,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
