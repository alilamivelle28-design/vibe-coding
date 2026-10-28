import { type NextRequest } from "next/server";
import { confirmerLien } from "@/lib/supabase/confirmer";

// Lien du mail de confirmation d'inscription.
export async function GET(request: NextRequest) {
  return confirmerLien(request, "/espace");
}
