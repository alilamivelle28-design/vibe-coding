// Les compétences du profil : contrôle de la réponse de l'IA, de la liste relue et du fichier déposé.
// Les mêmes limites sont vérifiées par la base (supabase/migrations/005_competences.sql).

export const COMPETENCES_MAX = 15;
export const COMPETENCE_MIN = 2;
export const COMPETENCE_MAX = 40;
export const CV_TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

const nettoyer = (texte: string) => texte.replace(/\s+/g, " ").trim();

// Une compétence ne doit jamais contenir de coordonnées : e-mail, lien ou numéro de téléphone.
export function ressembleACoordonnees(texte: string): boolean {
  return /@/.test(texte) || /(https?:\/\/|www\.)/i.test(texte) || /\d{8}/.test(texte.replace(/\D/g, ""));
}

function estCompetenceCorrecte(texte: string): boolean {
  return texte.length >= COMPETENCE_MIN && texte.length <= COMPETENCE_MAX && !ressembleACoordonnees(texte);
}

// Lit la réponse brute de l'IA. Renvoie la liste nettoyée, ou null si la réponse n'a pas la forme attendue.
export function lireReponseIA(reponse: string): string[] | null {
  const texte = reponse.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let donnees: unknown;
  try {
    donnees = JSON.parse(texte);
  } catch {
    return null;
  }
  if (typeof donnees !== "object" || donnees === null || Array.isArray(donnees)) return null;
  const liste = (donnees as { competences?: unknown }).competences;
  if (!Array.isArray(liste)) return null;

  const gardees: string[] = [];
  const dejaVues = new Set<string>();
  for (const element of liste) {
    if (typeof element !== "string") continue;
    const competence = nettoyer(element);
    const cle = competence.toLowerCase();
    if (!estCompetenceCorrecte(competence) || dejaVues.has(cle)) continue;
    dejaVues.add(cle);
    gardees.push(competence);
    if (gardees.length === COMPETENCES_MAX) break;
  }
  return gardees;
}

// Vérifie la liste relue et validée par l'étudiant, juste avant l'enregistrement. Renvoie un message d'erreur ou null.
export function validerCompetences(liste: unknown): string | null {
  if (!Array.isArray(liste) || !liste.every((c) => typeof c === "string")) {
    return "La liste des compétences est illisible, réessaie.";
  }
  if (liste.length > COMPETENCES_MAX) return `Garde au plus ${COMPETENCES_MAX} compétences.`;
  const dejaVues = new Set<string>();
  for (const brute of liste) {
    const competence = nettoyer(brute);
    if (!competence) return "Une compétence est vide : remplis-la ou supprime-la.";
    if (competence.length < COMPETENCE_MIN) return `« ${competence} » est trop court (au moins ${COMPETENCE_MIN} caractères).`;
    if (competence.length > COMPETENCE_MAX) return `Chaque compétence fait au plus ${COMPETENCE_MAX} caractères.`;
    if (ressembleACoordonnees(competence)) {
      return `« ${competence} » ressemble à des coordonnées : elles restent privées, retire-les.`;
    }
    const cle = competence.toLowerCase();
    if (dejaVues.has(cle)) return `« ${competence} » apparaît deux fois.`;
    dejaVues.add(cle);
  }
  return null;
}

// Vérifie le fichier déposé avant de l'envoyer à l'IA. Renvoie un message d'erreur ou null.
export function verifierFichierCV({ type, taille, debut }: { type: string; taille: number; debut: Uint8Array }): string | null {
  if (taille === 0) return "Le fichier est vide.";
  if (taille > CV_TAILLE_MAX) return "Le CV dépasse 5 Mo : enregistre-le en plus léger et réessaie.";
  const signature = new TextDecoder().decode(debut.subarray(0, 5));
  if (type !== "application/pdf" || signature !== "%PDF-") return "Dépose ton CV au format PDF.";
  return null;
}
