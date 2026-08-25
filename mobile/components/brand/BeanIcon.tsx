import { StyleSheet, View } from 'react-native';

interface BeanIconProps {
  size?: number;
  opacity?: number;
  variant?: 'full' | 'stamp';
  tone?: 'default' | 'brand' | 'light' | 'lime' | 'green' | 'black';
}

const TONES = {
  default: {
    body: '#74C69D',
    border: '#2D6A4F',
    shine: 'rgba(255,255,255,0.45)',
    eye: '#1B4332',
    cheek: 'rgba(255, 143, 163, 0.55)',
  },
  // 공통 헤더/브랜드 로고 전용 톤 (경기 기록량과 무관하게 고정)
  brand: {
    body: '#9CCC65',
    border: '#558B2F',
    shine: 'rgba(255,255,255,0.45)',
    eye: '#33691E',
    cheek: 'rgba(255, 143, 163, 0.5)',
  },
  // 달력에서 선택된 날짜의 콩 반전 표시용 (선택 시 항상 불투명하게 그려 또렷하게 보이도록 함)
  light: {
    body: 'rgba(255,255,255,0.8)',
    border: 'rgba(255,255,255,0.95)',
    shine: 'rgba(255,255,255,0.4)',
    eye: 'rgba(27, 67, 50, 0.85)',
    cheek: 'rgba(255, 180, 190, 0.6)',
  },
  // 스탬프 레벨 1 (경기 적음): 노랑에 가까운 라임색
  lime: {
    body: '#DCE775',
    border: '#AFB42B',
    shine: 'rgba(255,255,255,0.5)',
    eye: '#827717',
    cheek: 'rgba(255, 143, 163, 0.5)',
  },
  // 스탬프 레벨 2 (경기 중간): 진한 연두색
  green: {
    body: '#9CCC65',
    border: '#558B2F',
    shine: 'rgba(255,255,255,0.45)',
    eye: '#33691E',
    cheek: 'rgba(255, 143, 163, 0.5)',
  },
  // 스탬프 레벨 4 (경기 아주 많음): 검은콩 (테두리 진회색, 채우기 진회색)
  black: {
    body: '#7A7A7A',
    border: '#333333',
    shine: 'rgba(255,255,255,0.5)',
    eye: '#1F1F1F',
    cheek: 'rgba(255, 143, 163, 0.55)',
  },
} as const;

export function BeanIcon({
  size = 34,
  opacity = 1,
  variant = 'full',
  tone = 'default',
}: BeanIconProps) {
  const palette = TONES[tone];
  const bodyWidth = size * 0.68;
  const bodyHeight = size * 0.92;
  const showFace = variant === 'full' && size >= 22;

  return (
    <View style={[styles.wrap, { width: size, height: size, opacity }]}>
      <View
        style={[
          styles.bean,
          {
            width: bodyWidth,
            height: bodyHeight,
            borderRadius: bodyWidth / 2,
            backgroundColor: palette.body,
            borderColor: palette.border,
          },
        ]}>
        <View style={[styles.shine, { backgroundColor: palette.shine }]} />
        {showFace && (
          <View style={styles.face}>
            <View style={styles.eyes}>
              <View style={[styles.eye, { backgroundColor: palette.eye }]} />
              <View style={[styles.eye, { backgroundColor: palette.eye }]} />
            </View>
            <View style={[styles.cheekLeft, { backgroundColor: palette.cheek }]} />
            <View style={[styles.cheekRight, { backgroundColor: palette.cheek }]} />
            <View style={[styles.smile, { borderColor: palette.eye }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bean: {
    borderWidth: 2,
    transform: [{ rotate: '-22deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: '18%',
    left: '16%',
    width: '22%',
    height: '28%',
    borderRadius: 6,
    transform: [{ rotate: '18deg' }],
  },
  face: {
    transform: [{ rotate: '22deg' }],
    alignItems: 'center',
    marginTop: 2,
  },
  eyes: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 2,
  },
  eye: {
    width: 3,
    height: 4,
    borderRadius: 2,
  },
  cheekLeft: {
    position: 'absolute',
    top: 8,
    left: -6,
    width: 5,
    height: 3,
    borderRadius: 3,
  },
  cheekRight: {
    position: 'absolute',
    top: 8,
    right: -6,
    width: 5,
    height: 3,
    borderRadius: 3,
  },
  smile: {
    width: 8,
    height: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
  },
});
