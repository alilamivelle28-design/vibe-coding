import { redirect } from "next/navigation";
import { createClient } from "./server";

// Pour les pages réservées aux étudiants connectés : renvoie vers la connexion sinon.
export async function exigerConnexion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/#connexion");
  return { supabase, id };
}
