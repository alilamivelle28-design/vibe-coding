import Link from "next/link";

export default function LienInvalide() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-5 py-16">
      <h1 className="font-titres text-4xl uppercase">Lien expiré ou invalide</h1>
      <p className="leading-relaxed text-noir/70">
        Ce lien a déjà servi ou il a expiré. Reconnecte-toi, ou demande un nouveau lien avec « Mot de passe oublié ? ».
      </p>
      <Link href="/#connexion" className="bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge">
        Retour à la connexion →
      </Link>
    </main>
  );
}
