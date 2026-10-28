import { type NextRequest } from "next/server";
import { confirmerLien } from "@/lib/supabase/confirmer";

// Lien du mail « mot de passe oublié ».
export async function GET(request: NextRequest) {
  return confirmerLien(request, "/nouveau-mot-de-passe");
}
