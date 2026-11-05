-- Lot 3 : la demande de contact.
-- À coller une seule fois dans Supabase › SQL Editor, après 002_annonces.sql.
-- Règle d'or n°1 : mes coordonnées (téléphone, e-mail) ne sont visibles qu'après mon accord.
-- Les règles déjà validées sur profils_prives ne changent pas : les coordonnées passent seulement
-- par les deux fonctions en bas de ce fichier, qui ne les rendent que pour une demande acceptée.
-- Le nom et l'adresse ne sont jamais partagés.

create table public.demandes (
  id uuid primary key default gen_random_uuid(),
  annonce uuid not null references public.annonces (id) on delete cascade,
  -- La personne qui demande : toujours la personne connectée.
  demandeur uuid not null default auth.uid() references public.profils_publics (id) on delete cascade,
  -- L'auteur de l'annonce : rempli par la base, jamais par le site.
  destinataire uuid not null references public.profils_publics (id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 10 and 500),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'acceptee', 'refusee')),
  cree_le timestamptz not null default now(),
  repondu_le timestamptz,
  -- Une seule demande par annonce et par personne.
  unique (annonce, demandeur)
);

create index demandes_destinataire_idx on public.demandes (destinataire, statut);
create index demandes_demandeur_idx on public.demandes (demandeur);

alter table public.demandes enable row level security;

revoke all on public.demandes from anon;
revoke all on public.demandes from authenticated;
-- Le demandeur n'écrit que l'annonce et le message ; le destinataire ne change que le statut.
grant insert (annonce, message) on public.demandes to authenticated;
grant update (statut) on public.demandes to authenticated;
grant select on public.demandes to authenticated;

create policy "Je demande en mon nom"
  on public.demandes for insert to authenticated
  with check ((select auth.uid()) = demandeur);

-- Lecture directe : seulement les demandes reçues. Le demandeur suit les siennes par
-- mes_demandes_envoyees(), qui ne lui dit jamais qu'une demande a été refusée.
create policy "Je lis les demandes que je reçois"
  on public.demandes for select to authenticated
  using ((select auth.uid()) = destinataire);

-- Je réponds une seule fois, aux demandes que je reçois.
create policy "Je réponds aux demandes que je reçois"
  on public.demandes for update to authenticated
  using ((select auth.uid()) = destinataire and statut = 'en_attente')
  with check ((select auth.uid()) = destinataire and statut in ('acceptee', 'refusee'));

-- Avant chaque nouvelle demande : retrouver l'auteur de l'annonce, refuser de se demander soi-même.
create function public.preparer_demande()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select a.auteur into new.destinataire from public.annonces a where a.id = new.annonce;
  if new.destinataire is null then
    raise exception 'Annonce introuvable';
  end if;
  if new.destinataire = new.demandeur then
    raise exception 'Impossible de demander le contact sur sa propre annonce';
  end if;
  new.statut := 'en_attente';
  new.repondu_le := null;
  return new;
end;
$$;

create trigger preparer_demande
  before insert on public.demandes
  for each row execute function public.preparer_demande();

create function public.dater_reponse()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.repondu_le := now();
  return new;
end;
$$;

create trigger dater_reponse
  before update of statut on public.demandes
  for each row execute function public.dater_reponse();

-- Demandes que j'ai envoyées. Une demande refusée reste affichée « en attente » : pas de notification de refus.
-- Téléphone et e-mail de l'auteur seulement si la demande est acceptée.
create function public.mes_demandes_envoyees()
returns table (
  id uuid, annonce uuid, titre text, prenom text, message text, statut text, cree_le timestamptz,
  telephone text, email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.annonce, a.titre, pp.prenom, d.message,
    case when d.statut = 'acceptee' then 'acceptee' else 'en_attente' end,
    d.cree_le,
    case when d.statut = 'acceptee' then pv.telephone end,
    case when d.statut = 'acceptee' then pv.email end
  from public.demandes d
  join public.annonces a on a.id = d.annonce
  join public.profils_publics pp on pp.id = d.destinataire
  join public.profils_prives pv on pv.id = d.destinataire
  where d.demandeur = (select auth.uid())
  order by d.cree_le desc;
$$;

-- Demandes que j'ai reçues. Téléphone et e-mail du demandeur seulement si j'ai accepté.
create function public.mes_demandes_recues()
returns table (
  id uuid, annonce uuid, titre text, prenom text, message text, statut text, cree_le timestamptz,
  telephone text, email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.annonce, a.titre, pp.prenom, d.message, d.statut, d.cree_le,
    case when d.statut = 'acceptee' then pv.telephone end,
    case when d.statut = 'acceptee' then pv.email end
  from public.demandes d
  join public.annonces a on a.id = d.annonce
  join public.profils_publics pp on pp.id = d.demandeur
  join public.profils_prives pv on pv.id = d.demandeur
  where d.destinataire = (select auth.uid())
  order by (d.statut = 'en_attente') desc, d.cree_le desc;
$$;

revoke all on function public.mes_demandes_envoyees() from public, anon;
revoke all on function public.mes_demandes_recues() from public, anon;
grant execute on function public.mes_demandes_envoyees() to authenticated;
grant execute on function public.mes_demandes_recues() to authenticated;
revoke all on function public.preparer_demande() from public, anon, authenticated;
