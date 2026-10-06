import { Redirect, Tabs } from 'expo-router';

import { tabIcon, useTabScreenOptions } from '@/components/tab-options';
import { useSession } from '@/lib/session';

export default function MusteriLayout() {
  const { user, loading } = useSession();
  const screenOptions = useTabScreenOptions();
  if (!loading && user?.role !== 'musteri') return <Redirect href="/" />;

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="ana-sayfa" options={{ title: 'Ana Sayfa', headerShown: false, tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="kesfet" options={{ title: 'Keşfet', tabBarIcon: tabIcon('search-outline', 'search') }} />
      <Tabs.Screen name="randevularim" options={{ title: 'Randevularım', tabBarIcon: tabIcon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="hesabim" options={{ title: 'Hesabım', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
