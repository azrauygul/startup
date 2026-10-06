import type { Booking, Cleaner, Message, Review, Slot, User } from './types';
import { quote } from '@/config/pricing';
import { SLOT_TEMPLATES } from '@/config/slots';
import { addDays, toISODate } from '@/lib/dates';

export const DEMO_CUSTOMER: User = { id: 'u-fatma', fullName: 'Fatma Demir', role: 'musteri' };
export const DEMO_CLEANER_USER: User = {
  id: 'u-ayse',
  fullName: 'Ayşe Yılmaz',
  role: 'temizlikci',
  cleanerId: 'c-ayse',
};

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&crop=faces`;

export const SEED_CLEANERS: Cleaner[] = [
  {
    id: 'c-ayse',
    fullName: 'Ayşe Yılmaz',
    photoUrl: photo('photo-1494790108377-be9c29b29330'),
    city: 'İzmir',
    districts: ['Bornova', 'Bayraklı', 'Alsancak'],
    bio: '8 yıldır ev temizliği yapıyorum. Mutfak ve banyoda çok titizimdir. Büyüklerimize saygıyla ve sabırla hizmet ederim.',
    yearsExperience: 8,
    cleaningTypes: ['genel', 'derin'],
    prices: { '1+1': 2200, '2+1': 2700, '3+1': 3400, '4+1': 4500 },
    rules: { noDogs: true, noCats: false, noPets: false, other: 'Temizlik malzemesi evde olmalı.' },
    insuranceStatus: 'dogrulandi',
    insuranceDocName: 'sgk-hizmet-dokumu.pdf',
    ratingAvg: 4.9,
    ratingCount: 47,
    completedJobs: 112,
  },
  {
    id: 'c-mehmet',
    fullName: 'Mehmet Kaya',
    photoUrl: photo('photo-1507003211169-0a1dd7228f2d'),
    city: 'İzmir',
    districts: ['Karşıyaka', 'Çiğli', 'Bostanlı'],
    bio: 'Cam, balkon ve detaylı temizlikte 5 yıllık deneyimim var. Kendi ekipmanımı getiririm.',
    yearsExperience: 5,
    cleaningTypes: ['genel', 'derin', 'insaat'],
    prices: { '1+1': 2000, '2+1': 2500, '3+1': 3200, '4+1': 4200 },
    rules: { noDogs: false, noCats: false, noPets: false, other: '4. kattan yukarısı için asansör olmalı.' },
    insuranceStatus: 'dogrulandi',
    insuranceDocName: 'sgk-tescil-belgesi.pdf',
    ratingAvg: 4.7,
    ratingCount: 31,
    completedJobs: 76,
  },
  {
    id: 'c-elif',
    fullName: 'Elif Şahin',
    photoUrl: photo('photo-1438761681033-6461ffad8d80'),
    city: 'İzmir',
    districts: ['Konak', 'Göztepe', 'Güzelyalı'],
    bio: 'Doğal ve kokusuz ürünlerle çalışırım. Hasta veya bebek olan evlerde özenle temizlik yaparım.',
    yearsExperience: 6,
    cleaningTypes: ['genel', 'derin'],
    prices: { '1+1': 2400, '2+1': 3000, '3+1': 3700, '4+1': 4800 },
    rules: { noDogs: false, noCats: false, noPets: true, other: 'Kimyasal koku istemeyen evler için uygundur.' },
    insuranceStatus: 'dogrulandi',
    insuranceDocName: 'sigorta-police.pdf',
    ratingAvg: 4.8,
    ratingCount: 22,
    completedJobs: 54,
  },
  {
    id: 'c-zeynep',
    fullName: 'Zeynep Arslan',
    photoUrl: photo('photo-1544005313-94ddf0286df2'),
    city: 'İzmir',
    districts: ['Buca', 'Gaziemir', 'Şirinyer'],
    bio: 'Taşınma ve detaylı temizlik uzmanıyım. Evinizi baştan sona pırıl pırıl yaparım.',
    yearsExperience: 10,
    cleaningTypes: ['genel', 'derin', 'tasinma'],
    prices: { '1+1': 2500, '2+1': 3100, '3+1': 3900, '4+1': 5200 },
    rules: { noDogs: false, noCats: false, noPets: false, other: 'Detaylı temizlik için en az 5 saat ayırın.' },
    insuranceStatus: 'dogrulandi',
    insuranceDocName: 'sgk-hizmet-dokumu.pdf',
    ratingAvg: 4.6,
    ratingCount: 18,
    completedJobs: 40,
  },
  {
    id: 'c-hatice',
    fullName: 'Hatice Çelik',
    photoUrl: photo('photo-1580489944761-15a19d654956'),
    city: 'İzmir',
    districts: ['Karabağlar', 'Balçova', 'Narlıdere'],
    bio: 'Haftalık düzenli temizlik yapıyorum. Aynı evlere yıllardır gidiyorum.',
    yearsExperience: 12,
    cleaningTypes: ['genel'],
    prices: { '1+1': 1900, '2+1': 2300, '3+1': 2900, '4+1': 3900 },
    rules: { noDogs: true, noCats: true, noPets: false, other: '' },
    insuranceStatus: 'inceleniyor',
    insuranceDocName: 'sgk-hizmet-dokumu.pdf',
    ratingAvg: 5.0,
    ratingCount: 12,
    completedJobs: 63,
  },
];

const REVIEW_TEXTS: [string, string, number, string][] = [
  ['c-ayse', 'Nermin Hanım', 5, 'Çok temiz ve saygılı. Mutfağım ilk günkü gibi oldu.'],
  ['c-ayse', 'Ahmet Bey', 5, 'Zamanında geldi, sabırla çalıştı. Gönül rahatlığıyla tavsiye ederim.'],
  ['c-mehmet', 'Sevim Hanım', 5, 'Camlar pırıl pırıl oldu.'],
  ['c-mehmet', 'Kemal Bey', 4, 'İşini iyi yapıyor, biraz geç geldi.'],
  ['c-elif', 'Gülay Hanım', 5, 'Kokusuz ürün kullanması çok iyi oldu.'],
  ['c-zeynep', 'Murat Bey', 4, 'Taşınma sonrası evi sıfırladı.'],
  ['c-hatice', 'Emine Hanım', 5, 'Yıllardır gelir, ailemizden biri gibi.'],
];

export function seedReviews(): Review[] {
  return REVIEW_TEXTS.map(([cleanerId, customerName, rating, comment], i) => ({
    id: `r-seed-${i}`,
    bookingId: `b-seed-${i}`,
    cleanerId,
    customerName,
    rating,
    comment,
    createdAt: toISODate(addDays(new Date(), -7 * (i + 1))),
  }));
}

/** Opens a varied pattern of slots for the next two weeks, relative to today. */
export function seedSlots(): Slot[] {
  const slots: Slot[] = [];
  SEED_CLEANERS.forEach((c, ci) => {
    for (let d = 1; d <= 14; d++) {
      const date = toISODate(addDays(new Date(), d));
      SLOT_TEMPLATES.forEach((t, ti) => {
        if ((d + ci + ti) % 3 === 0) return;
        slots.push({ id: `s-${c.id}-${date}-${t.id}`, cleanerId: c.id, date, template: t.id, booked: false });
      });
    }
  });
  return slots;
}

const DEMO_ANSWERS = {
  houseSize: '2+1',
  cleaningType: 'genel',
  pets: 'yok',
  address: 'Bornova, Kazımdirik Mah. 372. Sk. No: 5 D: 3',
  notes: 'Mutfağa özellikle dikkat edilsin.',
};

/**
 * Demo customer gets a completed booking waiting for a review (Ayşe) and an upcoming one (Elif).
 * The demo cleaner (Ayşe) also gets an upcoming job from another customer.
 */
export function seedBookings(slots: Slot[]): Booking[] {
  const [ayse, , elif] = SEED_CLEANERS;
  const past = toISODate(addDays(new Date(), -3));
  const take = (cleanerId: string) => {
    const s = slots.find((x) => x.cleanerId === cleanerId && !x.booked)!;
    s.booked = true;
    return s;
  };
  const elifSlot = take(elif.id);
  const ayseSlot = take(ayse.id);
  const createdAt = new Date().toISOString();
  return [
    {
      id: 'b-demo-past',
      cleanerId: ayse.id,
      cleanerName: ayse.fullName,
      cleanerPhotoUrl: ayse.photoUrl,
      customerId: DEMO_CUSTOMER.id,
      customerName: DEMO_CUSTOMER.fullName,
      slotId: `s-past-${past}`,
      date: past,
      template: 'sabah',
      answers: DEMO_ANSWERS,
      packageId: 'tek',
      price: quote(ayse.prices, '2+1', 'genel', 'tek'),
      paymentId: 'mock-pay-seed-1',
      status: 'tamamlandi',
      reviewed: false,
      createdAt,
    },
    {
      id: 'b-demo-upcoming',
      cleanerId: elif.id,
      cleanerName: elif.fullName,
      cleanerPhotoUrl: elif.photoUrl,
      customerId: DEMO_CUSTOMER.id,
      customerName: DEMO_CUSTOMER.fullName,
      slotId: elifSlot.id,
      date: elifSlot.date,
      template: elifSlot.template,
      answers: DEMO_ANSWERS,
      packageId: 'iki-haftada-bir',
      price: quote(elif.prices, '2+1', 'genel', 'iki-haftada-bir'),
      paymentId: 'mock-pay-seed-2',
      status: 'onaylandi',
      reviewed: false,
      createdAt,
    },
    {
      id: 'b-demo-ayse-job',
      cleanerId: ayse.id,
      cleanerName: ayse.fullName,
      cleanerPhotoUrl: ayse.photoUrl,
      customerId: 'u-nermin',
      customerName: 'Nermin Aksoy',
      slotId: ayseSlot.id,
      date: ayseSlot.date,
      template: ayseSlot.template,
      answers: { houseSize: '3+1', cleaningType: 'derin', pets: 'kedi', address: 'Bayraklı, Mansuroğlu Mah. 283/1 Sk. No: 12 D: 7', notes: 'Kapı zili çalışmıyor, kapıyı çalın.' },
      packageId: 'haftalik',
      price: quote(ayse.prices, '3+1', 'derin', 'haftalik', true),
      paymentId: 'mock-pay-seed-3',
      status: 'onaylandi',
      reviewed: false,
      createdAt,
    },
  ];
}

export function seedMessages(): Message[] {
  return [
    {
      id: 'm-seed-1',
      bookingId: 'b-demo-upcoming',
      senderRole: 'temizlikci',
      text: 'Merhaba Fatma Hanım, randevunuz için teşekkürler. Bina girişinde zil var mı?',
      masked: false,
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
    {
      id: 'm-seed-2',
      bookingId: 'b-demo-upcoming',
      senderRole: 'musteri',
      text: 'Merhaba, zil var. Bana ••• ulaşabilirsiniz.',
      masked: true,
      createdAt: new Date(Date.now() - 3000_000).toISOString(),
    },
  ];
}
