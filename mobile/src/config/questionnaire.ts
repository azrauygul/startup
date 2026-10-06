import { CLEANING_TYPES, HOUSE_SIZES, PET_SURCHARGE_PCT } from './pricing';

/**
 * Booking questions are data-driven so they can be refined without touching screens.
 * `cleaningType` options are narrowed to what the selected cleaner offers.
 */
export type Question =
  | {
      id: string;
      kind: 'choice';
      title: string;
      help?: string;
      required: boolean;
      options: { id: string; label: string; hint?: string }[];
    }
  | {
      id: string;
      kind: 'text';
      title: string;
      help?: string;
      required: boolean;
      placeholder: string;
      multiline?: boolean;
    };

export const PET_OPTIONS = [
  { id: 'yok', label: 'Evcil hayvan yok' },
  { id: 'kopek', label: 'Köpek var' },
  { id: 'kedi', label: 'Kedi var' },
  { id: 'diger', label: 'Başka bir hayvan var' },
] as const;

export const QUESTIONS: Question[] = [
  {
    id: 'houseSize',
    kind: 'choice',
    title: 'Eviniz kaç oda?',
    required: true,
    options: HOUSE_SIZES.map((h) => ({ id: h.id, label: h.label, hint: h.hint })),
  },
  {
    id: 'cleaningType',
    kind: 'choice',
    title: 'Nasıl bir temizlik istiyorsunuz?',
    required: true,
    options: CLEANING_TYPES.map((c) => ({ id: c.id, label: c.label })),
  },
  {
    id: 'pets',
    kind: 'choice',
    title: 'Evinizde evcil hayvan var mı?',
    help: `Evcil hayvanlı evlerde ücrete %${PET_SURCHARGE_PCT} eklenir.`,
    required: true,
    options: PET_OPTIONS.map((p) => ({ id: p.id, label: p.label })),
  },
  {
    id: 'address',
    kind: 'text',
    title: 'Adresiniz',
    help: 'Adresiniz yalnızca randevu onaylandığında temizlikçiye gösterilir.',
    required: true,
    placeholder: 'Mahalle, sokak, bina ve daire no',
    multiline: true,
  },
  {
    id: 'notes',
    kind: 'text',
    title: 'Eklemek istediğiniz bir not var mı?',
    help: 'Telefon numarası veya e-posta yazmayın; güvenliğiniz için gizlenir.',
    required: false,
    placeholder: 'Örneğin: Mutfağa özellikle dikkat edilsin.',
    multiline: true,
  },
];

export type Answers = Record<string, string>;
