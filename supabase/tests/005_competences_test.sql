-- Tests de 005_competences.sql (Postgres local), après mock, 001 à 004 et leurs tests (Alila = 1111…, Sam = 2222…).
\set ON_ERROR_STOP 0

\echo == visiteur non connecté (anon) : lecture, ajout et fonction doivent ECHOUER
set role anon;
select * from public.competences;
insert into public.competences (libelle) values ('Pirate');
select public.enregistrer_mes_competences(array['Pirate']);
reset role;

\echo == Alila enregistre sa liste validée (3 lignes ensuite)
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.enregistrer_mes_competences(array['Photographie', ' Montage vidéo ', 'SQL']);
select libelle from public.competences order by libelle;
\echo -- Alila remplace sa liste (2 lignes ensuite : Canva, SQL)
select public.enregistrer_mes_competences(array['SQL', 'Canva']);
select libelle from public.competences order by libelle;
\echo -- au nom de Sam (doit ECHOUER)
insert into public.competences (utilisateur, libelle) values ('22222222-2222-2222-2222-222222222222', 'Faux');
\echo -- valeurs interdites (chacune doit ECHOUER) : vide, trop longue, doublon, e-mail, lien, téléphone
insert into public.competences (libelle) values ('  ');
insert into public.competences (libelle) values (repeat('a', 41));
insert into public.competences (libelle) values ('sql');
insert into public.competences (libelle) values ('alila@mail-esd.com');
insert into public.competences (libelle) values ('www.pirate.fr');
insert into public.competences (libelle) values ('06 12 34 56 78');
\echo -- une liste avec une valeur interdite est refusée en entier (doit ECHOUER, la liste reste Canva, SQL)
select public.enregistrer_mes_competences(array['Python', 'alila@mail-esd.com']);
select libelle from public.competences order by libelle;
\echo -- plus de 15 compétences (doit ECHOUER)
select public.enregistrer_mes_competences(array(select 'Compétence ' || i from generate_series(1, 16) i));
reset role;

\echo == Sam connecté
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
\echo -- Sam voit les compétences d Alila avec son prénom (2 lignes)
select p.prenom, c.libelle from public.competences c join public.profils_publics p on p.id = c.utilisateur order by c.libelle;
\echo -- Sam tente de supprimer ou modifier celles d Alila (DELETE 0, puis ECHEC sur la modification)
delete from public.competences where utilisateur = '11111111-1111-1111-1111-111111111111';
update public.competences set libelle = 'Piraté';
\echo -- la fonction de Sam ne touche pas à la liste d Alila (Alila garde 2 lignes)
select public.enregistrer_mes_competences(array['Python']);
select p.prenom, c.libelle from public.competences c join public.profils_publics p on p.id = c.utilisateur order by p.prenom, c.libelle;
reset role;

\echo == droits : aucun TRUNCATE/TRIGGER/REFERENCES, fonction de limite non appelable (t attendu partout)
select not has_table_privilege(r, 'public.competences', 'TRUNCATE')
   and not has_table_privilege(r, 'public.competences', 'TRIGGER')
   and not has_table_privilege(r, 'public.competences', 'REFERENCES')
   and not has_function_privilege(r, 'public.limiter_competences()', 'EXECUTE') as ok, r
from unnest(array['anon','authenticated']) r;
