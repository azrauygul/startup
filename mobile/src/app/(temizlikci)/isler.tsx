import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BookingCard, InsuranceBadge } from '@/components/cleaner-bits';
import { Body, Button, Card, Heading, Loading, Muted, Notice, Screen, styles as ui } from '@/components/ui';
import { COMMISSION, formatTL } from '@/config/pricing';
import { repository } from '@/data';
import { todayISO } from '@/lib/dates';
import { useData } from '@/lib/use-data';
import { useSession } from '@/lib/session';
import { colors, space } from '@/theme';

export default function Isler() {
  const { user } = useSession();
  const { data, error } = useData(async () => {
    const [bookings, cleaner] = await Promise.all([
      repository.listMyBookings(),
      user?.cleanerId ? repository.getCleaner(user.cleanerId) : null,
    ]);
    return { bookings, cleaner };
  }, [user?.cleanerId]);
  if (!data && !error) return <Loading />;

  const today = todayISO();
  const bookings = data?.bookings ?? [];
  const upcoming = bookings.filter((b) => b.status === 'onaylandi' && b.date >= today);
  const done = bookings.filter((b) => b.status === 'tamamlandi');
  const earned = done.reduce((sum, b) => sum + b.price.cleanerPayout, 0);
  const cleaner = data?.cleaner;
  const profileIncomplete = cleaner && (!cleaner.photoUrl || cleaner.insuranceStatus === 'yok');

  return (
    <Screen>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {profileIncomplete ? (
        <Card style={{ borderColor: colors.warning, borderWidth: 2 }}>
          <Heading>Profilinizi tamamlayın</Heading>
          <Body>Müşteriler fotoğrafı ve sigorta belgesi olan temizlikçileri tercih ediyor.</Body>
          <Button label="Profilime git" icon="person" variant="secondary" onPress={() => router.push('/profil')} />
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Card style={{ flex: 1 }}>
          <Muted>Yaklaşan iş</Muted>
          <Text style={[ui.title, { color: colors.primary }]}>{upcoming.length}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>Kazancınız</Muted>
          <Text style={[ui.heading, { color: colors.primary }]}>{formatTL(earned)}</Text>
        </Card>
      </View>
      {cleaner ? <InsuranceBadge status={cleaner.insuranceStatus} /> : null}

      <Heading>Yaklaşan işler</Heading>
      {upcoming.length ? (
        upcoming.map((b) => <BookingCard key={b.id} booking={b} showCustomer />)
      ) : (
        <Card>
          <Body>Henüz randevunuz yok. Boş saatlerinizi açın, müşteriler hemen randevu alabilsin.</Body>
          <Button label="Müsaitliğimi aç" icon="calendar" onPress={() => router.push('/musaitlik')} />
        </Card>
      )}

      <Heading>Tamamlanan işler</Heading>
      {done.length ? done.map((b) => <BookingCard key={b.id} booking={b} showCustomer />) : <Muted>Henüz tamamlanan iş yok.</Muted>}

      <Muted>
        Ödemeniz temizlik tamamlandıktan sonra hesabınıza aktarılır. mismis komisyonu tek seferlik işlerde %
        {COMMISSION.cleanerOneOff * 100}, paket müşterilerinde %{COMMISSION.cleanerSubscription * 100}’dir.
      </Muted>
    </Screen>
  );
}
