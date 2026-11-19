export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 500;

export type StatutDemande = "en_attente" | "acceptee" | "refusee";

// Une ligne renvoyée par mes_demandes_envoyees() ou mes_demandes_recues() (voir 003_demandes.sql).
// Téléphone et e-mail ne sont remplis que pour une demande acceptée.
export type Demande = {
  id: string;
  annonce: string;
  titre: string;
  prenom: string;
  message: string;
  statut: StatutDemande;
  cree_le: string;
  telephone: string | null;
  email: string | null;
};

export function validateMessage(message: string): string | null {
  const texte = message.trim();
  if (texte.length < MESSAGE_MIN) return `Ton message doit faire au moins ${MESSAGE_MIN} caractères.`;
  if (texte.length > MESSAGE_MAX) return `Ton message doit faire au plus ${MESSAGE_MAX} caractères.`;
  return null;
}

// Transforme une erreur de la base en phrase compréhensible pour l'étudiant.
export function messageErreurDemande(erreur: { code?: string; message?: string }): string {
  if (erreur.code === "23505") return "Tu as déjà demandé le contact pour cette annonce.";
  if (erreur.message?.includes("propre annonce")) return "C'est ton annonce : tu ne peux pas te demander le contact.";
  if (erreur.message?.includes("introuvable")) return "Cette annonce n'existe plus.";
  return "La demande n'est pas partie. Vérifie ta connexion, puis réessaie.";
}
