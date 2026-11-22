// Cohérence entre public/index.html (contenu gratuit + emplacements) et le contenu payant du serveur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { QUESTIONS_PREMIUM, FICHES_PREMIUM } from '../api/_lib/contenu-premium.js';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const bloc = html.slice(html.indexOf('var Q = ['), html.indexOf('function fichesOf'));
const app = {};
new Function('app', bloc + ';app.Q=Q;app.FICHES=FICHES;app.FREE_IDS=FREE_IDS;app.FREE_FICHES=FREE_FICHES;')(app);

test('chaque emplacement payant a sa question sur le serveur, avec le même thème', () => {
  app.Q.forEach((q, n) => {
    if (q.p) {
      assert.ok(QUESTIONS_PREMIUM[n], `question n°${n} manquante sur le serveur`);
      assert.equal(QUESTIONS_PREMIUM[n].t, q.t, `thème différent pour n°${n}`);
    } else {
      assert.ok(app.FREE_IDS[n], `question n°${n} en clair dans la page mais pas gratuite`);
      assert.ok(q.q && q.o.length === 4 && q.e, `question gratuite n°${n} incomplète`);
    }
  });
  assert.deepEqual(Object.keys(QUESTIONS_PREMIUM).map(Number).sort((a, b) => a - b),
    app.Q.map((q, n) => (q.p ? n : -1)).filter((n) => n >= 0));
});

test('questions payantes complètes (4 réponses, explication)', () => {
  for (const [n, q] of Object.entries(QUESTIONS_PREMIUM)) {
    assert.ok(q.q && Array.isArray(q.o) && q.o.length === 4 && q.e, `n°${n}`);
  }
});

test('fiches : gratuites en clair, payantes uniquement sur le serveur', () => {
  for (const f of app.FICHES) {
    if (app.FREE_FICHES[f.id]) assert.ok(f.pts.length > 0 && !f.p, f.id);
    else {
      assert.ok(f.p && f.pts.length === 0, `${f.id} ne doit pas avoir de texte dans la page`);
      assert.ok(FICHES_PREMIUM[f.id]?.length > 0, `${f.id} manquante sur le serveur`);
    }
  }
});

test('aucun texte payant dans public/', () => {
  const dir = new URL('../public/', import.meta.url);
  const tout = fs.readdirSync(dir, { recursive: true }).filter((f) => /\.(html|js|json)$/.test(f))
    .map((f) => fs.readFileSync(new URL(f, dir), 'utf8')).join('\n');
  for (const q of Object.values(QUESTIONS_PREMIUM)) assert.ok(!tout.includes(q.q), q.q);
  for (const p of Object.values(FICHES_PREMIUM).flat()) assert.ok(!tout.includes(p), p);
});
