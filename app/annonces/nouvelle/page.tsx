import { Suspense } from "react";
import Link from "next/link";
import EnTete from "@/app/components/EnTete";
import FormulaireAnnonce from "@/app/components/FormulaireAnnonce";
import { exigerConnexion } from "@/lib/supabase/connexion";

export default function NouvelleAnnonce() {
  return (
    <>
      <EnTete />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16">
        <Link href="/annonces" className="text-sm font-semibold underline underline-offset-4 hover:text-rouge">
          ← Retour aux annonces
        </Link>
        <h1 className="mt-3 font-titres text-5xl uppercase">Publier une annonce</h1>
        <p className="mt-2 font-manuscrit text-3xl text-rouge">ce que tu sais faire, ou ce qu&apos;il te faut.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-noir/60">Chargement…</p>}>
            <FormulaireConnecte />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function FormulaireConnecte() {
  await exigerConnexion();
  return <FormulaireAnnonce />;
}
