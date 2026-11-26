-- Tests de 004_verrouillage.sql (Postgres local), après mock, 001, 002, 003.
-- Chaque ligne doit afficher « t » (vrai).
\echo == Plus de droit TRUNCATE / TRIGGER / REFERENCES pour les visiteurs et les connectés
select not has_table_privilege(r, t, 'TRUNCATE')
   and not has_table_privilege(r, t, 'TRIGGER')
   and not has_table_privilege(r, t, 'REFERENCES') as ok, r, t
from unnest(array['anon','authenticated']) r,
     unnest(array['public.profils_prives','public.profils_publics','public.annonces','public.demandes']) t;

\echo == Les fonctions de déclencheur ne sont plus appelables par /rpc/
select not has_function_privilege(r, f, 'EXECUTE') as ok, r, f
from unnest(array['anon','authenticated']) r,
     unnest(array['public.creer_profils()','public.verifier_domaine_ecole()','public.dater_modification()',
                  'public.dater_reponse()','public.preparer_demande()']) f;

\echo == Les fonctions de demandes : connectés oui, visiteurs non
select has_function_privilege('authenticated', f, 'EXECUTE')
   and not has_function_privilege('anon', f, 'EXECUTE') as ok, f
from unnest(array['public.mes_demandes_envoyees()','public.mes_demandes_recues()']) f;
