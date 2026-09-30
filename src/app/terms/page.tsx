import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { termsDocument } from "@/lib/legal/content";

export default function TermsPage() {
  return <LegalPageShell document={termsDocument} />;
}
