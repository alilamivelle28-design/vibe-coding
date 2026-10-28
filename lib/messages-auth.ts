// Transforme une erreur de Supabase Auth en phrase compréhensible pour l'étudiant.
export function messageErreurAuth(erreur: { code?: string }): string {
  switch (erreur.code) {
    case "invalid_credentials":
      return "Adresse ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirme d'abord ton adresse : clique sur le lien reçu par mail.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cette adresse. Connecte-toi ou utilise « Mot de passe oublié ? ».";
    case "weak_password":
      return "Ce mot de passe est trop faible, choisis-en un plus long.";
    case "same_password":
      return "Choisis un mot de passe différent de l'ancien.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de mails envoyés pour l'instant. Réessaie dans quelques minutes.";
    case "unexpected_failure":
      // La base refuse l'inscription : domaine interdit ou champ invalide.
      return "Inscription refusée : vérifie que ton adresse se termine par @mail-esd.com et que tous les champs sont remplis.";
    default:
      return "Une erreur est survenue, réessaie dans un instant.";
  }
}
