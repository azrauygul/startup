import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Logo } from '@/components/logo';
import { Body, Button, Card, Choice, Field, Heading, Muted, Notice, Screen, Title } from '@/components/ui';
import { repository } from '@/data';
import type { Role } from '@/data/types';
import { useSession } from '@/lib/session';
import { space } from '@/theme';

export default function Giris() {
  const { setUser } = useSession();
  const [busy, setBusy] = useState<Role | 'form' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const done = (role: Role) => router.replace(role === 'temizlikci' ? '/isler' : '/ana-sayfa');

  const demo = async (role: Role) => {
    setBusy(role);
    const user = await repository.signInDemo(role);
    setUser(user);
    done(role);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xl }}>
        <Logo size={56} />
        <Title center>Evinize güvenilir temizlik</Title>
        <Body center>Sigortası kontrol edilmiş temizlikçiler. Anında onay, güvenli ödeme.</Body>
      </View>

      {repository.mode === 'demo' ? (
        <Card style={{ gap: space.md }}>
          <Heading>Nasıl devam etmek istersiniz?</Heading>
          <Button
            label="Temizlik yaptırmak istiyorum"
            icon="home"
            loading={busy === 'musteri'}
            onPress={() => demo('musteri')}
          />
          <Button
            label="Temizlikçiyim"
            icon="briefcase"
            variant="secondary"
            loading={busy === 'temizlikci'}
            onPress={() => demo('temizlikci')}
          />
          <Muted center>Demo sürümü: örnek hesaplarla giriş yapılır.</Muted>
        </Card>
      ) : (
        <EmailForm
          busy={busy === 'form'}
          error={error}
          onSubmit={async (mode, input) => {
            setBusy('form');
            setError(null);
            try {
              const user =
                mode === 'giris'
                  ? await repository.signIn(input.email, input.password)
                  : await repository.signUp(input);
              setUser(user);
              done(user.role);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Giriş yapılamadı.');
            } finally {
              setBusy(null);
            }
          }}
        />
      )}
    </Screen>
  );
}

type FormInput = { email: string; password: string; fullName: string; role: Role };

function EmailForm({
  busy,
  error,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  onSubmit: (mode: 'giris' | 'kayit', input: FormInput) => void;
}) {
  const [mode, setMode] = useState<'giris' | 'kayit'>('giris');
  const [input, setInput] = useState<FormInput>({ email: '', password: '', fullName: '', role: 'musteri' });
  const set = (k: keyof FormInput) => (v: string) => setInput((p) => ({ ...p, [k]: v }));

  return (
    <Card style={{ gap: space.md }}>
      <Heading>{mode === 'giris' ? 'Giriş yapın' : 'Hesap oluşturun'}</Heading>
      {mode === 'kayit' ? (
        <>
          <Field label="Adınız ve soyadınız" value={input.fullName} onChangeText={set('fullName')} autoComplete="name" />
          <Choice label="Temizlik yaptırmak istiyorum" selected={input.role === 'musteri'} onPress={() => set('role')('musteri')} />
          <Choice label="Temizlikçiyim" selected={input.role === 'temizlikci'} onPress={() => set('role')('temizlikci')} />
        </>
      ) : null}
      <Field
        label="E-posta"
        value={input.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field label="Şifre" value={input.password} onChangeText={set('password')} secureTextEntry />
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button label={mode === 'giris' ? 'Giriş yap' : 'Kayıt ol'} loading={busy} onPress={() => onSubmit(mode, input)} />
      <Button
        variant="ghost"
        label={mode === 'giris' ? 'Hesabım yok, kayıt olacağım' : 'Zaten hesabım var'}
        onPress={() => setMode(mode === 'giris' ? 'kayit' : 'giris')}
      />
    </Card>
  );
}
