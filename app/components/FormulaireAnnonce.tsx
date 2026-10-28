"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DESCRIPTION_MAX,
  FAMILLES_CATEGORIES,
  TITRE_MAX,
  TYPES_ANNONCE,
  validateAnnonce,
  type BrouillonAnnonce,
} from "@/lib/annonces";
import { createClient } from "@/lib/supabase/client";

const champ =
  "mt-1 w-full border border-noir bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rouge";
const etiquette = "mt-5 block font-titres text-base uppercase tracking-wide";
const vide: BrouillonAnnonce = { type: "propose", categorie: "", titre: "", description: "", remunere: false };

// Sert à publier (sans id) et à modifier (avec l'id de l'annonce).
// Sans `apresEnvoi`, on part sur « Mes annonces » une fois l'annonce enregistrée.
export default function FormulaireAnnonce({
  id,
  initiale = vide,
  apresEnvoi,
}: {
  id?: string;
  initiale?: BrouillonAnnonce;
  apresEnvoi?: () => void;
}) {
  const [annonce, setAnnonce] = useState<BrouillonAnnonce>(initiale);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  function changer<K extends keyof BrouillonAnnonce>(cle: K, valeur: BrouillonAnnonce[K]) {
    setAnnonce((actuelle) => ({ ...actuelle, [cle]: valeur }));
    setErreur(null);
  }

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const probleme = validateAnnonce(annonce);
    if (probleme) {
      setErreur(probleme);
      return;
    }

    const valeurs = {
      type: annonce.type,
      categorie: annonce.categorie,
      titre: annonce.titre.trim(),
      description: annonce.description.trim(),
      remunere: annonce.remunere,
    };
    const supabase = createClient();
    setEnvoi(true);
    const { error } = id
      ? await supabase.from("annonces").update(valeurs).eq("id", id)
      : await supabase.from("annonces").insert(valeurs);
    setEnvoi(false);

    if (error) {
      setErreur("L'enregistrement n'a pas marché. Vérifie ta connexion, puis réessaie.");
      return;
    }
    if (apresEnvoi) {
      apresEnvoi();
      return;
    }
    router.push("/espace#mes-annonces");
    router.refresh();
  }

  return (
    <form onSubmit={envoyer} noValidate className="border border-noir bg-white p-6">
      <fieldset>
        <legend className="font-titres text-base uppercase tracking-wide">Tu…</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {Object.entries(TYPES_ANNONCE).map(([valeur, texte]) => (
            <label
              key={valeur}
              className={`flex cursor-pointer items-center justify-center border border-noir px-4 py-3 font-semibold has-focus-visible:ring-2 has-focus-visible:ring-rouge ${
                annonce.type === valeur ? "bg-noir text-white" : "bg-white hover:bg-gris"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={valeur}
                checked={annonce.type === valeur}
                onChange={() => changer("type", valeur)}
                className="sr-only"
              />
              {texte}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="categorie" className={etiquette}>
        Catégorie
      </label>
      <select
        id="categorie"
        value={annonce.categorie}
        onChange={(e) => changer("categorie", e.target.value)}
        aria-describedby="erreur-annonce"
        className={champ}
      >
        <option value="" disabled>
          Choisis une catégorie
        </option>
        {FAMILLES_CATEGORIES.map((famille) => (
          <optgroup key={famille.nom} label={famille.nom}>
            {Object.entries(famille.categories).map(([valeur, texte]) => (
              <option key={valeur} value={valeur}>
                {texte}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <label htmlFor="titre" className={etiquette}>
        Titre
      </label>
      <input
        id="titre"
        value={annonce.titre}
        maxLength={TITRE_MAX}
        onChange={(e) => changer("titre", e.target.value)}
        placeholder="Ex. : Shooting portrait pour ton CV"
        aria-describedby="erreur-annonce"
        className={champ}
      />
      <p className="mt-1 text-right text-xs text-noir/60">
        {annonce.titre.length} / {TITRE_MAX}
      </p>

      <label htmlFor="description" className="mt-1 block font-titres text-base uppercase tracking-wide">
        Description
      </label>
      <textarea
        id="description"
        value={annonce.description}
        maxLength={DESCRIPTION_MAX}
        rows={6}
        onChange={(e) => changer("description", e.target.value)}
        placeholder="Ce que tu proposes ou cherches, quand, où…"
        aria-describedby="erreur-annonce"
        className={champ}
      />
      <p className="mt-1 text-right text-xs text-noir/60">
        {annonce.description.length} / {DESCRIPTION_MAX}
      </p>

      <label className="mt-3 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={annonce.remunere}
          onChange={(e) => changer("remunere", e.target.checked)}
          className="mt-1 size-5 accent-rouge"
        />
        <span>
          <span className="font-semibold">Rémunéré</span>
          <span className="block text-sm text-noir/70">
            Le service peut comprendre une participation financière, à régler entre vous. Aucun paiement ne passe par
            le site.
          </span>
        </span>
      </label>

      <p id="erreur-annonce" role="alert" aria-live="polite" className="mt-4 min-h-5 text-sm font-semibold text-rouge">
        {erreur}
      </p>

      <button
        type="submit"
        disabled={envoi}
        className="mt-2 flex w-full items-center justify-center gap-2 bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white transition hover:bg-rouge disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
      >
        {envoi ? "Envoi…" : id ? "Enregistrer les modifications" : "Publier l'annonce"}
      </button>
    </form>
  );
}
