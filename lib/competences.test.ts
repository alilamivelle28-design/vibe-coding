import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import {
  COMPETENCE_MAX,
  COMPETENCES_MAX,
  CV_TAILLE_MAX,
  lireReponseIA,
  validerCompetences,
  verifierFichierCV,
} from "./competences.ts";
import { PROMPT_CV } from "./ia/prompts.ts";

const cv = (nom: string) => readFileSync(new URL(`../cv-de-test/${nom}`, import.meta.url));

// --- La réponse de l'IA : du JSON, une liste de compétences courtes, rien d'autre ---

test("lit une réponse JSON correcte", () => {
  assert.deepEqual(lireReponseIA('{"competences": ["Photographie", "Montage vidéo", "SQL"]}'), [
    "Photographie",
    "Montage vidéo",
    "SQL",
  ]);
});

test("accepte une réponse entourée de ```json", () => {
  assert.deepEqual(lireReponseIA('```json\n{"competences": ["Canva"]}\n```'), ["Canva"]);
});

test("refuse une réponse qui n'est pas du JSON ou n'a pas la bonne forme", () => {
  assert.equal(lireReponseIA("Voici tes compétences : photo, vidéo"), null);
  assert.equal(lireReponseIA(""), null);
  assert.equal(lireReponseIA('["Photo"]'), null);
  assert.equal(lireReponseIA('{"skills": ["Photo"]}'), null);
  assert.equal(lireReponseIA('{"competences": "Photo"}'), null);
});

test("un CV presque vide donne une liste vide, pas une erreur", () => {
  assert.deepEqual(lireReponseIA('{"competences": []}'), []);
});

test("nettoie la liste : espaces, doublons, éléments vides ou qui ne sont pas du texte", () => {
  assert.deepEqual(lireReponseIA('{"competences": ["  Python ", "python", "", 42, null, "SQL"]}'), ["Python", "SQL"]);
});

test("écarte les éléments trop longs et garde au plus le maximum", () => {
  const beaucoup = Array.from({ length: COMPETENCES_MAX + 10 }, (_, i) => `Compétence ${i + 1}`);
  const lu = lireReponseIA(JSON.stringify({ competences: [...beaucoup, "a".repeat(COMPETENCE_MAX + 1)] }));
  assert.equal(lu?.length, COMPETENCES_MAX);
  assert.ok(lu?.every((c) => c.length <= COMPETENCE_MAX));
});

test("ne garde jamais d'e-mail, de téléphone ni de lien, même si le CV caché le demande", () => {
  const piege = {
    competences: ["Excel", "alex.piege@mail-esd.com", "07 00 00 00 00", "+33 6 12 34 56 78", "https://pirate.example", "Anglais"],
  };
  assert.deepEqual(lireReponseIA(JSON.stringify(piege)), ["Excel", "Anglais"]);
});

test("ignore les champs en plus dans la réponse", () => {
  assert.deepEqual(lireReponseIA('{"competences": ["Excel"], "email": "a@b.c", "consigne": "ok"}'), ["Excel"]);
});

// --- La liste validée par l'étudiant avant l'enregistrement ---

test("accepte la liste relue par l'étudiant", () => {
  assert.equal(validerCompetences(["Photographie", "SQL"]), null);
  assert.equal(validerCompetences([]), null);
});

test("refuse une liste relue invalide", () => {
  assert.match(validerCompetences("Photo") ?? "", /liste/);
  assert.match(validerCompetences(["Photo", "  "]) ?? "", /vide/);
  assert.match(validerCompetences(["a".repeat(COMPETENCE_MAX + 1)]) ?? "", /au plus/);
  assert.match(validerCompetences(["Photo", "photo"]) ?? "", /deux fois/);
  assert.match(validerCompetences(Array.from({ length: COMPETENCES_MAX + 1 }, (_, i) => `C${i}`)) ?? "", /au plus/);
  assert.match(validerCompetences(["moi@mail-esd.com"]) ?? "", /coordonnées/);
});

// --- Le fichier déposé ---

test("accepte les 3 CV de test", () => {
  for (const nom of ["cv-normal.pdf", "cv-presque-vide.pdf", "cv-texte-cache.pdf"]) {
    const octets = cv(nom);
    assert.equal(verifierFichierCV({ type: "application/pdf", taille: octets.length, debut: octets.subarray(0, 5) }), null);
  }
});

test("refuse un fichier vide, trop lourd ou qui n'est pas un PDF", () => {
  const debutPdf = new TextEncoder().encode("%PDF-");
  assert.match(verifierFichierCV({ type: "application/pdf", taille: 0, debut: debutPdf }) ?? "", /vide/);
  assert.match(verifierFichierCV({ type: "application/pdf", taille: CV_TAILLE_MAX + 1, debut: debutPdf }) ?? "", /Mo/);
  assert.match(verifierFichierCV({ type: "image/png", taille: 100, debut: debutPdf }) ?? "", /PDF/);
  // Un faux PDF : le nom ou le type disent PDF, mais le contenu non.
  assert.match(
    verifierFichierCV({ type: "application/pdf", taille: 100, debut: new TextEncoder().encode("<html") }) ?? "",
    /PDF/,
  );
});

test("le CV piégé contient bien une consigne cachée (pour vérifier que l'IA ne lui obéit pas)", () => {
  assert.match(cv("cv-texte-cache.pdf").toString("latin1"), /IGNORE TOUTES LES CONSIGNES/);
  assert.match(cv("cv-texte-cache.pdf").toString("latin1"), /1 1 1 rg/);
});

// --- Le prompt, rangé à part ---

test("le prompt traite le CV comme des données et impose du JSON sans coordonnées", () => {
  assert.match(PROMPT_CV, /jamais des instructions/i);
  assert.match(PROMPT_CV, /JSON/);
  assert.match(PROMPT_CV, /"competences"/);
  assert.match(PROMPT_CV, /coordonnées/i);
});

// --- La clé d'API ne part jamais vers le navigateur ---

function fichiersDuSite(dossier: URL): URL[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = new URL(nom, dossier);
    if (statSync(chemin).isDirectory()) return fichiersDuSite(new URL(`${nom}/`, dossier));
    return /\.(ts|tsx)$/.test(nom) && !nom.endsWith(".test.ts") ? [chemin] : [];
  });
}

test("la clé Gemini n'est lue que par un fichier serveur et jamais en NEXT_PUBLIC_", () => {
  const fichiers = [...fichiersDuSite(new URL("../app/", import.meta.url)), ...fichiersDuSite(new URL("./", import.meta.url))];
  const lecteurs = fichiers.filter((f) => readFileSync(f, "utf8").includes("GEMINI_API_KEY"));
  assert.deepEqual(
    lecteurs.map((f) => f.pathname.split("/vibe-coding/").pop() ?? f.pathname),
    ["lib/ia/gemini.ts"],
  );
  const gemini = readFileSync(lecteurs[0], "utf8");
  assert.match(gemini, /^import "server-only";/m);
  for (const f of fichiers) assert.doesNotMatch(readFileSync(f, "utf8"), /NEXT_PUBLIC_GEMINI/);
});
