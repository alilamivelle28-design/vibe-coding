-- Faux schéma auth de Supabase, pour tester les migrations sur un Postgres local (jamais dans Supabase).
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
-- Supabase donne par défaut tous les droits aux rôles API sur les nouvelles tables
alter default privileges in schema public grant all on tables to anon, authenticated;
