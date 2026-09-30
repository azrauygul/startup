import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import type { LegalDocument } from "@/lib/legal/content";

type Props = {
  document: LegalDocument;
};

export function LegalPageShell({ document }: Props) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Ana sayfa
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Hukuki metin
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {document.title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {document.summary}
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
          Bu metinler MVP aşaması için hazırlanmış özet hukuki bilgilendirme
          niteliğindedir. Resmi faaliyet öncesinde avukat incelemesi önerilir.
        </div>
      </article>

      <footer className="border-t border-border/60 py-8">
        <LegalFooterLinks className="mx-auto max-w-3xl px-4 sm:px-6" />
      </footer>
    </main>
  );
}
