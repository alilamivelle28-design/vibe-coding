export const PASSWORD_MIN_LENGTH = 8;

// Renvoie un message d'erreur à afficher, ou null si le mot de passe est valide.
export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (password !== confirmation) {
    return "Les deux mots de passe ne sont pas identiques.";
  }
  return null;
}
