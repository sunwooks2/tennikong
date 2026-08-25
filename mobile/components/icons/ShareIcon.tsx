import Svg, { Line, Path, Polyline } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color: string;
}

/** Feather 아이콘의 "share" 글리프 (박스 + 위쪽 화살표) */
export function ShareIcon({ size = 14, color }: ShareIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="16 6 12 2 8 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="12" y1="2" x2="12" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
