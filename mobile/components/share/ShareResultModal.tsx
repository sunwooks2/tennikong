import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { MatchShareCard } from '@/components/share/MatchShareCard';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import { getErrorMessage } from '@/utils/alert';

interface ShareResultModalProps {
  visible: boolean;
  onClose: () => void;
  matches: Match[];
  colors: (typeof Colors)['light'];
}

function notify(message: string, title = '알림') {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
}

export function ShareResultModal({ visible, onClose, matches, colors }: ShareResultModalProps) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;

    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        // react-native-view-shot has no native module on web; html2canvas captures the DOM node directly.
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(cardRef.current as unknown as HTMLElement, {
          backgroundColor: colors.card,
        });
        await shareOnWeb(canvas.toDataURL('image/png'));
      } else {
        const uri = await captureRef(cardRef, { format: 'png', quality: 0.9, result: 'tmpfile' });
        const available = await Sharing.isAvailableAsync();
        if (!available) {
          notify('이 기기에서는 공유 기능을 사용할 수 없습니다.');
          return;
        }
        await Sharing.shareAsync(uri, {
          dialogTitle: '경기 결과 공유',
          mimeType: 'image/png',
        });
      }
    } catch (error) {
      notify(getErrorMessage(error, '이미지를 만드는 데 실패했습니다.'), '오류');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View ref={cardRef} collapsable={false}>
            <MatchShareCard matches={matches} colors={colors} />
          </View>

          <View style={styles.actions}>
            <TrackedPressable
              eventName="share_modal_close"
              onPress={onClose}
              disabled={sharing}
              style={[
                styles.cancelButton,
                { backgroundColor: colors.card, borderColor: colors.muted },
              ]}>
              <Text style={[styles.cancelText, { color: colors.text }]}>닫기</Text>
            </TrackedPressable>
            <TrackedPressable
              eventName="share_modal_share"
              onPress={handleShare}
              disabled={sharing}
              style={[
                styles.shareButton,
                { backgroundColor: colors.tint, opacity: sharing ? 0.7 : 1 },
              ]}>
              {sharing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.shareText}>공유하기</Text>
              )}
            </TrackedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const SHARE_URL = 'https://tennikong.vercel.app';

async function shareOnWeb(dataUri: string) {
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
  };

  const res = await fetch(dataUri);
  const blob = await res.blob();
  const file = new File([blob], 'tennikong-result.png', { type: 'image/png' });

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    await nav.share({
      files: [file],
      title: '테니콩 경기결과',
      text: `🎾 테니콩 경기결과!\n나도 기록하기 👇\n${SHARE_URL}`,
    });
    return;
  }

  const link = document.createElement('a');
  link.href = dataUri;
  link.download = 'tennikong-result.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  notify('이미지가 저장됐어요! 카카오톡에 직접 첨부해 공유해보세요.');
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    width: 320,
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
  shareButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
