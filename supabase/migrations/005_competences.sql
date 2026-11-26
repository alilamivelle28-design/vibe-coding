-- Lot 5 : les compétences du profil (proposées par l'IA à partir du CV, puis validées par l'étudiant).
-- À coller une seule fois dans Supabase › SQL Editor, après 004_verrouillage.sql.
-- Le CV lui-même n'est jamais enregistré : seule la liste validée l'est.
-- Voulu : les compétences sont publiques pour les étudiants connectés, comme le prénom (pas de coordonnées dedans).

create table public.competences (
  id uuid primary key default gen_random_uuid(),
  -- Le propriétaire est toujours la personne connectée : la valeur par défaut le remplit, la règle d'insertion le vérifie.
  utilisateur uuid not null default auth.uid() references public.profils_publics (id) on delete cascade,
  libelle text not null check (
    char_length(btrim(libelle)) between 2 and 40
    -- Jamais de coordonnées dans une compétence : ni e-mail, ni lien, ni numéro de téléphone.
    and libelle !~ '@'
    and libelle !~* '(https?://|www\.)'
    and regexp_replace(libelle, '[^0-9]', '', 'g') !~ '[0-9]{8}'
  ),
  cree_le timestamptz not null default now()
);

-- Pas deux fois la même compétence pour une personne (sans tenir compte des majuscules).
create unique index competences_unique_idx on public.competences (utilisateur, lower(btrim(libelle)));

alter table public.competences enable row level security;

-- Les visiteurs non connectés n'ont accès à rien.
revoke all on public.competences from anon;
-- Les connectés lisent, ajoutent (seulement le libellé) et suppriment. Pas de modification : on remplace la liste.
revoke all on public.competences from authenticated;
grant select, delete on public.competences to authenticated;
grant insert (libelle) on public.competences to authenticated;

create policy "Les connectés lisent les compétences"
  on public.competences for select to authenticated
  using (true);

create policy "J'ajoute mes compétences"
  on public.competences for insert to authenticated
  with check ((select auth.uid()) = utilisateur);

create policy "Je supprime mes compétences"
  on public.competences for delete to authenticated
  using ((select auth.uid()) = utilisateur);

-- 15 compétences au plus par personne, même en contournant le site.
create function public.limiter_competences()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.competences where utilisateur = new.utilisateur) >= 15 then
    raise exception 'Pas plus de 15 compétences.';
  end if;
  return new;
end;
$$;

create trigger limiter_competences
  before insert on public.competences
  for each row execute function public.limiter_competences();

revoke execute on function public.limiter_competences() from public, anon, authenticated;

-- Enregistrer la liste validée en une seule fois : tout passe ou rien ne passe.
-- « security invoker » : la fonction agit avec les droits de la personne connectée, donc la RLS s'applique.
create function public.enregistrer_mes_competences(liste text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Connexion requise.';
  end if;
  delete from public.competences where utilisateur = (select auth.uid());
  insert into public.competences (libelle)
  select btrim(l) from unnest(coalesce(liste, '{}')) as l;
end;
$$;

revoke execute on function public.enregistrer_mes_competences(text[]) from public, anon;
grant execute on function public.enregistrer_mes_competences(text[]) to authenticated;
