const MASK = '•••';

const PATTERNS: RegExp[] = [
  // IBAN: TR + 24 digits, often written in groups
  /\bT\s*R\s*\d{2}(?:[\s-]*\d){10,}/giu,
  // e-mail, also "ad at site nokta com" style
  /[\p{L}0-9._%+-]+\s*(?:@|\(at\)|\[at\])\s*[\p{L}0-9.-]+\s*(?:\.|\(dot\)|nokta)\s*[a-z]{2,}/giu,
  /[\p{L}0-9._-]+\s+at\s+[\p{L}0-9-]+\s+(?:nokta|dot)\s+[a-z]{2,}/giu,
  /\b(?:https?:\/\/|www\.)\S+/gi,
  /\b(?:wa\.me|t\.me|instagram\.com|facebook\.com|tiktok\.com)\/\S*/gi,
  // phone numbers (TR numbers have 10+ digits), allowing spaces, dots, dashes, parentheses and +90
  /(?:\+?\d[\s().-]*){9,}\d/g,
];

const HANDLE = /(^|\s)@[\p{L}0-9._]{2,}/gu;

const NUMBER_WORD =
  '(?:sıfır|sifir|bir|iki|üç|uc|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|kirk|elli|altmış|altmis|yetmiş|yetmis|seksen|doksan|yüz|yuz|\\d+)';
/** Phone numbers spelled out, e.g. "sıfır beş yüz otuz iki ...": 5+ number words in a row. */
const SPELLED_NUMBER = new RegExp(
  `(?<![\\p{L}])${NUMBER_WORD}(?:[\\s,.-]+${NUMBER_WORD}){4,}(?![\\p{L}])`,
  'giu',
);

const PLATFORM_WORDS =
  /(?<![\p{L}])(?:(?:whats\s*app|vatsap|watsap|telegram|instagram|insta|face\s*book|tiktok|snap\s*chat|numaram|beni\s+ara|elden\s+öde|nakit\s+öde)\p{L}*|wp'?\p{L}*|iban\p{L}*)(?![\p{L}])/giu;

/** Masks phone numbers, IBANs, e-mails, links and social handles so users and cleaners can't move off-platform. */
export function filterContactInfo(text: string): { text: string; changed: boolean } {
  let out = text;
  for (const re of PATTERNS) out = out.replace(re, MASK);
  out = out.replace(SPELLED_NUMBER, MASK);
  out = out.replace(HANDLE, (_m, lead: string) => `${lead}${MASK}`);
  out = out.replace(PLATFORM_WORDS, MASK);
  return { text: out, changed: out !== text };
}

export const CONTACT_FILTER_NOTICE =
  'Güvenliğiniz için telefon, IBAN, e-posta ve sosyal medya bilgileri gizlendi. Tüm iletişim ve ödeme mismis üzerinden yapılır.';
