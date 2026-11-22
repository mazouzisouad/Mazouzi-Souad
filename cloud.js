/* =====================================================================
   Planning partagé en ligne (Firebase : Authentication + Firestore)

   - Chaque personne (agences, moniteurs) se connecte avec son e-mail.
   - Toutes les modifications sont envoyées en ligne et apparaissent
     en direct chez les autres.
   - Fonctionne aussi hors connexion : les changements partent dès
     que le réseau revient.

   Deux niveaux d'accès (protégés par les règles Firebase) :
     - direction / secrétariat : tout ;
     - moniteur : uniquement SES séances, le nom et le téléphone des élèves,
       la liste des auto-écoles et des moniteurs. Il peut noter les présences
       et les résultats, rien d'autre.

   Organisation dans Firestore :
     ecole/config     → paramètres, auto-écoles, moniteurs, prestations (direction)
     ecole/compteur   → dernier numéro de facture (direction)
     ecole/roles      → qui est direction / moniteur (lu par les moniteurs)
     ecole/public     → auto-écoles (nom, couleur), moniteurs, réglages du planning
     eleves_planning/{id} → nom, prénom, téléphone, auto-école de chaque élève
     eleves/{id}, seances/{id}, factures/{id}, paiements/{id}, contrats/{id}
     motos/{id}, pleins/{id} → flotte de motos et pleins d'essence
   ===================================================================== */
'use strict';

const CLOUD_CFG_KEY = 'motoplanning_firebase';
const CLOUD_COLLS = ['eleves', 'seances', 'factures', 'paiements', 'contrats', 'suivi', 'motos', 'pleins'];
const CLOUD_CONFIG_KEYS = ['version', 'settings', 'entreprise', 'agences', 'moniteurs', 'prestations', 'modeles'];

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

const ROLE_CACHE_KEY = 'motoplanning_role';

const Cloud = {
  enabled: false,   // une configuration Firebase existe
  user: null,       // utilisateur connecté
  role: null,       // 'admin' (direction) ou 'moniteur'
  monId: null,      // pour un moniteur : son identifiant dans la liste des moniteurs
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
    this.auth.onAuthStateChanged(async (u) => {
      this.user = u;
      this.stop();
      this.role = null; this.monId = null;
      if (u) {
        try {
          await this.detecterRole();
          this.error = '';
          this.subscribe();
        } catch (e) {
          this.error = this.messageErreur(e);
        }
      }
      this.onState();
    });
    return true;
  },

  messageErreur(e) {
    return /permission/i.test((e && (e.code + ' ' + e.message)) || '')
      ? "Ce compte n'a pas accès au planning. Demandez à la direction de vous donner l'accès (Paramètres → Accès à l'appli)."
      : 'Connexion au planning impossible : ' + (e && e.message);
  },

  // Direction si on peut lire la configuration interne ; sinon moniteur si l'e-mail est dans la liste des rôles
  async detecterRole() {
    const email = (this.user.email || '').toLowerCase();
    const cache = () => { try { return JSON.parse(localStorage.getItem(ROLE_CACHE_KEY) || 'null'); } catch (e) { return null; } };
    const memo = (role, monId) => { try { localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify({ email, role, monId })); } catch (e) { /* */ } };
    try {
      await this.fs.collection('ecole').doc('config').get();
      this.role = 'admin'; memo('admin'); return;
    } catch (e) {
      if (!/permission/i.test(e.code + ' ' + e.message)) {
        const c = cache(); // hors connexion : on reprend le dernier rôle connu
        if (c && c.email === email) { this.role = c.role; this.monId = c.monId || null; return; }
        throw e;
      }
    }
    const d = (await this.fs.collection('ecole').doc('roles').get()).data() || {};
    if ((d.moniteurs || []).includes(email) && d.moniteurIds && d.moniteurIds[email]) {
      this.role = 'moniteur'; this.monId = d.moniteurIds[email]; memo('moniteur', this.monId); return;
    }
    throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
  },

  login(email, password) { return this.auth.signInWithEmailAndPassword(email.trim(), password); },
  // Déconnexion : on efface aussi les données gardées sur l'appareil (confidentialité)
  async logout() {
    this.deconnexion = true; // plus aucune écriture locale à partir d'ici
    this.stop();
    const effacer = () => { try { localStorage.removeItem('motoplanning_v1'); localStorage.removeItem(ROLE_CACHE_KEY); } catch (e) { /* */ } };
    effacer();
    try { await this.auth.signOut(); } catch (e) { /* */ }
    const delai = (ms) => new Promise((r) => setTimeout(r, ms));
    try { await Promise.race([this.fs.terminate().then(() => this.fs.clearPersistence()), delai(3000)]); } catch (e) { /* */ }
    effacer();
    location.reload();
  },
  resetPassword(email) { return this.auth.sendPasswordResetEmail(email.trim()); },

  // Crée le compte de connexion d'une autre personne sans déconnecter la direction
  async creerCompte(email, motDePasse) {
    const cfg = this.config();
    const app2 = firebase.apps.find((a) => a.name === 'creation') || firebase.initializeApp(cfg, 'creation');
    const auth2 = app2.auth();
    if (cfg.emulator && !auth2._emuOk) { auth2.useEmulator(`http://${cfg.emulator.auth}`, { disableWarnings: true }); auth2._emuOk = true; }
    try {
      await auth2.createUserWithEmailAndPassword(email.trim(), motDePasse);
      return 'cree';
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') return 'existe';
      throw e;
    } finally {
      try { await auth2.signOut(); } catch (e) { /* */ }
    }
  },

  stop() {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.ready = false;
    this.empty = false;
    this.remote = { config: null, compteur: 0, public: null, roles: null };
    this.synced = { config: null, public: null, roles: null };
    for (const c of [...CLOUD_COLLS, 'eleves_planning']) { this.remote[c] = new Map(); this.synced[c] = new Map(); }
  },

  subscribe() {
    const admin = this.role === 'admin';
    const attendus = new Set(admin ? ['config', 'compteur', 'public', 'roles', 'eleves_planning', ...CLOUD_COLLS] : ['public', 'eleves_planning', 'seances', 'suivi', 'motos', 'pleins']);
    const recu = (k) => {
      attendus.delete(k);
      if (attendus.size) return;
      const premier = !this.ready;
      if (premier) this.empty = admin && !this.remote.config;
      if (!this.empty) this.onChange(this.compose()); // données prêtes avant le premier affichage
      if (premier) { this.ready = true; this.onState(); }
    };
    const onErr = (e) => {
      if (/permission/i.test(e.code + ' ' + e.message)) return this.perdreAcces();
      this.error = this.messageErreur(e); this.onState();
    };
    const doc = (nom, cle, apres) => this.unsubs.push(this.fs.collection('ecole').doc(nom).onSnapshot((d) => {
      this.remote[cle] = d.exists ? d.data() : null;
      if (cle in this.synced) this.synced[cle] = d.exists ? stableStringify(d.data()) : null;
      if (apres) apres(d);
      recu(cle);
    }, onErr));
    const coll = (nom, requete) => this.unsubs.push((requete || this.fs.collection(nom)).onSnapshot((snap) => {
      snap.docChanges().forEach((ch) => {
        if (ch.type === 'removed') { this.remote[nom].delete(ch.doc.id); this.synced[nom].delete(ch.doc.id); }
        else { this.remote[nom].set(ch.doc.id, ch.doc.data()); this.synced[nom].set(ch.doc.id, stableStringify(ch.doc.data())); }
      });
      recu(nom);
    }, onErr));

    doc('public', 'public');
    coll('eleves_planning');
    if (admin) {
      doc('config', 'config', (d) => { if (d.exists && this.ready && this.empty) { this.empty = false; this.onState(); } });
      this.unsubs.push(this.fs.collection('ecole').doc('compteur').onSnapshot((d) => {
        this.remote.compteur = d.exists ? Number(d.data().n) || 0 : 0;
        this.remote.compteurs = d.exists ? Object.fromEntries(Object.entries(d.data()).filter(([k]) => k.startsWith('a_'))) : {};
        recu('compteur');
      }, onErr));
      doc('roles', 'roles');
      for (const c of CLOUD_COLLS) coll(c);
    } else {
      coll('seances', this.fs.collection('seances').where('moniteurId', '==', this.monId));
      coll('suivi'); // fiche de suivi : lue par tous les moniteurs, chacun écrit les siens
      coll('motos'); coll('pleins'); // flotte : tout le monde note les pleins et où sont les motos
      // Si la direction retire l'accès, l'appli se ferme aussitôt
      const email = (this.user.email || '').toLowerCase();
      this.unsubs.push(this.fs.collection('ecole').doc('roles').onSnapshot((d) => {
        const r = d.data() || {};
        if (!(r.moniteurs || []).includes(email) || (r.moniteurIds || {})[email] !== this.monId) this.perdreAcces();
      }, onErr));
    }
  },

  // Accès retiré (ou jamais donné) : on ferme et on efface les données gardées sur l'appareil
  perdreAcces() {
    this.stop();
    this.role = null;
    this.error = this.messageErreur({ code: 'permission-denied' });
    try { localStorage.removeItem('motoplanning_v1'); localStorage.removeItem(ROLE_CACHE_KEY); } catch (e) { /* */ }
    this.onState();
  },

  // Reconstitue la base à partir de la copie en ligne
  compose() {
    if (this.role !== 'admin') {
      const pub = this.remote.public || {};
      return {
        version: 2,
        settings: clean(pub.settings || {}),
        entreprise: {},
        agences: clean(pub.agences || []),
        moniteurs: clean(pub.moniteurs || []),
        prestations: [], modeles: [], factures: [], paiements: [], contrats: [],
        suivi: [...this.remote.suivi.values()].map(clean),
        motos: [...this.remote.motos.values()].map(clean),
        pleins: [...this.remote.pleins.values()].map(clean),
        eleves: [...this.remote.eleves_planning.values()].map(clean),
        seances: [...this.remote.seances.values()].map(clean),
      };
    }
    const db = clean(this.remote.config || {});
    db.entreprise = Object.assign({}, db.entreprise || {}, { compteur: this.remote.compteur, compteurs: this.remote.compteurs || {} });
    for (const c of CLOUD_COLLS) db[c] = [...this.remote[c].values()].map(clean);
    return db;
  },

  // Ce que les moniteurs ont le droit de voir, calculé à partir de la base complète
  derive(db) {
    const low = (x) => String(x || '').trim().toLowerCase();
    const avecAcces = (db.moniteurs || []).filter((m) => m.email);
    return {
      roles: {
        admins: [...new Set(((db.settings && db.settings.acces && db.settings.acces.admins) || []).map(low).filter(Boolean))],
        moniteurs: avecAcces.map((m) => low(m.email)),
        moniteurIds: Object.fromEntries(avecAcces.map((m) => [low(m.email), m.id])),
      },
      public: {
        agences: (db.agences || []).map((a) => ({ id: a.id, nom: a.nom || '', couleur: a.couleur || '', adresse: a.adresse || '', cp: a.cp || '', ville: a.ville || '', tel: a.tel || '' })),
        moniteurs: (db.moniteurs || []).map((m) => ({ id: m.id, prenom: m.prenom || '', nom: m.nom || '', couleur: m.couleur || '' })),
        settings: {
          capacite: (db.settings && db.settings.capacite) || {},
          dureeDefaut: (db.settings && db.settings.dureeDefaut) || {},
          heureMin: (db.settings && db.settings.heureMin) || '07:00',
          heureMax: (db.settings && db.settings.heureMax) || '20:00',
        },
      },
      eleves_planning: (db.eleves || []).map((e) => ({ id: e.id, nom: e.nom || '', prenom: e.prenom || '', agenceId: e.agenceId || '', tel: e.tel || '', formation: e.formation || '', statut: e.statut || '' })),
    };
  },

  // Envoie en ligne uniquement ce qui a changé
  async push(db) {
    if (!this.ready || this.empty || !this.user) return;
    const ops = [];
    if (this.role !== 'admin') {
      // Moniteur : seulement les présences / résultats de ses séances
      for (const item of db.seances) {
        if (!this.synced.seances.has(item.id)) continue;
        const s = stableStringify(clean(item));
        if (this.synced.seances.get(item.id) !== s) { ops.push(['update', this.fs.collection('seances').doc(item.id), { eleves: clean(item.eleves) }]); this.synced.seances.set(item.id, s); }
      }
      // … et ses propres commentaires de suivi
      const moi = (this.user.email || '').toLowerCase();
      const ids = new Set();
      for (const item of db.suivi || []) {
        if (item.auteur !== moi) continue;
        ids.add(item.id);
        const s = stableStringify(clean(item));
        if (this.synced.suivi.get(item.id) !== s) { ops.push(['set', this.fs.collection('suivi').doc(item.id), clean(item)]); this.synced.suivi.set(item.id, s); }
      }
      for (const [id, s] of [...this.synced.suivi.entries()]) {
        if (!ids.has(id) && JSON.parse(s).auteur === moi) { ops.push(['delete', this.fs.collection('suivi').doc(id)]); this.synced.suivi.delete(id); }
      }
      // … où sont les motos (emplacement / compteur uniquement)
      for (const m of db.motos || []) {
        if (!this.synced.motos.has(m.id)) continue;
        const s = stableStringify(clean(m));
        if (this.synced.motos.get(m.id) !== s) {
          const champs = clean({ emplacement: m.emplacement || {}, km: m.km ?? '', majLe: m.majLe || '', majPar: m.majPar || '' });
          ops.push(['update', this.fs.collection('motos').doc(m.id), champs]); this.synced.motos.set(m.id, s);
        }
      }
      // … et ses propres pleins d'essence
      const idsP = new Set();
      for (const p of db.pleins || []) {
        if (p.auteur !== moi) continue;
        idsP.add(p.id);
        const s = stableStringify(clean(p));
        if (this.synced.pleins.get(p.id) !== s) { ops.push(['set', this.fs.collection('pleins').doc(p.id), clean(p)]); this.synced.pleins.set(p.id, s); }
      }
      for (const [id, s] of [...this.synced.pleins.entries()]) {
        if (!idsP.has(id) && JSON.parse(s).auteur === moi) { ops.push(['delete', this.fs.collection('pleins').doc(id)]); this.synced.pleins.delete(id); }
      }
    } else {
      const cfg = {};
      for (const k of CLOUD_CONFIG_KEYS) cfg[k] = db[k];
      cfg.entreprise = Object.assign({}, db.entreprise);
      delete cfg.entreprise.compteur; delete cfg.entreprise.compteurs;
      const sCfg = stableStringify(clean(cfg));
      if (sCfg !== this.synced.config) { ops.push(['set', this.fs.collection('ecole').doc('config'), clean(cfg)]); this.synced.config = sCfg; }
      const der = this.derive(db);
      for (const k of ['roles', 'public']) {
        const sK = stableStringify(der[k]);
        if (sK !== this.synced[k]) { ops.push(['set', this.fs.collection('ecole').doc(k), der[k]]); this.synced[k] = sK; }
      }
      const listes = Object.assign({}, ...CLOUD_COLLS.map((c) => ({ [c]: db[c] })), { eleves_planning: der.eleves_planning });
      for (const c of Object.keys(listes)) {
        const ids = new Set();
        for (const item of listes[c]) {
          ids.add(item.id);
          const s = stableStringify(clean(item));
          if (this.synced[c].get(item.id) !== s) { ops.push(['set', this.fs.collection(c).doc(item.id), clean(item)]); this.synced[c].set(item.id, s); }
        }
        for (const id of [...this.synced[c].keys()]) {
          if (!ids.has(id)) { ops.push(['delete', this.fs.collection(c).doc(id)]); this.synced[c].delete(id); }
        }
      }
    }
    for (let i = 0; i < ops.length; i += 450) {
      const batch = this.fs.batch();
      for (const [op, ref, data] of ops.slice(i, i + 450)) {
        if (op === 'set') batch.set(ref, data); else if (op === 'update') batch.update(ref, data); else batch.delete(ref);
      }
      await batch.commit();
    }
  },

  // Première mise en ligne : envoie toutes les données de cet appareil
  async upload(db) {
    this.empty = false;
    await this.fs.collection('ecole').doc('compteur').set({ n: Number(db.entreprise?.compteur) || 0, ...(db.entreprise?.compteurs || {}) });
    this.synced.config = null;
    await this.push(db);
    this.onState();
  },

  // Numéro de facture suivant, sans doublon même si deux agences facturent en même temps
  // cle : 'n' (suite commune) ou 'a_<auto-école>' (une suite par auto-école)
  async nextNumero(cle = 'n') {
    const ref = this.fs.collection('ecole').doc('compteur');
    return this.fs.runTransaction(async (t) => {
      const d = await t.get(ref);
      const n = (d.exists ? Number(d.data()[cle]) || 0 : 0) + 1;
      t.set(ref, { [cle]: n }, { merge: true });
      return n;
    });
  },
  setCompteur(n, cle = 'n') { return this.fs.collection('ecole').doc('compteur').set({ [cle]: Number(n) || 0 }, { merge: true }); },

  get actif() { return this.enabled && this.user && this.ready && !this.empty; },
  get moniteur() { return this.actif && this.role === 'moniteur'; },
};
