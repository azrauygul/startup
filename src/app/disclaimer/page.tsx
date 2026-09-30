import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { disclaimerDocument } from "@/lib/legal/content";

export default function DisclaimerPage() {
  return <LegalPageShell document={disclaimerDocument} />;
}
