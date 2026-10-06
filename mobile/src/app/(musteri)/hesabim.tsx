import { AccountSection } from '@/components/account-section';
import { Body, Card, Heading, InfoLine, Screen } from '@/components/ui';
import { COMMISSION } from '@/config/pricing';

export default function Hesabim() {
  return (
    <Screen>
      <AccountSection />
      <Card>
        <Heading>Ödeme ve güvence</Heading>
        <InfoLine icon="lock-closed">Ödemeler iyzico güvencesiyle mismis üzerinden yapılır.</InfoLine>
        <InfoLine icon="wallet">
          Tek seferlik randevularda %{COMMISSION.customerFee * 100} hizmet bedeli alınır. Paketlerde hizmet bedeli yoktur.
        </InfoLine>
        <InfoLine icon="refresh-circle">Randevuya 24 saatten fazla varsa ücretsiz iptal edebilirsiniz.</InfoLine>
      </Card>
      <Card>
        <Heading>Yardım</Heading>
        <Body>Bir sorun olursa randevu sayfasından temizlikçinize yazabilir veya bize ulaşabilirsiniz.</Body>
      </Card>
    </Screen>
  );
}
