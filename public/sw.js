/* Service worker de Code Ludique : appli installable et utilisable hors connexion.
   - Pages : réseau d'abord (toujours la dernière version), copie locale si pas de réseau.
   - Fichiers du site (scripts, styles, icônes) : copie locale, mise à jour en arrière-plan.
   - /api/* (paiement, contenu payant, compte…) : jamais mis en cache, sauf /api/config (public).
   - Supabase, Stripe : non concernés (autres domaines). */
var VERSION = 'code-ludique-v2';
var ESSENTIELS = ['/', '/js/acces.js', '/js/illustrations.js', '/vendor/supabase.js', '/css/site.css', '/api/config',
  '/manifest.webmanifest', '/icons/icone-192.png', '/icons/icone.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ESSENTIELS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function copieEtReseau(req) { // copie locale tout de suite, mise à jour en arrière-plan
  return caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (copie) {
      var reseau = fetch(req).then(function (r) { if (r.ok) c.put(req, r.clone()); return r; }).catch(function () { return copie || Response.error(); });
      return copie || reseau;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  var polices = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !polices) return;
  if (polices) { e.respondWith(copieEtReseau(req)); return; }
  if (url.pathname.indexOf('/api/') === 0) {
    if (url.pathname === '/api/config') e.respondWith(copieEtReseau(req));
    return; // jamais de cache pour le reste de l'API
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (r) {
      if (r.ok && url.pathname === '/') {
        var copie = r.clone(); // copie faite tout de suite, avant que la page soit lue
        caches.open(VERSION).then(function (c) { c.put('/', copie); });
      }
      return r;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (copie) { return copie || caches.match('/'); });
    }));
    return;
  }
  e.respondWith(copieEtReseau(req));
});
