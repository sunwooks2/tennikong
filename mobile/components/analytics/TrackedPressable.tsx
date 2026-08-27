import { forwardRef } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';

import { logEvent } from '@/lib/analytics';

interface TrackedPressableProps extends PressableProps {
  eventName: string;
  eventMeta?: Record<string, unknown>;
}

export const TrackedPressable = forwardRef<React.ElementRef<typeof Pressable>, TrackedPressableProps>(
  ({ eventName, eventMeta, onPress, ...rest }, ref) => {
    const handlePress = (e: GestureResponderEvent) => {
      logEvent('button_tap', eventName, eventMeta);
      onPress?.(e);
    };

    return <Pressable ref={ref} onPress={handlePress} {...rest} />;
  },
);

TrackedPressable.displayName = 'TrackedPressable';
