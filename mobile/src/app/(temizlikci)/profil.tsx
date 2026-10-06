import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AccountSection } from '@/components/account-section';
import { InsuranceBadge } from '@/components/cleaner-bits';
import { Avatar, Body, Button, Card, Choice, Field, Heading, Loading, Muted, Notice, Screen } from '@/components/ui';
import {
  CLEANING_TYPES,
  formatTL,
  HOUSE_SIZES,
  priceError,
  standardBand,
  type CleaningTypeId,
  type HouseSizeId,
} from '@/config/pricing';
import { repository } from '@/data';
import type { Cleaner, CleanerProfileInput } from '@/data/types';
import { CONTACT_FILTER_NOTICE, filterContactInfo } from '@/lib/contact-filter';
import { useSession } from '@/lib/session';
import { space } from '@/theme';

type Draft = Omit<CleanerProfileInput, 'prices' | 'districts' | 'yearsExperience'> & {
  prices: Record<HouseSizeId, string>;
  districts: string;
  yearsExperience: string;
};

function toDraft(c: Cleaner): Draft {
  return {
    photoUrl: c.photoUrl,
    bio: c.bio,
    cleaningTypes: c.cleaningTypes,
    rules: c.rules,
    prices: Object.fromEntries(HOUSE_SIZES.map((h) => [h.id, String(c.prices[h.id])])) as Draft['prices'],
    districts: c.districts.join(', '),
    yearsExperience: String(c.yearsExperience),
  };
}

export default function Profil() {
  const { user } = useSession();
  const cleanerId = user?.cleanerId ?? '';
  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<'save' | 'photo' | 'doc' | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger' | 'warning'; text: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    repository.getCleaner(cleanerId).then((c) => {
      setCleaner(c);
      if (c) setDraft(toDraft(c));
    });
  }, [cleanerId]);

  if (!cleaner || !draft) return <Loading />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const priceErrors = Object.fromEntries(
    HOUSE_SIZES.map((h) => [h.id, priceError(h.id, Number(draft.prices[h.id].replace(/\D/g, '')))]),
  ) as Record<HouseSizeId, string | null>;
  const errors = {
    photo: draft.photoUrl ? null : 'Profil fotoğrafı zorunludur.',
    types: draft.cleaningTypes.length ? null : 'En az bir temizlik türü seçin.',
    prices: Object.values(priceErrors).some(Boolean) ? 'Fiyatları izin verilen aralıkta yazın.' : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    setBusy('photo');
    try {
      const url = await repository.uploadPhoto(cleanerId, {
        uri: asset.uri,
        name: asset.fileName ?? 'foto.jpg',
        mimeType: asset.mimeType,
      });
      set('photoUrl', url);
    } catch (e) {
      setMessage({ tone: 'danger', text: e instanceof Error ? e.message : 'Fotoğraf yüklenemedi.' });
    } finally {
      setBusy(null);
    }
  };

  const pickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (res.canceled) return;
    const file = res.assets[0];
    setBusy('doc');
    try {
      setCleaner(await repository.uploadInsuranceDocument(cleanerId, { uri: file.uri, name: file.name, mimeType: file.mimeType }));
      setMessage({ tone: 'success', text: 'Belgeniz alındı. Ekibimiz barkodu e-Devlet üzerinden kontrol edecek.' });
    } catch (e) {
      setMessage({ tone: 'danger', text: e instanceof Error ? e.message : 'Belge yüklenemedi.' });
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setShowErrors(true);
    if (hasErrors) {
      setMessage({ tone: 'danger', text: 'Lütfen kırmızı ile işaretli alanları düzeltin.' });
      return;
    }
    setBusy('save');
    const bioFiltered = filterContactInfo(draft.bio);
    const rulesFiltered = filterContactInfo(draft.rules.other);
    try {
      const updated = await repository.updateCleanerProfile(cleanerId, {
        photoUrl: draft.photoUrl,
        bio: draft.bio,
        cleaningTypes: draft.cleaningTypes,
        rules: draft.rules,
        prices: Object.fromEntries(
          HOUSE_SIZES.map((h) => [h.id, Number(draft.prices[h.id].replace(/\D/g, ''))]),
        ) as CleanerProfileInput['prices'],
        districts: draft.districts.split(',').map((d) => d.trim()).filter(Boolean),
        yearsExperience: Number(draft.yearsExperience) || 0,
      });
      setCleaner(updated);
      setDraft(toDraft(updated));
      setMessage(
        bioFiltered.changed || rulesFiltered.changed
          ? { tone: 'warning', text: `Kaydedildi. ${CONTACT_FILTER_NOTICE}` }
          : { tone: 'success', text: 'Profiliniz kaydedildi.' },
      );
    } catch (e) {
      setMessage({ tone: 'danger', text: e instanceof Error ? e.message : 'Kaydedilemedi.' });
    } finally {
      setBusy(null);
    }
  };

  const toggleType = (id: CleaningTypeId) =>
    set('cleaningTypes', draft.cleaningTypes.includes(id) ? draft.cleaningTypes.filter((t) => t !== id) : [...draft.cleaningTypes, id]);
  const setRule = (k: 'noDogs' | 'noCats' | 'noPets', v: boolean) => set('rules', { ...draft.rules, [k]: v });

  return (
    <Screen footer={<Button label="Kaydet" icon="save" loading={busy === 'save'} onPress={save} />}>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      <Card style={{ alignItems: 'center' }}>
        <Avatar uri={draft.photoUrl} size={140} />
        <Button
          label={draft.photoUrl ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}
          icon="camera"
          variant="secondary"
          loading={busy === 'photo'}
          onPress={pickPhoto}
          style={{ alignSelf: 'stretch' }}
        />
        <Muted center>Yüzünüzün net göründüğü bir fotoğraf seçin. Zorunludur.</Muted>
        {showErrors && errors.photo ? <Notice tone="danger">{errors.photo}</Notice> : null}
      </Card>

      <Card>
        <Heading>Sigorta / SGK belgesi</Heading>
        <InsuranceBadge status={cleaner.insuranceStatus} />
        <Body>
          e-Devlet’ten aldığınız barkodlu “SGK Tescil ve Hizmet Dökümü” veya sigorta poliçenizi yükleyin. Doğrulanınca profilinizde
          yeşil rozet görünür.
        </Body>
        {cleaner.insuranceDocName ? <Muted>Yüklenen belge: {cleaner.insuranceDocName}</Muted> : null}
        <Button
          label={cleaner.insuranceDocName ? 'Yeni belge yükle' : 'Belge yükle'}
          icon="document-attach"
          variant="secondary"
          loading={busy === 'doc'}
          onPress={pickDocument}
        />
      </Card>

      <Card>
        <Field
          label="Kendinizi tanıtın"
          help="Telefon, e-posta veya sosyal medya yazmayın; otomatik gizlenir."
          multiline
          value={draft.bio}
          onChangeText={(v) => set('bio', v)}
        />
        <Field label="Kaç yıllık deneyiminiz var?" keyboardType="number-pad" value={draft.yearsExperience} onChangeText={(v) => set('yearsExperience', v.replace(/\D/g, ''))} />
        <Field label="Gittiğiniz semtler" help="Virgülle ayırın" value={draft.districts} onChangeText={(v) => set('districts', v)} />
      </Card>

      <Card>
        <Heading>Yaptığınız temizlikler</Heading>
        {CLEANING_TYPES.map((t) => (
          <Choice key={t.id} multi label={t.label} selected={draft.cleaningTypes.includes(t.id)} onPress={() => toggleType(t.id)} />
        ))}
        {showErrors && errors.types ? <Notice tone="danger">{errors.types}</Notice> : null}
      </Card>

      <Card>
        <Heading>Fiyatlarınız (standart temizlik)</Heading>
        <Muted>Detaylı, taşınma ve inşaat sonrası temizlik fiyatları bunlara göre otomatik hesaplanır.</Muted>
        {HOUSE_SIZES.map((h) => {
          const [floor, ceiling] = standardBand(h.id);
          return (
            <Field
              key={h.id}
              label={`${h.label} ev (₺)`}
              help={`${formatTL(floor)} ile ${formatTL(ceiling)} arası`}
              keyboardType="number-pad"
              value={draft.prices[h.id]}
              error={showErrors ? priceErrors[h.id] : null}
              onChangeText={(v) => set('prices', { ...draft.prices, [h.id]: v.replace(/\D/g, '') })}
            />
          );
        })}
      </Card>

      <Card>
        <Heading>Tercihleriniz</Heading>
        <Choice multi label="Köpek olan evlere gitmiyorum" selected={draft.rules.noDogs} onPress={() => setRule('noDogs', !draft.rules.noDogs)} />
        <Choice multi label="Kedi olan evlere gitmiyorum" selected={draft.rules.noCats} onPress={() => setRule('noCats', !draft.rules.noCats)} />
        <Choice multi label="Hiç evcil hayvan istemiyorum" selected={draft.rules.noPets} onPress={() => setRule('noPets', !draft.rules.noPets)} />
        <Field
          label="Diğer kurallarınız"
          placeholder="Örneğin: Temizlik malzemesi evde olmalı."
          multiline
          value={draft.rules.other}
          onChangeText={(v) => set('rules', { ...draft.rules, other: v })}
        />
      </Card>

      <View style={{ gap: space.sm }}>
        <AccountSection />
      </View>
    </Screen>
  );
}
