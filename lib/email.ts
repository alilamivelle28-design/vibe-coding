export const SCHOOL_EMAIL_DOMAIN = "mail-esd.com";

// Seules les adresses internes de l'école (nom@mail-esd.com) sont acceptées.
export function isSchoolEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@mail-esd\.com$/.test(email);
}
