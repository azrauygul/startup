import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BookingCard } from '@/components/cleaner-bits';
import { Logo } from '@/components/logo';
import { Body, Button, Card, Heading, Notice, Screen, Title, styles as ui, type IconName } from '@/components/ui';
import { repository } from '@/data';
import { useData } from '@/lib/use-data';
import { useSession } from '@/lib/session';
import { todayISO } from '@/lib/dates';
import { colors, space } from '@/theme';

const PROMISES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'shield-checkmark',
    title: 'Sigortalı ve doğrulanmış',
    text: 'Her temizlikçinin SGK veya sigorta belgesini e-Devlet barkoduyla kontrol ederiz. Doğrulananlar yeşil rozet taşır.',
  },
  {
    icon: 'flash',
    title: 'Anında onay',
    text: 'Temizlikçinin boş saatlerinden birini seçersiniz, randevunuz hemen onaylanır. Beklemek yok.',
  },
  {
    icon: 'lock-closed',
    title: 'Güvenli ödeme',
    text: 'Ödemeniz iyzico güvencesiyle mismis üzerinden yapılır. Para, temizlik bitene kadar güvenli havuzda bekler.',
  },
  {
    icon: 'star',
    title: 'Gerçek yorumlar',
    text: 'Puanları yalnızca temizlik yaptırmış müşteriler verir.',
  },
];

const STEPS = ['Temizlikçinizi seçin', 'Boş bir gün ve saat seçin', 'Evinizi anlatın ve ödeyin'];

export default function AnaSayfa() {
  const { user } = useSession();
  const { data: bookings } = useData(() => repository.listMyBookings());
  const upcoming = bookings?.find((b) => b.status === 'onaylandi' && b.date >= todayISO());
  const toReview = bookings?.find((b) => b.status === 'tamamlandi' && !b.reviewed);

  return (
    <Screen edges={['top']}>
      <View style={{ gap: space.sm, paddingTop: space.sm }}>
        <Logo />
        <Title>Merhaba {user?.fullName.split(' ')[0]},</Title>
        <Body>mismis ile evinize güvenilir, sigortalı temizlikçi birkaç dokunuşla gelir.</Body>
      </View>

      <Button label="Temizlikçi bul" icon="search" onPress={() => router.push('/kesfet')} />

      {toReview ? (
        <Card style={{ borderColor: colors.star, borderWidth: 2 }}>
          <Heading>{toReview.cleanerName} ile temizliğiniz nasıldı?</Heading>
          <Body>Puanınız diğer kullanıcılara yol gösterir.</Body>
          <Button
            label="Değerlendir"
            icon="star"
            variant="secondary"
            onPress={() => router.push({ pathname: '/degerlendir/[id]', params: { id: toReview.id } })}
          />
        </Card>
      ) : null}

      {upcoming ? (
        <View style={{ gap: space.sm }}>
          <Heading>Sıradaki randevunuz</Heading>
          <BookingCard booking={upcoming} />
        </View>
      ) : null}

      <Heading>Neden mismis?</Heading>
      {PROMISES.map((p) => (
        <Card key={p.title} style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={p.icon} size={32} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={ui.bodyStrong}>{p.title}</Text>
            <Body>{p.text}</Body>
          </View>
        </Card>
      ))}

      <Heading>Nasıl çalışır?</Heading>
      <Card>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[ui.bodyStrong, { color: colors.onPrimary }]}>{i + 1}</Text>
            </View>
            <Body style={{ flex: 1 }}>{s}</Body>
          </View>
        ))}
      </Card>

      <Notice icon="chatbubbles">
        Telefon numaraları gizli tutulur. Temizlikçinizle uygulama içinden yazışırsınız; böylece güvence ve
        iade hakkınız korunur.
      </Notice>
    </Screen>
  );
}
