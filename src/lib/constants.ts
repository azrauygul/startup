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
