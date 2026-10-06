/**
 * Prices and commission model from docs/research.md (Ekim 2026, büyükşehir).
 * Amounts are TRY per visit, before the customer service fee.
 */
export const HOUSE_SIZES = [
  { id: '1+1', label: '1+1', hint: 'Yaklaşık 60 m²' },
  { id: '2+1', label: '2+1', hint: 'Yaklaşık 90 m²' },
  { id: '3+1', label: '3+1', hint: 'Yaklaşık 120 m²' },
  { id: '4+1', label: '4+1 ve üzeri', hint: '120 m² üzeri' },
] as const;

export type HouseSizeId = (typeof HOUSE_SIZES)[number]['id'];
export type PriceTable = Record<HouseSizeId, number>;
type Band = Record<HouseSizeId, [floor: number, ceiling: number]>;

/**
 * The cleaner sets the standard price per house size; other types are derived
 * with a multiplier and clamped into their own band.
 */
export const CLEANING_TYPES = [
  {
    id: 'genel',
    label: 'Standart ev temizliği',
    multiplier: 1,
    band: { '1+1': [1800, 4000], '2+1': [2200, 5000], '3+1': [2800, 6500], '4+1': [3800, 8500] } as Band,
  },
  {
    id: 'derin',
    label: 'Detaylı (dip köşe) temizlik',
    multiplier: 1.4,
    band: { '1+1': [2500, 5500], '2+1': [3200, 7000], '3+1': [4000, 9000], '4+1': [5500, 12000] } as Band,
  },
  {
    id: 'tasinma',
    label: 'Taşınma öncesi / sonrası',
    multiplier: 1.55,
    band: { '1+1': [2800, 6000], '2+1': [3500, 7500], '3+1': [4500, 10000], '4+1': [6000, 14000] } as Band,
  },
  {
    id: 'insaat',
    label: 'İnşaat / tadilat sonrası',
    multiplier: 2,
    band: { '1+1': [3500, 9000], '2+1': [4500, 12000], '3+1': [6000, 16000], '4+1': [8000, 22000] } as Band,
  },
] as const;

export type CleaningTypeId = (typeof CLEANING_TYPES)[number]['id'];

/** Evcil hayvanlı evler için ek ücret. */
export const PET_SURCHARGE_PCT = 10;

export const COMMISSION = {
  /** Taken from the cleaner's share on one-off jobs. */
  cleanerOneOff: 0.15,
  /** Taken from the cleaner's share on subscription visits. */
  cleanerSubscription: 0.12,
  /** Customer service fee, one-off jobs only. */
  customerFee: 0.06,
  customerFeeMin: 79,
};

export const PACKAGES = [
  { id: 'tek', label: 'Tek sefer', description: 'Sadece bu randevu', everyWeeks: 0, discountPct: 0, minVisits: 1 },
  { id: 'haftalik', label: 'Her hafta', description: 'Aynı gün, aynı temizlikçi', everyWeeks: 1, discountPct: 12, minVisits: 1 },
  { id: 'iki-haftada-bir', label: '2 haftada bir', description: 'Aynı gün, aynı temizlikçi', everyWeeks: 2, discountPct: 8, minVisits: 1 },
  { id: 'dort-haftada-bir', label: '4 haftada bir', description: 'En az 3 ziyaret', everyWeeks: 4, discountPct: 5, minVisits: 3 },
] as const;

export type PackageId = (typeof PACKAGES)[number]['id'];

export function houseSizeLabel(id: string) {
  return HOUSE_SIZES.find((h) => h.id === id)?.label ?? id;
}

export function cleaningType(id: string) {
  return CLEANING_TYPES.find((c) => c.id === id) ?? CLEANING_TYPES[0];
}

export function cleaningTypeLabel(id: string) {
  return cleaningType(id).label;
}

export function packageById(id: string) {
  return PACKAGES.find((p) => p.id === id) ?? PACKAGES[0];
}

export function standardBand(size: HouseSizeId) {
  return CLEANING_TYPES[0].band[size];
}

export function priceError(size: HouseSizeId, value: number): string | null {
  const [floor, ceiling] = standardBand(size);
  if (!Number.isFinite(value) || value <= 0) return 'Lütfen bir fiyat yazın.';
  if (value < floor) return `En az ${formatTL(floor)} olmalı.`;
  if (value > ceiling) return `En fazla ${formatTL(ceiling)} olabilir.`;
  return null;
}

export function defaultPrices(): PriceTable {
  return { '1+1': 2200, '2+1': 2800, '3+1': 3500, '4+1': 4600 };
}

export function visitPrice(prices: PriceTable, size: HouseSizeId, type: CleaningTypeId, hasPets: boolean) {
  const t = cleaningType(type);
  const [floor, ceiling] = t.band[size];
  const base = Math.min(ceiling, Math.max(floor, prices[size] * t.multiplier));
  return roundTo10(base * (hasPets ? 1 + PET_SURCHARGE_PCT / 100 : 1));
}

export type PriceQuote = {
  /** Cleaner's list price for one visit. */
  listPrice: number;
  discountPct: number;
  /** Price after package discount, before customer fee. */
  servicePrice: number;
  customerFee: number;
  /** What the customer pays per visit. */
  customerTotal: number;
  commissionRate: number;
  commission: number;
  cleanerPayout: number;
  /** Platform revenue per visit: commission + customer fee. */
  platformTotal: number;
  isSubscription: boolean;
};

/** Subscriptions are charged per visit, so the quote is always for one visit. */
export function quote(
  prices: PriceTable,
  size: HouseSizeId,
  type: CleaningTypeId,
  pkg: PackageId,
  hasPets = false,
): PriceQuote {
  const listPrice = visitPrice(prices, size, type, hasPets);
  const p = packageById(pkg);
  const isSubscription = p.everyWeeks > 0;
  const servicePrice = Math.round(listPrice * (1 - p.discountPct / 100));
  const customerFee = isSubscription
    ? 0
    : Math.max(COMMISSION.customerFeeMin, Math.round(servicePrice * COMMISSION.customerFee));
  const commissionRate = isSubscription ? COMMISSION.cleanerSubscription : COMMISSION.cleanerOneOff;
  const commission = Math.round(servicePrice * commissionRate);
  return {
    listPrice,
    discountPct: p.discountPct,
    servicePrice,
    customerFee,
    customerTotal: servicePrice + customerFee,
    commissionRate,
    commission,
    cleanerPayout: servicePrice - commission,
    platformTotal: commission + customerFee,
    isSubscription,
  };
}

function roundTo10(v: number) {
  return Math.round(v / 10) * 10;
}

export function formatTL(value: number) {
  return `${Math.round(value).toLocaleString('tr-TR')} ₺`;
}

export function priceRange(prices: PriceTable) {
  const values = Object.values(prices);
  return { min: Math.min(...values), max: Math.max(...values) };
}
