import { test } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "./password.ts";

test("accepte un mot de passe assez long et confirmé", () => {
  assert.equal(validateNewPassword("motdepasse123", "motdepasse123"), null);
});

test("refuse un mot de passe trop court", () => {
  assert.match(
    validateNewPassword("court", "court") ?? "",
    new RegExp(String(PASSWORD_MIN_LENGTH)),
  );
});

test("refuse une confirmation différente", () => {
  assert.match(validateNewPassword("motdepasse123", "motdepasse124") ?? "", /identiques/);
});

test("refuse un mot de passe vide", () => {
  assert.notEqual(validateNewPassword("", ""), null);
});
