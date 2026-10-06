import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Body, Button, Field, Loading, Notice, Screen, StarInput, Title } from '@/components/ui';
import { repository } from '@/data';
import { useData } from '@/lib/use-data';
import { colors, space } from '@/theme';

const RATING_WORDS = ['', 'Çok kötü', 'Kötü', 'İdare eder', 'İyi', 'Çok iyi'];

export default function Degerlendir() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking } = useData(() => repository.getBooking(id), [id]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!booking) return <Loading />;

  if (done) {
    return (
      <Screen footer={<Button label="Ana sayfa" onPress={() => router.replace('/ana-sayfa')} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xl }}>
          <Ionicons name="heart" size={96} color={colors.primary} />
          <Title center>Teşekkür ederiz</Title>
          <Body center>Değerlendirmeniz {booking.cleanerName} profilinde görünecek.</Body>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="Gönder"
          icon="send"
          disabled={!rating}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await repository.addReview(booking.id, rating, comment);
              setDone(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Gönderilemedi.');
            } finally {
              setBusy(false);
            }
          }}
        />
      }>
      <View style={{ alignItems: 'center', gap: space.md }}>
        <Avatar uri={booking.cleanerPhotoUrl} size={120} />
        <Title center>{booking.cleanerName} ile temizliğiniz nasıldı?</Title>
        <StarInput value={rating} onChange={setRating} />
        <Body center style={{ fontWeight: '700', minHeight: 30 }}>{RATING_WORDS[rating]}</Body>
      </View>
      <Field
        label="Yorumunuz (isteğe bağlı)"
        placeholder="Neleri beğendiniz?"
        multiline
        value={comment}
        onChangeText={setComment}
      />
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
