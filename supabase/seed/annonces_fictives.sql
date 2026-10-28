-- Annonces fictives pour tester et pour la démo.
-- À coller dans Supabase › SQL Editor, après 001_comptes.sql et 002_annonces.sql. Peut être relancé sans doublon.
-- Les auteurs sont des comptes fictifs (adresses fictif.*@mail-esd.com) sans mot de passe : personne ne peut s'y connecter.
-- Pour tout retirer plus tard : supabase/seed/retirer_annonces_fictives.sql

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  f.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', f.email, '', now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('prenom', f.prenom, 'nom', f.nom, 'telephone', f.telephone, 'adresse', 'Adresse fictive'),
  now(), now(), '', '', '', ''
from (values
  ('f0000000-0000-4000-8000-000000000001'::uuid, 'fictif.ines@mail-esd.com', 'Inès', 'Fictif', '06 00 00 00 01'),
  ('f0000000-0000-4000-8000-000000000002'::uuid, 'fictif.hugo@mail-esd.com', 'Hugo', 'Fictif', '06 00 00 00 02'),
  ('f0000000-0000-4000-8000-000000000003'::uuid, 'fictif.yasmine@mail-esd.com', 'Yasmine', 'Fictif', '06 00 00 00 03'),
  ('f0000000-0000-4000-8000-000000000004'::uuid, 'fictif.theo@mail-esd.com', 'Théo', 'Fictif', '06 00 00 00 04'),
  ('f0000000-0000-4000-8000-000000000005'::uuid, 'fictif.chloe@mail-esd.com', 'Chloé', 'Fictif', '06 00 00 00 05'),
  ('f0000000-0000-4000-8000-000000000006'::uuid, 'fictif.malik@mail-esd.com', 'Malik', 'Fictif', '06 00 00 00 06'),
  ('f0000000-0000-4000-8000-000000000007'::uuid, 'fictif.lea@mail-esd.com', 'Léa', 'Fictif', '06 00 00 00 07'),
  ('f0000000-0000-4000-8000-000000000008'::uuid, 'fictif.noah@mail-esd.com', 'Noah', 'Fictif', '06 00 00 00 08')
) as f (id, email, prenom, nom, telephone)
on conflict (id) do nothing;

insert into public.annonces (id, auteur, type, categorie, titre, description, remunere, cree_le, modifie_le)
select a.id, a.auteur, a.type, a.categorie, a.titre, a.description, a.remunere,
  now() - a.age, now() - a.age
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'f0000000-0000-4000-8000-000000000001'::uuid, 'propose', 'photo',
   'Shooting portrait pour ton CV',
   'Je fais des portraits pro pour ton CV, LinkedIn ou ton book. Une heure en extérieur ou au studio de l''école, retouches comprises.',
   true, interval '2 hours'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'f0000000-0000-4000-8000-000000000002'::uuid, 'cherche', 'video',
   'Monteur pour un court-métrage',
   'On tourne un court-métrage de 5 minutes pour le festival étudiant. On cherche quelqu''un à l''aise sur Premiere ou DaVinci pour le montage.',
   false, interval '5 hours'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'f0000000-0000-4000-8000-000000000003'::uuid, 'propose', 'graphisme',
   'Logo et identité pour ton asso',
   'Étudiante en direction artistique, je crée ton logo, ta palette et tes visuels Instagram. Deux allers-retours inclus.',
   true, interval '1 day'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'f0000000-0000-4000-8000-000000000004'::uuid, 'propose', 'web',
   'Site vitrine sur Webflow ou WordPress',
   'Je monte un site simple pour un BDE, une asso ou un projet perso. Je t''explique ensuite comment le modifier toi-même.',
   false, interval '1 day 3 hours'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'f0000000-0000-4000-8000-000000000005'::uuid, 'cherche', 'reseaux',
   'Community manager pour le BDE',
   'Le BDE cherche quelqu''un pour gérer Instagram et TikTok deux heures par semaine : stories des soirées, posts d''annonce.',
   true, interval '2 days'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'f0000000-0000-4000-8000-000000000006'::uuid, 'propose', 'redaction',
   'Relecture de mémoire et de dossiers',
   'Je relis ton mémoire, ton dossier de candidature ou ta lettre de motivation : orthographe, clarté, ton.',
   false, interval '2 days 6 hours'),
  ('a0000000-0000-4000-8000-000000000007'::uuid, 'f0000000-0000-4000-8000-000000000007'::uuid, 'cherche', 'evenementiel',
   'Bénévoles pour le gala de fin d''année',
   'On cherche 6 personnes pour l''accueil, le vestiaire et la déco le soir du gala. Entrée offerte en échange.',
   false, interval '3 days'),
  ('a0000000-0000-4000-8000-000000000008'::uuid, 'f0000000-0000-4000-8000-000000000008'::uuid, 'propose', 'ia',
   'Initiation à Midjourney et ChatGPT',
   'Une séance d''une heure pour apprendre à écrire de bons prompts pour tes moodboards et tes présentations.',
   false, interval '3 days 4 hours'),
  ('a0000000-0000-4000-8000-000000000009'::uuid, 'f0000000-0000-4000-8000-000000000002'::uuid, 'cherche', 'langues',
   'Préparer un oral en anglais',
   'J''ai une soutenance en anglais dans trois semaines. Je cherche quelqu''un pour faire deux ou trois répétitions avec moi.',
   true, interval '4 days'),
  ('a0000000-0000-4000-8000-000000000010'::uuid, 'f0000000-0000-4000-8000-000000000003'::uuid, 'cherche', 'logement',
   'Une chambre en coloc près du campus',
   'Je cherche une chambre en colocation à partir de janvier, pas trop loin du campus. Calme, non-fumeuse, plutôt du matin.',
   false, interval '4 days 8 hours'),
  ('a0000000-0000-4000-8000-000000000011'::uuid, 'f0000000-0000-4000-8000-000000000004'::uuid, 'propose', 'covoiturage',
   'Trajet Lille → Paris le vendredi soir',
   'Je rentre à Paris presque tous les vendredis vers 18 h. Deux places libres, on partage l''essence.',
   true, interval '5 days'),
  ('a0000000-0000-4000-8000-000000000012'::uuid, 'f0000000-0000-4000-8000-000000000006'::uuid, 'propose', 'materiel',
   'Je prête trépied, micro et ring light',
   'Pour tes tournages ou tes vidéos de cours : trépied, micro-cravate et ring light à emprunter pour un week-end.',
   false, interval '6 days')
) as a (id, auteur, type, categorie, titre, description, remunere, age)
on conflict (id) do nothing;

select count(*) as annonces_fictives from public.annonces where auteur::text like 'f0000000-%';
