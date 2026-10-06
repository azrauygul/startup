const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function todayISO() {
  return toISODate(new Date());
}

export function nextDays(count: number, from = new Date()) {
  return Array.from({ length: count }, (_, i) => toISODate(addDays(from, i)));
}

/** "Perşembe, 8 Ekim" */
export function formatDay(iso: string) {
  const d = parseISODate(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function relativeDayLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return 'Bugün';
  if (iso === toISODate(addDays(new Date(), 1))) return 'Yarın';
  return DAYS[parseISODate(iso).getDay()];
}

export function dayNumber(iso: string) {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
