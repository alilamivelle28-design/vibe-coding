-- Tests de 001_comptes.sql, à lancer après mock_supabase.sql sur un Postgres local (jamais dans Supabase).
\set ON_ERROR_STOP 0
\echo == inscription valide
insert into auth.users (id, email, raw_user_meta_data) values ('11111111-1111-1111-1111-111111111111', 'Alila.Mivelle@mail-esd.com', '{"prenom":"Alila","nom":"Mivelle","telephone":"06 12 34 56 78","adresse":"1 rue A"}');
insert into auth.users (id, email, raw_user_meta_data) values ('22222222-2222-2222-2222-222222222222', 'sam@mail-esd.com', '{"prenom":"Sam","nom":"Martin","telephone":"+33 6 11 22 33 44","adresse":"2 rue B"}');
select count(*) as profils_publics from public.profils_publics;
\echo == doivent ECHOUER : gmail, faux domaine, champ manquant, téléphone faux
insert into auth.users (email, raw_user_meta_data) values ('x@gmail.com', '{"prenom":"X","nom":"Y","telephone":"0612345678","adresse":"a"}');
insert into auth.users (email, raw_user_meta_data) values ('x@mail-esd.com.evil.fr', '{"prenom":"X","nom":"Y","telephone":"0612345678","adresse":"a"}');
insert into auth.users (email, raw_user_meta_data) values ('x@mail-esd.com', '{"nom":"Y","telephone":"0612345678","adresse":"a"}');
insert into auth.users (email, raw_user_meta_data) values ('x@mail-esd.com', '{"prenom":"X","nom":"Y","telephone":"123","adresse":"a"}');
update auth.users set email = 'sam@gmail.com' where id = '22222222-2222-2222-2222-222222222222';
select count(*) as utilisateurs_total from auth.users;

\echo == visiteur non connecté (anon) : doit ECHOUER
set role anon;
select * from public.profils_publics;
reset role;

\echo == Sam connecté
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select prenom from public.profils_publics order by prenom;
\echo -- infos privées visibles par Sam (doit être seulement Sam) :
select nom, telephone from public.profils_prives;
\echo -- Sam tente de modifier le prénom et le téléphone d Alila (0 ligne attendue) :
update public.profils_publics set prenom = 'Pirate' where id = '11111111-1111-1111-1111-111111111111';
update public.profils_prives set telephone = '0600000000' where id = '11111111-1111-1111-1111-111111111111';
\echo -- Sam modifie son propre prénom (1 ligne attendue) :
update public.profils_publics set prenom = 'Samuel' where id = '22222222-2222-2222-2222-222222222222';
\echo -- Sam tente de changer son e-mail ou son id (doit ECHOUER) :
update public.profils_prives set email = 'autre@gmail.com' where id = '22222222-2222-2222-2222-222222222222';
update public.profils_publics set id = '11111111-1111-1111-1111-111111111111' where id = '22222222-2222-2222-2222-222222222222';
\echo -- Sam tente d inserer ou supprimer un profil (doit ECHOUER) :
insert into public.profils_publics (id, prenom) values (gen_random_uuid(), 'Faux');
delete from public.profils_publics where id = '11111111-1111-1111-1111-111111111111';
reset role;
\echo == état final
select p.prenom, v.nom, v.email, v.telephone from public.profils_publics p join public.profils_prives v using (id) order by 1;
