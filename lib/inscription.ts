export type InfosInscription = {
  prenom: string;
  nom: string;
  telephone: string;
  adresse: string;
};

// Numéro français : 0X XX XX XX XX ou +33 X XX XX XX XX (espaces, points et tirets acceptés).
export function isPhoneNumber(value: string): boolean {
  const chiffres = value.replace(/[\s.-]/g, "");
  return /^(0[1-9]\d{8}|\+33[1-9]\d{8})$/.test(chiffres);
}

// Renvoie un message d'erreur à afficher, ou null si tout est valide.
export function validateInscription(infos: InfosInscription): string | null {
  if (infos.prenom.trim() === "") return "Entre ton prénom.";
  if (infos.nom.trim() === "") return "Entre ton nom.";
  if (!isPhoneNumber(infos.telephone)) {
    return "Entre un numéro de téléphone valide, par exemple 06 12 34 56 78.";
  }
  if (infos.adresse.trim() === "") return "Entre ton adresse.";
  return null;
}
