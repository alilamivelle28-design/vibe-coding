import "server-only";
// Appel à l'IA Gemini (Google). Ce fichier ne s'exécute que sur le serveur :
// la clé est lue dans les variables d'environnement de Vercel et n'est jamais envoyée au navigateur.
import { PROMPT_CV } from "./prompts";

// « gemini-flash-latest » suit automatiquement le dernier modèle Flash de Google (disponible en version gratuite).
// On peut en choisir un autre sans toucher au code avec la variable Vercel GEMINI_MODELE (ce n'est pas un secret).
const MODELE = process.env.GEMINI_MODELE || "gemini-flash-latest";
const DELAI_MAX_MS = 20_000;

export type ResultatIA = { ok: true; texte: string } | { ok: false; raison: "sans_cle" | "lente" | "panne" };

// Envoie le CV (PDF) à Gemini et renvoie la réponse brute (texte JSON), sans jamais la faire confiance : elle est
// ensuite contrôlée par lireReponseIA.
export async function extraireCompetencesDuCV(pdf: ArrayBuffer): Promise<ResultatIA> {
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return { ok: false, raison: "sans_cle" };

  try {
    const reponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": cle },
      signal: AbortSignal.timeout(DELAI_MAX_MS),
      body: JSON.stringify({
        // Les consignes vont dans systemInstruction ; le CV va à part, comme une simple pièce jointe.
        systemInstruction: { parts: [{ text: PROMPT_CV }] },
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "application/pdf", data: Buffer.from(pdf).toString("base64") } },
              { text: "Voici le CV à analyser. Réponds avec le JSON demandé." },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: { competences: { type: "ARRAY", items: { type: "STRING" } } },
            required: ["competences"],
          },
        },
      }),
    });
    if (!reponse.ok) {
      console.error("Gemini a refusé la demande", reponse.status);
      return { ok: false, raison: "panne" };
    }
    const donnees = (await reponse.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const texte = donnees.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return { ok: true, texte };
  } catch (erreur) {
    const lente = erreur instanceof Error && (erreur.name === "TimeoutError" || erreur.name === "AbortError");
    return { ok: false, raison: lente ? "lente" : "panne" };
  }
}
