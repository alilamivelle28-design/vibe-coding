import { test } from "node:test";
import assert from "node:assert/strict";
import { isSchoolEmail } from "./email.ts";

test("accepte une adresse de l'école", () => {
  assert.equal(isSchoolEmail("lauriane.peynot@mail-esd.com"), true);
});

test("ignore les majuscules et les espaces autour", () => {
  assert.equal(isSchoolEmail("  Lauriane@MAIL-ESD.COM "), true);
});

test("refuse un autre domaine", () => {
  assert.equal(isSchoolEmail("lauriane@gmail.com"), false);
});

test("refuse un faux domaine qui contient celui de l'école", () => {
  assert.equal(isSchoolEmail("lauriane@mail-esd.com.evil.fr"), false);
  assert.equal(isSchoolEmail("lauriane@evil-mail-esd.com"), false);
  assert.equal(isSchoolEmail("lauriane@evil.com@mail-esd.com"), false);
  assert.equal(isSchoolEmail("lauriane@sub.mail-esd.com"), false);
});

test("refuse une adresse vide ou sans nom", () => {
  assert.equal(isSchoolEmail(""), false);
  assert.equal(isSchoolEmail("@mail-esd.com"), false);
  assert.equal(isSchoolEmail("lauriane mail-esd.com"), false);
});
