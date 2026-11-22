// Aperçu des illustrations : node scripts/apercu-illustrations.cjs specs.json sortie.png
// specs.json : tableau d'objets « img » (voir docs/illustrations.md), ou absent pour la galerie des panneaux.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
// le fichier est un script de navigateur : on l'exécute avec un « window » simulé
const vm = require('vm'), bac = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'illustrations.js'), 'utf8'), bac);
const Illus = bac.window.Illus;
const [, , fichierSpecs, sortie = 'apercu.png'] = process.argv;
let cases;
if (fichierSpecs) {
  const specs = JSON.parse(fs.readFileSync(fichierSpecs, 'utf8'));
  cases = specs.map((s, i) => `<div class="c"><div class="t">${s.titre || '#' + i}</div>${Illus.rendre(s.img || s)}</div>`);
} else {
  const ex = { B14: 'B14:50', B25: 'B25:30', B33: 'B33:50', C4a: 'C4a:70', EB10: 'EB10:VILLENEUVE', EB20: 'EB20:VILLENEUVE' };
  cases = Illus.codes.map((c) => `<div class="c p"><div class="t">${c}</div>${Illus.panneau(ex[c] || c, 110)}</div>`);
}
const html = `<html><head><style>body{margin:0;font:700 12px Arial;background:#f6f1ec}.g{display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:${fichierSpecs ? 1010 : 980}px}
.c{background:#fff;border-radius:10px;padding:6px;width:${fichierSpecs ? 320 : 128}px}.t{margin-bottom:4px;color:#444}.illus{margin:0}.illus-scene svg{width:100%;display:block;border-radius:8px}
.illus-seul{display:flex;gap:6px;justify-content:center}</style></head><body><div class="g">${cases.join('')}</div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1030, height: 600 } });
  await p.setContent(html); await p.screenshot({ path: sortie, fullPage: true }); await b.close();
  console.log('aperçu :', sortie);
})();
