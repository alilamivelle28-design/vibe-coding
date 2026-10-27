# Fiche d'identité du projet : L'entraide du campus

> À relire avant chaque demande. Les lignes marquées (à compléter) sont à écrire par Lauriane.

## Ce que je construis
- **Pour qui** : les étudiants du campus.
- **Problème** : trouver quelqu'un qui sait faire quelque chose (photo, vidéo, dev, community management) ou qui propose un service (coloc, covoiturage).
- **Un seul compte** : la même personne propose et cherche, sans changer de rôle.
- **3 écrans** : les annonces, la demande reçue, mon profil (rempli par l'IA à partir du CV).
- **Ce qu'on ne fait pas** : (à compléter, par exemple : pas de paiement, pas d'appli mobile native, pas de notation).

## Avec quoi
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Supabase : base de données et comptes (inscription, connexion, déconnexion).
- Vercel : mise en ligne automatique à chaque sauvegarde sur la branche `main` de GitHub.

## Les 3 règles d'or (toujours vraies)
1. Mes coordonnées ne sont visibles qu'après mon accord.
2. Je ne peux modifier que mes propres annonces.
3. Une conversation n'est lisible que par ses deux participants.

Ces règles sont protégées dans la base (RLS Supabase), pas seulement cachées à l'écran.

## Ce que l'IA ne touche jamais
- Les fichiers `.env*` et les clés : aucune clé d'API ni clé `service_role` dans le code.
- Les règles RLS déjà validées, sans me demander.
- (à compléter)

## Comment on travaille
- Pose-moi tes questions avant de coder, puis propose un plan court avec un moyen de vérifier chaque étape.
- Une demande à la fois. N'installe aucun outil ou bibliothèque sans me le dire.
- Ne refais pas ce que je n'ai pas demandé.
- Après chaque étape, explique ce que tu as changé et pourquoi.

@AGENTS.md
