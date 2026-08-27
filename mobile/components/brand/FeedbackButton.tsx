import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { FeedbackModal } from '@/components/profile/FeedbackModal';
import Colors from '@/constants/Colors';
import { showAlert } from '@/utils/alert';

interface FeedbackButtonProps {
  colors: (typeof Colors)['light'];
  userId: string | null | undefined;
}

/** 어떤 화면에서도 접근 가능한 개선제안 버튼 (헤더 최우측 전구 아이콘) */
export function FeedbackButton({ colors, userId }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  const handlePress = () => {
    if (!userId) {
      showAlert('로그인이 필요해요', '로그인 후 개선제안을 남길 수 있어요.');
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <TrackedPressable eventName="feedback_button_header" onPress={handlePress} hitSlop={10} style={styles.button}>
        <LightbulbIcon size={22} />
      </TrackedPressable>
      {userId ? (
        <FeedbackModal
          visible={open}
          onClose={() => setOpen(false)}
          userId={userId}
          colors={colors}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
