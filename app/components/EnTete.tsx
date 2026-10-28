import Link from "next/link";

const liens = [
  { href: "/annonces", texte: "Annonces" },
  { href: "/annonces/nouvelle", texte: "Publier" },
  { href: "/espace", texte: "Mon espace" },
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
      </nav>
    </header>
  );
}
