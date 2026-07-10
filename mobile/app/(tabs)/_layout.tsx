import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/brand/AppHeader';
import { AppTabBar, tabIcon, type AppTabBarProps } from '@/components/navigation/AppTabBar';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader />
      <View style={styles.tabs}>
        <Tabs
        tabBar={(props) => (
          <AppTabBar
            state={props.state}
            descriptors={props.descriptors}
            navigation={props.navigation as AppTabBarProps['navigation']}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '달력',
          tabBarIcon: tabIcon({
            ios: 'calendar',
            android: 'calendar_today',
            web: 'calendar_today',
          }),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
          tabBarIcon: tabIcon({
            ios: 'chart.bar.fill',
            android: 'bar_chart',
            web: 'bar_chart',
          }),
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: '성장',
          tabBarIcon: tabIcon({
            ios: 'chart.line.uptrend.xyaxis',
            android: 'trending_up',
            web: 'trending_up',
          }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          tabBarIcon: tabIcon({
            ios: 'person.fill',
            android: 'person',
            web: 'person',
          }),
        }}
      />
    </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabs: {
    flex: 1,
  },
});
