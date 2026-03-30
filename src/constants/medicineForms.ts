/**
 * Common pharmaceutical dosage forms (oral, topical, injectable, etc.)
 * Used for the medicine "Form" dropdown; selected value is sent as `medicineForm` on create/update.
 */
export const COMMON_MEDICINE_FORMS: readonly string[] = [
  'Tablet',
  'Capsule',
  'Softgel',
  'Chewable tablet',
  'Dispersible tablet',
  'Syrup',
  'Suspension',
  'Oral solution',
  'Oral drops',
  'Powder',
  'Granules',
  'Sachet',
  'Injection',
  'Dry powder injection',
  'Prefilled syringe',
  'Cream',
  'Ointment',
  'Gel',
  'Lotion',
  'Spray',
  'Nasal spray',
  'Nasal drops',
  'Eye drops',
  'Ear drops',
  'Inhaler',
  'Rotacaps',
  'Transdermal patch',
  'Suppository',
  'Mouthwash',
  'Other',
] as const;

/** Merge API-provided forms with the static list; dedupe and sort for the dropdown. */
export function mergeMedicineFormOptions(apiForms: string[] | null | undefined): string[] {
  const set = new Set<string>();
  for (const f of COMMON_MEDICINE_FORMS) {
    set.add(f);
  }
  for (const f of apiForms || []) {
    if (f != null && String(f).trim() !== '') {
      set.add(String(f).trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
