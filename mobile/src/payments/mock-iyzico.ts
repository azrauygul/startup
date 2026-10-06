import type { CheckoutRequest, CheckoutSession, PaymentProvider, PaymentResult, SandboxCard } from './types';

/** iyzico sandbox test cards: the first succeeds, the second is declined (insufficient funds). */
export const SANDBOX_CARDS = {
  success: '5528790000000008',
  insufficientFunds: '4111111111111129',
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Offline stand-in for iyzico Marketplace. Validates the card like the sandbox would,
 * and logs the split the real backend would send (sub-merchant price = cleaner payout).
 */
export class MockIyzicoProvider implements PaymentProvider {
  readonly name = 'mock-iyzico' as const;
  private requests = new Map<string, CheckoutRequest>();

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const token = `mock-${Date.now().toString(36)}`;
    this.requests.set(token, req);
    return { token, paymentPageUrl: null, callbackUrlPrefix: 'mismis://odeme' };
  }

  async confirm(session: CheckoutSession, card?: SandboxCard): Promise<PaymentResult> {
    await wait(700);
    const req = this.requests.get(session.token);
    if (!req) return { status: 'failed', reason: 'Ödeme oturumu bulunamadı.' };
    const digits = card?.number.replace(/\D/g, '') ?? '';
    if (digits.length < 15) return { status: 'failed', reason: 'Kart numarası eksik.' };
    if (!card || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvc)) {
      return { status: 'failed', reason: 'Son kullanma tarihi veya CVC hatalı.' };
    }
    if (digits === SANDBOX_CARDS.insufficientFunds) {
      return { status: 'failed', reason: 'Kart limiti yetersiz.' };
    }
    if (__DEV__) {
      console.log('[mock-iyzico] split', {
        paidPrice: req.price.customerTotal,
        subMerchantPrice: req.price.cleanerPayout,
        platform: req.price.platformTotal,
      });
    }
    this.requests.delete(session.token);
    return { status: 'paid', paymentToken: session.token, paymentId: session.token };
  }
}
