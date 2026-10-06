// iyzico Marketplace checkout for mismis (Supabase Edge Function, Deno).
//
// Env: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL (https://sandbox-api.iyzipay.com),
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (provided by Supabase).
//
// Actions (POST JSON, user JWT in Authorization):
//   initialize { slotId, packageId, answers } -> { token, paymentPageUrl, callbackUrlPrefix }
//   status     { token }                       -> { status, paymentId?, reason? }
// iyzico POSTs the browser to ?action=callback when the form finishes; the app's WebView
// detects that URL and calls `status`. Payouts are released with approveItem() after the job
// is completed and the 24h dispute window passes (run from a scheduled function).
//
// NOT yet verified against the iyzico sandbox.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { type CleaningTypeId, type HouseSizeId, type PackageId, quote } from '../_shared/pricing.ts';

const IYZICO_BASE_URL = Deno.env.get('IYZICO_BASE_URL') ?? 'https://sandbox-api.iyzipay.com';
const API_KEY = Deno.env.get('IYZICO_API_KEY')!;
const SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const CALLBACK_URL = `${SUPABASE_URL}/functions/v1/iyzico-checkout?action=callback`;

const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function hmacHex(key: string, message: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** iyzico IYZWSv2 request signing. */
async function iyzico<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const json = JSON.stringify(body);
  const rnd = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const signature = await hmacHex(SECRET_KEY, rnd + path + json);
  const auth = btoa(`apiKey:${API_KEY}&randomKey:${rnd}&signature:${signature}`);
  const res = await fetch(IYZICO_BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `IYZWSv2 ${auth}`, 'x-iyzi-rnd': rnd },
    body: json,
  });
  return (await res.json()) as T;
}

export async function approveItem(paymentTransactionId: string) {
  return iyzico('/payment/iyzipos/item/approve', { locale: 'tr', paymentTransactionId });
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function initialize(userId: string, email: string, input: { slotId: string; packageId: PackageId; answers: Record<string, string> }) {
  const { data: slot } = await admin
    .from('availability_slots')
    .select('id, booked, cleaner_id, cleaners(prices, iyzico_sub_merchant_key, profiles(full_name))')
    .eq('id', input.slotId)
    .single();
  if (!slot || slot.booked) return json({ error: 'Bu saat dolu' }, 409);
  // deno-lint-ignore no-explicit-any
  const cleaner = slot.cleaners as any;
  if (!cleaner?.iyzico_sub_merchant_key) return json({ error: 'Temizlikçinin ödeme hesabı hazır değil' }, 409);

  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', userId).single();
  const price = quote(
    cleaner.prices,
    input.answers.houseSize as HouseSizeId,
    input.answers.cleaningType as CleaningTypeId,
    input.packageId,
    input.answers.pets !== 'yok',
  );
  const [name, ...rest] = (profile?.full_name ?? 'mismis Müşteri').split(' ');
  const conversationId = crypto.randomUUID();
  const address = input.answers.address ?? '';

  const res = await iyzico<{ status: string; token: string; paymentPageUrl: string; errorMessage?: string }>(
    '/payment/iyzipos/checkoutform/initialize/auth/ecom',
    {
      locale: 'tr',
      conversationId,
      price: price.customerTotal.toFixed(2),
      paidPrice: price.customerTotal.toFixed(2),
      currency: 'TRY',
      basketId: input.slotId,
      paymentGroup: 'PRODUCT',
      callbackUrl: CALLBACK_URL,
      enabledInstallments: [1],
      buyer: {
        id: userId,
        name,
        surname: rest.join(' ') || name,
        email,
        // TODO: collect TCKN at first payment (required by iyzico); sandbox accepts this test value.
        identityNumber: '11111111111',
        registrationAddress: address,
        city: 'İzmir',
        country: 'Turkey',
        ip: '85.34.78.112',
      },
      billingAddress: { contactName: profile?.full_name, city: 'İzmir', country: 'Turkey', address },
      basketItems: [
        {
          id: input.slotId,
          name: 'Ev temizliği',
          category1: 'Temizlik',
          itemType: 'VIRTUAL',
          price: price.customerTotal.toFixed(2),
          subMerchantKey: cleaner.iyzico_sub_merchant_key,
          subMerchantPrice: price.cleanerPayout.toFixed(2),
        },
      ],
    },
  );
  if (res.status !== 'success') return json({ error: res.errorMessage ?? 'iyzico hatası' }, 502);

  await admin.from('payments').insert({
    customer_id: userId,
    slot_id: input.slotId,
    token: res.token,
    amount: price.customerTotal,
    draft: { ...input, price, conversationId },
  });
  return json({ token: res.token, paymentPageUrl: res.paymentPageUrl, callbackUrlPrefix: CALLBACK_URL });
}

async function status(userId: string, token: string) {
  const { data: payment } = await admin.from('payments').select('*').eq('token', token).eq('customer_id', userId).single();
  if (!payment) return json({ status: 'failed', reason: 'Ödeme bulunamadı' }, 404);
  if (payment.status === 'paid') return json({ status: 'paid', paymentId: payment.payment_id });

  const res = await iyzico<{
    paymentStatus?: string;
    paymentId?: string;
    errorMessage?: string;
    itemTransactions?: { paymentTransactionId: string }[];
  }>('/payment/iyzipos/checkoutform/auth/ecom/detail', { locale: 'tr', token });

  if (res.paymentStatus !== 'SUCCESS') {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id);
    return json({ status: 'failed', reason: res.errorMessage ?? 'Ödeme tamamlanmadı' });
  }
  await admin
    .from('payments')
    .update({
      status: 'paid',
      payment_id: res.paymentId,
      payment_transaction_id: res.itemTransactions?.[0]?.paymentTransactionId,
    })
    .eq('id', payment.id);
  return json({ status: 'paid', paymentId: res.paymentId });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('action') === 'callback') {
    return new Response('<html><body style="font:24px sans-serif;text-align:center;padding:40px">Ödeme işlendi. Uygulamaya dönülüyor…</body></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { data } = await admin.auth.getUser(jwt);
  if (!data.user) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json();
  if (body.action === 'initialize') return initialize(data.user.id, data.user.email ?? '', body);
  if (body.action === 'status') return status(data.user.id, body.token);
  return json({ error: 'Bilinmeyen işlem' }, 400);
});
