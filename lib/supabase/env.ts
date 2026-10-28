export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Clé publique : elle peut être vue par le navigateur, la RLS protège les données.
export const SUPABASE_PUBLIC_KEY = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
