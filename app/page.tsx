import FormulaireConnexion from "./components/FormulaireConnexion";
import Telephones from "./components/Telephones";

const etapes = [
  {
    titre: "Crée ton compte",
    texte: "Avec ton adresse e-mail de l'école. Un seul compte : tu proposes et tu cherches, sans changer de rôle.",
  },
  {
    titre: "Publie une annonce",
    texte: "Dis ce que tu sais faire, ou ce dont tu as besoin. Elle reste en ligne jusqu'à ce que tu la retires.",
  },
  {
    titre: "Demande le contact",
    texte: "Tu trouves une annonce qui t'intéresse ? Un clic, et la personne reçoit ta demande.",
  },
  {
    titre: "Accepte, puis échangez",
    texte: "Tes coordonnées restent cachées tant que tu n'as pas dit oui. Après ton accord, chacun voit celles de l'autre.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <a href="#" className="font-titres text-2xl uppercase tracking-wide">
          Entraide<span className="text-rouge">.</span>
        </a>
        <nav className="flex items-center gap-5 text-sm font-semibold uppercase tracking-wide">
          <a href="#solutions" className="hidden hover:text-rouge sm:inline">Deux solutions</a>
          <a href="#fonctionnement" className="hidden hover:text-rouge sm:inline">Comment ça marche</a>
          <a href="#connexion" className="border border-noir px-4 py-2 hover:bg-noir hover:text-white">
            Connexion
          </a>
        </nav>
      </header>

      <main className="flex-1">
        {/* Connexion + aperçu de l'interface */}
        <section className="mx-auto w-full max-w-6xl px-3 sm:px-5">
          <div className="grid items-center gap-10 overflow-hidden rounded-[32px] bg-ciel px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-5">
              <h1 className="font-titres text-5xl uppercase leading-[0.95] text-white sm:text-7xl">
                L&apos;entraide
                <br />
                du campus
              </h1>
              <p className="-mt-1 -rotate-2 font-manuscrit text-4xl text-rouge sm:text-5xl">
                propose, demande, avance.
              </p>
              <p className="max-w-md text-lg leading-relaxed text-noir/80">
                Propose ce que tu sais faire, trouve ce dont tu as besoin. Une appli réservée aux étudiants de l&apos;école.
              </p>
              <FormulaireConnexion />
            </div>
            <Telephones />
          </div>
        </section>

        {/* Les deux solutions */}
        <section id="solutions" className="mx-auto w-full max-w-6xl px-5 pt-20">
          <h2 className="font-titres text-4xl uppercase leading-[1.1] sm:text-5xl">
            Deux façons
            <br />
            de s&apos;entraider
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="relative overflow-hidden rounded-[28px] bg-gris p-7 sm:p-9">
              <p className="font-manuscrit text-2xl text-rouge">Je cherche</p>
              <h3 className="mt-1 font-titres text-3xl uppercase">Demander de l&apos;aide</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-noir/70">
                Une coloc, un covoiturage, quelqu&apos;un pour monter ta vidéo : poste ta demande et laisse les autres étudiants te répondre.
              </p>
              <a href="#connexion" className="mt-6 inline-block text-sm font-bold uppercase tracking-wide hover:text-rouge">
                Se connecter pour publier →
              </a>
              <div aria-hidden className="absolute hidden md:block -bottom-10 -right-6 h-40 w-40 rounded-full bg-rouge/90" />
              <div aria-hidden className="absolute hidden md:block -bottom-6 right-24 h-24 w-24 rotate-12 rounded-3xl bg-noir" />
            </article>
            <article className="relative overflow-hidden rounded-[28px] bg-gris p-7 sm:p-9">
              <p className="font-manuscrit text-2xl text-rouge">Je propose</p>
              <h3 className="mt-1 font-titres text-3xl uppercase">Proposer un service</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-noir/70">
                Photo, vidéo, développement, community management : montre ce que tu sais faire et rends service autour de toi.
              </p>
              <a href="#connexion" className="mt-6 inline-block text-sm font-bold uppercase tracking-wide hover:text-rouge">
                Se connecter pour publier →
              </a>
              <div aria-hidden className="absolute hidden md:block -bottom-12 -right-4 h-44 w-44 rounded-[40%] bg-ciel" />
              <div aria-hidden className="absolute hidden md:block bottom-6 right-28 h-16 w-16 rounded-full border-[6px] border-noir" />
            </article>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="fonctionnement" className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="font-titres text-4xl uppercase leading-[1.1] sm:text-5xl">
                Comment
                <br />
                ça marche
              </h2>
              <p className="mt-4 max-w-xs leading-relaxed text-noir/70">
                De ton compte à la mise en relation, en quatre étapes.
              </p>
            </div>
            <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {etapes.map((etape, i) => (
                <li key={etape.titre} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rouge font-titres text-lg text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{etape.titre}</h3>
                    <p className="mt-1 leading-relaxed text-noir/70">{etape.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-noir/10 py-8 text-center text-sm text-noir/60">
        L&apos;entraide du campus · projet étudiant
      </footer>
    </>
  );
}
