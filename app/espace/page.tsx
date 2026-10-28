import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function Espace() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
      <Suspense fallback={<p className="text-noir/60">Chargement de ton espace…</p>}>
        <ContenuEspace />
      </Suspense>
    </main>
  );
}

async function ContenuEspace() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/#connexion");

  const [{ data: publics }, { data: prives }] = await Promise.all([
    supabase.from("profils_publics").select("prenom").eq("id", id).single(),
    supabase.from("profils_prives").select("nom, email, telephone, adresse").eq("id", id).single(),
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

      <p className="mt-8 text-noir/60">Les annonces arrivent à la prochaine étape.</p>
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
