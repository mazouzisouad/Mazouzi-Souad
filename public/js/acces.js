/* ==========================================================================
   acces.js : comptes élèves, accès payant et progression en ligne.

   À inclure dans l'appli, dans <head>, AVANT ses propres scripts :
     <script src="/api/config"></script>
     <script src="/vendor/supabase.js"></script>
     <script src="/js/acces.js"></script>

   Progression : l'appli continue d'utiliser localStorage comme avant.
   Ce script recopie automatiquement localStorage dans Supabase (table
   « progression ») et le restaure sur un autre appareil. Aucune modification
   de l'appli n'est nécessaire pour la sauvegarde.

   API exposée : window.CodeAcces
     .pret                  Promise résolue quand l'état est connu
     .utilisateur           objet utilisateur Supabase ou null
     .premium               true si l'accès complet est actif
     .expireLe              Date de fin d'accès ou null
     .surChangement(fn)     appelle fn(etat) à chaque changement
     .exigerPremium()       renvoie true, sinon propose de payer et renvoie false
     .sauvegarderMaintenant()
     .deconnexion()
   ========================================================================== */
(function () {
  'use strict';

  var CLE_SYNC = '__ca_sync';           // métadonnées de synchro (non synchronisées)
  var CLE_RECHARGE = '__ca_recharge';   // évite les rechargements en boucle
  var CLE_ETAT = '__ca_etat';           // dernier statut connu (affichage immédiat)
  var DELAI_ENVOI = 1500;               // ms : regroupe les écritures rapides

  var cfg = window.SITE_CONFIG || {};
  var etat = { utilisateur: null, premium: false, expireLe: null, configure: !!(cfg.supabaseUrl && cfg.supabaseAnonKey) };
  var ecouteurs = [];
  try { // affichage immédiat du dernier statut connu, confirmé ensuite par le serveur
    var cache = JSON.parse(localStorage.getItem(CLE_ETAT) || 'null');
    if (cache && cache.expireLe && new Date(cache.expireLe) > new Date()) {
      etat.premium = true; etat.expireLe = new Date(cache.expireLe);
    }
  } catch (e) {}
  var sb = null;
  var synchroFaite = false;  // n'envoie rien avant d'avoir lu la version en ligne

  // Copie des fonctions natives AVANT de les surveiller
  var stockage = window.localStorage;
  var natif = {
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
  };

  function cleSynchronisable(k) {
    return k && k.indexOf('__ca_') !== 0 && k.indexOf('sb-') !== 0 && k.indexOf('supabase.') !== 0;
  }
  function lireMeta() {
    try { return JSON.parse(stockage.getItem(CLE_SYNC)) || {}; } catch (e) { return {}; }
  }
  function ecrireMeta(m) {
    try { natif.setItem.call(stockage, CLE_SYNC, JSON.stringify(m)); } catch (e) {}
  }
  function instantane() {
    var o = {};
    for (var i = 0; i < stockage.length; i++) {
      var k = stockage.key(i);
      if (cleSynchronisable(k)) o[k] = stockage.getItem(k);
    }
    return o;
  }
  function appliquer(donnees) {
    var k, a_supprimer = [];
    for (var i = 0; i < stockage.length; i++) {
      k = stockage.key(i);
      if (cleSynchronisable(k) && !(k in donnees)) a_supprimer.push(k);
    }
    a_supprimer.forEach(function (c) { natif.removeItem.call(stockage, c); });
    for (k in donnees) if (cleSynchronisable(k)) natif.setItem.call(stockage, k, donnees[k]);
  }
  function memeContenu(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) if (a[ka[i]] !== b[ka[i]]) return false;
    return true;
  }

  function notifier() {
    var copie = { utilisateur: etat.utilisateur, premium: etat.premium, expireLe: etat.expireLe };
    ecouteurs.forEach(function (fn) { try { fn(copie); } catch (e) { console.error(e); } });
    try { window.dispatchEvent(new CustomEvent('codeacces', { detail: copie })); } catch (e) {}
    majBadge();
  }

  // ---------- Surveillance de localStorage ----------
  var minuterie = null;
  function marquerModifie(k) {
    if (!cleSynchronisable(k)) return;
    var m = lireMeta(); m.modifie = true; ecrireMeta(m);
    if (!etat.utilisateur || !synchroFaite) return;
    clearTimeout(minuterie);
    minuterie = setTimeout(envoyer, DELAI_ENVOI);
  }
  Storage.prototype.setItem = function (k, v) {
    natif.setItem.call(this, k, v);
    if (this === stockage) marquerModifie(String(k));
  };
  Storage.prototype.removeItem = function (k) {
    natif.removeItem.call(this, k);
    if (this === stockage) marquerModifie(String(k));
  };
  Storage.prototype.clear = function () {
    // Ne pas effacer la session de connexion avec la progression
    if (this !== stockage) return natif.clear.call(this);
    Object.keys(instantane()).forEach(function (k) { natif.removeItem.call(stockage, k); });
    marquerModifie('clear');
  };

  var envoiEnCours = null;
  function envoyer(force) {
    if (!sb || !etat.utilisateur || (!synchroFaite && force !== true)) return Promise.resolve();
    clearTimeout(minuterie);
    var donnees = instantane();
    var maintenant = new Date().toISOString();
    envoiEnCours = sb.from('progression')
      .upsert({ user_id: etat.utilisateur.id, donnees: donnees, mis_a_jour: maintenant })
      .then(function (r) {
        if (r.error) throw r.error;
        ecrireMeta({ modifie: false, distant: maintenant, user: etat.utilisateur.id });
      })
      .catch(function (e) { console.warn('[CodeAcces] sauvegarde en ligne impossible', e); });
    return envoiEnCours;
  }

  // Envoi de secours quand on quitte la page (si une sauvegarde est en attente)
  function envoiFinal() {
    if (!etat.utilisateur || !synchroFaite || !lireMeta().modifie) return;
    envoyer();
  }
  window.addEventListener('pagehide', envoiFinal);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') envoiFinal();
  });

  // ---------- Récupération de la progression en ligne ----------
  function synchroniserAuDemarrage() {
    var uid = etat.utilisateur.id;
    synchroFaite = false;
    return sb.from('progression').select('donnees, mis_a_jour').eq('user_id', uid).maybeSingle()
      .then(function (r) {
        if (r.error) throw r.error;
        var meta = lireMeta();
        var local = instantane();
        var distant = r.data;

        if (!distant) {                              // rien en ligne : on envoie ce qu'on a
          if (Object.keys(local).length) return envoyer(true);
          return;
        }
        var memeCompte = meta.user === uid;
        var distantPlusRecent = !memeCompte || !meta.distant || new Date(distant.mis_a_jour) > new Date(meta.distant);

        if (memeCompte && meta.modifie && !distantPlusRecent) return envoyer(true); // modifs locales hors ligne
        if (!distantPlusRecent) return;
        if (memeContenu(local, distant.donnees || {})) {
          ecrireMeta({ modifie: false, distant: distant.mis_a_jour, user: uid });
          return;
        }
        // La version en ligne est plus récente (autre appareil) : on la reprend
        // et on recharge une fois pour que l'appli relise sa progression.
        appliquer(distant.donnees || {});
        ecrireMeta({ modifie: false, distant: distant.mis_a_jour, user: uid });
        if (!sessionStorage.getItem(CLE_RECHARGE)) {
          sessionStorage.setItem(CLE_RECHARGE, '1');
          location.reload();
          return new Promise(function () {}); // la page se recharge
        }
      })
      .catch(function (e) { console.warn('[CodeAcces] lecture de la progression impossible', e); })
      .then(function () {
        sessionStorage.removeItem(CLE_RECHARGE);
        synchroFaite = true;
        if (lireMeta().modifie) { clearTimeout(minuterie); minuterie = setTimeout(envoyer, DELAI_ENVOI); }
      });
  }

  // ---------- Accès payant ----------
  function chargerAcces() {
    if (!etat.utilisateur) {
      etat.premium = false; etat.expireLe = null;
      natif.removeItem.call(stockage, CLE_ETAT);
      return Promise.resolve();
    }
    return sb.from('acces').select('expire_le').eq('user_id', etat.utilisateur.id).maybeSingle()
      .then(function (r) {
        var fin = r.data && r.data.expire_le ? new Date(r.data.expire_le) : null;
        etat.expireLe = fin;
        etat.premium = !!(fin && fin > new Date());
        try { natif.setItem.call(stockage, CLE_ETAT, JSON.stringify({ expireLe: fin })); } catch (e) {}
      });
  }

  // ---------- Petit bandeau compte (coin de l'écran) ----------
  var badge = null;
  function majBadge() {
    if (document.documentElement.hasAttribute('data-ca-sans-badge')) return;
    if (!document.body) return;
    if (!badge) {
      badge = document.createElement('a');
      badge.id = 'ca-badge';
      badge.href = '/compte';
      badge.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;padding:8px 12px;border-radius:999px;' +
        'font:600 13px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-decoration:none;' +
        'box-shadow:0 2px 10px rgba(0,0,0,.18);background:#fff;color:#1a3a6b;border:1px solid rgba(0,0,0,.08)';
      document.body.appendChild(badge);
    }
    if (!etat.configure) { badge.textContent = '⚙︎ Site non configuré'; return; }
    if (!etat.utilisateur) badge.textContent = '👤 Se connecter';
    else if (etat.premium) badge.textContent = '✅ Accès complet';
    else badge.textContent = '🔓 Débloquer tout (9,90 €)';
  }

  // ---------- Fenêtre « accès réservé » ----------
  function proposerPaiement() {
    var deja = document.getElementById('ca-modale');
    if (deja) { deja.style.display = 'flex'; return; }
    var fond = document.createElement('div');
    fond.id = 'ca-modale';
    fond.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(10,20,40,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    var connecte = !!etat.utilisateur;
    fond.innerHTML =
      '<div role="dialog" aria-modal="true" style="max-width:380px;width:100%;background:#fff;color:#1b2433;border-radius:16px;padding:24px;' +
      'font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.3)">' +
      '<div style="font-size:32px">🔒</div>' +
      '<h2 style="margin:6px 0 8px;font-size:20px">Contenu réservé</h2>' +
      '<p style="margin:0 0 16px">Débloquez toutes les questions et séries pendant <b>3 mois</b> pour <b>9,90 €</b>, sans abonnement.</p>' +
      '<a href="' + (connecte ? '/compte' : '/connexion?suite=/compte') + '" style="display:block;text-align:center;background:#1a3a6b;color:#fff;' +
      'padding:12px;border-radius:10px;text-decoration:none;font-weight:600">' + (connecte ? 'Débloquer l’accès' : 'Créer un compte / Se connecter') + '</a>' +
      '<button type="button" style="display:block;width:100%;margin-top:8px;background:none;border:0;color:#556;padding:10px;font:inherit;cursor:pointer">Plus tard</button></div>';
    fond.addEventListener('click', function (e) {
      if (e.target === fond || e.target.tagName === 'BUTTON') fond.style.display = 'none';
    });
    document.body.appendChild(fond);
  }

  // ---------- Démarrage ----------
  var resoudrePret;
  var pret = new Promise(function (r) { resoudrePret = r; });

  function demarrer() {
    if (!etat.configure || !window.supabase) {
      etat.premium = false; etat.expireLe = null;
      console.warn('[CodeAcces] Supabase non configuré : mode hors ligne.');
      resoudrePret(); notifier(); return;
    }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });

    sb.auth.getSession().then(function (r) {
      etat.utilisateur = r.data.session ? r.data.session.user : null;
      if (!etat.utilisateur) return chargerAcces(); // efface un statut en cache
      return Promise.all([chargerAcces(), synchroniserAuDemarrage()]);
    }).catch(function (e) { console.warn('[CodeAcces]', e); })
      .then(function () { resoudrePret(); notifier(); });

    sb.auth.onAuthStateChange(function (evt, session) {
      var avant = etat.utilisateur && etat.utilisateur.id;
      etat.utilisateur = session ? session.user : null;
      var apres = etat.utilisateur && etat.utilisateur.id;
      if (avant === apres) return;
      setTimeout(function () { // hors du callback (recommandation Supabase)
        if (!apres) synchroFaite = false;
        (apres ? Promise.all([chargerAcces(), synchroniserAuDemarrage()]) : chargerAcces())
          .then(notifier);
      }, 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', majBadge);
  demarrer();

  window.CodeAcces = {
    pret: pret,
    get client() { return sb; },
    get utilisateur() { return etat.utilisateur; },
    get premium() { return etat.premium; },
    get expireLe() { return etat.expireLe; },
    get configure() { return etat.configure; },
    surChangement: function (fn) { ecouteurs.push(fn); },
    exigerPremium: function () { if (etat.premium) return true; proposerPaiement(); return false; },
    rafraichirAcces: function () { return chargerAcces().then(notifier); },
    sauvegarderMaintenant: function () { return envoyer(); },
    jeton: function () {
      return sb ? sb.auth.getSession().then(function (r) { return r.data.session && r.data.session.access_token; }) : Promise.resolve(null);
    },
    deconnexion: function () {
      var p = lireMeta().modifie ? envoyer() : Promise.resolve();
      return p.then(function () { return sb && sb.auth.signOut(); }).then(function () {
        // La progression de l'élève ne reste pas sur un appareil partagé
        Object.keys(instantane()).forEach(function (k) { natif.removeItem.call(stockage, k); });
        natif.removeItem.call(stockage, CLE_SYNC);
        natif.removeItem.call(stockage, CLE_ETAT);
        etat.premium = false; etat.expireLe = null;
      });
    },
  };
})();
