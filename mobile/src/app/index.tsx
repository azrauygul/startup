import { Redirect } from 'expo-router';

import { Loading } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function Index() {
  const { user, loading } = useSession();
  if (loading) return <Loading />;
  if (!user) return <Redirect href="/giris" />;
  return <Redirect href={user.role === 'temizlikci' ? '/isler' : '/ana-sayfa'} />;
}
