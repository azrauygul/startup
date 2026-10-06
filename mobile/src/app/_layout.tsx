import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/lib/session';
import { colors, font } from '@/theme';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary, text: colors.text },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <SessionProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontSize: font.large, fontWeight: '700', color: colors.text },
              headerBackTitle: 'Geri',
              headerBackButtonDisplayMode: 'default',
              contentStyle: { backgroundColor: colors.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="giris" options={{ headerShown: false }} />
            <Stack.Screen name="(musteri)" options={{ headerShown: false }} />
            <Stack.Screen name="(temizlikci)" options={{ headerShown: false }} />
            <Stack.Screen name="temizlikci/[id]" options={{ title: 'Temizlikçi' }} />
            <Stack.Screen name="rezervasyon/[cleanerId]" options={{ title: 'Randevu al' }} />
            <Stack.Screen name="randevu/[id]" options={{ title: 'Randevu' }} />
            <Stack.Screen name="degerlendir/[id]" options={{ title: 'Değerlendir' }} />
          </Stack>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
