import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CATEGORIES, FAMILLES_CATEGORIES, TITRE_MAX, validateAnnonce } from "./annonces.ts";

const valide = {
  type: "propose",
  categorie: "photo",
  titre: "Shooting portrait",
  description: "Je fais des photos pour vos CV et vos books.",
  remunere: true,
};

test("accepte une annonce complète", () => {
  assert.equal(validateAnnonce(valide), null);
});

test("refuse un type ou une catégorie inconnus", () => {
  assert.match(validateAnnonce({ ...valide, type: "vend" }) ?? "", /proposes ou si tu cherches/);
  assert.match(validateAnnonce({ ...valide, categorie: "cuisine" }) ?? "", /catégorie/);
  assert.match(validateAnnonce({ ...valide, categorie: "toString" }) ?? "", /catégorie/);
});

test("refuse un titre vide, fait d'espaces ou trop long", () => {
  assert.match(validateAnnonce({ ...valide, titre: "" }) ?? "", /titre/);
  assert.match(validateAnnonce({ ...valide, titre: "    " }) ?? "", /titre/);
  assert.match(validateAnnonce({ ...valide, titre: "a".repeat(TITRE_MAX + 1) }) ?? "", /au plus/);
});

test("refuse une description trop courte", () => {
  assert.match(validateAnnonce({ ...valide, description: "court" }) ?? "", /description/);
});

test("compte 15 catégories réparties en 2 familles", () => {
  assert.equal(FAMILLES_CATEGORIES.length, 2);
  assert.equal(Object.keys(CATEGORIES).length, 15);
});

test("les catégories du site sont les mêmes que celles de la base", () => {
  const sql = readFileSync(new URL("../supabase/migrations/002_annonces.sql", import.meta.url), "utf8");
  const bloc = sql.match(/categorie in \(([^)]*)\)/)?.[1] ?? "";
  const dansLaBase = [...bloc.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(dansLaBase, Object.keys(CATEGORIES).sort());
});
