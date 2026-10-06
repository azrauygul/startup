import { router } from 'expo-router';

import { Body, Button, Card, Heading, Muted } from './ui';
import { repository } from '@/data';
import { MockRepository } from '@/data/mock-repository';
import { useSession } from '@/lib/session';

export function AccountSection() {
  const { user, signOut } = useSession();
  const demo = repository instanceof MockRepository ? repository : null;
  return (
    <Card>
      <Heading>Hesabım</Heading>
      <Body>{user?.fullName}</Body>
      <Muted>{user?.role === 'temizlikci' ? 'Temizlikçi hesabı' : 'Müşteri hesabı'}</Muted>
      <Button
        label="Çıkış yap"
        icon="log-out"
        variant="secondary"
        onPress={async () => {
          await signOut();
          router.replace('/giris');
        }}
      />
      {demo ? (
        <Button
          label="Demo verilerini sıfırla"
          icon="refresh"
          variant="ghost"
          onPress={async () => {
            await demo.reset();
            router.replace('/giris');
          }}
        />
      ) : null}
    </Card>
  );
}
