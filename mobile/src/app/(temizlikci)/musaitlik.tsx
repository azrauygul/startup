import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Body, Card, Heading, Loading, Notice, Screen, styles as ui } from '@/components/ui';
import { BOOKING_WINDOW_DAYS, SLOT_TEMPLATES, type SlotTemplateId } from '@/config/slots';
import { repository } from '@/data';
import { formatDay, nextDays } from '@/lib/dates';
import { useData } from '@/lib/use-data';
import { useSession } from '@/lib/session';
import { colors, radius, space, TAP } from '@/theme';

export default function Musaitlik() {
  const { user } = useSession();
  const cleanerId = user?.cleanerId ?? '';
  const { data: slots, reload } = useData(() => repository.listSlots(cleanerId), [cleanerId]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  if (!slots) return <Loading />;

  const toggle = async (date: string, template: SlotTemplateId, open: boolean) => {
    const key = `${date}-${template}`;
    setPending(key);
    setError(null);
    try {
      await repository.setSlotOpen(cleanerId, date, template, open);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi.');
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen>
      <Body>Çalışabileceğiniz saatlere dokunup açın. Müşteriler açık saatlerden hemen randevu alır.</Body>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {nextDays(BOOKING_WINDOW_DAYS + 1).slice(1).map((date) => (
        <Card key={date}>
          <Heading>{formatDay(date)}</Heading>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {SLOT_TEMPLATES.map((t) => {
              const slot = slots.find((s) => s.date === date && s.template === t.id);
              const state = slot?.booked ? 'dolu' : slot ? 'acik' : 'kapali';
              const key = `${date}-${t.id}`;
              const look = {
                acik: { bg: colors.primary, fg: colors.onPrimary, icon: 'checkmark-circle' as const, text: 'Açık' },
                kapali: { bg: colors.surface, fg: colors.textMuted, icon: 'close-circle-outline' as const, text: 'Kapalı' },
                dolu: { bg: colors.warningSoft, fg: colors.warning, icon: 'person' as const, text: 'Randevu var' },
              }[state];
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: state !== 'kapali', disabled: state === 'dolu', busy: pending === key }}
                  accessibilityLabel={`${formatDay(date)} ${t.label} ${t.start}–${t.end}: ${look.text}`}
                  disabled={state === 'dolu' || pending === key}
                  onPress={() => toggle(date, t.id, state === 'kapali')}
                  style={{
                    flex: 1,
                    minHeight: TAP + 24,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor: state === 'kapali' ? colors.border : look.bg,
                    backgroundColor: look.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: space.sm,
                    opacity: pending === key ? 0.6 : 1,
                  }}>
                  <Text style={[ui.bodyStrong, { color: look.fg }]}>{t.label}</Text>
                  <Text style={[ui.muted, { color: look.fg }]}>{t.start} – {t.end}</Text>
                  <View style={[ui.row, { marginTop: 4 }]}>
                    <Ionicons name={look.icon} size={22} color={look.fg} />
                    <Text style={[ui.muted, { color: look.fg, fontWeight: '700' }]}>{look.text}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
