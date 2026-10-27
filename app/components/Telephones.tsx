// Aperçu de l'interface (maquette dessinée, pas encore connectée aux vraies données).
export default function Telephones() {
  return (
    <div
      className="relative mx-auto h-[560px] w-full max-w-[460px] sm:h-[520px]"
      role="img"
      aria-label="Aperçu de l'appli : la liste des annonces et une demande de contact reçue"
    >
      {/* Téléphone 1 : les annonces */}
      <div className="absolute left-0 top-4 w-[220px] -rotate-3 rounded-[28px] bg-white p-4 shadow-2xl sm:w-[250px]">
        <p className="font-titres text-2xl uppercase">Annonces</p>
        <div className="mt-3 flex gap-1.5 text-xs font-semibold whitespace-nowrap">
          <span className="rounded-full bg-noir px-3 py-1 text-white">Tout</span>
          <span className="rounded-full bg-gris px-3 py-1">Je propose</span>
          <span className="rounded-full bg-gris px-3 py-1">Je cherche</span>
        </div>
        <div className="mt-4 rounded-2xl bg-gris p-3">
          <span className="rounded-full bg-ciel/40 px-2 py-0.5 text-[11px] font-semibold">Je propose · Photo</span>
          <p className="mt-2 text-sm font-semibold leading-tight">Photos pour vos événements</p>
          <p className="mt-1 text-xs text-noir/60">Sam</p>
          <p className="mt-3 inline-block bg-noir px-3 py-1.5 text-[11px] font-bold uppercase text-white">
            Demander le contact
          </p>
        </div>
        <div className="mt-3 rounded-2xl bg-gris p-3">
          <span className="rounded-full bg-rouge/15 px-2 py-0.5 text-[11px] font-semibold text-rouge">Je cherche · Covoiturage</span>
          <p className="mt-2 text-sm font-semibold leading-tight">Trajet vers le campus</p>
          <p className="mt-1 text-xs text-noir/60">Léa</p>
        </div>
      </div>

      {/* Téléphone 2 : une demande reçue */}
      <div className="absolute right-0 top-[300px] w-[210px] sm:top-32 rotate-3 rounded-[28px] bg-noir p-4 text-white shadow-2xl sm:w-[235px]">
        <p className="font-titres text-2xl uppercase">Demande reçue</p>
        <p className="mt-3 text-sm leading-snug text-white/80">
          Léa veut te contacter pour ton annonce « Photos pour vos événements ».
        </p>
        <div className="mt-4 flex gap-2">
          <span className="flex-1 bg-white py-2 text-center text-[11px] font-bold uppercase text-noir">Accepter</span>
          <span className="flex-1 border border-white/60 py-2 text-center text-[11px] font-bold uppercase">Refuser</span>
        </div>
        <div className="mt-5 rounded-2xl bg-white/10 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Coordonnées</p>
          <p className="mt-1 text-sm">🔒 Visibles après ton accord</p>
        </div>
      </div>
    </div>
  );
}
