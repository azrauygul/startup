import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { InsuranceBadge, rulesList } from '@/components/cleaner-bits';
import {
  Avatar,
  Body,
  Button,
  Card,
  Heading,
  InfoLine,
  Loading,
  Muted,
  Notice,
  Row,
  Screen,
  Stars,
  Tag,
  Title,
  styles as ui,
} from '@/components/ui';
import { cleaningTypeLabel, formatTL, HOUSE_SIZES } from '@/config/pricing';
import { slotTemplate } from '@/config/slots';
import { repository } from '@/data';
import { formatDay } from '@/lib/dates';
import { useData } from '@/lib/use-data';
import { colors, space } from '@/theme';

export default function TemizlikciDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error } = useData(async () => {
    const [cleaner, slots, reviews] = await Promise.all([
      repository.getCleaner(id),
      repository.listSlots(id),
      repository.listReviews(id),
    ]);
    return { cleaner, slots: slots.filter((s) => !s.booked), reviews };
  }, [id]);

  if (error) return <Screen><Notice tone="danger">{error}</Notice></Screen>;
  if (!data) return <Loading />;
  const { cleaner, slots, reviews } = data;
  if (!cleaner) return <Screen><Notice tone="danger">Temizlikçi bulunamadı.</Notice></Screen>;
  const rules = rulesList(cleaner);

  return (
    <Screen
      footer={
        <Button
          label={slots.length ? 'Randevu al' : 'Şu an boş saati yok'}
          icon="calendar"
          disabled={!slots.length}
          onPress={() => router.push({ pathname: '/rezervasyon/[cleanerId]', params: { cleanerId: cleaner.id } })}
        />
      }>
      <Stack.Screen options={{ title: cleaner.fullName }} />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Avatar uri={cleaner.photoUrl} size={160} />
        <Title center>{cleaner.fullName}</Title>
        <Stars value={cleaner.ratingAvg} count={cleaner.ratingCount} />
        <InsuranceBadge status={cleaner.insuranceStatus} />
      </View>

      <Card>
        <InfoLine icon="time">{cleaner.yearsExperience} yıllık deneyim · {cleaner.completedJobs} tamamlanan iş</InfoLine>
        <InfoLine icon="location">{cleaner.city}: {cleaner.districts.join(', ')}</InfoLine>
      </Card>

      <Heading>Hakkında</Heading>
      <Body>{cleaner.bio || 'Henüz bilgi eklenmemiş.'}</Body>

      <Heading>Yaptığı temizlikler</Heading>
      <Row>
        {cleaner.cleaningTypes.map((t) => (
          <Tag key={t} label={cleaningTypeLabel(t)} />
        ))}
      </Row>

      <Heading>Fiyatlar</Heading>
      <Card>
        {HOUSE_SIZES.map((h) => (
          <View key={h.id} style={[ui.row, { justifyContent: 'space-between', paddingVertical: 4 }]}>
            <Body>{h.label}</Body>
            <Text style={[ui.bodyStrong, { color: colors.primary }]}>{formatTL(cleaner.prices[h.id])}</Text>
          </View>
        ))}
        <Muted>Standart temizlik fiyatıdır. Detaylı temizlikte ve paketlerde fiyat bir sonraki adımda hesaplanır.</Muted>
      </Card>

      {rules.length ? (
        <>
          <Heading>Tercihleri</Heading>
          <Card>
            {rules.map((r) => (
              <InfoLine key={r} icon="information-circle">{r}</InfoLine>
            ))}
          </Card>
        </>
      ) : null}

      <Heading>En yakın boş saatler</Heading>
      {slots.length ? (
        <Card>
          {slots.slice(0, 4).map((s) => {
            const t = slotTemplate(s.template);
            return (
              <InfoLine key={s.id} icon="calendar">
                {formatDay(s.date)} · {t.start} – {t.end}
              </InfoLine>
            );
          })}
        </Card>
      ) : (
        <Muted>Bu temizlikçinin önümüzdeki iki hafta boş saati yok.</Muted>
      )}

      <Heading>Yorumlar</Heading>
      {reviews.length ? (
        reviews.map((r) => (
          <Card key={r.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={ui.bodyStrong}>{r.customerName}</Text>
              <Stars value={r.rating} />
            </Row>
            {r.comment ? <Body>{r.comment}</Body> : null}
          </Card>
        ))
      ) : (
        <Muted>Henüz yorum yok.</Muted>
      )}
    </Screen>
  );
}
