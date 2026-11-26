import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const liens = [
  { href: "/annonces", texte: "Annonces" },
  { href: "/annonces/nouvelle", texte: "Publier" },
] as const;

// En-tête des pages réservées aux étudiants connectés.
export default function EnTete() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
      <Link href="/annonces" className="font-titres text-2xl uppercase tracking-wide">
        Entraide<span className="text-rouge">.</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm font-semibold uppercase tracking-wide sm:gap-5">
        {liens.map((lien) => (
          <Link key={lien.href} href={lien.href} className="hover:text-rouge">
            {lien.texte}
          </Link>
        ))}
        <Link href="/profil" className="flex items-center gap-1.5 hover:text-rouge">
          Mon profil
          <Suspense fallback={null}>
            <PastilleDemandes />
          </Suspense>
        </Link>
      </nav>
    </header>
  );
}

// Nombre de demandes reçues en attente de réponse (la base ne compte que les miennes).
async function PastilleDemandes() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("demandes")
    .select("id", { count: "exact", head: true })
    .eq("statut", "en_attente");
  if (!count) return null;

  return (
    <span
      aria-label={`${count} demande${count > 1 ? "s" : ""} en attente`}
      className="grid min-w-5 place-items-center rounded-full bg-rouge px-1.5 text-xs leading-5 text-white"
    >
      {count}
    </span>
  );
}
