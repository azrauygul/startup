import { router } from 'expo-router';

import { BookingCard } from '@/components/cleaner-bits';
import { Body, Button, Card, Heading, Loading, Muted, Notice, Screen } from '@/components/ui';
import { repository } from '@/data';
import { todayISO } from '@/lib/dates';
import { useData } from '@/lib/use-data';

export default function Randevularim() {
  const { data: bookings, error } = useData(() => repository.listMyBookings());
  if (!bookings && !error) return <Loading />;

  const today = todayISO();
  const upcoming = bookings?.filter((b) => b.status === 'onaylandi' && b.date >= today) ?? [];
  const past = (bookings?.filter((b) => !upcoming.includes(b)) ?? []).reverse();

  return (
    <Screen>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Heading>Yaklaşan</Heading>
      {upcoming.length ? (
        upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
      ) : (
        <Card>
          <Body>Yaklaşan randevunuz yok.</Body>
          <Button label="Temizlikçi bul" icon="search" onPress={() => router.push('/kesfet')} />
        </Card>
      )}
      <Heading>Geçmiş</Heading>
      {past.length ? past.map((b) => <BookingCard key={b.id} booking={b} />) : <Muted>Henüz geçmiş randevunuz yok.</Muted>}
    </Screen>
  );
}
