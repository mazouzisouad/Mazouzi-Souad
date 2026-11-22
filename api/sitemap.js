// Plan du site pour les moteurs de recherche (/sitemap.xml, voir vercel.json).
import { urlDuSite } from './_lib/serveur.js';
import { PAGES_PUBLIQUES } from './_lib/pages-publiques.js';

export default function handler(req, res) {
  const site = urlDuSite(req);
  const priorite = (p) => (p === '/' || p === '/code' ? '1.0' : p === '/code/test-gratuit' ? '0.9' : p.startsWith('/code/panneaux/') ? '0.6' : '0.8');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGES_PUBLIQUES.map((p) => `  <url><loc>${site}${p === '/' ? '/' : p}</loc><priority>${priorite(p)}</priority></url>`).join('\n') + '\n</urlset>\n';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(xml);
}
