// Vérifie que l'appli en ligne trouve Supabase. N'affiche jamais les valeurs des clés.
import { connection } from "next/server";

export async function GET() {
  await connection();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseRepond = false;
  if (url && cle) {
    try {
      const reponse = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: cle },
        cache: "no-store",
      });
      supabaseRepond = reponse.ok;
    } catch {
      supabaseRepond = false;
    }
  }

  return Response.json({
    adresseSupabaseTrouvee: Boolean(url),
    clePubliqueTrouvee: Boolean(cle),
    supabaseRepond,
  });
}
