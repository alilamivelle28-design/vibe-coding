export const SEUIL_SWIPE = 100;
export const CLE_ECARTEES = "entraide:pas-interessee";

export type Decision = "interessee" | "pas-interessee";

// À droite au-delà du seuil : je réponds. À gauche : pas intéressée. Entre les deux : la carte revient.
export function decisionSwipe(deplacement: number, seuil = SEUIL_SWIPE): Decision | null {
  if (deplacement >= seuil) return "interessee";
  if (deplacement <= -seuil) return "pas-interessee";
  return null;
}

// Lit la liste des annonces écartées sur ce téléphone, sans planter si elle est abîmée.
export function lireEcartees(texte: string | null): string[] {
  if (!texte) return [];
  try {
    const valeur: unknown = JSON.parse(texte);
    return Array.isArray(valeur) ? valeur.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
