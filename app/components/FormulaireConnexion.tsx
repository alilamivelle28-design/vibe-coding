"use client";

import { useState } from "react";
import { isSchoolEmail, SCHOOL_EMAIL_DOMAIN } from "@/lib/email";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";

type Mode = "connexion" | "inscription" | "oubli";
type Retour = { type: "erreur" | "ok"; texte: string } | null;

const TITRES: Record<Mode, string> = {
  connexion: "Connexion",
  inscription: "Créer un compte",
  oubli: "Mot de passe oublié",
};

const BOUTONS: Record<Mode, string> = {
  connexion: "Se connecter",
  inscription: "Créer mon compte",
  oubli: "Recevoir le lien",
};

const champ =
  "mt-1 w-full border border-noir bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-rouge";
const etiquette = "mt-4 block font-titres text-base uppercase tracking-wide";
const lien =
  "text-sm font-semibold underline underline-offset-4 hover:text-rouge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge";

export default function FormulaireConnexion() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [retour, setRetour] = useState<Retour>(null);

  function changerMode(nouveau: Mode) {
    setMode(nouveau);
    setRetour(null);
    setMotDePasse("");
    setConfirmation("");
  }

  function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    if (!isSchoolEmail(email)) {
      setRetour({
        type: "erreur",
        texte: `Utilise ton adresse interne de l'école, qui se termine par @${SCHOOL_EMAIL_DOMAIN}.`,
      });
      return;
    }

    if (mode === "connexion" && motDePasse === "") {
      setRetour({ type: "erreur", texte: "Entre ton mot de passe." });
      return;
    }

    if (mode === "inscription") {
      const erreur = validateNewPassword(motDePasse, confirmation);
      if (erreur) {
        setRetour({ type: "erreur", texte: erreur });
        return;
      }
    }

    // Les comptes ne sont pas encore branchés : on confirme seulement que le formulaire est valide.
    setRetour({
      type: "ok",
      texte:
        mode === "oubli"
          ? "Si un compte existe pour cette adresse, un lien de réinitialisation sera envoyé. L'envoi sera activé à la prochaine étape du projet."
          : "Formulaire valide. La connexion et l'inscription seront activées à la prochaine étape du projet.",
    });
  }

  return (
    <form
      id="connexion"
      onSubmit={envoyer}
      noValidate
      className="w-full max-w-md border border-noir bg-white p-5 text-noir"
    >
      <h2 className="font-titres text-2xl uppercase tracking-wide">{TITRES[mode]}</h2>
      {mode === "oubli" && (
        <p className="mt-1 text-sm text-noir/70">
          Entre ton adresse de l&apos;école : tu recevras un lien pour choisir un nouveau mot de passe.
        </p>
      )}

      <label htmlFor="email" className={etiquette}>
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
          setRetour(null);
        }}
        aria-describedby="retour-formulaire"
        className={champ}
      />

      {mode !== "oubli" && (
        <>
          <label htmlFor="mot-de-passe" className={etiquette}>
            Mot de passe
          </label>
          <input
            id="mot-de-passe"
            name="mot-de-passe"
            type="password"
            autoComplete={mode === "inscription" ? "new-password" : "current-password"}
            value={motDePasse}
            onChange={(e) => {
              setMotDePasse(e.target.value);
              setRetour(null);
            }}
            aria-describedby="retour-formulaire"
            className={champ}
          />
        </>
      )}

      {mode === "inscription" && (
        <>
          <label htmlFor="confirmation" className={etiquette}>
            Confirme ton mot de passe
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value);
              setRetour(null);
            }}
            aria-describedby="retour-formulaire"
            className={champ}
          />
        </>
      )}

      <p
        id="retour-formulaire"
        role={retour ? "alert" : undefined}
        className={`mt-2 text-sm ${retour?.type === "erreur" ? "font-semibold text-rouge" : "text-noir/70"}`}
      >
        {retour
          ? retour.texte
          : mode === "inscription"
            ? `Seules les adresses @${SCHOOL_EMAIL_DOMAIN} sont acceptées. Mot de passe : ${PASSWORD_MIN_LENGTH} caractères minimum.`
            : `Seules les adresses @${SCHOOL_EMAIL_DOMAIN} sont acceptées.`}
      </p>

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white transition hover:bg-rouge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
      >
        {BOUTONS[mode]} <span aria-hidden>→</span>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {mode === "connexion" && (
          <>
            <button type="button" onClick={() => changerMode("oubli")} className={lien}>
              Mot de passe oublié ?
            </button>
            <button
              type="button"
              onClick={() => changerMode("inscription")}
              className="border border-noir px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-noir hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
            >
              Créer un compte
            </button>
          </>
        )}
        {mode !== "connexion" && (
          <button type="button" onClick={() => changerMode("connexion")} className={lien}>
            ← Retour à la connexion
          </button>
        )}
      </div>
    </form>
  );
}
