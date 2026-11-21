/* =====================================================================
   Planning partagé en ligne (Firebase : Authentication + Firestore)

   - Chaque personne (agences, moniteurs) se connecte avec son e-mail.
   - Toutes les modifications sont envoyées en ligne et apparaissent
     en direct chez les autres.
   - Fonctionne aussi hors connexion : les changements partent dès
     que le réseau revient.

   Organisation dans Firestore :
     ecole/config     → paramètres, auto-école, agences, moniteurs, prestations
     ecole/compteur   → dernier numéro de facture (protégé contre les doublons)
     eleves/{id}, seances/{id}, factures/{id}, paiements/{id}
   ===================================================================== */
'use strict';

const CLOUD_CFG_KEY = 'motoplanning_firebase';
const CLOUD_COLLS = ['eleves', 'seances', 'factures', 'paiements'];
const CLOUD_CONFIG_KEYS = ['version', 'settings', 'entreprise', 'agences', 'moniteurs', 'prestations'];

// JSON avec clés triées : sert à comparer local / en ligne sans faux écarts
function stableStringify(v) {
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(v ?? null);
}
const clean = (v) => JSON.parse(JSON.stringify(v)); // retire les « undefined » refusés par Firestore

// Accepte le JSON ou le bout de code « const firebaseConfig = { apiKey: "...", ... } »
function parseFirebaseConfig(text) {
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) throw new Error('configuration introuvable');
  let body = m[0];
  try { return JSON.parse(body); } catch (e) { /* format JavaScript */ }
  body = body
    .replace(/\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z_][\w]*)\s*:/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/,\s*}/g, '}');
  const cfg = JSON.parse(body);
  if (!cfg.apiKey || !cfg.projectId) throw new Error('apiKey ou projectId manquant');
  return cfg;
}

const Cloud = {
  enabled: false,   // une configuration Firebase existe
  user: null,       // utilisateur connecté
  ready: false,     // données en ligne chargées
  empty: false,     // base en ligne vide (première mise en service)
  error: '',
  remote: null,     // copie des données en ligne
  synced: null,     // empreintes de ce qui est déjà en ligne
  unsubs: [],
  onChange: () => {}, // appelé quand les données en ligne changent
  onState: () => {},  // appelé quand l'état de connexion change

  config() {
    if (window.FIREBASE_CONFIG) return window.FIREBASE_CONFIG;
    try { return JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || 'null'); } catch (e) { return null; }
  },
  saveConfig(cfg) { localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(cfg)); },
  forgetConfig() { localStorage.removeItem(CLOUD_CFG_KEY); },

  start() {
    const cfg = this.config();
    if (!cfg || !window.firebase) return false;
    this.enabled = true;
    try {
      firebase.initializeApp(cfg);
      this.auth = firebase.auth();
      this.fs = firebase.firestore();
      if (cfg.emulator) { // pour les tests
        this.auth.useEmulator(`http://${cfg.emulator.auth}`, { disableWarnings: true });
        const [h, p] = cfg.emulator.firestore.split(':');
        this.fs.useEmulator(h, Number(p));
      }
      this.fs.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    } catch (e) {
      this.error = 'Configuration Firebase invalide : ' + e.message;
      this.onState();
      return true;
    }
    this.auth.onAuthStateChanged((u) => {
      this.user = u;
      this.stop();
      if (u) this.subscribe();
      this.onState();
    });
    return true;
  },

  login(email, password) { return this.auth.signInWithEmailAndPassword(email, password); },
  logout() { return this.auth.signOut(); },
  resetPassword(email) { return this.auth.sendPasswordResetEmail(email); },

  stop() {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.ready = false;
    this.empty = false;
    this.remote = { config: null, compteur: 0, eleves: new Map(), seances: new Map(), factures: new Map(), paiements: new Map() };
    this.synced = { config: null, eleves: new Map(), seances: new Map(), factures: new Map(), paiements: new Map() };
  },

  subscribe() {
    const attendus = new Set(['config', 'compteur', ...CLOUD_COLLS]);
    const recu = (k) => {
      attendus.delete(k);
      if (attendus.size) return;
      const premier = !this.ready;
      if (premier) this.empty = !this.remote.config;
      if (!this.empty) this.onChange(this.compose()); // données prêtes avant le premier affichage
      if (premier) { this.ready = true; this.onState(); }
    };
    const onErr = (e) => {
      this.error = /permission/i.test(e.code + ' ' + e.message)
        ? "Ce compte n'a pas accès au planning. Demandez à la direction d'ajouter votre e-mail dans les règles Firebase."
        : 'Connexion au planning impossible : ' + e.message;
      this.onState();
    };

    this.unsubs.push(this.fs.collection('ecole').doc('config').onSnapshot((d) => {
      this.remote.config = d.exists ? d.data() : null;
      this.synced.config = d.exists ? stableStringify(d.data()) : null;
      if (d.exists && this.ready && this.empty) { this.empty = false; this.onState(); }
      recu('config');
    }, onErr));
    this.unsubs.push(this.fs.collection('ecole').doc('compteur').onSnapshot((d) => {
      this.remote.compteur = d.exists ? Number(d.data().n) || 0 : 0;
      recu('compteur');
    }, onErr));
    for (const c of CLOUD_COLLS) {
      this.unsubs.push(this.fs.collection(c).onSnapshot((snap) => {
        snap.docChanges().forEach((ch) => {
          if (ch.type === 'removed') { this.remote[c].delete(ch.doc.id); this.synced[c].delete(ch.doc.id); }
          else { this.remote[c].set(ch.doc.id, ch.doc.data()); this.synced[c].set(ch.doc.id, stableStringify(ch.doc.data())); }
        });
        recu(c);
      }, onErr));
    }
  },

  // Reconstitue la base complète à partir de la copie en ligne
  compose() {
    const db = clean(this.remote.config || {});
    db.entreprise = Object.assign({}, db.entreprise || {}, { compteur: this.remote.compteur });
    for (const c of CLOUD_COLLS) db[c] = [...this.remote[c].values()].map(clean);
    return db;
  },

  // Envoie en ligne uniquement ce qui a changé
  async push(db) {
    if (!this.ready || this.empty || !this.user) return;
    const ops = [];
    const cfg = {};
    for (const k of CLOUD_CONFIG_KEYS) cfg[k] = db[k];
    cfg.entreprise = Object.assign({}, db.entreprise);
    delete cfg.entreprise.compteur;
    const sCfg = stableStringify(clean(cfg));
    if (sCfg !== this.synced.config) { ops.push(['set', this.fs.collection('ecole').doc('config'), clean(cfg)]); this.synced.config = sCfg; }
    for (const c of CLOUD_COLLS) {
      const ids = new Set();
      for (const item of db[c]) {
        ids.add(item.id);
        const s = stableStringify(clean(item));
        if (this.synced[c].get(item.id) !== s) { ops.push(['set', this.fs.collection(c).doc(item.id), clean(item)]); this.synced[c].set(item.id, s); }
      }
      for (const id of [...this.synced[c].keys()]) {
        if (!ids.has(id)) { ops.push(['delete', this.fs.collection(c).doc(id)]); this.synced[c].delete(id); }
      }
    }
    for (let i = 0; i < ops.length; i += 450) {
      const batch = this.fs.batch();
      for (const [op, ref, data] of ops.slice(i, i + 450)) op === 'set' ? batch.set(ref, data) : batch.delete(ref);
      await batch.commit();
    }
  },

  // Première mise en ligne : envoie toutes les données de cet appareil
  async upload(db) {
    this.empty = false;
    await this.fs.collection('ecole').doc('compteur').set({ n: Number(db.entreprise?.compteur) || 0 });
    this.synced.config = null;
    await this.push(db);
    this.onState();
  },

  // Numéro de facture suivant, sans doublon même si deux agences facturent en même temps
  async nextNumero() {
    const ref = this.fs.collection('ecole').doc('compteur');
    return this.fs.runTransaction(async (t) => {
      const d = await t.get(ref);
      const n = (d.exists ? Number(d.data().n) || 0 : 0) + 1;
      t.set(ref, { n });
      return n;
    });
  },
  setCompteur(n) { return this.fs.collection('ecole').doc('compteur').set({ n: Number(n) || 0 }); },

  get actif() { return this.enabled && this.user && this.ready && !this.empty; },
};
