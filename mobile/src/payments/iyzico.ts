import type { SupabaseClient } from '@supabase/supabase-js';

import type { CheckoutRequest, CheckoutSession, PaymentProvider, PaymentResult } from './types';

/**
 * Real iyzico Marketplace via Supabase Edge Functions (supabase/functions/iyzico-checkout).
 * The secret key never leaves the server; the app only opens the hosted Checkout Form in a WebView.
 */
export class IyzicoProvider implements PaymentProvider {
  readonly name = 'iyzico' as const;

  constructor(private client: SupabaseClient) {}

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const { data, error } = await this.client.functions.invoke('iyzico-checkout', {
      body: { action: 'initialize', slotId: req.slotId, packageId: req.packageId, answers: req.answers },
    });
    if (error) throw new Error('Ödeme sayfası açılamadı. Lütfen tekrar deneyin.');
    return data as CheckoutSession;
  }

  async confirm(session: CheckoutSession): Promise<PaymentResult> {
    const { data, error } = await this.client.functions.invoke('iyzico-checkout', {
      body: { action: 'status', token: session.token },
    });
    if (error) return { status: 'failed', reason: 'Ödeme sonucu alınamadı.' };
    if (data.status !== 'paid') return { status: 'failed', reason: data.reason ?? 'Ödeme tamamlanmadı.' };
    return { status: 'paid', paymentToken: session.token, paymentId: data.paymentId };
  }
}
