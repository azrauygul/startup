import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const customerSteps = [
  {
    step: "1",
    title: "Keşfet",
    text: "Şehir, ilçe ve temizlik türüne göre personelleri inceleyin. Puan, yorum ve ücretleri karşılaştırın.",
  },
  {
    step: "2",
    title: "Profili incele",
    text: "Müsait günleri, hizmet verdiği semtleri ve özel isteklerini görün. Size uygun olanı seçin.",
  },
  {
    step: "3",
    title: "Randevu al",
    text: "Ev büyüklüğünüzü belirtin, müsait gün ve saati seçin. Tekrarlayan temizlikte tasarruf edin.",
  },
];

const cleanerSteps = [
  {
    step: "1",
    title: "Temizlikçi ol",
    text: "Ücretsiz hesap açın ve operasyon panelinden profil kartınızı oluşturun.",
  },
  {
    step: "2",
    title: "Kartını yayınla",
    text: "Fotoğraf, il, ilçe, temizlik türleri ve ücretlerinizi ekleyin. Keşfet sayfasında görünün.",
  },
  {
    step: "3",
    title: "Talepleri yönet",
    text: "Gelen randevuları görün, tamamlandı olarak işaretleyin. Müşteriyle doğrudan iletişime geçin.",
  },
];

const customerBenefits = [
  { icon: Search, title: "81 ilde arama", text: "Türkiye genelinde personel bulun, şehre göre filtreleyin." },
  { icon: Star, title: "Şeffaf profiller", text: "Puan, tamamlanan temizlik sayısı ve yorumlarla güvenle seçim yapın." },
  { icon: Wallet, title: "Güvenli uygulama içi ödeme", text: "iyzico ile ödersiniz; para iş bitene kadar güvende bekler. Tek seferlik işlerde %6 hizmet bedeli, paketlerde yok." },
  { icon: MessageCircle, title: "Uygulama içi mesajlaşma", text: "Detayları uygulama içinden netleştirin; numaranız gizli kalır." },
];

const cleanerBenefits = [
  { icon: UserPlus, title: "Ücretsiz kayıt", text: "Kayıt ücretsiz. Yalnızca tamamlanan işlerden %15 (paket müşterilerinde %12) komisyon alınır." },
  { icon: MapPin, title: "Bölgenizi seçin", text: "Hizmet vereceğiniz ili ve ilçeleri siz belirleyin." },
  { icon: CalendarClock, title: "Müsaitliğinizi yönetin", text: "Çalışmak istediğiniz gün ve saatleri kendiniz girin." },
  { icon: BadgeCheck, title: "Randevuları yönetin", text: "Müsait gün ve saatlerinizi belirleyin; müşteriler doğrudan randevu alsın." },
];

export default function AppHomePage() {
  return (
    <div className="animate-fade-up space-y-12 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(160deg,var(--brand-soft),var(--background)_55%,oklch(0.97_0.02_215))] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <p className="font-heading text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            mismis
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Temizlik personeli bulmanın en kolay yolu
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            mismis, müşterileri Türkiye genelindeki temizlik personelleriyle
            buluşturan bir platformdur. Önce inceleyin, sonra randevu alın —
            kayıt olmadan personelleri keşfedebilirsiniz.
          </p>
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Button
              render={<Link href="/dashboard" />}
              size="lg"
              className="rounded-full px-8"
            >
              Personelleri Keşfet
            </Button>
            <Button
              render={<Link href="/register?role=cleaner" />}
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              Temizlikçi Ol
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Müşteriler için nasıl çalışır?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Uygulamayı indirmeden veya kayıt olmadan personelleri inceleyebilirsiniz.
            Randevu almak istediğinizde hesap açmanız yeterli.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {customerSteps.map(({ step, title, text }) => (
            <div
              key={step}
              className="rounded-3xl border border-border/60 bg-card/80 p-5"
            >
              <span className="mb-4 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {step}
              </span>
              <h3 className="font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {customerBenefits.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex gap-4 rounded-3xl border border-border/60 bg-card/80 p-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="font-heading font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6 rounded-[2rem] border border-primary/20 bg-primary/5 px-6 py-10 sm:px-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Temizlik personeli misiniz?
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Kendi kartınızı oluşturun, müşteri bulun
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            mismis&apos;e temizlik personeli olarak katılın. Profil fotoğrafınız,
            deneyiminiz, hizmet verdiğiniz bölgeler ve ücretlerinizle Keşfet
            sayfasında görünün. Her personel yalnızca bir kart oluşturabilir.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cleanerSteps.map(({ step, title, text }) => (
            <div key={step} className="rounded-2xl border border-border/50 bg-background/80 p-4">
              <span className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {step}
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cleanerBenefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-background/60 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <Button
          render={<Link href="/register?role=cleaner" />}
          size="lg"
          className="rounded-full"
        >
          Temizlikçi Olarak Başla
        </Button>
      </section>

      <section className="rounded-3xl border border-dashed border-primary/25 px-6 py-10 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Hemen keşfetmeye başlayın
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Kayıt olmadan personel kartlarını inceleyin. Beğendiğiniz bir profile
          tıklayın, detayları okuyun ve randevu almak istediğinizde hesap
          oluşturun.
        </p>
        <Button
          render={<Link href="/dashboard" />}
          className="mt-5 rounded-full"
          size="lg"
        >
          Keşfet Sayfasına Git
        </Button>
      </section>
    </div>
  );
}
