"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BoutonSupprimer({ id, titre }: { id: string; titre: string }) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(false);
  const router = useRouter();

  async function supprimer() {
    if (!window.confirm(`Supprimer l'annonce « ${titre} » ? Ce n'est pas réversible.`)) return;
    setEnvoi(true);
    const { error } = await createClient().from("annonces").delete().eq("id", id);
    setEnvoi(false);
    setErreur(Boolean(error));
    if (!error) router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={supprimer}
        disabled={envoi}
        className="border border-rouge px-4 py-2 text-sm font-bold uppercase tracking-wide text-rouge hover:bg-rouge hover:text-white disabled:opacity-60"
      >
        {envoi ? "Suppression…" : "Supprimer"}
      </button>
      {erreur && <p role="alert" className="w-full text-sm font-semibold text-rouge">La suppression n&apos;a pas marché, réessaie.</p>}
    </>
  );
}
