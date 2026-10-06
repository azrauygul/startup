import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { defaultPrices, priceError, quote, visitPrice } from '../src/config/pricing.ts';

const prices = { ...defaultPrices(), '2+1': 3000 };

test('one-off job matches research unit economics (2+1, 3000 TL)', () => {
  const q = quote(prices, '2+1', 'genel', 'tek');
  assert.equal(q.customerFee, 180);
  assert.equal(q.customerTotal, 3180);
  assert.equal(q.cleanerPayout, 2550);
  assert.equal(q.platformTotal, 630);
});

test('weekly subscription: -12%, no customer fee, 12% commission', () => {
  const q = quote(prices, '2+1', 'genel', 'haftalik');
  assert.equal(q.customerTotal, 2640);
  assert.equal(q.customerFee, 0);
  assert.equal(q.cleanerPayout, 2323);
});

test('prices below the floor are clamped, so the fee is at least 79 TL', () => {
  const q = quote({ ...prices, '1+1': 1000 }, '1+1', 'genel', 'tek');
  assert.equal(q.listPrice, 1800);
  assert.equal(q.customerFee, 108);
});

test('derived cleaning types stay inside their band', () => {
  assert.equal(visitPrice({ ...prices, '1+1': 1800 }, '1+1', 'derin', false), 2520);
  assert.equal(visitPrice({ ...prices, '1+1': 4000 }, '1+1', 'derin', false), 5500);
  assert.equal(visitPrice(prices, '2+1', 'genel', true), 3300);
});

test('standard price floor/ceiling', () => {
  assert.ok(priceError('1+1', 1799));
  assert.equal(priceError('1+1', 1800), null);
  assert.ok(priceError('4+1', 8501));
});

test('edge function pricing copy is in sync', () => {
  const app = readFileSync(new URL('../src/config/pricing.ts', import.meta.url), 'utf8');
  const fn = readFileSync(new URL('../../supabase/functions/_shared/pricing.ts', import.meta.url), 'utf8');
  assert.equal(fn, app, 'run: npm run sync:pricing');
});
