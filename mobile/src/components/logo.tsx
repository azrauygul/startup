import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { colors } from '@/theme';

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <View
      accessible
      accessibilityLabel="mismis"
      style={{ flexDirection: 'row', alignItems: 'center', gap: size / 4 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 3,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name="sparkles" size={size * 0.6} color={colors.onPrimary} />
      </View>
      <Text style={{ fontSize: size * 0.8, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 }}>
        mismis
      </Text>
    </View>
  );
}
