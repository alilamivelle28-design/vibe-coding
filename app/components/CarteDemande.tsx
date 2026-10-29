import type { Demande } from "@/lib/demandes";
import BoutonsReponse from "./BoutonsReponse";

const dateCourte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export default function CarteDemande({ demande, recue = false }: { demande: Demande; recue?: boolean }) {
  const acceptee = demande.statut === "acceptee";
  const etat = acceptee ? "Acceptée" : demande.statut === "refusee" ? "Refusée" : "En attente";

  return (
    <article className={`rounded-[28px] p-6 ${acceptee ? "bg-ciel/30" : "bg-gris"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="rounded-full border border-noir px-2.5 py-1">« {demande.titre} »</span>
        <span className={`rounded-full px-2.5 py-1 ${acceptee ? "bg-noir text-white" : "bg-white"}`}>{etat}</span>
      </div>
      <p className="mt-4 text-sm text-noir/60">
        {recue ? "De" : "À"} <span className="font-semibold text-noir">{demande.prenom}</span>, le{" "}
        {dateCourte.format(new Date(demande.cree_le))}
      </p>
      <p className="mt-2 whitespace-pre-line leading-relaxed">{demande.message}</p>
      {acceptee && (
        <dl className="mt-4 grid gap-2 border-t border-noir/20 pt-4 sm:grid-cols-2">
          <Coordonnee nom="Téléphone" valeur={demande.telephone} />
          <Coordonnee nom="E-mail" valeur={demande.email} />
        </dl>
      )}
      {recue && demande.statut === "en_attente" && <BoutonsReponse id={demande.id} prenom={demande.prenom} />}
    </article>
  );
}

function Coordonnee({ nom, valeur }: { nom: string; valeur: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-noir/60">{nom}</dt>
      <dd className="mt-0.5 break-all font-semibold">{valeur ?? "—"}</dd>
    </div>
  );
}
