"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StatutDemande } from "@/lib/demandes";
import { createClient } from "@/lib/supabase/client";

// Accepter ou refuser une demande reçue. La base n'accepte qu'une seule réponse.
export default function BoutonsReponse({ id, prenom }: { id: string; prenom: string }) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(false);
  const router = useRouter();

  async function repondre(statut: Exclude<StatutDemande, "en_attente">) {
    if (
      statut === "acceptee" &&
      !window.confirm(`Accepter ? ${prenom} verra ton téléphone et ton e-mail, et tu verras les siens.`)
    ) {
      return;
    }
    setEnvoi(true);
    const { error } = await createClient().from("demandes").update({ statut }).eq("id", id);
    setEnvoi(false);
    setErreur(Boolean(error));
    if (!error) router.refresh();
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => repondre("acceptee")}
        disabled={envoi}
        className="flex-1 bg-noir px-4 py-2.5 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge disabled:opacity-60"
      >
        Accepter
      </button>
      <button
        type="button"
        onClick={() => repondre("refusee")}
        disabled={envoi}
        className="flex-1 border border-noir px-4 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white disabled:opacity-60"
      >
        Refuser
      </button>
      {erreur && (
        <p role="alert" className="w-full text-sm font-semibold text-rouge">
          La réponse n&apos;est pas partie, réessaie.
        </p>
      )}
    </div>
  );
}
