import type { Answers } from '@/config/questionnaire';
import type { PackageId, PriceQuote } from '@/config/pricing';

export type CheckoutRequest = {
  cleanerId: string;
  slotId: string;
  packageId: PackageId;
  answers: Answers;
  price: PriceQuote;
  buyer: { id: string; fullName: string };
};

export type CheckoutSession = {
  token: string;
  /** Hosted iyzico Checkout Form, opened in a WebView. Null for the in-app sandbox form. */
  paymentPageUrl: string | null;
  /** The WebView watches for navigation to this prefix to know the payment finished. */
  callbackUrlPrefix: string;
};

export type PaymentResult =
  | { status: 'paid'; paymentToken: string; paymentId: string }
  | { status: 'failed'; reason: string };

/**
 * Marketplace payment provider. The customer pays the full amount; the provider
 * holds it and pays the cleaner (sub-merchant) `cleanerPayout` once the job is approved,
 * keeping commission + service fee for mismis.
 */
export interface PaymentProvider {
  readonly name: 'mock-iyzico' | 'iyzico';
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Called after the checkout form finishes (callback reached or sandbox form submitted). */
  confirm(session: CheckoutSession, sandboxCard?: SandboxCard): Promise<PaymentResult>;
}

export type SandboxCard = { holder: string; number: string; expiry: string; cvc: string };
