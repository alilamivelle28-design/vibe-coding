-- Retire les comptes fictifs et, par cascade, leurs profils et leurs annonces. Ne touche à aucun vrai compte.
delete from auth.users where id::text like 'f0000000-0000-4000-8000-%' and email like 'fictif.%@mail-esd.com';
