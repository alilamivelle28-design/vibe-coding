-- Tests de 002_annonces.sql, à lancer après mock_supabase.sql, 001_comptes.sql et 001_comptes_test.sql (Postgres local).
\set ON_ERROR_STOP 0
\echo == visiteur non connecté (anon) : lecture et publication doivent ECHOUER
set role anon;
select * from public.annonces;
insert into public.annonces (type, categorie, titre, description) values ('propose', 'photo', 'Pirate', 'Une annonce anonyme');
reset role;

\echo == Alila connectée publie (2 lignes attendues)
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into public.annonces (type, categorie, titre, description, remunere) values ('propose', 'photo', 'Shooting portrait', 'Je fais des photos pour vos CV et books.', true);
insert into public.annonces (type, categorie, titre, description) values ('cherche', 'covoiturage', 'Trajet Lille-Paris', 'Je cherche un covoiturage le vendredi soir.');
\echo -- Alila tente de publier au nom de Sam (doit ECHOUER)
insert into public.annonces (auteur, type, categorie, titre, description) values ('22222222-2222-2222-2222-222222222222', 'propose', 'web', 'Faux', 'Annonce au nom de Sam');
\echo -- valeurs interdites (doivent ECHOUER) : type, catégorie, titre vide, description trop courte
insert into public.annonces (type, categorie, titre, description) values ('vend', 'photo', 'Titre ok', 'Description ok ok');
insert into public.annonces (type, categorie, titre, description) values ('propose', 'cuisine', 'Titre ok', 'Description ok ok');
insert into public.annonces (type, categorie, titre, description) values ('propose', 'photo', '   ', 'Description ok ok');
insert into public.annonces (type, categorie, titre, description) values ('propose', 'photo', 'Titre ok', 'court');
reset role;

\echo == Sam connecté
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
\echo -- Sam voit les annonces d Alila avec son prénom (2 lignes)
select a.titre, p.prenom, a.remunere from public.annonces a join public.profils_publics p on p.id = a.auteur order by a.titre;
\echo -- Sam tente de modifier puis supprimer les annonces d Alila (UPDATE 0 et DELETE 0 attendus)
update public.annonces set titre = 'Piraté' where auteur = '11111111-1111-1111-1111-111111111111';
delete from public.annonces where auteur = '11111111-1111-1111-1111-111111111111';
\echo -- Sam publie la sienne (1 ligne)
insert into public.annonces (type, categorie, titre, description) values ('propose', 'web', 'Site vitrine', 'Je code des sites pour les assos.');
\echo -- Sam tente de donner son annonce à Alila ou de changer la date (doit ECHOUER)
update public.annonces set auteur = '11111111-1111-1111-1111-111111111111' where titre = 'Site vitrine';
update public.annonces set cree_le = now() - interval '1 year' where titre = 'Site vitrine';
\echo -- Sam modifie puis supprime la sienne (UPDATE 1 puis DELETE 1)
update public.annonces set titre = 'Site vitrine pour assos' where titre = 'Site vitrine';
delete from public.annonces where titre = 'Site vitrine pour assos';
reset role;

\echo == Alila modifie la sienne (UPDATE 1) et la date de modification avance
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
update public.annonces set remunere = false where titre = 'Shooting portrait';
select titre, remunere, modifie_le > cree_le as date_modifiee from public.annonces order by titre;
reset role;
\echo == état final (2 annonces d Alila, intactes)
select titre, type, categorie from public.annonces order by titre;
