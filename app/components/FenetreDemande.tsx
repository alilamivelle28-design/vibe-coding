"use client";

import { useEffect, useRef, useState } from "react";
import { MESSAGE_MAX, messageErreurDemande, validateMessage } from "@/lib/demandes";
import { createClient } from "@/lib/supabase/client";
import type { Annonce } from "./CarteAnnonce";

// Pop-in « Demander le contact » : un court message, puis l'auteur de l'annonce accepte ou non.
// `fermer(true)` si la demande est partie, `fermer(false)` si on a annulé.
export default function FenetreDemande({
  annonce,
  fermer,
}: {
  annonce: Annonce | null;
  fermer: (envoyee: boolean) => void;
}) {
  const fenetre = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (annonce) fenetre.current?.showModal();
    else fenetre.current?.close();
  }, [annonce]);

  function annuler() {
    setMessage("");
    setErreur(null);
    fermer(false);
  }

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (!annonce) return;
    const probleme = validateMessage(message);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    setEnvoi(true);
    const { error } = await createClient().from("demandes").insert({ annonce: annonce.id, message: message.trim() });
    setEnvoi(false);
    if (error) {
      setErreur(messageErreurDemande(error));
      return;
    }
    setMessage("");
    setErreur(null);
    fermer(true);
  }

  const prenom = annonce?.profils_publics?.prenom ?? "l'auteur";

  return (
    <dialog
      ref={fenetre}
      aria-labelledby="titre-demande"
      onCancel={(e) => {
        e.preventDefault();
        annuler();
      }}
      onClick={(e) => e.target === e.currentTarget && annuler()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg bg-transparent p-0 backdrop:bg-noir/60"
    >
      <form onSubmit={envoyer} noValidate className="bg-papier p-6">
        <h2 id="titre-demande" className="font-titres text-3xl uppercase">
          Demander le contact
        </h2>
        <p className="mt-1 text-sm text-noir/70">
          Pour « {annonce?.titre} ». {prenom} lira ton message et choisira de partager ou non son téléphone et son
          e-mail. Les tiens ne seront visibles qu&apos;en cas d&apos;accord.
        </p>
        <label htmlFor="message-demande" className="mt-5 block font-titres text-base uppercase tracking-wide">
          Ton message
        </label>
        <textarea
          id="message-demande"
          value={message}
          maxLength={MESSAGE_MAX}
          rows={5}
          onChange={(e) => {
            setMessage(e.target.value);
            setErreur(null);
          }}
          placeholder={`Salut ${prenom}, ton annonce m'intéresse parce que…`}
          aria-describedby="erreur-demande"
          className="mt-1 w-full border border-noir bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rouge"
        />
        <p className="mt-1 text-right text-xs text-noir/60">
          {message.length} / {MESSAGE_MAX}
        </p>
        <p id="erreur-demande" role="alert" aria-live="polite" className="min-h-5 text-sm font-semibold text-rouge">
          {erreur}
        </p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={annuler}
            className="flex-1 border border-noir px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoi}
            className="flex-[2] bg-noir px-4 py-3 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge disabled:opacity-60"
          >
            {envoi ? "Envoi…" : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
