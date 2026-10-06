import { useState } from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Button, Card, Field, Heading, Muted, Notice, Row } from './ui';
import { payments, SANDBOX_CARDS, type CheckoutSession, type SandboxCard } from '@/payments';
import type { CheckoutRequest } from '@/payments/types';
import { colors, space } from '@/theme';

/**
 * Real iyzico: opens the hosted Checkout Form in a WebView.
 * Sandbox: a minimal in-app card form prefilled with the iyzico test card.
 */
export function PaymentStep({
  request,
  amountLabel,
  onPaid,
}: {
  request: CheckoutRequest;
  amountLabel: string;
  onPaid: (paymentToken: string) => Promise<void>;
}) {
  const [card, setCard] = useState<SandboxCard>({
    holder: request.buyer.fullName,
    number: SANDBOX_CARDS.success,
    expiry: '12/30',
    cvc: '123',
  });
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSandbox = payments.name === 'mock-iyzico';

  const finish = async (s: CheckoutSession, sandboxCard?: SandboxCard) => {
    const result = await payments.confirm(s, sandboxCard);
    if (result.status === 'failed') throw new Error(result.reason);
    await onPaid(result.paymentToken);
  };

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await payments.createCheckout(request);
      if (s.paymentPageUrl) setSession(s);
      else await finish(s, card);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ödeme yapılamadı.');
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof SandboxCard) => (v: string) => setCard((c) => ({ ...c, [k]: v }));

  return (
    <View style={{ gap: space.md }}>
      {isSandbox ? (
        <Card style={{ gap: space.md }}>
          <Heading>Kart bilgileri</Heading>
          <Notice tone="warning" icon="flask">Deneme ödemesi: iyzico test kartı hazır yazıldı, gerçek para çekilmez.</Notice>
          <Field label="Kart üzerindeki isim" value={card.holder} onChangeText={set('holder')} autoComplete="name" />
          <Field label="Kart numarası" value={card.number} onChangeText={set('number')} keyboardType="number-pad" maxLength={19} />
          <Row style={{ flexWrap: 'nowrap', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Field label="Son kullanma (AA/YY)" value={card.expiry} onChangeText={set('expiry')} maxLength={5} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="CVC" value={card.cvc} onChangeText={set('cvc')} keyboardType="number-pad" maxLength={4} secureTextEntry />
            </View>
          </Row>
        </Card>
      ) : (
        <Muted>“Öde” düğmesine bastığınızda iyzico’nun güvenli ödeme sayfası açılır.</Muted>
      )}
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button label={`${amountLabel} öde`} icon="lock-closed" loading={busy} onPress={pay} />

      <Modal visible={!!session} animationType="slide" onRequestClose={() => setSession(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={{ padding: space.md }}>
            <Button label="Vazgeç" icon="close" variant="secondary" onPress={() => setSession(null)} />
          </View>
          {session?.paymentPageUrl ? (
            <WebView
              source={{ uri: session.paymentPageUrl }}
              onNavigationStateChange={(nav) => {
                if (!nav.url.startsWith(session.callbackUrlPrefix)) return;
                const s = session;
                setSession(null);
                setBusy(true);
                finish(s)
                  .catch((e) => setError(e instanceof Error ? e.message : 'Ödeme yapılamadı.'))
                  .finally(() => setBusy(false));
              }}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
