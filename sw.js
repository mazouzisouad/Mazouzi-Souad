// Service worker : permet d'utiliser l'appli hors connexion (installée sur le téléphone).
const CACHE = 'moto-planning-v35';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'icon.svg', 'manifest.webmanifest', 'vendor/jspdf.umd.min.js',
  'config.js', 'cloud.js', 'contrats.js', 'rappels.js', 'suivi.js', 'email.js', 'motos.js', 'compte.js', 'eleves-import.js', 'vendor/pdfjs/pdf.min.js', 'vendor/pdfjs/pdf.worker.min.js', 'pdfdesign.js', 'vendor/fonts/Poppins-Regular.ttf', 'vendor/fonts/Poppins-SemiBold.ttf', 'vendor/fonts/Poppins-Bold.ttf', 'vendor/firebase/firebase-app-compat.js', 'vendor/firebase/firebase-auth-compat.js', 'vendor/firebase/firebase-firestore-compat.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour avoir toujours la dernière version), cache si hors ligne.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return; // Firebase & co : pas de cache
  // « no-cache » : le navigateur redemande toujours au serveur s'il y a une nouvelle version
  const frais = new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' });
  e.respondWith(
    fetch(frais)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
