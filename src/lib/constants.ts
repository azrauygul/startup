export const MIN_DAILY_RATE = 500;
/** ~22 iş günü × minimum günlük ücret */
export const MIN_MONTHLY_RATE = 11_000;
export const DEFAULT_DAILY_RATE = 500;
export const DEFAULT_MONTHLY_RATE = 11_000;

export const CLEANING_TYPES = [
  "Genel ev temizliği",
  "Derin temizlik",
  "Taşınma öncesi / sonrası temizlik",
  "Ofis temizliği",
  "Cam temizliği",
  "Halı yıkama",
  "Koltuk yıkama",
  "Banyo ve mutfak detay temizliği",
  "Ütü hizmeti",
  "Bulaşık ve mutfak düzeni",
  "Evcil hayvanlı ev temizliği",
  "Airbnb / kısa konaklama temizliği",
  "İnşaat sonrası temizlik",
  "Bahçe ve balkon temizliği",
  "Periyodik bakım temizliği",
] as const;

export type CleaningType = (typeof CLEANING_TYPES)[number];

/** Öncelikli iller en üstte, kalan 78 il alfabetik */
export const PRIORITY_CITIES = ["İstanbul", "Ankara", "İzmir"] as const;

export const OTHER_CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
] as const;

export const TURKEY_CITIES = [...PRIORITY_CITIES, ...OTHER_CITIES] as const;
export type TurkeyCity = (typeof TURKEY_CITIES)[number];

export function isTurkeyCity(value: string): value is TurkeyCity {
  return (TURKEY_CITIES as readonly string[]).includes(value);
}

export function isCleaningType(value: string): value is CleaningType {
  return (CLEANING_TYPES as readonly string[]).includes(value);
}

export const HOME_SIZES = [
  {
    id: "studio",
    label: "Stüdyo / 1+0",
    description: "Tek oda veya küçük alan",
    hint: "~40 m²",
  },
  {
    id: "1+1",
    label: "1+1",
    description: "1 yatak odası + salon",
    hint: "~60 m²",
  },
  {
    id: "2+1",
    label: "2+1",
    description: "2 yatak odası + salon",
    hint: "~90 m²",
  },
  {
    id: "3+1",
    label: "3+1",
    description: "3 yatak odası + salon",
    hint: "~120 m²",
  },
  {
    id: "4+1",
    label: "4+1 ve üzeri",
    description: "Geniş daire veya dubleks",
    hint: "120+ m²",
  },
  {
    id: "villa",
    label: "Villa / Müstakil",
    description: "Bahçeli veya çok katlı ev",
    hint: "200+ m²",
  },
] as const;

export type HomeSizeId = (typeof HOME_SIZES)[number]["id"];

export function isHomeSizeId(value: string): value is HomeSizeId {
  return HOME_SIZES.some((s) => s.id === value);
}

export function getHomeSizeLabel(id: string | null | undefined) {
  if (!id) return "Belirtilmedi";
  return HOME_SIZES.find((s) => s.id === id)?.label ?? id;
}

export const AVAILABILITY_WINDOW_DAYS = 14;

export const TRUST_FEATURES = [
  "Puanlı profiller",
  "Tamamlanan iş sayısı",
  "Müsait gün ve saatten randevu",
  "Tekrarlayan temizlikte tasarruf",
] as const;

export const BOOKING_FREQUENCIES = [
  {
    id: "once",
    label: "Tek seferlik",
    discount: 0,
    hint: null,
  },
  {
    id: "biweekly",
    label: "2 haftada bir",
    discount: 10,
    hint: "%10 tasarruf · En popüler",
  },
  {
    id: "every_4_weeks",
    label: "4 haftada bir",
    discount: 15,
    hint: "%15 tasarruf · En avantajlı",
  },
] as const;

export type BookingFrequencyId = (typeof BOOKING_FREQUENCIES)[number]["id"];

export function isBookingFrequency(value: string): value is BookingFrequencyId {
  return BOOKING_FREQUENCIES.some((f) => f.id === value);
}

export function getBookingFrequencyLabel(id: string | null | undefined) {
  if (!id) return "Tek seferlik";
  return BOOKING_FREQUENCIES.find((f) => f.id === id)?.label ?? id;
}

export function getFrequencyDiscount(id: BookingFrequencyId): number {
  return BOOKING_FREQUENCIES.find((f) => f.id === id)?.discount ?? 0;
}

export function applyFrequencyDiscount(
  amount: number,
  frequency: BookingFrequencyId,
): number {
  const discount = getFrequencyDiscount(frequency);
  return Math.round(amount * (1 - discount / 100));
}
