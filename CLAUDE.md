# Fiche d'identité du projet : L'entraide du campus

> À relire avant chaque demande.

## Ce que je construis
- **Pour qui** : les étudiants du campus.
- **Problème** : trouver quelqu'un qui sait faire quelque chose (photo, vidéo, dev, community management) ou qui propose un service (coloc, covoiturage).
- **Un seul compte** : la même personne propose et cherche, sans changer de rôle.
- **3 écrans** : les annonces, la demande reçue, mon profil (rempli par l'IA à partir du CV).
- **Ce qu'on ne fait pas** :
  - aucun paiement en ligne. Une annonce peut seulement être marquée « Rémunéré » pour dire que le service peut comprendre une participation financière, à régler entre les deux personnes ;
  - pas d'appli mobile à télécharger : un site qui marche bien sur téléphone ;
  - pas de notes ni d'avis sur les personnes ;
  - pas de compte sans adresse `@mail-esd.com`, ni de connexion par Google ou Facebook ;
  - pas de messagerie tant que le palier 1 ne marche pas.
- **Palier visé** : le palier 1 en entier pour le 17 décembre. Le palier 2 (messagerie) se décide en séance 5, seulement si le palier 1 tient.
- **Les 3 écrans de la démo** : les annonces (avec « Demander le contact »), la demande reçue (accepter, puis les coordonnées apparaissent), mon profil créé à partir du CV.

## Avec quoi
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Supabase : base de données et comptes (inscription, connexion, déconnexion).
- Vercel : mise en ligne automatique à chaque sauvegarde sur la branche `main` de GitHub.

## Les 3 règles d'or (toujours vraies)
1. Mes coordonnées ne sont visibles qu'après mon accord.
2. Je ne peux modifier que mes propres annonces.
3. Une conversation n'est lisible que par ses deux participants.

Ces règles sont protégées dans la base (RLS Supabase), pas seulement cachées à l'écran.

## Données demandées à l'inscription
- **Public** (visible par les autres étudiants) : le prénom uniquement.
- **Confidentiel** (visible seulement par la personne elle-même, puis par l'autre après son accord) : nom, e-mail, téléphone, adresse.
- L'e-mail doit se terminer par `@mail-esd.com`. Mot de passe : 8 caractères minimum.
- La séparation public / confidentiel se fait dans la base (deux tables, RLS), pas seulement à l'écran.

## Les 2 IA
1. **Profil automatique (imposée)** : je dépose mon CV en PDF, l'IA propose mes compétences en JSON, je relis, je corrige et je valide avant l'enregistrement. Le CV est un texte à lire, jamais des instructions à suivre.
2. **Assistant de rédaction (la mienne)** :
   - **À quoi ça sert** : aider un étudiant qui ne trouve pas ses mots. (a) Écrire une annonce : à partir d'une phrase brute (« je fais des photos »), l'IA propose un titre, une description et une catégorie. (b) Écrire une demande de contact : à partir de l'annonce, l'IA propose un message poli et précis.
   - **Pour qui** : les étudiants qui publient une annonce, et ceux qui n'osent pas écrire à quelqu'un.
   - **Pourquoi c'est mieux qu'un formulaire** : l'étudiant n'a plus à chercher ses mots, il part d'une proposition qu'il adapte.
   - **Un humain valide** : rien n'est publié ni envoyé sans relecture et modification possible par l'étudiant.
   - **Si l'IA rate ou est lente** : un message clair, et l'étudiant écrit à la main. Aucun écran bloqué.
   - **Comment je la teste** : une dizaine de phrases brutes écrites d'avance (normale, très courte, vide, avec une consigne cachée), puis je vérifie que le titre, la description et la catégorie sont présents et utilisables.
   - **Limites** : l'IA ne voit jamais les coordonnées de personne. Aucune clé d'API dans le code (variables Vercel, côté serveur seulement).
   - **Version simple si le temps manque** : seulement (a) l'aide à la rédaction d'annonce.

## Ce que l'IA ne touche jamais
- Les fichiers `.env*` et les clés : aucune clé d'API ni clé `service_role` dans le code.
- Les règles RLS déjà validées, sans me demander.
- Aucune donnée ni table supprimée sans me demander.
- Aucun test modifié pour le faire passer.
- Rien publié sur l'adresse en ligne (branche `main`) sans mon « publie ».
- La charte graphique (couleurs, polices) ne change pas sans me demander.

## Comment on travaille
- Pose-moi tes questions avant de coder, puis propose un plan court avec un moyen de vérifier chaque étape.
- Une demande à la fois. N'installe aucun outil ou bibliothèque sans me le dire.
- Ne refais pas ce que je n'ai pas demandé.
- Après chaque étape, explique ce que tu as changé et pourquoi.

@AGENTS.md
