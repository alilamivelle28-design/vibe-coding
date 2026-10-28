"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormulaireAnnonce from "./FormulaireAnnonce";

// Sur ordinateur, le formulaire s'ouvre en pop-in par-dessus la page.
// Sur téléphone (ou sans JavaScript), le lien ouvre la page plein écran /annonces/nouvelle.
export default function BoutonPublier() {
  const fenetre = useRef<HTMLDialogElement>(null);
  // Change à chaque ouverture pour repartir d'un formulaire vide.
  const [ouverture, setOuverture] = useState(0);
  const router = useRouter();

  function ouvrir(evenement: React.MouseEvent<HTMLAnchorElement>) {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    evenement.preventDefault();
    setOuverture((n) => n + 1);
    fenetre.current?.showModal();
  }

  function fermer() {
    fenetre.current?.close();
  }

  return (
    <>
      <Link
        href="/annonces/nouvelle"
        onClick={ouvrir}
        className="inline-flex items-center gap-2 bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
      >
        + Publier une annonce
      </Link>

      <dialog
        ref={fenetre}
        aria-labelledby="titre-pop-in"
        onClick={(e) => e.target === e.currentTarget && fermer()}
        className="m-auto w-full max-w-xl bg-transparent p-0 backdrop:bg-noir/60"
      >
        <div className="max-h-[90vh] overflow-y-auto bg-papier p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="titre-pop-in" className="font-titres text-3xl uppercase">
              Publier une annonce
            </h2>
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="size-10 shrink-0 border border-noir text-xl hover:bg-noir hover:text-white"
            >
              ✕
            </button>
          </div>
          {ouverture > 0 && (
            <FormulaireAnnonce
              key={ouverture}
              apresEnvoi={() => {
                fermer();
                router.refresh();
              }}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
