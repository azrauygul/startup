import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Avatar, Body, Card, Muted, Row, Stars, Tag, styles as ui } from './ui';
import { cleaningTypeLabel, formatTL, priceRange } from '@/config/pricing';
import { slotTemplate } from '@/config/slots';
import type { Booking, Cleaner, InsuranceStatus } from '@/data/types';
import { formatDay } from '@/lib/dates';
import { colors, font, space } from '@/theme';

export function InsuranceBadge({ status }: { status: InsuranceStatus }) {
  if (status === 'dogrulandi') return <Tag icon="shield-checkmark" tone="success" label="Sigortalı · Belgesi doğrulandı" />;
  if (status === 'inceleniyor') return <Tag icon="time" tone="warning" label="Sigorta belgesi inceleniyor" />;
  return <Tag icon="alert-circle" tone="warning" label="Sigorta belgesi yok" />;
}

export function rulesList(c: Cleaner): string[] {
  const list: string[] = [];
  if (c.rules.noPets) list.push('Evcil hayvan olan evlere gitmiyor');
  else {
    if (c.rules.noDogs) list.push('Köpek olan evlere gitmiyor');
    if (c.rules.noCats) list.push('Kedi olan evlere gitmiyor');
  }
  if (c.rules.other.trim()) list.push(c.rules.other.trim());
  return list;
}

export function CleanerCard({ cleaner }: { cleaner: Cleaner }) {
  const range = priceRange(cleaner.prices);
  return (
    <Link href={{ pathname: '/temizlikci/[id]', params: { id: cleaner.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Temizlikçinin profilini açar"
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <Card>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Avatar uri={cleaner.photoUrl} size={104} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[ui.heading, { fontSize: font.title }]}>{cleaner.fullName}</Text>
              <Stars value={cleaner.ratingAvg} count={cleaner.ratingCount} />
              <Text style={[ui.bodyStrong, { color: colors.primary }]}>
                {formatTL(range.min)} – {formatTL(range.max)}
              </Text>
              <Muted>{cleaner.districts.join(', ')}</Muted>
            </View>
          </View>
          <InsuranceBadge status={cleaner.insuranceStatus} />
          <Row>
            {cleaner.cleaningTypes.map((t) => (
              <Tag key={t} label={cleaningTypeLabel(t)} />
            ))}
          </Row>
          <View style={[ui.row, { justifyContent: 'flex-end' }]}>
            <Text style={[ui.bodyStrong, { color: colors.primary }]}>Profili gör</Text>
            <Ionicons name="chevron-forward" size={26} color={colors.primary} />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

export const STATUS_LABEL = { onaylandi: 'Onaylandı', tamamlandi: 'Tamamlandı', iptal: 'İptal edildi' } as const;

export function BookingCard({ booking, showCustomer }: { booking: Booking; showCustomer?: boolean }) {
  const t = slotTemplate(booking.template);
  const tone = booking.status === 'onaylandi' ? 'success' : booking.status === 'iptal' ? 'warning' : 'neutral';
  return (
    <Link href={{ pathname: '/randevu/[id]', params: { id: booking.id } }} asChild>
      <Pressable accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tag label={STATUS_LABEL[booking.status]} tone={tone} icon={booking.status === 'onaylandi' ? 'checkmark-circle' : undefined} />
            <Ionicons name="chevron-forward" size={26} color={colors.primary} />
          </Row>
          <Text style={ui.heading}>{formatDay(booking.date)}</Text>
          <Body>
            {t.label}, saat {t.start} – {t.end}
          </Body>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            {showCustomer ? null : <Avatar uri={booking.cleanerPhotoUrl} size={48} />}
            <Body style={{ fontWeight: '600' }}>{showCustomer ? booking.customerName : booking.cleanerName}</Body>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
