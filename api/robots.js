// Consignes pour les moteurs de recherche (/robots.txt, voir vercel.json).
import { urlDuSite } from './_lib/serveur.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(['User-agent: *', 'Allow: /',
    'Disallow: /api/', 'Disallow: /admin', 'Disallow: /compte', 'Disallow: /connexion', 'Disallow: /merci', 'Disallow: /reinitialiser',
    '', `Sitemap: ${urlDuSite(req)}/sitemap.xml`, ''].join('\n'));
}
