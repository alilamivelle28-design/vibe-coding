-- Lot 2 : les annonces.
-- À coller une seule fois dans Supabase › SQL Editor, après 001_comptes.sql.
-- Règle d'or n°2 : je ne peux modifier (ou supprimer) que mes propres annonces, vérifié par la base (RLS).

create table public.annonces (
  id uuid primary key default gen_random_uuid(),
  -- L'auteur est toujours la personne connectée : la valeur par défaut le remplit, la règle d'insertion le vérifie.
  auteur uuid not null default auth.uid() references public.profils_publics (id) on delete cascade,
  type text not null check (type in ('propose', 'cherche')),
  categorie text not null check (categorie in (
    'photo', 'video', 'graphisme', 'web', 'reseaux', 'redaction', 'evenementiel', 'marketing', 'ia', 'langues',
    'logement', 'covoiturage', 'materiel', 'coup_de_main', 'autre'
  )),
  titre text not null check (char_length(btrim(titre)) between 3 and 80),
  description text not null check (char_length(btrim(description)) between 10 and 1000),
  -- « Rémunéré » : le service peut comprendre une participation financière, réglée entre les deux personnes.
  remunere boolean not null default false,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index annonces_cree_le_idx on public.annonces (cree_le desc);
create index annonces_auteur_idx on public.annonces (auteur);

alter table public.annonces enable row level security;

-- Les visiteurs non connectés n'ont accès à rien.
revoke all on public.annonces from anon;
-- Les connectés ne peuvent écrire que ces colonnes : ni l'auteur, ni les dates, ni l'identifiant.
revoke all on public.annonces from authenticated;
grant select, delete on public.annonces to authenticated;
grant insert (type, categorie, titre, description, remunere) on public.annonces to authenticated;
grant update (type, categorie, titre, description, remunere) on public.annonces to authenticated;

-- Voulu : tous les étudiants connectés voient toutes les annonces (pas de coordonnées dedans).
create policy "Les connectés lisent les annonces"
  on public.annonces for select to authenticated
  using (true);

create policy "Je publie en mon nom"
  on public.annonces for insert to authenticated
  with check ((select auth.uid()) = auteur);

create policy "Je modifie mes annonces"
  on public.annonces for update to authenticated
  using ((select auth.uid()) = auteur)
  with check ((select auth.uid()) = auteur);

create policy "Je supprime mes annonces"
  on public.annonces for delete to authenticated
  using ((select auth.uid()) = auteur);

create function public.dater_modification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le := now();
  return new;
end;
$$;

create trigger dater_modification_annonce
  before update on public.annonces
  for each row execute function public.dater_modification();
