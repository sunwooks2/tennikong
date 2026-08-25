import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

interface LightbulbIconProps {
  size?: number;
}

/** 불이 들어온 전구 아이콘 (개선제안 버튼용). 메인 콩 로고보다는 은은하되 알아볼 수 있는 톤으로 표현 */
export function LightbulbIcon({ size = 22 }: LightbulbIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="1" x2="12" y2="3" stroke="#FFC94D" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="3.5" y1="4.5" x2="5" y2="6" stroke="#FFC94D" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="20.5" y1="4.5" x2="19" y2="6" stroke="#FFC94D" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="1" y1="12" x2="3" y2="12" stroke="#FFC94D" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="23" y1="12" x2="21" y2="12" stroke="#FFC94D" strokeWidth={1.5} strokeLinecap="round" />

      <Circle cx="12" cy="12" r="7" fill="#FFDE7A" stroke="#F2A900" strokeWidth={1.5} />
      <Ellipse cx="9.3" cy="9" rx="1.7" ry="2.3" fill="rgba(255,255,255,0.7)" transform="rotate(-25 9.3 9)" />

      <Path d="M9.3 19.2h5.4" stroke="#C99A2E" strokeWidth={1.5} strokeLinecap="round" />
      <Path
        d="M9.7 21.3h4.6a0.9 0.9 0 0 1-0.9 0.9h-2.8a0.9 0.9 0 0 1-0.9-0.9Z"
        fill="#C99A2E"
      />
    </Svg>
  );
}
