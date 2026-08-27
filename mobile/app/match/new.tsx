import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { BeanIcon } from '@/components/brand/BeanIcon';
import { MatchForm } from '@/components/match/MatchForm';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSession } from '@/hooks/useSession';
import { toDateKey } from '@/utils/date';

export default function MatchNewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { user, displayName, loading, isAuthenticated } = useSession();
  const [showFirstMatchModal, setShowFirstMatchModal] = useState(false);

  const initialDate = typeof date === 'string' && date.length > 0 ? date : toDateKey(new Date());

  const handleSuccess = (isFirstMatch: boolean) => {
    if (isFirstMatch) {
      setShowFirstMatchModal(true);
    } else {
      router.back();
    }
  };

  const handleCloseFirstMatchModal = () => {
    setShowFirstMatchModal(false);
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.muted }]}>
          로그인 후 경기를 등록할 수 있습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MatchForm
        userId={user.id}
        defaultMyName={displayName}
        initialDate={initialDate}
        colors={colors}
        onSuccess={handleSuccess}
      />

      <Modal
        visible={showFirstMatchModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseFirstMatchModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.beanProgressRow}>
              <BeanIcon size={40} tone="lime" />
              <BeanIcon size={40} tone="green" />
              <BeanIcon size={40} tone="default" />
              <BeanIcon size={40} tone="black" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              첫 경기 등록 완료! 🎉
            </Text>
            <Text style={[styles.modalDesc, { color: colors.muted }]}>
              앞으로도 꾸준히 기록해보세요.{'\n'}많은 경기를 등록할수록{'\n'}콩 색깔이 점점
              진해져요!
            </Text>
            <TrackedPressable
              eventName="first_match_modal_confirm"
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={handleCloseFirstMatchModal}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TrackedPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  beanProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
