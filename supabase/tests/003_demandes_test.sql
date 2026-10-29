-- Tests de 003_demandes.sql (Postgres local), après mock, 001, 002 et 001_comptes_test.sql (Alila 111…, Sam 222…).
\set ON_ERROR_STOP 0
-- Annonces de départ, créées en administrateur pour fixer leur identifiant.
insert into public.annonces (id, auteur, type, categorie, titre, description) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'propose', 'photo', 'Shooting portrait', 'Je fais des photos pour vos CV.'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'propose', 'web', 'Site vitrine', 'Je code des sites pour les assos.');

\echo == visiteur non connecté : tout doit ECHOUER
set role anon;
select * from public.demandes;
select * from public.mes_demandes_recues();
reset role;

\echo == Sam demande le contact (1 ligne), puis essaie une 2e fois (ECHEC : une seule demande)
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
insert into public.demandes (annonce, message) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Salut, ton shooting m interesse pour mon CV !');
insert into public.demandes (annonce, message) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Encore moi, tu as vu ma demande ?');
\echo -- doivent ECHOUER : message trop court, statut forcé, destinataire forcé, au nom d Alila
insert into public.demandes (annonce, message) values ('aaaaaaaa-0000-0000-0000-000000000001', 'court');
insert into public.demandes (annonce, message, statut) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Je m accepte tout seul hihi', 'acceptee');
insert into public.demandes (annonce, message, destinataire) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Je choisis le destinataire', '22222222-2222-2222-2222-222222222222');
insert into public.demandes (annonce, demandeur, message) values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Au nom d Alila, pas bien');
\echo -- AVANT accord : Sam ne voit pas les coordonnées d Alila (telephone et email vides)
select titre, prenom, statut, telephone, email from public.mes_demandes_envoyees();
\echo -- Sam ne lit pas la demande directement (0 ligne) et ne peut pas l accepter lui-même (UPDATE 0)
select count(*) from public.demandes;
update public.demandes set statut = 'acceptee';
\echo -- Sam ne lit toujours pas profils_prives d Alila (seulement lui-même)
select nom, telephone from public.profils_prives;
reset role;

\echo == Alila : se demander soi-même ECHOUE ; elle voit la demande de Sam sans ses coordonnées
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into public.demandes (annonce, message) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Je me demande moi-meme');
select titre, prenom, statut, telephone, email from public.mes_demandes_recues();
\echo -- Alila ne peut pas modifier le message (ECHEC) ni remettre en attente (ECHEC)
update public.demandes set message = 'Message modifié par Alila';
update public.demandes set statut = 'en_attente';
\echo -- Alila accepte (UPDATE 1), puis ne peut plus changer d avis (UPDATE 0)
update public.demandes set statut = 'acceptee';
update public.demandes set statut = 'refusee';
\echo -- APRES accord : Alila voit le téléphone et l e-mail de Sam
select titre, prenom, statut, telephone, email from public.mes_demandes_recues();
reset role;

\echo == APRES accord : Sam voit le téléphone et l e-mail d Alila (pas le nom ni l adresse)
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select titre, prenom, statut, telephone, email from public.mes_demandes_envoyees();
reset role;

\echo == Refus : Alila demande le site de Sam, Sam refuse ; Alila voit toujours « en_attente » sans coordonnées
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into public.demandes (annonce, message) values ('aaaaaaaa-0000-0000-0000-000000000002', 'Bonjour, il me faudrait un site pour mon asso.');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
update public.demandes set statut = 'refusee' where annonce = 'aaaaaaaa-0000-0000-0000-000000000002';
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select titre, statut, telephone, email from public.mes_demandes_envoyees();
reset role;
