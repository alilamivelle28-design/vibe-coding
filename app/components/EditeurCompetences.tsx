"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPETENCE_MAX, COMPETENCES_MAX, validerCompetences } from "@/lib/competences";
import { createClient } from "@/lib/supabase/client";

const bouton =
  "bg-noir px-5 py-2.5 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge disabled:opacity-60";
const boutonSecondaire =
  "border border-noir px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white disabled:opacity-60";

type Etape = "repos" | "analyse" | "relecture";

// Écran de relecture : l'IA propose une liste à partir du CV, l'étudiant la corrige, puis valide.
// Rien n'est enregistré avant le clic sur « Valider ». Si l'IA échoue, on passe en saisie manuelle.
export default function EditeurCompetences({ actuelles }: { actuelles: string[] }) {
  const [etape, setEtape] = useState<Etape>("repos");
  const [liste, setListe] = useState<string[]>(actuelles);
  const [nouvelle, setNouvelle] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  async function analyser(fichier: File | undefined) {
    if (!fichier) return;
    setErreur(null);
    setInfo(null);
    setEtape("analyse");
    let message: string | null = null;
    try {
      const donnees = new FormData();
      donnees.append("cv", fichier);
      const reponse = await fetch("/api/cv", { method: "POST", body: donnees });
      const resultat = (await reponse.json()) as { competences?: string[]; erreur?: string };
      if (reponse.ok && Array.isArray(resultat.competences)) {
        setListe(resultat.competences);
        setInfo(
          resultat.competences.length
            ? "Voici ce que l'IA a trouvé dans ton CV. Corrige, supprime ou ajoute, puis valide."
            : "L'IA n'a trouvé aucune compétence dans ce CV. Ajoute-les à la main ci-dessous.",
        );
      } else {
        message = resultat.erreur ?? "L'IA n'a pas pu lire ton CV.";
      }
    } catch {
      message = "L'IA ne répond pas pour le moment.";
    }
    if (message) {
      setErreur(`${message} Tu peux écrire tes compétences à la main ci-dessous.`);
    }
    setEtape("relecture");
  }

  function modifier(index: number, valeur: string) {
    setListe((l) => l.map((c, i) => (i === index ? valeur : c)));
    setErreur(null);
  }

  function retirer(index: number) {
    setListe((l) => l.filter((_, i) => i !== index));
    setErreur(null);
  }

  function ajouter(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!nouvelle.trim()) return;
    setListe((l) => [...l, nouvelle.trim()]);
    setNouvelle("");
    setErreur(null);
  }

  async function valider() {
    const propres = liste.map((c) => c.replace(/\s+/g, " ").trim());
    const probleme = validerCompetences(propres);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    setEnvoi(true);
    const { error } = await createClient().rpc("enregistrer_mes_competences", { liste: propres });
    setEnvoi(false);
    if (error) {
      setErreur(`L'enregistrement n'a pas marché, réessaie. (Détail : ${error.code ?? "?"} · ${error.message})`);
      return;
    }
    setEtape("repos");
    setInfo(null);
    router.refresh();
  }

  function annuler() {
    setListe(actuelles);
    setErreur(null);
    setInfo(null);
    setEtape("repos");
  }

  if (etape === "repos") {
    return (
      <div>
        {actuelles.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {actuelles.map((c) => (
              <li key={c} className="rounded-full border border-noir bg-white px-3 py-1 text-sm font-semibold">
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-noir/70">
            Pas encore de compétences. Dépose ton CV en PDF : l&apos;IA te propose une liste, tu la relis avant
            qu&apos;elle soit enregistrée.
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className={`${bouton} cursor-pointer`}>
            {actuelles.length ? "Refaire avec mon CV" : "Remplir avec mon CV"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => {
                analyser(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button type="button" className={boutonSecondaire} onClick={() => setEtape("relecture")}>
            {actuelles.length ? "Modifier à la main" : "Écrire à la main"}
          </button>
        </div>
        <p className="mt-3 text-xs text-noir/60">
          PDF de 5 Mo au plus. Ton CV n&apos;est pas conservé : seule la liste que tu valides est enregistrée.
        </p>
      </div>
    );
  }

  if (etape === "analyse") {
    return (
      <p role="status" className="mt-4 animate-pulse font-semibold">
        L&apos;IA lit ton CV… (jusqu&apos;à 20 secondes)
      </p>
    );
  }

  return (
    <div className="mt-4 border border-noir bg-white p-5">
      <p className="font-titres text-lg uppercase">Relis avant d&apos;enregistrer</p>
      {info && <p className="mt-1 text-sm text-noir/80">{info}</p>}
      {erreur && (
        <p role="alert" className="mt-2 text-sm font-semibold text-rouge">
          {erreur}
        </p>
      )}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {liste.map((c, i) => (
          <li key={i} className="flex gap-2">
            <input
              value={c}
              maxLength={COMPETENCE_MAX}
              aria-label={`Compétence ${i + 1}`}
              onChange={(e) => modifier(i, e.target.value)}
              className="min-w-0 flex-1 border border-noir px-3 py-2 outline-none focus:ring-2 focus:ring-rouge"
            />
            <button
              type="button"
              onClick={() => retirer(i)}
              aria-label={`Supprimer ${c || "cette compétence"}`}
              className="border border-noir px-3 font-bold hover:bg-rouge hover:text-white"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {liste.length < COMPETENCES_MAX && (
        <form onSubmit={ajouter} className="mt-4 flex gap-2">
          <input
            value={nouvelle}
            maxLength={COMPETENCE_MAX}
            placeholder="Ajouter une compétence (ex. : Montage vidéo)"
            onChange={(e) => setNouvelle(e.target.value)}
            className="min-w-0 flex-1 border border-noir px-3 py-2 outline-none focus:ring-2 focus:ring-rouge"
          />
          <button type="submit" className={boutonSecondaire}>
            Ajouter
          </button>
        </form>
      )}
      <p className="mt-2 text-xs text-noir/60">
        {liste.length}/{COMPETENCES_MAX} compétences · visibles par les étudiants connectés, avec ton prénom.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={valider} disabled={envoi} className={bouton}>
          {envoi ? "Enregistrement…" : "Valider"}
        </button>
        <button type="button" onClick={annuler} disabled={envoi} className={boutonSecondaire}>
          Annuler
        </button>
      </div>
    </div>
  );
}
