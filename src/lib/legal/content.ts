import { LEGAL_LAST_UPDATED, PLATFORM_NAME } from "@/lib/legal/constants";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  summary: string;
  sections: LegalSection[];
};

const intro = `${PLATFORM_NAME}, temizlik personeli ile müşterileri bir araya getiren dijital bir aracı platformdur. MVP aşamasında sunulan hizmetler test ve erken erişim kapsamındadır.`;

export const termsDocument: LegalDocument = {
  title: "Kullanım Koşulları",
  summary: `${PLATFORM_NAME} platformunu kullanmadan önce lütfen bu koşulları okuyun. Son güncelleme: ${LEGAL_LAST_UPDATED}.`,
  sections: [
    {
      id: "scope",
      title: "1. Hizmetin kapsamı",
      paragraphs: [
        intro,
        `${PLATFORM_NAME}; profil oluşturma, keşfetme, kiralama talebi oluşturma ve iletişim kolaylaştırma araçları sunar. Platform, temizlik hizmetini bizzat sağlamaz; müşteri ile temizlik personelini eşleştiren bir pazar yeri aracısıdır.`,
      ],
    },
    {
      id: "accounts",
      title: "2. Hesap ve kayıt",
      paragraphs: [
        "Kayıt sırasında doğru ve güncel bilgi vermekle yükümlüsünüz. Hesap güvenliğinizden siz sorumlusunuz.",
        "Müşteri ve temizlik personeli hesapları farklı roller taşır. Rolünüze aykırı kullanım hesabın askıya alınmasına yol açabilir.",
      ],
    },
    {
      id: "bookings",
      title: "3. Kiralama talepleri",
      paragraphs: [
        "Kiralama talebi, hizmetin kesinleşmesi anlamına gelmez. Talep; personelin onayı ve taraflar arasındaki iletişim sonrası netleşir.",
        "Ödemeler platform üzerinden, lisanslı ödeme kuruluşu (iyzico) aracılığıyla alınır. Ücreti temizlik personeli, platformun belirlediği taban ve tavan aralığında kendisi belirler. Platform, tek seferlik işlerde personelin payından %15, paket (abonelik) müşterilerinde %12 aracılık komisyonu keser; müşteriden tek seferlik işlerde %6 (en az 79 TL) hizmet bedeli alınır.",
      ],
      bullets: [
        "Talep oluştururken paylaştığınız adres, saat ve notlar yalnızca hizmetin yürütülmesi için kullanılır.",
        "Randevuya 24 saatten fazla kala iptal ücretsizdir; 24 saatten az kala iptalde ücretin %50'si personele aktarılır. Platform dışında ödeme veya doğrudan ücret anlaşması yapılmamalıdır; bu durumda platform güvencesi geçerli olmaz.",
      ],
    },
    {
      id: "conduct",
      title: "4. Kullanıcı yükümlülükleri",
      paragraphs: [
        "Platformu yasa dışı, yanıltıcı, taciz edici veya üçüncü kişilerin haklarını ihlal eden amaçlarla kullanamazsınız.",
        "Ev veya iş yerine erişim, anahtar teslimi ve fiziksel güvenlik konularında tarafların kendi sorumlulukları vardır.",
      ],
    },
    {
      id: "changes",
      title: "5. Değişiklikler",
      paragraphs: [
        `${PLATFORM_NAME}, MVP sürecinde bu koşulları güncelleyebilir. Güncel metin platformda yayımlandığı tarihten itibaren geçerlidir.`,
      ],
    },
  ],
};

export const privacyDocument: LegalDocument = {
  title: "Gizlilik Politikası ve KVKK Aydınlatması",
  summary: `${PLATFORM_NAME} olarak kişisel verilerinizi yalnızca hizmeti sunmak ve geliştirmek amacıyla işleriz. Son güncelleme: ${LEGAL_LAST_UPDATED}.`,
  sections: [
    {
      id: "controller",
      title: "1. Veri sorumlusu",
      paragraphs: [
        `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu ${PLATFORM_NAME} platform operatörüdür.`,
        "MVP aşamasında iletişim kanalları platform içi kayıt ve destek süreçleri üzerinden yürütülür.",
      ],
    },
    {
      id: "data",
      title: "2. İşlenen veriler",
      paragraphs: ["Aşağıdaki veri kategorileri, hizmetin ifası için işlenebilir:"],
      bullets: [
        "Kimlik ve iletişim: ad soyad, e-posta, telefon",
        "Hesap: rol (müşteri / temizlik personeli), profil bilgileri",
        "Hizmet: biyografi, fiyat, müsaitlik, kiralama talebi tarihleri ve notları",
        "Değerlendirme: puan ve yorum metinleri",
        "Teknik: oturum, cihaz ve güvenlik kayıtları",
      ],
    },
    {
      id: "purpose",
      title: "3. İşleme amaçları",
      paragraphs: [
        "Verileriniz; üyelik oluşturma, kimlik doğrulama, eşleştirme, talep yönetimi, iletişimin sağlanması, güvenlik, hukuki yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin artırılması amacıyla işlenir.",
        "Adres ve randevu notları yalnızca ilgili kiralama talebinin yürütülmesi için paylaşılır; pazarlama amacıyla kullanılmaz.",
      ],
    },
    {
      id: "legal-basis",
      title: "4. Hukuki sebep ve aktarım",
      paragraphs: [
        "Veri işleme; sözleşmenin kurulması ve ifası, meşru menfaat ve açık rıza (gerektiğinde) hukuki sebeplerine dayanır.",
        "Hizmet altyapısı kapsamında veriler, Supabase ve barındırma sağlayıcıları (ör. Vercel) ile sınırlı ve hizmetin sunulması için gerekli ölçüde paylaşılabilir.",
      ],
    },
    {
      id: "retention-rights",
      title: "5. Saklama süresi ve haklarınız",
      paragraphs: [
        "Veriler, işleme amacının gerektirdiği süre boyunca saklanır; yasal zorunluluk ve uyuşmazlık süreleri saklıdır.",
        "KVKK kapsamında; verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve itiraz etme haklarına sahipsiniz. Taleplerinizi platform üzerinden iletebilirsiniz.",
      ],
    },
  ],
};

export const disclaimerDocument: LegalDocument = {
  title: "Sorumluluk Reddi Beyanı",
  summary: `${PLATFORM_NAME} fiziksel temizlik hizmetinin tarafı değildir. Son güncelleme: ${LEGAL_LAST_UPDATED}.`,
  sections: [
    {
      id: "intermediary",
      title: "1. Aracı platform statüsü",
      paragraphs: [
        `${PLATFORM_NAME}, müşteriler ile bağımsız temizlik personelini buluşturan bir aracı platformdur. Temizlik hizmeti, personelin kendi sorumluluğunda sunulur.`,
        "Platform; personelin davranışı, hizmet kalitesi, gecikme, iptal veya taraflar arası anlaşmazlıklardan doğrudan sorumlu tutulamaz.",
      ],
    },
    {
      id: "property",
      title: "2. Mülkiyet, hasar ve güvenlik",
      paragraphs: [
        "Ev, ofis veya eşyalarda meydana gelebilecek hasar, kayıp, hırsızlık iddiası veya kaza gibi fiziksel risklerde birincil sorumluluk hizmeti fiilen gerçekleştiren personel ile hizmeti talep eden müşteri arasındadır.",
        "Değerli eşya, anahtar teslimi, güvenlik kamerası, evcil hayvan ve erişim kuralları taraflarca önceden yazılı veya açık şekilde mutabık kalınmalıdır.",
      ],
    },
    {
      id: "verification",
      title: "3. Doğrulama sınırları",
      paragraphs: [
        "MVP aşamasında platform, sınırlı profil bilgisi ve kullanıcı değerlendirmeleri sunabilir; bu bilgiler garanti veya taahhüt niteliği taşımaz.",
        "Kullanıcılar, kendi güvenlik değerlendirmelerini yapmakla yükümlüdür.",
      ],
    },
    {
      id: "payment",
      title: "4. Ödeme ve uyuşmazlık",
      paragraphs: [
        "Tahsilat platform üzerinden yapılır. Ödeme, hizmet tamamlanıp 24 saatlik itiraz süresi geçene kadar ödeme kuruluşunun güvenli havuzunda bekletilir, ardından personelin payı komisyon düşülerek aktarılır. İade talepleri platform üzerinden değerlendirilir.",
        "Anlaşmazlık halinde taraflar öncelikle platformun destek kanalına başvurmalı; platform aracı hizmet sağlayıcı sıfatıyla uyuşmazlığın çözümüne aracılık eder. Gerekirse yasal mercilere başvurulabilir.",
      ],
    },
    {
      id: "acceptance",
      title: "5. Kabul",
      paragraphs: [
        "Kayıt olmak veya kiralama talebi oluşturmak, bu beyanı okuduğunuzu ve aracı platform modelini kabul ettiğinizi ifade eder.",
      ],
    },
  ],
};
