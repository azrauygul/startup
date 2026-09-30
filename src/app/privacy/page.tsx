import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { privacyDocument } from "@/lib/legal/content";

export default function PrivacyPage() {
  return <LegalPageShell document={privacyDocument} />;
}
