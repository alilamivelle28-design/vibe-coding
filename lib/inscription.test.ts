import { test } from "node:test";
import assert from "node:assert/strict";
import { isPhoneNumber, validateInscription } from "./inscription.ts";

const valide = {
  prenom: "Lauriane",
  nom: "Peynot",
  telephone: "06 12 34 56 78",
  adresse: "12 rue de la Paix, 75002 Paris",
};

test("accepte une inscription complète", () => {
  assert.equal(validateInscription(valide), null);
});

test("refuse un champ vide ou fait d'espaces", () => {
  assert.match(validateInscription({ ...valide, prenom: "  " }) ?? "", /prénom/);
  assert.match(validateInscription({ ...valide, nom: "" }) ?? "", /nom/);
  assert.match(validateInscription({ ...valide, adresse: "" }) ?? "", /adresse/);
});

test("accepte les formats de téléphone français courants", () => {
  assert.equal(isPhoneNumber("0612345678"), true);
  assert.equal(isPhoneNumber("06 12 34 56 78"), true);
  assert.equal(isPhoneNumber("06.12.34.56.78"), true);
  assert.equal(isPhoneNumber("+33 6 12 34 56 78"), true);
});

test("refuse un téléphone invalide", () => {
  assert.equal(isPhoneNumber("1234"), false);
  assert.equal(isPhoneNumber("06 12 34 56"), false);
  assert.equal(isPhoneNumber("abcdefghij"), false);
  assert.match(validateInscription({ ...valide, telephone: "123" }) ?? "", /téléphone/);
});
