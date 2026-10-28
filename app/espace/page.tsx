import { Suspense } from "react";
import Link from "next/link";
import BoutonSupprimer from "@/app/components/BoutonSupprimer";
import CarteAnnonce, { COLONNES_ANNONCE, type Annonce } from "@/app/components/CarteAnnonce";
import EnTete from "@/app/components/EnTete";
import { exigerConnexion } from "@/lib/supabase/connexion";

export default function Espace() {
  return (
    <>
      <EnTete />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-4">
        <Suspense fallback={<p className="text-noir/60">Chargement de ton espace…</p>}>
          <ContenuEspace />
        </Suspense>
      </main>
    </>
  );
}

async function ContenuEspace() {
  const { supabase, id } = await exigerConnexion();

  const [{ data: publics }, { data: prives }, { data: mesAnnonces }] = await Promise.all([
    supabase.from("profils_publics").select("prenom").eq("id", id).single(),
    supabase.from("profils_prives").select("nom, email, telephone, adresse").eq("id", id).single(),
    supabase
      .from("annonces")
      .select(COLONNES_ANNONCE)
      .eq("auteur", id)
      .order("cree_le", { ascending: false })
      .overrideTypes<Annonce[], { merge: false }>(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titres text-5xl uppercase">Bonjour {publics?.prenom ?? ""}</h1>
        <form action="/auth/deconnexion" method="post">
          <button
            type="submit"
            className="border border-noir px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white"
          >
            Se déconnecter
          </button>
        </form>
      </div>
      <p className="mt-2 font-manuscrit text-3xl text-rouge">ton compte est prêt.</p>

      <section className="mt-8 rounded-[28px] bg-gris p-7">
        <h2 className="font-titres text-2xl uppercase">
          Mes informations
          <span className="ml-2 rounded-full bg-noir px-2 py-0.5 align-middle font-sans text-xs font-semibold normal-case tracking-normal text-white">
            🔒 Visibles seulement par toi
          </span>
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info nom="Prénom (public)" valeur={publics?.prenom} />
          <Info nom="Nom" valeur={prives?.nom} />
          <Info nom="E-mail" valeur={prives?.email} />
          <Info nom="Téléphone" valeur={prives?.telephone} />
          <Info nom="Adresse" valeur={prives?.adresse} />
        </dl>
      </section>

      <section id="mes-annonces" className="mt-12 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-titres text-3xl uppercase">Mes annonces</h2>
          <Link
            href="/annonces/nouvelle"
            className="bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge"
          >
            Publier une annonce →
          </Link>
        </div>
        {mesAnnonces?.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mesAnnonces.map((annonce) => (
              <CarteAnnonce key={annonce.id} annonce={annonce}>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/annonces/${annonce.id}/modifier`}
                    className="border border-noir px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white"
                  >
                    Modifier
                  </Link>
                  <BoutonSupprimer id={annonce.id} titre={annonce.titre} />
                </div>
              </CarteAnnonce>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-noir/70">Tu n&apos;as pas encore publié d&apos;annonce.</p>
        )}
      </section>
    </>
  );
}

function Info({ nom, valeur }: { nom: string; valeur?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-noir/60">{nom}</dt>
      <dd className="mt-0.5">{valeur ?? "—"}</dd>
    </div>
  );
}
