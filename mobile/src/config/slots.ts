export const SLOT_TEMPLATES = [
  { id: 'sabah', label: 'Sabah', start: '09:00', end: '13:00' },
  { id: 'ogleden-sonra', label: 'Öğleden sonra', start: '14:00', end: '18:00' },
] as const;

export type SlotTemplateId = (typeof SLOT_TEMPLATES)[number]['id'];

/** How many days ahead cleaners can open slots and customers can book. */
export const BOOKING_WINDOW_DAYS = 14;

export function slotTemplate(id: string) {
  return SLOT_TEMPLATES.find((s) => s.id === id) ?? SLOT_TEMPLATES[0];
}
