-- Lot 4 : verrouiller le palier 1
-- Ce script retire des droits inutiles. Il ne touche à aucune donnée.

-- 1. Les visiteurs connectés n'ont pas besoin de vider (TRUNCATE) ni de brancher
--    des déclencheurs sur les tables de profils. Ils gardent la lecture (filtrée par la RLS).
revoke truncate, trigger, references on public.profils_prives  from anon, authenticated;
revoke truncate, trigger, references on public.profils_publics from anon, authenticated;
revoke truncate, trigger, references on public.annonces        from anon, authenticated;
revoke truncate, trigger, references on public.demandes        from anon, authenticated;

-- 2. Les fonctions de déclencheur ne doivent pas être appelables par l'adresse /rpc/.
revoke execute on function public.creer_profils()          from public, anon, authenticated;
revoke execute on function public.verifier_domaine_ecole() from public, anon, authenticated;
revoke execute on function public.dater_modification()     from public, anon, authenticated;
revoke execute on function public.dater_reponse()          from public, anon, authenticated;
revoke execute on function public.preparer_demande()       from public, anon, authenticated;

-- 3. Les deux fonctions de demandes restent réservées aux connectés (jamais aux visiteurs).
revoke execute on function public.mes_demandes_envoyees() from public, anon;
revoke execute on function public.mes_demandes_recues()   from public, anon;
grant  execute on function public.mes_demandes_envoyees() to authenticated;
grant  execute on function public.mes_demandes_recues()   to authenticated;
