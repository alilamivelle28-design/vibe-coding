export const TYPES_ANNONCE = {
  propose: "Je propose",
  cherche: "Je cherche",
} as const;

export type TypeAnnonce = keyof typeof TYPES_ANNONCE;

// Les clés doivent rester identiques à la liste de supabase/migrations/002_annonces.sql (vérifié par un test).
export const FAMILLES_CATEGORIES = [
  {
    nom: "Savoir-faire",
    categories: {
      photo: "Photo",
      video: "Vidéo, montage et motion design",
      graphisme: "Graphisme et direction artistique",
      web: "Web, UX/UI et dev",
      reseaux: "Réseaux sociaux et influence",
      redaction: "Rédaction et stratégie de marque",
      evenementiel: "Événementiel",
      marketing: "Marketing digital et data",
      ia: "IA générative",
      langues: "Langues et soutien",
    },
  },
  {
    nom: "Vie étudiante",
    categories: {
      logement: "Logement et coloc",
      covoiturage: "Covoiturage et trajets",
      materiel: "Prêt de matériel",
      coup_de_main: "Coup de main",
      autre: "Autre",
    },
  },
] as const;

export const CATEGORIES: Record<string, string> = Object.assign(
  {},
  ...FAMILLES_CATEGORIES.map((famille) => famille.categories),
);

export const TITRE_MIN = 3;
export const TITRE_MAX = 80;
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 1000;

export type BrouillonAnnonce = {
  type: string;
  categorie: string;
  titre: string;
  description: string;
  remunere: boolean;
};

export function estTypeAnnonce(valeur: unknown): valeur is TypeAnnonce {
  return typeof valeur === "string" && Object.hasOwn(TYPES_ANNONCE, valeur);
}

export function estCategorie(valeur: unknown): valeur is string {
  return typeof valeur === "string" && Object.hasOwn(CATEGORIES, valeur);
}

export function validateAnnonce(annonce: BrouillonAnnonce): string | null {
  if (!estTypeAnnonce(annonce.type)) return "Choisis si tu proposes ou si tu cherches.";
  if (!estCategorie(annonce.categorie)) return "Choisis une catégorie.";

  const titre = annonce.titre.trim();
  if (titre.length < TITRE_MIN) return `Le titre doit faire au moins ${TITRE_MIN} caractères.`;
  if (titre.length > TITRE_MAX) return `Le titre doit faire au plus ${TITRE_MAX} caractères.`;

  const description = annonce.description.trim();
  if (description.length < DESCRIPTION_MIN) {
    return `La description doit faire au moins ${DESCRIPTION_MIN} caractères.`;
  }
  if (description.length > DESCRIPTION_MAX) {
    return `La description doit faire au plus ${DESCRIPTION_MAX} caractères.`;
  }

  return null;
}
