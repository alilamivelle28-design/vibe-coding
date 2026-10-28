"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSchoolEmail, SCHOOL_EMAIL_DOMAIN } from "@/lib/email";
import { type InfosInscription, validateInscription } from "@/lib/inscription";
import { messageErreurAuth } from "@/lib/messages-auth";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/client";

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
const infosVides: InfosInscription = { prenom: "", nom: "", telephone: "", adresse: "" };

function Badge({ publique }: { publique: boolean }) {
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 align-middle font-sans text-[11px] font-semibold normal-case tracking-normal ${
        publique ? "bg-ciel/30 text-noir" : "bg-noir text-white"
      }`}
    >
      {publique ? "Visible par les autres" : "🔒 Confidentiel"}
    </span>
  );
}

const lien =
  "text-sm font-semibold underline underline-offset-4 hover:text-rouge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge";

export default function FormulaireConnexion() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [infos, setInfos] = useState<InfosInscription>(infosVides);
  const [retour, setRetour] = useState<Retour>(null);
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  function changerInfo(cle: keyof InfosInscription, valeur: string) {
    setInfos((avant) => ({ ...avant, [cle]: valeur }));
    setRetour(null);
  }

  function changerMode(nouveau: Mode) {
    setMode(nouveau);
    setRetour(null);
    setMotDePasse("");
    setConfirmation("");
  }

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
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
      const erreur = validateInscription(infos) ?? validateNewPassword(motDePasse, confirmation);
      if (erreur) {
        setRetour({ type: "erreur", texte: erreur });
        return;
      }
    }

    const supabase = createClient();
    const adresse = email.trim().toLowerCase();
    const origine = window.location.origin;
    setEnvoi(true);

    if (mode === "connexion") {
      const { error } = await supabase.auth.signInWithPassword({ email: adresse, password: motDePasse });
      setEnvoi(false);
      if (error) {
        setRetour({ type: "erreur", texte: messageErreurAuth(error) });
        return;
      }
      router.push("/espace");
      return;
    }

    if (mode === "inscription") {
      const { error } = await supabase.auth.signUp({
        email: adresse,
        password: motDePasse,
        options: {
          emailRedirectTo: `${origine}/auth/confirm`,
          data: {
            prenom: infos.prenom.trim(),
            nom: infos.nom.trim(),
            telephone: infos.telephone.trim(),
            adresse: infos.adresse.trim(),
          },
        },
      });
      setEnvoi(false);
      if (error) {
        setRetour({ type: "erreur", texte: messageErreurAuth(error) });
        return;
      }
      setRetour({
        type: "ok",
        texte: `Presque fini : clique sur le lien envoyé à ${adresse} pour confirmer ton compte. Pense à regarder dans les spams.`,
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(adresse, {
      redirectTo: `${origine}/auth/recuperation`,
    });
    setEnvoi(false);
    if (error) {
      setRetour({ type: "erreur", texte: messageErreurAuth(error) });
      return;
    }
    // Même message qu'il existe un compte ou non, pour ne pas révéler qui est inscrit.
    setRetour({
      type: "ok",
      texte: "Si un compte existe pour cette adresse, un lien pour choisir un nouveau mot de passe vient d'être envoyé.",
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

      {mode === "inscription" && (
        <>
          <p className="mt-2 text-sm text-noir/70">
            Seul ton prénom est visible par les autres étudiants. Ton nom, ton téléphone, ton adresse et ton e-mail restent confidentiels.
          </p>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <div>
              <label htmlFor="prenom" className={etiquette}>
                Prénom <Badge publique />
              </label>
              <input id="prenom" name="prenom" autoComplete="given-name" value={infos.prenom}
                onChange={(e) => changerInfo("prenom", e.target.value)}
                aria-describedby="retour-formulaire" className={champ} />
            </div>
            <div>
              <label htmlFor="nom" className={etiquette}>
                Nom <Badge publique={false} />
              </label>
              <input id="nom" name="nom" autoComplete="family-name" value={infos.nom}
                onChange={(e) => changerInfo("nom", e.target.value)}
                aria-describedby="retour-formulaire" className={champ} />
            </div>
          </div>
        </>
      )}

      <label htmlFor="email" className={etiquette}>
        Adresse e-mail de l&apos;école
        {mode === "inscription" && <Badge publique={false} />}
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

      {mode === "inscription" && (
        <>
          <label htmlFor="telephone" className={etiquette}>
            Téléphone <Badge publique={false} />
          </label>
          <input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel"
            placeholder="06 12 34 56 78" value={infos.telephone}
            onChange={(e) => changerInfo("telephone", e.target.value)}
            aria-describedby="retour-formulaire" className={champ} />
          <label htmlFor="adresse" className={etiquette}>
            Adresse <Badge publique={false} />
          </label>
          <input id="adresse" name="adresse" autoComplete="street-address"
            placeholder="Numéro, rue, code postal, ville" value={infos.adresse}
            onChange={(e) => changerInfo("adresse", e.target.value)}
            aria-describedby="retour-formulaire" className={champ} />
        </>
      )}

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
        disabled={envoi}
        className="mt-4 flex w-full items-center justify-center gap-2 bg-noir px-5 py-3 font-titres text-lg uppercase tracking-wide text-white transition hover:bg-rouge disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rouge"
      >
        {envoi ? "Envoi…" : BOUTONS[mode]} {!envoi && <span aria-hidden>→</span>}
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
