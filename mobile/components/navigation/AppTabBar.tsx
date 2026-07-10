import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const TAB_ICON_SIZE = 24;

type TabIconProps = {
  focused: boolean;
  color: ColorValue;
  size: number;
};

type TabDescriptor = {
  options: {
    title?: string;
    tabBarIcon?: (props: TabIconProps) => ReactNode;
  };
};

export type AppTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<string, TabDescriptor>;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderTopColor: `${colors.muted}33`,
          paddingBottom: bottomPadding,
        },
      ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const color = isFocused ? colors.tint : colors.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}>
            {options.tabBarIcon?.({
              focused: isFocused,
              color,
              size: TAB_ICON_SIZE,
            })}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 0,
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
});

export function tabIcon(names: {
  ios: string;
  android: string;
  web: string;
}): (props: TabIconProps) => ReactNode {
  return ({ color, size }) => (
    <SymbolView name={names as never} tintColor={color} size={size ?? TAB_ICON_SIZE} />
  );
}
