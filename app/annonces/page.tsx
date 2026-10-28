import { Suspense } from "react";
import Link from "next/link";
import BoutonPublier from "@/app/components/BoutonPublier";
import { COLONNES_ANNONCE, type Annonce } from "@/app/components/CarteAnnonce";
import EnTete from "@/app/components/EnTete";
import VueAnnonces from "@/app/components/VueAnnonces";
import { estCategorie, estTypeAnnonce, FAMILLES_CATEGORIES, TYPES_ANNONCE } from "@/lib/annonces";
import { exigerConnexion } from "@/lib/supabase/connexion";

type Filtres = Promise<{ [cle: string]: string | string[] | undefined }>;

const choix = "mt-1 w-full border border-noir bg-white px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-rouge";

export default function Annonces({ searchParams }: { searchParams: Filtres }) {
  return (
    <>
      <EnTete />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16">
        <h1 className="font-titres text-5xl uppercase">Les annonces</h1>
        <div className="mt-5">
          <BoutonPublier />
        </div>
        <Suspense fallback={<p className="mt-8 text-noir/60">Chargement des annonces…</p>}>
          <ListeAnnonces searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function ListeAnnonces({ searchParams }: { searchParams: Filtres }) {
  const { supabase, id: moi } = await exigerConnexion();
  const parametres = await searchParams;
  const type = estTypeAnnonce(parametres.type) ? parametres.type : "";
  const categorie = estCategorie(parametres.categorie) ? parametres.categorie : "";

  let requete = supabase.from("annonces").select(COLONNES_ANNONCE).order("cree_le", { ascending: false }).limit(100);
  if (type) requete = requete.eq("type", type);
  if (categorie) requete = requete.eq("categorie", categorie);
  const { data, error } = await requete.overrideTypes<Annonce[], { merge: false }>();

  return (
    <>
      <form method="get" className="mt-6 grid gap-3 rounded-[28px] bg-gris p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold">
          Type
          <select name="type" defaultValue={type} className={choix}>
            <option value="">Tout</option>
            {Object.entries(TYPES_ANNONCE).map(([valeur, texte]) => (
              <option key={valeur} value={valeur}>
                {texte}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Catégorie
          <select name="categorie" defaultValue={categorie} className={choix}>
            <option value="">Toutes</option>
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
        </label>
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-noir px-5 py-2.5 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge">
            Filtrer
          </button>
          {(type || categorie) && (
            <Link href="/annonces" className="self-center text-sm font-semibold underline underline-offset-4 hover:text-rouge">
              Effacer
            </Link>
          )}
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-8 font-semibold text-rouge">
          Les annonces n&apos;ont pas pu être chargées. Recharge la page dans un instant.
        </p>
      ) : data.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-noir/40 p-8 text-center">
          <p className="font-manuscrit text-3xl text-rouge">
            {type || categorie ? "rien dans ce filtre pour l'instant." : "aucune annonce pour l'instant."}
          </p>
          <p className="mt-2 text-noir/70">Lance-toi : la première annonce, c&apos;est peut-être la tienne.</p>
        </div>
      ) : (
        <VueAnnonces annonces={data} moi={moi} />
      )}
    </>
  );
}
