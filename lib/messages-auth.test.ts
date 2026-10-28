import { test } from "node:test";
import assert from "node:assert/strict";
import { messageErreurAuth } from "./messages-auth.ts";

test("traduit les erreurs courantes de Supabase", () => {
  assert.match(messageErreurAuth({ code: "invalid_credentials" }), /incorrect/);
  assert.match(messageErreurAuth({ code: "email_not_confirmed" }), /lien reçu par mail/);
  assert.match(messageErreurAuth({ code: "user_already_exists" }), /existe déjà/);
  assert.match(messageErreurAuth({ code: "over_email_send_rate_limit" }), /Trop de mails/);
});

test("explique un refus de la base (domaine, champ invalide)", () => {
  assert.match(messageErreurAuth({ code: "unexpected_failure" }), /@mail-esd\.com/);
});

test("donne un message par défaut pour une erreur inconnue", () => {
  assert.match(messageErreurAuth({ code: "truc_inconnu" }), /réessaie/);
  assert.match(messageErreurAuth({}), /réessaie/);
});
