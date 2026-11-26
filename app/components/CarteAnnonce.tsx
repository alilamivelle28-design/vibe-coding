import { CATEGORIES, TYPES_ANNONCE, type TypeAnnonce } from "@/lib/annonces";

export type Annonce = {
  id: string;
  auteur: string;
  type: TypeAnnonce;
  categorie: string;
  titre: string;
  description: string;
  remunere: boolean;
  cree_le: string;
  profils_publics: { prenom: string; competences?: { libelle: string }[] } | null;
};

export const COLONNES_ANNONCE = "id, auteur, type, categorie, titre, description, remunere, cree_le, profils_publics(prenom, competences(libelle))";

// Sur la carte, on montre quelques compétences de l'auteur (publiques, comme le prénom).
const COMPETENCES_SUR_CARTE = 4;

const dateCourte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export default function CarteAnnonce({ annonce, children }: { annonce: Annonce; children?: React.ReactNode }) {
  const propose = annonce.type === "propose";
  const competences = (annonce.profils_publics?.competences ?? []).map((c) => c.libelle);

  return (
    <article className="flex flex-col rounded-[28px] bg-gris p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`rounded-full px-2.5 py-1 text-white ${propose ? "bg-noir" : "bg-rouge"}`}>
          {TYPES_ANNONCE[annonce.type]}
        </span>
        <span className="rounded-full border border-noir px-2.5 py-1">{CATEGORIES[annonce.categorie]}</span>
        {annonce.remunere && <span className="rounded-full bg-ciel px-2.5 py-1">Rémunéré</span>}
      </div>
      <h2 className="mt-4 font-titres text-2xl uppercase leading-tight">{annonce.titre}</h2>
      <p className="mt-2 flex-1 whitespace-pre-line leading-relaxed text-noir/80">{annonce.description}</p>
      <p className="mt-4 text-sm text-noir/60">
        Par <span className="font-semibold text-noir">{annonce.profils_publics?.prenom ?? "un étudiant"}</span>, le{" "}
        {dateCourte.format(new Date(annonce.cree_le))}
      </p>
      {competences.length > 0 && (
        <p className="mt-1 text-xs text-noir/70">
          <span className="font-semibold">Ses compétences :</span>{" "}
          {competences.slice(0, COMPETENCES_SUR_CARTE).join(" · ")}
          {competences.length > COMPETENCES_SUR_CARTE && ` · +${competences.length - COMPETENCES_SUR_CARTE}`}
        </p>
      )}
      {children}
    </article>
  );
}
