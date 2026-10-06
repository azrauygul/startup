import { Redirect, Tabs } from 'expo-router';

import { tabIcon, useTabScreenOptions } from '@/components/tab-options';
import { useSession } from '@/lib/session';

export default function TemizlikciLayout() {
  const { user, loading } = useSession();
  const screenOptions = useTabScreenOptions();
  if (!loading && user?.role !== 'temizlikci') return <Redirect href="/" />;

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="isler" options={{ title: 'İşlerim', tabBarIcon: tabIcon('briefcase-outline', 'briefcase') }} />
      <Tabs.Screen name="musaitlik" options={{ title: 'Müsaitliğim', tabBarIcon: tabIcon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profilim', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
