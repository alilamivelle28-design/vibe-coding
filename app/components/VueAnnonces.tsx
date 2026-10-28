"use client";

import { useEffect, useRef, useState } from "react";
import { CLE_ECARTEES, decisionSwipe, lireEcartees, type Decision } from "@/lib/swipe";
import CarteAnnonce, { type Annonce } from "./CarteAnnonce";

type Mode = "liste" | "swipe";

function lireMemoire(): string[] {
  try {
    return lireEcartees(window.localStorage.getItem(CLE_ECARTEES));
  } catch {
    return [];
  }
}

function ecrireMemoire(ids: string[]) {
  try {
    window.localStorage.setItem(CLE_ECARTEES, JSON.stringify(ids));
  } catch {
    // Navigation privée ou mémoire pleine : le choix ne vaut que pour cette visite.
  }
}

// Liste des annonces, et sur téléphone un mode « Swipe » : à droite je réponds, à gauche pas intéressée.
export default function VueAnnonces({ annonces, moi }: { annonces: Annonce[]; moi: string }) {
  const [mode, setMode] = useState<Mode>("liste");
  // Écartées : mémorisées sur ce téléphone. Vues : passées à droite pendant cette visite.
  const [ecartees, setEcartees] = useState<string[]>([]);
  const [vues, setVues] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // La mémoire du téléphone n'existe pas côté serveur : on la lit une fois la page affichée.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEcartees(lireMemoire());
  }, []);

  const pile = annonces.filter((a) => a.auteur !== moi && !ecartees.includes(a.id) && !vues.includes(a.id));

  function decider(annonce: Annonce, decision: Decision) {
    if (decision === "pas-interessee") {
      const nouvelles = [...ecartees, annonce.id];
      setEcartees(nouvelles);
      ecrireMemoire(nouvelles);
      setMessage(null);
    } else {
      setVues((actuelles) => [...actuelles, annonce.id]);
      const prenom = annonce.profils_publics?.prenom ?? "l'auteur";
      setMessage(`Noté ! Demander le contact à ${prenom} sera possible ici très bientôt.`);
    }
  }

  function toutRevoir() {
    setEcartees([]);
    setVues([]);
    ecrireMemoire([]);
    setMessage(null);
  }

  return (
    <>
      <div role="group" aria-label="Affichage" className="mt-6 grid grid-cols-2 border border-noir md:hidden">
        {(["liste", "swipe"] as const).map((choix) => (
          <button
            key={choix}
            type="button"
            aria-pressed={mode === choix}
            onClick={() => setMode(choix)}
            className={`py-2.5 font-titres text-lg uppercase tracking-wide ${
              mode === choix ? "bg-noir text-white" : "bg-white"
            }`}
          >
            {choix === "liste" ? "Liste" : "Swipe"}
          </button>
        ))}
      </div>

      {mode === "swipe" && (
        <div className="-mx-5 mt-6 overflow-x-hidden px-5 pb-2 md:hidden">
          {pile.length > 0 ? (
            <PileSwipe annonce={pile[0]} suivante={pile[1]} reste={pile.length} decider={decider} />
          ) : (
            <div className="rounded-[28px] border border-dashed border-noir/40 p-8 text-center">
              <p className="font-manuscrit text-3xl text-rouge">tu as tout vu !</p>
              <p className="mt-2 text-noir/70">Reviens plus tard pour les nouvelles annonces.</p>
              {(ecartees.length > 0 || vues.length > 0) && (
                <button
                  type="button"
                  onClick={toutRevoir}
                  className="mt-4 border border-noir px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white"
                >
                  Revoir toutes les annonces
                </button>
              )}
            </div>
          )}
          <p role="status" aria-live="polite" className="mt-4 min-h-6 text-center text-sm font-semibold">
            {message}
          </p>
        </div>
      )}

      <div className={`mt-8 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${mode === "swipe" ? "hidden md:grid" : "grid"}`}>
        {annonces.map((annonce) => (
          <CarteAnnonce key={annonce.id} annonce={annonce} />
        ))}
      </div>
    </>
  );
}

function PileSwipe({
  annonce,
  suivante,
  reste,
  decider,
}: {
  annonce: Annonce;
  suivante?: Annonce;
  reste: number;
  decider: (annonce: Annonce, decision: Decision) => void;
}) {
  const [deplacement, setDeplacement] = useState(0);
  const [glisse, setGlisse] = useState(false);
  const [sortie, setSortie] = useState<Decision | null>(null);
  const depart = useRef<number | null>(null);

  function lancer(decision: Decision) {
    setSortie(decision);
    // Laisse la carte s'envoler avant de passer à la suivante.
    window.setTimeout(() => {
      decider(annonce, decision);
      setSortie(null);
      setDeplacement(0);
    }, 250);
  }

  function poser(e: React.PointerEvent<HTMLDivElement>) {
    if (sortie) return;
    depart.current = e.clientX;
    setGlisse(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function bouger(e: React.PointerEvent<HTMLDivElement>) {
    if (depart.current === null) return;
    setDeplacement(e.clientX - depart.current);
  }

  function lacher() {
    if (depart.current === null) return;
    depart.current = null;
    setGlisse(false);
    const decision = decisionSwipe(deplacement);
    if (decision) lancer(decision);
    else setDeplacement(0);
  }

  const x = sortie === "interessee" ? 600 : sortie === "pas-interessee" ? -600 : deplacement;
  const intensite = Math.min(Math.abs(x) / 100, 1);

  return (
    <>
      <p className="mb-3 text-center text-sm text-noir/60">
        {reste} annonce{reste > 1 ? "s" : ""} à découvrir · glisse à droite pour répondre, à gauche pour passer
      </p>
      <div className="relative">
        {suivante && (
          <div aria-hidden className="pointer-events-none absolute inset-0 scale-95 opacity-60">
            <CarteAnnonce annonce={suivante} />
          </div>
        )}
        <div
          data-testid="carte-swipe"
          onPointerDown={poser}
          onPointerMove={bouger}
          onPointerUp={lacher}
          onPointerCancel={lacher}
          style={{
            transform: `translateX(${x}px) rotate(${x / 20}deg)`,
            transition: glisse ? "none" : "transform 250ms ease-out",
            touchAction: "pan-y",
          }}
          className="relative cursor-grab select-none active:cursor-grabbing"
        >
          <CarteAnnonce annonce={annonce} />
          <span
            aria-hidden
            style={{ opacity: x > 0 ? intensite : 0 }}
            className="absolute left-5 top-5 -rotate-12 border-4 border-noir bg-white px-3 py-1 font-titres text-2xl uppercase"
          >
            Je réponds ✓
          </span>
          <span
            aria-hidden
            style={{ opacity: x < 0 ? intensite : 0 }}
            className="absolute right-5 top-5 rotate-12 border-4 border-rouge bg-white px-3 py-1 font-titres text-2xl uppercase text-rouge"
          >
            Pas pour moi ✕
          </span>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-6">
        <button
          type="button"
          onClick={() => lancer("pas-interessee")}
          aria-label="Pas intéressée"
          className="size-16 rounded-full border-2 border-rouge bg-white text-2xl text-rouge hover:bg-rouge hover:text-white"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => lancer("interessee")}
          aria-label="Je réponds à l'annonce"
          className="size-16 rounded-full border-2 border-noir bg-noir text-2xl text-white hover:bg-rouge hover:border-rouge"
        >
          ✓
        </button>
      </div>
    </>
  );
}
