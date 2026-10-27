"use client";

import { useState } from "react";
import { isSchoolEmail, SCHOOL_EMAIL_DOMAIN } from "@/lib/email";

type Etat = "repos" | "erreur" | "ok";

export default function FormulaireConnexion() {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>("repos");

  function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setEtat(isSchoolEmail(email) ? "ok" : "erreur");
  }

  return (
    <form
      id="connexion"
      onSubmit={envoyer}
      noValidate
      className="w-full max-w-md border border-noir bg-white p-5 text-noir"
    >
      <label htmlFor="email" className="font-titres text-lg uppercase tracking-wide">
        Adresse e-mail de l&apos;école
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={`prenom.nom@${SCHOOL_EMAIL_DOMAIN}`}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEtat("repos");
        }}
        aria-invalid={etat === "erreur"}
        aria-describedby="aide-email"
        className="mt-2 w-full border border-noir bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rouge"
      />
      <p
        id="aide-email"
        role={etat === "repos" ? undefined : "alert"}
        className={`mt-2 text-sm ${etat === "erreur" ? "font-semibold text-rouge" : "text-noir/70"}`}
      >
        {etat === "erreur" &&
          `Utilise ton adresse interne de l'école, qui se termine par @${SCHOOL_EMAIL_DOMAIN}.`}
        {etat === "ok" &&
          "Adresse reconnue. La connexion sera activée à la prochaine étape du projet."}
        {etat === "repos" &&
          `Seules les adresses @${SCHOOL_EMAIL_DOMAIN} sont acceptées.`}
      </p>
      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white transition hover:bg-rouge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
      >
        Se connecter <span aria-hidden>→</span>
      </button>
    </form>
  );
}
