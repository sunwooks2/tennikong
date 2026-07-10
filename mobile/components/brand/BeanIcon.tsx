import { StyleSheet, View } from 'react-native';

interface BeanIconProps {
  size?: number;
  opacity?: number;
  variant?: 'full' | 'stamp';
  tone?: 'default' | 'light';
}

const TONES = {
  default: {
    body: '#74C69D',
    border: '#2D6A4F',
    shine: 'rgba(255,255,255,0.45)',
    eye: '#1B4332',
    cheek: 'rgba(255, 143, 163, 0.55)',
  },
  light: {
    body: 'rgba(255,255,255,0.55)',
    border: 'rgba(255,255,255,0.9)',
    shine: 'rgba(255,255,255,0.35)',
    eye: 'rgba(27, 67, 50, 0.7)',
    cheek: 'rgba(255, 180, 190, 0.45)',
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
