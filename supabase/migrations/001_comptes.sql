-- Étape 1 : les comptes.
-- À coller une seule fois dans Supabase › SQL Editor, puis cliquer sur Run.

-- 1. Profil public : seulement le prénom, lisible par les étudiants connectés.
create table public.profils_publics (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (char_length(trim(prenom)) between 1 and 50),
  cree_le timestamptz not null default now()
);

-- 2. Profil confidentiel : lisible seulement par la personne elle-même.
--    (À l'étape 3, l'autre personne pourra le lire après accord.)
create table public.profils_prives (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null check (char_length(trim(nom)) between 1 and 80),
  email text not null,
  telephone text not null check (
    regexp_replace(telephone, '[[:space:].-]', '', 'g') ~ '^(0[1-9][0-9]{8}|\+33[1-9][0-9]{8})$'
  ),
  adresse text not null check (char_length(trim(adresse)) between 1 and 200)
);

alter table public.profils_publics enable row level security;
alter table public.profils_prives enable row level security;

-- Les visiteurs non connectés ne lisent rien.
revoke all on public.profils_publics from anon;
revoke all on public.profils_prives from anon;

-- Les connectés ne peuvent modifier que ces colonnes (jamais l'id ni l'e-mail).
revoke insert, update, delete on public.profils_publics from authenticated;
revoke insert, update, delete on public.profils_prives from authenticated;
grant select on public.profils_publics, public.profils_prives to authenticated;
grant update (prenom) on public.profils_publics to authenticated;
grant update (nom, telephone, adresse) on public.profils_prives to authenticated;

-- Voulu : le prénom est la seule information publique, tout étudiant connecté peut la lire.
create policy "Les connectés lisent les prénoms"
  on public.profils_publics for select to authenticated
  using (true);

create policy "Je modifie seulement mon prénom"
  on public.profils_publics for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Je lis seulement mes infos confidentielles"
  on public.profils_prives for select to authenticated
  using ((select auth.uid()) = id);

create policy "Je modifie seulement mes infos confidentielles"
  on public.profils_prives for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. La base refuse toute adresse qui n'est pas @mail-esd.com, même si on contourne le site.
create function public.verifier_domaine_ecole()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) !~ '^[^@[:space:]]+@mail-esd\.com$' then
    raise exception 'Seules les adresses @mail-esd.com sont acceptées.';
  end if;
  return new;
end;
$$;

create trigger verifier_domaine_ecole
  before insert or update of email on auth.users
  for each row execute function public.verifier_domaine_ecole();

-- 4. À l'inscription, la base crée les deux profils à partir du formulaire.
--    Si un champ manque ou est invalide, l'inscription entière est refusée.
create function public.creer_profils()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  infos jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profils_publics (id, prenom)
  values (new.id, trim(infos ->> 'prenom'));

  insert into public.profils_prives (id, nom, email, telephone, adresse)
  values (
    new.id,
    trim(infos ->> 'nom'),
    lower(new.email),
    trim(infos ->> 'telephone'),
    trim(infos ->> 'adresse')
  );
  return new;
end;
$$;

create trigger creer_profils
  after insert on auth.users
  for each row execute function public.creer_profils();
