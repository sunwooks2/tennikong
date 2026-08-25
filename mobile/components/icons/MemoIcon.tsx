import Svg, { Path } from 'react-native-svg';

interface MemoIconProps {
  size?: number;
}

/** 깔끔하고 귀여운 연필 모양 메모 아이콘 */
export function MemoIcon({ size = 13 }: MemoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"
        fill="#FFD54F"
        stroke="#B9852B"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M14.5 5.5l4 4" stroke="#B9852B" strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
