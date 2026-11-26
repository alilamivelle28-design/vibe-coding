import { test } from "node:test";
import assert from "node:assert/strict";
import { MESSAGE_MAX, messageErreurDemande, validateMessage } from "./demandes.ts";

test("accepte un message normal", () => {
  assert.equal(validateMessage("Salut, ton shooting m'intéresse pour mon CV !"), null);
});

test("refuse un message vide, fait d'espaces ou trop court", () => {
  assert.match(validateMessage("") ?? "", /au moins/);
  assert.match(validateMessage("          ") ?? "", /au moins/);
  assert.match(validateMessage("Salut") ?? "", /au moins/);
});

test("refuse un message trop long", () => {
  assert.match(validateMessage("a".repeat(MESSAGE_MAX + 1)) ?? "", /au plus/);
});

test("explique les refus de la base", () => {
  assert.match(messageErreurDemande({ code: "23505" }), /déjà demandé/);
  assert.match(
    messageErreurDemande({ code: "P0001", message: "Impossible de demander le contact sur sa propre annonce" }),
    /ton annonce/,
  );
  assert.match(messageErreurDemande({ code: "P0001", message: "Annonce introuvable" }), /n'existe plus/);
  assert.match(messageErreurDemande({}), /réessaie/);
});
