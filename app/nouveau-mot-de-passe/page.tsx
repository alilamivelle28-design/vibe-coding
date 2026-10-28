"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messageErreurAuth } from "@/lib/messages-auth";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";

const champ =
  "mt-1 w-full border border-noir bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rouge";

export default function NouveauMotDePasse() {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const probleme = validateNewPassword(motDePasse, confirmation);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    setEnvoi(true);
    const { error } = await createClient().auth.updateUser({ password: motDePasse });
    setEnvoi(false);
    if (error) {
      setErreur(messageErreurAuth(error));
      return;
    }
    router.push("/espace");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <form onSubmit={envoyer} noValidate className="border border-noir bg-white p-5">
        <h1 className="font-titres text-2xl uppercase tracking-wide">Nouveau mot de passe</h1>
        <label htmlFor="mot-de-passe" className="mt-4 block font-titres uppercase tracking-wide">
          Mot de passe
        </label>
        <input id="mot-de-passe" type="password" autoComplete="new-password" value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)} className={champ} />
        <label htmlFor="confirmation" className="mt-4 block font-titres uppercase tracking-wide">
          Confirme ton mot de passe
        </label>
        <input id="confirmation" type="password" autoComplete="new-password" value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)} className={champ} />
        <p role={erreur ? "alert" : undefined}
          className={`mt-2 text-sm ${erreur ? "font-semibold text-rouge" : "text-noir/70"}`}>
          {erreur ?? `${PASSWORD_MIN_LENGTH} caractères minimum.`}
        </p>
        <button type="submit" disabled={envoi}
          className="mt-4 w-full bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white hover:bg-rouge disabled:opacity-60">
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
