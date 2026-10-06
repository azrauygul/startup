import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { STATUS_LABEL } from '@/components/cleaner-bits';
import { Avatar, Body, Button, Card, Field, Heading, InfoLine, Loading, Muted, Notice, Screen, Tag, Title, styles as ui } from '@/components/ui';
import { cleaningTypeLabel, formatTL, houseSizeLabel, packageById } from '@/config/pricing';
import { PET_OPTIONS } from '@/config/questionnaire';
import { slotTemplate } from '@/config/slots';
import { repository } from '@/data';
import type { Booking } from '@/data/types';
import { CONTACT_FILTER_NOTICE } from '@/lib/contact-filter';
import { formatDay, parseISODate } from '@/lib/dates';
import { useData } from '@/lib/use-data';
import { useSession } from '@/lib/session';
import { colors, radius, space } from '@/theme';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Evet', style: 'destructive', onPress: onYes },
  ]);
}

function hoursUntil(b: Booking) {
  const start = parseISODate(b.date);
  const [h, m] = slotTemplate(b.template).start.split(':').map(Number);
  start.setHours(h, m);
  return (start.getTime() - Date.now()) / 3_600_000;
}

export default function RandevuDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { data, reload } = useData(async () => {
    const [booking, messages] = await Promise.all([repository.getBooking(id), repository.listMessages(id)]);
    return { booking, messages };
  }, [id]);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading />;
  const { booking, messages } = data;
  if (!booking) return <Screen><Notice tone="danger">Randevu bulunamadı.</Notice></Screen>;

  const isCleaner = user?.role === 'temizlikci';
  const t = slotTemplate(booking.template);
  const active = booking.status === 'onaylandi';
  const freeCancel = hoursUntil(booking) > 24;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Bir sorun oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const send = () =>
    run(async () => {
      if (!text.trim()) return;
      const m = await repository.sendMessage(booking.id, text);
      setText('');
      setNotice(m.masked ? CONTACT_FILTER_NOTICE : null);
    });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        {isCleaner ? null : <Avatar uri={booking.cleanerPhotoUrl} size={72} />}
        <View style={{ flex: 1, gap: 4 }}>
          <Title>{isCleaner ? booking.customerName : booking.cleanerName}</Title>
          <Tag label={STATUS_LABEL[booking.status]} tone={active ? 'success' : 'neutral'} />
        </View>
      </View>

      <Card>
        <InfoLine icon="calendar">{formatDay(booking.date)}, {t.start} – {t.end}</InfoLine>
        <InfoLine icon="home">
          {houseSizeLabel(booking.answers.houseSize)} · {cleaningTypeLabel(booking.answers.cleaningType)}
        </InfoLine>
        <InfoLine icon="paw">{PET_OPTIONS.find((p) => p.id === booking.answers.pets)?.label ?? '—'}</InfoLine>
        <InfoLine icon="location">{booking.answers.address}</InfoLine>
        {booking.answers.notes ? <InfoLine icon="document-text">{booking.answers.notes}</InfoLine> : null}
        <InfoLine icon="repeat">{packageById(booking.packageId).label}</InfoLine>
        <InfoLine icon="wallet">
          {isCleaner
            ? `Size ödenecek: ${formatTL(booking.price.cleanerPayout)}`
            : `Ödenen: ${formatTL(booking.price.customerTotal)}`}
        </InfoLine>
      </Card>

      {notice ? <Notice tone="warning">{notice}</Notice> : null}

      {isCleaner && active ? (
        <Button
          label="Temizliği tamamladım"
          icon="checkmark-done"
          loading={busy}
          onPress={() =>
            confirm('Temizlik bitti mi?', 'Müşteriye değerlendirme bildirimi gidecek.', () =>
              run(() => repository.completeBooking(booking.id)),
            )
          }
        />
      ) : null}

      {!isCleaner && booking.status === 'tamamlandi' && !booking.reviewed ? (
        <Button
          label="Değerlendir"
          icon="star"
          onPress={() => router.push({ pathname: '/degerlendir/[id]', params: { id: booking.id } })}
        />
      ) : null}

      <Heading>Mesajlar</Heading>
      <Muted>Telefon, IBAN ve sosyal medya bilgileri otomatik gizlenir. Ödeme ve iletişim yalnızca mismis üzerinden yapılır.</Muted>
      {messages.length ? (
        messages.map((m) => {
          const mine = m.senderRole === user?.role;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                backgroundColor: mine ? colors.primarySoft : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.lg,
                padding: space.md,
                gap: 4,
              }}>
              <Text style={[ui.muted, { fontWeight: '700' }]}>
                {mine ? 'Siz' : m.senderRole === 'temizlikci' ? booking.cleanerName : booking.customerName}
              </Text>
              <Body>{m.text}</Body>
              {m.masked ? <Muted>Bu mesajdaki iletişim bilgisi gizlendi.</Muted> : null}
            </View>
          );
        })
      ) : (
        <Muted>Henüz mesaj yok.</Muted>
      )}
      {booking.status !== 'iptal' ? (
        <>
          <Field label="Mesajınız" value={text} onChangeText={setText} multiline placeholder="Mesajınızı yazın" />
          <Button label="Gönder" icon="send" variant="secondary" loading={busy} disabled={!text.trim()} onPress={send} />
        </>
      ) : null}

      {!isCleaner && active ? (
        <Card>
          <Heading>İptal</Heading>
          {freeCancel ? (
            <>
              <Body>Randevuya 24 saatten fazla var, ücretsiz iptal edebilirsiniz.</Body>
              <Button
                label="Randevuyu iptal et"
                icon="close-circle"
                variant="danger"
                loading={busy}
                onPress={() =>
                  confirm('Randevu iptal edilsin mi?', 'Ödemeniz kartınıza iade edilir.', () =>
                    run(() => repository.cancelBooking(booking.id)),
                  )
                }
              />
            </>
          ) : (
            <Body>Randevuya 24 saatten az kaldı. İptal için lütfen bizimle iletişime geçin; ücretin yarısı temizlikçiye ödenir.</Body>
          )}
        </Card>
      ) : null}
    </Screen>
  );
}
