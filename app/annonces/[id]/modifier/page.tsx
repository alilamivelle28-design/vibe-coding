import { Suspense } from "react";
import { notFound } from "next/navigation";
import EnTete from "@/app/components/EnTete";
import FormulaireAnnonce from "@/app/components/FormulaireAnnonce";
import { exigerConnexion } from "@/lib/supabase/connexion";

export default function ModifierAnnonce({ params }: PageProps<"/annonces/[id]/modifier">) {
  return (
    <>
      <EnTete />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16">
        <h1 className="font-titres text-5xl uppercase">Modifier l&apos;annonce</h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-noir/60">Chargement…</p>}>
            <FormulaireRempli params={params} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function FormulaireRempli({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, id: moi } = await exigerConnexion();
  const { id } = await params;
  // Seulement mes annonces : la base refuserait de toute façon la modification de celle d'un autre.
  const { data } = await supabase
    .from("annonces")
    .select("type, categorie, titre, description, remunere")
    .eq("id", id)
    .eq("auteur", moi)
    .maybeSingle();
  if (!data) notFound();

  return <FormulaireAnnonce id={id} initiale={data} />;
}
