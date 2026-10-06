import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterContactInfo } from '../src/lib/contact-filter.ts';

const masked = [
  'Beni 0532 123 45 67 numaradan arayın',
  '+90 (532) 123-45-67',
  '5321234567',
  'IBAN: TR33 0006 1005 1978 6457 8413 26',
  'mail: ayse.yilmaz@gmail.com',
  'ayse at gmail nokta com',
  'whatsapp yazın lütfen',
  'vatsaptan yaz',
  'insta: @ayse_temizlik',
  'sıfır beş yüz otuz iki yüz yirmi üç kırk beş',
  'wa.me/905321234567',
];

const untouched = [
  'Evde 2 kedi var, 3+1 ev, 10.10.2026 tarihinde gelin. Fiyat 2800 TL.',
  'Bir iki saat erken gelebilir misiniz?',
  'Mutfağa dikkat, banyo iki tane.',
];

test('masks contact details', () => {
  for (const text of masked) {
    const result = filterContactInfo(text);
    assert.ok(result.changed, `should mask: ${text}`);
    assert.doesNotMatch(result.text, /\d{4,}|@\w|gmail|whatsapp|TR33/i, text);
  }
});

test('keeps normal booking text', () => {
  for (const text of untouched) {
    assert.equal(filterContactInfo(text).text, text);
  }
});
