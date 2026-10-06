import { IyzicoProvider } from './iyzico';
import { MockIyzicoProvider } from './mock-iyzico';
import type { PaymentProvider } from './types';
import { repository } from '@/data';
import { SupabaseRepository } from '@/data/supabase-repository';

const useRealIyzico = process.env.EXPO_PUBLIC_PAYMENTS === 'iyzico' && repository instanceof SupabaseRepository;

export const payments: PaymentProvider = useRealIyzico
  ? new IyzicoProvider((repository as SupabaseRepository).client)
  : new MockIyzicoProvider();

export { SANDBOX_CARDS } from './mock-iyzico';
export type { CheckoutSession, PaymentResult, SandboxCard } from './types';
