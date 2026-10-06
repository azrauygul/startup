import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { rulesList } from '@/components/cleaner-bits';
import { PaymentStep } from '@/components/payment-step';
import { Avatar, Body, Button, Card, Choice, Field, Heading, InfoLine, Loading, Muted, Notice, Screen, Title, styles as ui } from '@/components/ui';
import {
  cleaningTypeLabel,
  formatTL,
  houseSizeLabel,
  PACKAGES,
  packageById,
  quote,
  type CleaningTypeId,
  type HouseSizeId,
  type PackageId,
} from '@/config/pricing';
import { PET_OPTIONS, QUESTIONS, type Answers } from '@/config/questionnaire';
import { slotTemplate } from '@/config/slots';
import { repository } from '@/data';
import type { Booking, Cleaner, Slot } from '@/data/types';
import { CONTACT_FILTER_NOTICE, filterContactInfo } from '@/lib/contact-filter';
import { formatDay } from '@/lib/dates';
import { useData } from '@/lib/use-data';
import { useSession } from '@/lib/session';
import { colors, space } from '@/theme';

const STEP_TITLES = ['Gün ve saat', 'Eviniz', 'Ne sıklıkla?', 'Özet ve ödeme'];

export default function Rezervasyon() {
  const { cleanerId } = useLocalSearchParams<{ cleanerId: string }>();
  const { data } = useData(async () => {
    const [cleaner, slots] = await Promise.all([repository.getCleaner(cleanerId), repository.listSlots(cleanerId)]);
    return { cleaner, slots: slots.filter((s) => !s.booked) };
  }, [cleanerId]);

  if (!data) return <Loading />;
  if (!data.cleaner) return <Screen><Notice tone="danger">Temizlikçi bulunamadı.</Notice></Screen>;
  return <Wizard cleaner={data.cleaner} slots={data.slots} />;
}

function petConflict(cleaner: Cleaner, pets: string | undefined) {
  if (!pets || pets === 'yok') return null;
  if (cleaner.rules.noPets) return `${cleaner.fullName} evcil hayvan olan evlere gitmiyor.`;
  if (pets === 'kopek' && cleaner.rules.noDogs) return `${cleaner.fullName} köpek olan evlere gitmiyor.`;
  if (pets === 'kedi' && cleaner.rules.noCats) return `${cleaner.fullName} kedi olan evlere gitmiyor.`;
  return null;
}

function Wizard({ cleaner, slots }: { cleaner: Cleaner; slots: Slot[] }) {
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    cleaningType: cleaner.cleaningTypes.length === 1 ? cleaner.cleaningTypes[0] : '',
  });
  const [pkg, setPkg] = useState<PackageId>('tek');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(
    () =>
      QUESTIONS.map((q) =>
        q.id === 'cleaningType' && q.kind === 'choice'
          ? { ...q, options: q.options.filter((o) => cleaner.cleaningTypes.includes(o.id as CleaningTypeId)) }
          : q,
      ),
    [cleaner.cleaningTypes],
  );

  const hasPets = !!answers.pets && answers.pets !== 'yok';
  const conflict = petConflict(cleaner, answers.pets);
  const answersComplete = questions.every((q) => !q.required || (answers[q.id] ?? '').trim());
  const priceFor = (p: PackageId) =>
    quote(cleaner.prices, answers.houseSize as HouseSizeId, answers.cleaningType as CleaningTypeId, p, hasPets);

  const canContinue = [!!slot, answersComplete && !conflict, true, false][step];

  const next = () => {
    setError(null);
    if (step === 1 && answers.notes) {
      const filtered = filterContactInfo(answers.notes);
      if (filtered.changed) {
        setAnswers((a) => ({ ...a, notes: filtered.text }));
        setError(CONTACT_FILTER_NOTICE);
      }
    }
    setStep((s) => s + 1);
  };

  if (booking) return <Confirmed booking={booking} />;

  const footer =
    step < 3 ? (
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {step > 0 ? <Button label="Geri" variant="secondary" style={{ flex: 1 }} onPress={() => setStep(step - 1)} /> : null}
        <Button label="Devam" icon="arrow-forward" style={{ flex: 2 }} disabled={!canContinue} onPress={next} />
      </View>
    ) : (
      <Button label="Geri" variant="secondary" onPress={() => setStep(2)} />
    );

  return (
    <Screen footer={footer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Avatar uri={cleaner.photoUrl} size={56} />
        <View style={{ flex: 1 }}>
          <Muted>Adım {step + 1} / 4</Muted>
          <Title>{STEP_TITLES[step]}</Title>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityElementsHidden>
        {STEP_TITLES.map((t, i) => (
          <View key={t} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= step ? colors.primary : colors.border }} />
        ))}
      </View>

      {step === 0 ? <SlotStep slots={slots} selected={slot} onSelect={setSlot} /> : null}

      {step === 1 ? (
        <>
          {questions.map((q) =>
            q.kind === 'choice' ? (
              <View key={q.id} style={{ gap: space.sm }}>
                <Heading>{q.title}</Heading>
                {q.help ? <Muted>{q.help}</Muted> : null}
                {q.options.map((o) => (
                  <Choice
                    key={o.id}
                    label={o.label}
                    hint={o.hint}
                    selected={answers[q.id] === o.id}
                    onPress={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  />
                ))}
                {q.id === 'pets' && conflict ? <Notice tone="danger">{conflict} Lütfen başka bir temizlikçi seçin.</Notice> : null}
              </View>
            ) : (
              <Field
                key={q.id}
                label={q.title + (q.required ? '' : ' (isteğe bağlı)')}
                help={q.help}
                placeholder={q.placeholder}
                multiline={q.multiline}
                value={answers[q.id] ?? ''}
                onChangeText={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              />
            ),
          )}
          {rulesList(cleaner).length ? (
            <Card>
              <Text style={ui.bodyStrong}>{cleaner.fullName} tercihleri</Text>
              {rulesList(cleaner).map((r) => <InfoLine key={r} icon="information-circle">{r}</InfoLine>)}
            </Card>
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Body>Düzenli temizlikte indirim kazanırsınız ve her seferinde aynı temizlikçi gelir.</Body>
          {PACKAGES.map((p) => {
            const q = priceFor(p.id);
            return (
              <Choice
                key={p.id}
                label={`${p.label} · ${formatTL(q.customerTotal)}`}
                hint={[p.discountPct ? `%${p.discountPct} indirim` : null, p.description, p.everyWeeks ? 'hizmet bedeli yok' : null]
                  .filter(Boolean)
                  .join(' · ')}
                selected={pkg === p.id}
                onPress={() => setPkg(p.id)}
              />
            );
          })}
          <Muted>Paketlerde her temizlik ayrı ayrı, temizlikten önce ödenir. İstediğiniz zaman bırakabilirsiniz.</Muted>
        </>
      ) : null}

      {step === 3 && slot && user ? (
        <>
          {error ? <Notice tone="warning">{error}</Notice> : null}
          <Summary cleaner={cleaner} slot={slot} answers={answers} pkg={pkg} price={priceFor(pkg)} />
          <PaymentStep
            amountLabel={formatTL(priceFor(pkg).customerTotal)}
            request={{
              cleanerId: cleaner.id,
              slotId: slot.id,
              packageId: pkg,
              answers,
              price: priceFor(pkg),
              buyer: { id: user.id, fullName: user.fullName },
            }}
            onPaid={async (paymentToken) => {
              const b = await repository.createBooking({
                cleanerId: cleaner.id,
                slotId: slot.id,
                answers,
                packageId: pkg,
                price: priceFor(pkg),
                paymentId: paymentToken,
              });
              setBooking(b);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}

function SlotStep({ slots, selected, onSelect }: { slots: Slot[]; selected: Slot | null; onSelect: (s: Slot) => void }) {
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    return [...map.entries()];
  }, [slots]);

  if (!days.length) return <Notice tone="warning">Bu temizlikçinin şu an boş saati yok.</Notice>;
  return (
    <>
      <Body>Temizlikçinin boş olduğu saatler aşağıda. Seçtiğiniz saat hemen sizin olur.</Body>
      {days.map(([date, daySlots]) => (
        <View key={date} style={{ gap: space.sm }}>
          <Heading>{formatDay(date)}</Heading>
          {daySlots.map((s) => {
            const t = slotTemplate(s.template);
            return (
              <Choice
                key={s.id}
                label={`${t.label}: ${t.start} – ${t.end}`}
                selected={selected?.id === s.id}
                onPress={() => onSelect(s)}
              />
            );
          })}
        </View>
      ))}
    </>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={[ui.row, { justifyContent: 'space-between', flexWrap: 'nowrap', gap: space.md }]}>
      <Text style={[strong ? ui.bodyStrong : ui.body, { flexShrink: 1 }]}>{label}</Text>
      <Text style={[ui.bodyStrong, strong && { color: colors.primary, fontSize: 24 }]}>{value}</Text>
    </View>
  );
}

function Summary({
  cleaner,
  slot,
  answers,
  pkg,
  price,
}: {
  cleaner: Cleaner;
  slot: Slot;
  answers: Answers;
  pkg: PackageId;
  price: ReturnType<typeof quote>;
}) {
  const t = slotTemplate(slot.template);
  const p = packageById(pkg);
  return (
    <Card>
      <InfoLine icon="person">{cleaner.fullName}</InfoLine>
      <InfoLine icon="calendar">{formatDay(slot.date)}, {t.start} – {t.end}</InfoLine>
      <InfoLine icon="home">
        {houseSizeLabel(answers.houseSize)} · {cleaningTypeLabel(answers.cleaningType)} ·{' '}
        {PET_OPTIONS.find((o) => o.id === answers.pets)?.label}
      </InfoLine>
      <InfoLine icon="repeat">{p.label}</InfoLine>
      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: space.xs }} />
      <Line label="Temizlik ücreti" value={formatTL(price.listPrice)} />
      {price.discountPct ? (
        <Line label={`Paket indirimi (%${price.discountPct})`} value={`−${formatTL(price.listPrice - price.servicePrice)}`} />
      ) : null}
      <Line label="Hizmet bedeli" value={price.customerFee ? formatTL(price.customerFee) : 'Yok'} />
      <Line label={price.isSubscription ? 'Her temizlik için' : 'Toplam'} value={formatTL(price.customerTotal)} strong />
      <Muted>Ödemeniz temizlik bitene kadar iyzico güvenli havuzunda bekler.</Muted>
    </Card>
  );
}

function Confirmed({ booking }: { booking: Booking }) {
  const t = slotTemplate(booking.template);
  return (
    <Screen
      footer={
        <>
          <Button label="Randevularım" icon="calendar" onPress={() => router.replace('/randevularim')} />
          <Button label="Ana sayfa" variant="secondary" onPress={() => router.replace('/ana-sayfa')} />
        </>
      }>
      <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xl }}>
        <Ionicons name="checkmark-circle" size={110} color={colors.success} />
        <Title center>Randevunuz onaylandı</Title>
        <Body center>
          {booking.cleanerName}, {formatDay(booking.date)} günü saat {t.start}’da evinizde olacak.
        </Body>
      </View>
      <Notice tone="success" icon="chatbubbles">
        Sorunuz olursa randevu sayfasından temizlikçinize yazabilirsiniz.
      </Notice>
    </Screen>
  );
}
