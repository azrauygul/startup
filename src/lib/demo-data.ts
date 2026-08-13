import type {
  Cleaner,
  CleanerAvailability,
  Review,
} from "@/lib/types";

export type DemoCleanerBundle = {
  cleaner: Cleaner;
  availability: CleanerAvailability[];
  reviews: Review[];
};

const DEMO_IDS = {
  ayse: "demo-cleaner-ayse-izmir",
  mehmet: "demo-cleaner-mehmet-izmir",
  elif: "demo-cleaner-elif-izmir",
  zeynep: "demo-cleaner-zeynep-izmir",
} as const;

export function isDemoCleanerId(id: string) {
  return id.startsWith("demo-cleaner-");
}

export const DEMO_CLEANERS: DemoCleanerBundle[] = [
  {
    cleaner: {
      id: DEMO_IDS.ayse,
      profile_id: "demo-profile-ayse",
      bio: "8 yıllık deneyimli ev temizlik uzmanı. Mutfak ve banyo detay temizliğinde uzmanlaştım. Bornova ve Bayraklı bölgelerine hizmet veriyorum.",
      rating: 4.9,
      review_count: 47,
      daily_rate: 1400,
      monthly_rate: 24000,
      services_offered: ["Genel temizlik", "Mutfak", "Banyo", "Ütü"],
      service_areas: ["Bornova", "Bayraklı", "Alsancak"],
      special_requests:
        "Temizlik malzemesi evde olmalı. Evcil hayvan varsa önceden bilgi verin. 3 saatten kısa işleri almıyorum.",
      city: "İzmir",
      created_at: "2025-01-10T10:00:00Z",
      profiles: {
        id: "demo-profile-ayse",
        full_name: "Ayşe Yılmaz",
        role: "cleaner",
        phone: "05321234567",
        avatar_url:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        created_at: "2025-01-10T10:00:00Z",
      },
    },
    availability: [
      {
        id: "demo-av-ayse-1",
        cleaner_id: DEMO_IDS.ayse,
        day_of_week: 1,
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        id: "demo-av-ayse-2",
        cleaner_id: DEMO_IDS.ayse,
        day_of_week: 2,
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        id: "demo-av-ayse-3",
        cleaner_id: DEMO_IDS.ayse,
        day_of_week: 3,
        start_time: "10:00:00",
        end_time: "16:00:00",
      },
      {
        id: "demo-av-ayse-4",
        cleaner_id: DEMO_IDS.ayse,
        day_of_week: 5,
        start_time: "09:00:00",
        end_time: "15:00:00",
      },
    ],
    reviews: [
      {
        id: "demo-rev-ayse-1",
        booking_id: "demo-book-1",
        cleaner_id: DEMO_IDS.ayse,
        reviewer_id: "demo-customer-1",
        rating: 5,
        comment: "Mutfağımı çok titiz temizledi. Kesinlikle tekrar çağıracağım.",
        created_at: "2026-06-01T12:00:00Z",
        profiles: {
          id: "demo-customer-1",
          full_name: "Deniz Kaya",
          role: "customer",
          phone: null,
          avatar_url: null,
          created_at: "2025-02-01T10:00:00Z",
        },
      },
      {
        id: "demo-rev-ayse-2",
        booking_id: "demo-book-2",
        cleaner_id: DEMO_IDS.ayse,
        reviewer_id: "demo-customer-2",
        rating: 5,
        comment: "Zamanında geldi, işini özenle yaptı. Çok memnun kaldım.",
        created_at: "2026-05-12T12:00:00Z",
        profiles: {
          id: "demo-customer-2",
          full_name: "Selin Arslan",
          role: "customer",
          phone: null,
          avatar_url: null,
          created_at: "2025-03-01T10:00:00Z",
        },
      },
    ],
  },
  {
    cleaner: {
      id: DEMO_IDS.mehmet,
      profile_id: "demo-profile-mehmet",
      bio: "Ofis ve geniş daire temizliğinde 5 yıl deneyim. Cam, balkon ve derin temizlik yapıyorum. Karşıyaka ve Çiğli.",
      rating: 4.7,
      review_count: 31,
      daily_rate: 1300,
      monthly_rate: 22000,
      services_offered: ["Genel temizlik", "Cam", "Balkon", "Ofis"],
      service_areas: ["Karşıyaka", "Çiğli", "Bostanlı"],
      special_requests:
        "Merdivenli binalarda 4. kattan sonrası için asansör olmalı. Ekipmanımı kendim getiririm.",
      city: "İzmir",
      created_at: "2025-02-14T10:00:00Z",
      profiles: {
        id: "demo-profile-mehmet",
        full_name: "Mehmet Demir",
        role: "cleaner",
        phone: "05339876543",
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        created_at: "2025-02-14T10:00:00Z",
      },
    },
    availability: [
      {
        id: "demo-av-mehmet-1",
        cleaner_id: DEMO_IDS.mehmet,
        day_of_week: 1,
        start_time: "08:00:00",
        end_time: "16:00:00",
      },
      {
        id: "demo-av-mehmet-2",
        cleaner_id: DEMO_IDS.mehmet,
        day_of_week: 3,
        start_time: "08:00:00",
        end_time: "16:00:00",
      },
      {
        id: "demo-av-mehmet-3",
        cleaner_id: DEMO_IDS.mehmet,
        day_of_week: 4,
        start_time: "08:00:00",
        end_time: "16:00:00",
      },
      {
        id: "demo-av-mehmet-4",
        cleaner_id: DEMO_IDS.mehmet,
        day_of_week: 6,
        start_time: "10:00:00",
        end_time: "14:00:00",
      },
    ],
    reviews: [
      {
        id: "demo-rev-mehmet-1",
        booking_id: "demo-book-3",
        cleaner_id: DEMO_IDS.mehmet,
        reviewer_id: "demo-customer-3",
        rating: 5,
        comment: "Ofis camları ve zemin mükemmel oldu.",
        created_at: "2026-04-20T12:00:00Z",
        profiles: {
          id: "demo-customer-3",
          full_name: "Can Öztürk",
          role: "customer",
          phone: null,
          avatar_url: null,
          created_at: "2025-04-01T10:00:00Z",
        },
      },
    ],
  },
  {
    cleaner: {
      id: DEMO_IDS.elif,
      profile_id: "demo-profile-elif",
      bio: "Hassas yüzeyler ve bebekli evlerde güvenli ürünlerle çalışırım. Konak ve Alsancak ağırlıklı.",
      rating: 4.8,
      review_count: 22,
      daily_rate: 1550,
      monthly_rate: 26000,
      services_offered: ["Genel temizlik", "Mutfak", "Bebek odası", "Ütü"],
      service_areas: ["Konak", "Alsancak", "Göztepe"],
      special_requests:
        "Kimyasal koku istemeyen evler için doğal ürün tercih ederim. Lütfen önceden belirtin.",
      city: "İzmir",
      created_at: "2025-03-20T10:00:00Z",
      profiles: {
        id: "demo-profile-elif",
        full_name: "Elif Şahin",
        role: "cleaner",
        phone: "05325551234",
        avatar_url:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        created_at: "2025-03-20T10:00:00Z",
      },
    },
    availability: [
      {
        id: "demo-av-elif-1",
        cleaner_id: DEMO_IDS.elif,
        day_of_week: 2,
        start_time: "09:00:00",
        end_time: "18:00:00",
      },
      {
        id: "demo-av-elif-2",
        cleaner_id: DEMO_IDS.elif,
        day_of_week: 4,
        start_time: "09:00:00",
        end_time: "18:00:00",
      },
      {
        id: "demo-av-elif-3",
        cleaner_id: DEMO_IDS.elif,
        day_of_week: 5,
        start_time: "09:00:00",
        end_time: "14:00:00",
      },
    ],
    reviews: [
      {
        id: "demo-rev-elif-1",
        booking_id: "demo-book-4",
        cleaner_id: DEMO_IDS.elif,
        reviewer_id: "demo-customer-4",
        rating: 5,
        comment: "Bebek odasını çok dikkatli temizledi, güven verdı.",
        created_at: "2026-03-15T12:00:00Z",
        profiles: {
          id: "demo-customer-4",
          full_name: "Merve Aksoy",
          role: "customer",
          phone: null,
          avatar_url: null,
          created_at: "2025-05-01T10:00:00Z",
        },
      },
    ],
  },
  {
    cleaner: {
      id: DEMO_IDS.zeynep,
      profile_id: "demo-profile-zeynep",
      bio: "Taşınma sonrası ve derin temizlik konusunda uzmanım. Buca, Gaziemir ve Şirinyer.",
      rating: 4.6,
      review_count: 18,
      daily_rate: 1600,
      monthly_rate: 27000,
      services_offered: ["Derin temizlik", "Taşınma", "Genel temizlik", "Banyo"],
      service_areas: ["Buca", "Gaziemir", "Şirinyer"],
      special_requests:
        "Derin temizlik için en az 5 saat ayırın. Park yeri bilgisi paylaşmanız önemli.",
      city: "İzmir",
      created_at: "2025-04-05T10:00:00Z",
      profiles: {
        id: "demo-profile-zeynep",
        full_name: "Zeynep Kara",
        role: "cleaner",
        phone: "05324445566",
        avatar_url:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        created_at: "2025-04-05T10:00:00Z",
      },
    },
    availability: [
      {
        id: "demo-av-zeynep-1",
        cleaner_id: DEMO_IDS.zeynep,
        day_of_week: 1,
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        id: "demo-av-zeynep-2",
        cleaner_id: DEMO_IDS.zeynep,
        day_of_week: 2,
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        id: "demo-av-zeynep-3",
        cleaner_id: DEMO_IDS.zeynep,
        day_of_week: 6,
        start_time: "09:00:00",
        end_time: "15:00:00",
      },
    ],
    reviews: [
      {
        id: "demo-rev-zeynep-1",
        booking_id: "demo-book-5",
        cleaner_id: DEMO_IDS.zeynep,
        reviewer_id: "demo-customer-5",
        rating: 4,
        comment: "Taşınma sonrası evi sıfırladı. Biraz uzun sürdü ama sonuç harika.",
        created_at: "2026-02-28T12:00:00Z",
        profiles: {
          id: "demo-customer-5",
          full_name: "Burak Yıldız",
          role: "customer",
          phone: null,
          avatar_url: null,
          created_at: "2025-06-01T10:00:00Z",
        },
      },
    ],
  },
];

export function getDemoCleaners(): Cleaner[] {
  return DEMO_CLEANERS.map((d) => d.cleaner);
}

export function getDemoCleanerBundle(id: string): DemoCleanerBundle | null {
  return DEMO_CLEANERS.find((d) => d.cleaner.id === id) ?? null;
}
