import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from './ui';
import { colors, font } from '@/theme';

export function useTabScreenOptions() {
  const insets = useSafeAreaInsets();
  return {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      height: 76 + insets.bottom,
      paddingTop: 8,
      paddingBottom: 8 + insets.bottom,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      backgroundColor: colors.surface,
    },
    tabBarLabelStyle: { fontSize: 16, fontWeight: '700' as const },
    tabBarLabelPosition: 'below-icon' as const,
    headerStyle: { backgroundColor: colors.surface },
    headerTitleStyle: { fontSize: font.title, fontWeight: '700' as const, color: colors.text },
    headerTitleAlign: 'left' as const,
  };
}

export function tabIcon(name: IconName, focusedName: IconName) {
  function TabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
    return <Ionicons name={focused ? focusedName : name} size={30} color={color as string} />;
  }
  return TabIcon;
}
