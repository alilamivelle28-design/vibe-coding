import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "./server";

// Ouvre la session à partir du lien reçu par mail, puis envoie vers `destination`.
// Accepte le lien « token_hash » (modèle de mail modifié) et le lien « code » (modèle par défaut).
export async function confirmerLien(request: NextRequest, destination: string) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createClient();

  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? destination : "/lien-invalide", request.url));
}
