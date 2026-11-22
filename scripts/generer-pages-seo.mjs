// Génère les pages publiques (référencement Google) dans public/code/ :
//   /code                 page d'accueil du code de la route
//   /code/test-gratuit    test de 10 questions gratuites
//   /code/<thème>         une page par thème, avec ses questions gratuites
//   /code/panneaux        tous les panneaux ; /code/panneaux/<code> une page par panneau
// Seul le contenu gratuit est publié (questions gratuites, fiches gratuites, fiches panneaux).
// Usage : SITE_URL=https://www.votre-site.fr node scripts/generer-pages-seo.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { FAMILLES, PANNEAUX, THEMES } from './donnees-panneaux.mjs';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(RACINE, 'public');
const SORTIE = path.join(PUB, 'code');
const SITE = (process.env.SITE_URL || '').replace(/\/$/, '');

// ---------- données de l'appli (contenu gratuit uniquement) ----------
const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
const app = {};
new Function('app', html.slice(html.indexOf('var Q = ['), html.indexOf('function fichesOf')) + ';app.Q=Q;app.CAT=CAT;app.FICHES=FICHES;app.FREE_IDS=FREE_IDS;app.FREE_FICHES=FREE_FICHES;')(app);
const gratuites = app.Q.map((q, n) => ({ n, ...q })).filter((q) => app.FREE_IDS[q.n] && !q.p);
const bac = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(PUB, 'js', 'illustrations.js'), 'utf8'), bac);
const Illus = bac.window.Illus;

// ---------- outils ----------
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugPanneau = (code) => code.split(':')[0].toLowerCase();
const nbTotal = app.Q.length;
function page({ chemin, titre, description, h1, corps, jsonld }) {
  const url = SITE ? SITE + chemin : chemin;
  const image = (SITE || '') + '/og-image.png';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
${SITE ? `<link rel="canonical" href="${url}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Code Ludique">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${image}">
${SITE ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#4f8fe0">
<link rel="icon" href="/icons/icone.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/pages-code.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>
<header class="entete">
  <a class="logo" href="/code">Code Ludique</a>
  <a class="bouton-entete" href="/">S’entraîner gratuitement</a>
</header>
<main>
<nav class="fil" aria-label="Fil d’Ariane">${chemin.split('/').filter(Boolean).map((p, i, a) => i < a.length - 1 ? `<a href="/${a.slice(0, i + 1).join('/')}">${p === 'code' ? 'Code de la route' : p === 'panneaux' ? 'Panneaux' : esc(p)}</a> ›` : '').join(' ')}</nav>
<h1>${h1}</h1>
${corps}
${appel()}
</main>
<footer class="pied">
  <a href="/code">Code de la route</a><a href="/code/test-gratuit">Test gratuit</a><a href="/code/panneaux">Panneaux</a>
  <a href="/cgv">Conditions de vente</a><a href="/confidentialite">Confidentialité</a><a href="/mentions-legales">Mentions légales</a>
</footer>
<script src="/js/mini-quiz.js" defer></script>
</body>
</html>
`;
}
function appel() {
  return `<section class="carte appel">
  <h2>Entraîne-toi gratuitement</h2>
  <p>${nbTotal} questions illustrées, examens blancs de 40 questions, fiches de cours, progression sauvegardée.
  Commence gratuitement, sans carte bancaire. Accès complet : 9,90 € pour 3 mois, sans abonnement.</p>
  <a class="bouton" href="/">Commencer maintenant</a>
</section>`;
}
function quiz(questions, id, titreFin) {
  const donnees = questions.map((q) => ({ q: q.q, o: q.o, e: q.e }));
  return `<div class="mini-quiz" id="${id}" data-fin="${esc(titreFin || '')}"><noscript>
${questions.map((q, i) => `<div class="carte"><p><b>${i + 1}. ${esc(q.q)}</b></p><p>Réponse : ${esc(q.o[0])}. ${esc(q.e)}</p></div>`).join('\n')}
</noscript><script type="application/json">${JSON.stringify(donnees).replace(/</g, '\\u003c')}</script></div>`;
}
function ecrire(chemin, contenu) {
  const f = path.join(PUB, chemin === '/code' ? 'code/index.html' : chemin.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, contenu);
  return chemin;
}

// ---------- génération ----------
fs.rmSync(SORTIE, { recursive: true, force: true });
const pages = [];

// panneaux
const parFamille = {};
PANNEAUX.forEach((p) => (parFamille[p[2]] = parFamille[p[2]] || []).push(p));
for (const [code, nom, fam, texte] of PANNEAUX) {
  const c = slugPanneau(code), F = FAMILLES[fam], court = code.split(':')[0];
  const voisins = parFamille[fam].filter((p) => p[0] !== code).slice(0, 8);
  const corps = `<section class="carte panneau-fiche">
  <div class="dessin">${Illus.panneau(code, 180)}</div>
  <div>
    <h2>Que signifie ce panneau ?</h2>
    <p class="gros">${esc(texte)}</p>
    <p class="doux">Nom officiel : « ${esc(nom)} » (panneau ${court}). Famille : ${esc(F.court)}.</p>
  </div>
</section>
<section class="carte">
  <h2>${esc(F.nom)}</h2>
  <p>${esc(F.texte)}</p>
  <div class="grille-panneaux">${voisins.map((p) => `<a href="/code/panneaux/${slugPanneau(p[0])}">${Illus.panneau(p[0], 72)}<span>${esc(p[1])}</span></a>`).join('')}</div>
  <p><a href="/code/panneaux">Voir tous les panneaux ›</a></p>
</section>`;
  pages.push(ecrire(`/code/panneaux/${c}`, page({
    chemin: `/code/panneaux/${c}`,
    titre: `Panneau ${court} : ${nom} – signification | Code Ludique`,
    description: `Que signifie le panneau ${court} « ${nom} » ? ${texte}`.slice(0, 158),
    h1: `Panneau ${esc(court)} : ${esc(nom)}`,
    corps,
  })));
}
pages.push(ecrire('/code/panneaux', page({
  chemin: '/code/panneaux',
  titre: 'Panneaux du code de la route : signification de chaque panneau | Code Ludique',
  description: `Les ${PANNEAUX.length} panneaux les plus utiles du code de la route, avec leur signification : danger, priorité, interdiction, obligation, indication.`,
  h1: 'Les panneaux du code de la route',
  corps: Object.keys(FAMILLES).filter((f) => parFamille[f]).map((f) => `<section class="carte"><h2>${esc(FAMILLES[f].nom)}</h2><p>${esc(FAMILLES[f].texte)}</p>
<div class="grille-panneaux">${parFamille[f].map((p) => `<a href="/code/panneaux/${slugPanneau(p[0])}">${Illus.panneau(p[0], 72)}<span>${esc(p[1])}</span></a>`).join('')}</div></section>`).join('\n'),
})));

// thèmes
for (const th of THEMES) {
  const qs = gratuites.filter((q) => q.t === th.t);
  const cat = app.CAT.find((c) => c.themes.includes(th.t));
  const fiches = app.FICHES.filter((f) => f.c === cat.id && app.FREE_FICHES[f.id]);
  const corps = `<p class="gros">${esc(th.intro)}</p>
${qs.length ? `<section><h2>${qs.length} question${qs.length > 1 ? 's' : ''} gratuite${qs.length > 1 ? 's' : ''} pour t’entraîner</h2>${quiz(qs, 'quiz-' + th.slug, 'Continue avec toutes les questions sur ce thème')}</section>` : ''}
${fiches.map((f) => `<section class="carte fiche"><h2>Fiche : ${esc(f.t)}</h2><ul>${f.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>`).join('\n')}
<section class="carte"><h2>Les autres thèmes</h2><ul class="liens">${THEMES.filter((t) => t !== th).map((t) => `<li><a href="/code/${t.slug}">${esc(t.t)}</a></li>`).join('')}</ul></section>`;
  pages.push(ecrire(`/code/${th.slug}`, page({
    chemin: `/code/${th.slug}`,
    titre: `${th.t} : questions du code de la route gratuites | Code Ludique`,
    description: `${th.t} : ${th.intro} Questions gratuites avec correction.`.slice(0, 158),
    h1: `${esc(th.t)} : questions du code de la route`,
    corps,
  })));
}

// test gratuit : 10 questions, réparties sur les thèmes
const test = [];
for (let r = 0; test.length < 10; r++) {
  let ajout = false;
  for (const th of THEMES) {
    const q = gratuites.filter((x) => x.t === th.t)[r];
    if (q && test.length < 10) { test.push(q); ajout = true; }
  }
  if (!ajout) break;
}
pages.push(ecrire('/code/test-gratuit', page({
  chemin: '/code/test-gratuit',
  titre: 'Test du code de la route gratuit : 10 questions avec correction | Code Ludique',
  description: 'Teste ton niveau au code de la route en 10 questions gratuites, avec la correction expliquée. Sans inscription.',
  h1: 'Test gratuit : 10 questions du code de la route',
  corps: `<p class="gros">Réponds aux 10 questions : la correction s’affiche après chaque réponse, et ton score à la fin. Sans inscription.</p>${quiz(test, 'quiz-test', 'Prêt pour un vrai examen blanc de 40 questions ?')}`,
})));

// accueil du code
pages.push(ecrire('/code', page({
  chemin: '/code',
  titre: 'Code de la route 2026 : réviser gratuitement avec des questions illustrées | Code Ludique',
  description: `Révise le code de la route avec ${nbTotal} questions illustrées et corrigées, des examens blancs et des fiches. Test gratuit, panneaux expliqués.`,
  h1: 'Réviser le code de la route',
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Code Ludique', url: SITE || undefined },
  corps: `<p class="gros">Questions illustrées, explications claires, examens blancs de 40 questions : tout pour réussir l’examen du code (au moins 35 bonnes réponses sur 40).</p>
<section class="carte"><h2>Commence par un test gratuit</h2><p>10 questions, la correction tout de suite, sans inscription.</p><a class="bouton secondaire" href="/code/test-gratuit">Faire le test gratuit</a></section>
<section class="carte"><h2>Révise par thème</h2><div class="grille-themes">${THEMES.map((t) => `<a href="/code/${t.slug}"><b>${esc(t.t)}</b><span>${esc(t.intro)}</span></a>`).join('')}</div></section>
<section class="carte"><h2>Les panneaux expliqués</h2><div class="grille-panneaux">${PANNEAUX.filter((p) => ['AB4', 'AB3a', 'AB1', 'AB6', 'B1', 'B6d', 'B14:50', 'C12'].includes(p[0])).map((p) => `<a href="/code/panneaux/${slugPanneau(p[0])}">${Illus.panneau(p[0], 72)}<span>${esc(p[1])}</span></a>`).join('')}</div><p><a href="/code/panneaux">Voir les ${PANNEAUX.length} panneaux ›</a></p></section>`,
})));

// liste des pages pour le plan du site (servi par api/sitemap.js)
fs.writeFileSync(path.join(RACINE, 'api', '_lib', 'pages-publiques.js'),
  '// Généré par scripts/generer-pages-seo.mjs : ne pas modifier à la main.\nexport const PAGES_PUBLIQUES = ' + JSON.stringify(['/', ...pages], null, 1) + ';\n');
console.log(pages.length, 'pages générées dans public/code/', SITE ? '(adresse : ' + SITE + ')' : '(sans adresse du site : relancez avec SITE_URL=… une fois le domaine connu)');
