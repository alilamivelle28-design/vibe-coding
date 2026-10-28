import { test } from "node:test";
import assert from "node:assert/strict";
import { decisionSwipe, lireEcartees, SEUIL_SWIPE } from "./swipe.ts";

test("à droite au-delà du seuil : je réponds", () => {
  assert.equal(decisionSwipe(SEUIL_SWIPE), "interessee");
  assert.equal(decisionSwipe(250), "interessee");
});

test("à gauche au-delà du seuil : pas intéressée", () => {
  assert.equal(decisionSwipe(-SEUIL_SWIPE), "pas-interessee");
});

test("un petit geste ne décide rien", () => {
  assert.equal(decisionSwipe(0), null);
  assert.equal(decisionSwipe(SEUIL_SWIPE - 1), null);
  assert.equal(decisionSwipe(-SEUIL_SWIPE + 1), null);
});

test("lit les annonces écartées, même si la mémoire est vide ou abîmée", () => {
  assert.deepEqual(lireEcartees('["a","b"]'), ["a", "b"]);
  assert.deepEqual(lireEcartees(null), []);
  assert.deepEqual(lireEcartees("pas du json"), []);
  assert.deepEqual(lireEcartees('{"a":1}'), []);
  assert.deepEqual(lireEcartees('["a",3,null]'), ["a"]);
});
