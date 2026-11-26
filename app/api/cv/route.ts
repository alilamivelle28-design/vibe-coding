// Reçoit le CV en PDF, le fait lire par l'IA côté serveur, et renvoie une liste de compétences à relire.
// Rien n'est enregistré ici : l'étudiant relit puis valide sur son profil. Le CV n'est jamais conservé.
import { lireReponseIA, verifierFichierCV } from "@/lib/competences";
import { extraireCompetencesDuCV } from "@/lib/ia/gemini";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const MESSAGES_PANNE = {
  sans_cle: "L'assistant IA n'est pas encore branché.",
  lente: "L'IA met trop de temps à répondre.",
  panne: "L'IA ne répond pas pour le moment.",
} as const;

export async function POST(requete: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return Response.json({ erreur: "Connecte-toi pour déposer ton CV." }, { status: 401 });
  }

  let fichier: FormDataEntryValue | null = null;
  try {
    fichier = (await requete.formData()).get("cv");
  } catch {
    fichier = null;
  }
  if (!(fichier instanceof File)) {
    return Response.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
  }

  const pdf = await fichier.arrayBuffer();
  const probleme = verifierFichierCV({ type: fichier.type, taille: pdf.byteLength, debut: new Uint8Array(pdf).subarray(0, 5) });
  if (probleme) return Response.json({ erreur: probleme }, { status: 400 });

  const resultat = await extraireCompetencesDuCV(pdf);
  if (!resultat.ok) {
    return Response.json({ erreur: MESSAGES_PANNE[resultat.raison] }, { status: 503 });
  }

  const competences = lireReponseIA(resultat.texte);
  if (!competences) {
    return Response.json({ erreur: "La réponse de l'IA était illisible." }, { status: 502 });
  }
  return Response.json({ competences });
}
