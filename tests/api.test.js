// Tests des fonctions serverless avec un faux Supabase local (aucun vrai service appelé).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Readable } from 'node:stream';
import Stripe from 'stripe';

const appels = [];
let faux;
before(async () => {
  faux = http.createServer((req, res) => {
    let corps = '';
    req.on('data', (c) => (corps += c));
    req.on('end', () => {
      appels.push({ url: req.url, corps: corps ? JSON.parse(corps) : null, auth: req.headers.authorization });
      res.setHeader('Content-Type', 'application/json');
      if (req.url.startsWith('/auth/v1/user')) {
        if (req.headers.authorization === 'Bearer bon-jeton') return res.end(JSON.stringify({ id: 'u-123', email: 'eleve@example.com', email_confirmed_at: '2026-01-01' }));
        if (req.headers.authorization === 'Bearer jeton-admin') return res.end(JSON.stringify({ id: 'u-adm', email: 'Gerant@AutoEcole.fr', email_confirmed_at: '2026-01-01' }));
        res.statusCode = 401; return res.end(JSON.stringify({ msg: 'invalid' }));
      }
      if (req.url.startsWith('/brevo')) {
        globalThis.EMAILS = (globalThis.EMAILS || []).concat([{ cle: req.headers['api-key'], corps: JSON.parse(corps) }]);
        if (globalThis.BREVO_EN_PANNE) { res.statusCode = 500; return res.end('{}'); }
        res.statusCode = 201; return res.end('{"messageId":"1"}');
      }
      if (req.url.startsWith('/rest/v1/rpc/rappels_a_envoyer')) return res.end(JSON.stringify(globalThis.CANDIDATS || []));
      if (req.url.startsWith('/rest/v1/rappels_envoyes')) {
        globalThis.RESERVES = globalThis.RESERVES || new Set();
        if (req.method === 'DELETE') { globalThis.SUPPRIMES = (globalThis.SUPPRIMES || 0) + 1; res.statusCode = 204; return res.end(); }
        const r = JSON.parse(corps), k = r.user_id + r.type + r.cle;
        if (globalThis.RESERVES.has(k)) { res.statusCode = 409; return res.end(JSON.stringify({ code: '23505', message: 'duplicate key' })); }
        globalThis.RESERVES.add(k); res.statusCode = 201; return res.end();
      }
      if (req.url.startsWith('/rest/v1/rpc/desinscrire')) return res.end(JSON.stringify(JSON.parse(corps).p_jeton === '11111111-2222-3333-4444-555555555555'));
      if (req.url.startsWith('/rest/v1/rpc/stats_admin')) return res.end(JSON.stringify({ total_centimes: 1980, nb_paiements: 2 }));
      if (req.url.startsWith('/rest/v1/rpc/rembourser') || req.url.startsWith('/rest/v1/rpc/lier_payment_intent')) return res.end('true');
      if (req.url.startsWith('/rest/v1/rpc/recompenser_parrain')) return res.end('null');
      if (req.url.startsWith('/rest/v1/acces')) {
        const ligne = globalThis.EXPIRE_LE ? { expire_le: globalThis.EXPIRE_LE } : null;
        const objet = (req.headers.accept || '').includes('vnd.pgrst.object');
        return res.end(JSON.stringify(objet ? ligne : (ligne ? [ligne] : [])));
      }
      if (req.url.startsWith('/rest/v1/rpc/accorder_acces')) return res.end(JSON.stringify('2027-02-22T10:00:00+00:00'));
      if (req.url.startsWith('/rest/v1/rpc/activer_code')) {
        const c = JSON.parse(corps);
        if (c.p_empreinte === globalThis.EMPREINTE_DEJA_UTILISEE) {
          res.statusCode = 400; return res.end(JSON.stringify({ code: 'P0001', message: 'deja_utilise' }));
        }
        return res.end(JSON.stringify('2027-02-22T10:00:00+00:00'));
      }
      res.statusCode = 404; res.end('{}');
    });
  }).listen(0);
  await new Promise((r) => faux.on('listening', r));
  process.env.SUPABASE_URL = `http://127.0.0.1:${faux.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'cle-service';
  process.env.SUPABASE_ANON_KEY = 'cle-anon';
  process.env.STRIPE_SECRET_KEY = 'sk_test_faux';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  process.env.CRON_SECRET = 'secret-cron';
  process.env.BREVO_API_KEY = 'cle-brevo';
  process.env.BREVO_API_URL = `${process.env.SUPABASE_URL}/brevo`;
  process.env.EMAIL_EXPEDITEUR = 'bonjour@code-ludique.fr';
  process.env.SITE_URL = 'https://code-ludique.fr';
  process.env.ADMIN_EMAILS = 'gerant@autoecole.fr, autre@x.fr';
});
after(() => faux.close());

function requete({ method = 'POST', headers = {}, corps = '', url = '/' }) {
  const req = Readable.from([Buffer.from(corps)]);
  Object.assign(req, { method, headers, url });
  return req;
}
function reponse() {
  return {
    statusCode: 200, entetes: {}, corps: '',
    setHeader(k, v) { this.entetes[k.toLowerCase()] = v; },
    end(c) { this.corps = c || ''; this.fini = true; },
  };
}
function evenementSigne(session) {
  const charge = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: session } });
  const sig = Stripe.webhooks.generateTestHeaderString({ payload: charge, secret: process.env.STRIPE_WEBHOOK_SECRET });
  return { charge, sig };
}
function evenementType(type, objet) {
  const charge = JSON.stringify({ id: 'evt_2', object: 'event', type, data: { object: objet } });
  return { charge, sig: Stripe.webhooks.generateTestHeaderString({ payload: charge, secret: process.env.STRIPE_WEBHOOK_SECRET }) };
}
const sessionPayee = {
  id: 'cs_test_abc', object: 'checkout.session', mode: 'payment', payment_status: 'paid',
  amount_total: 990, currency: 'eur', client_reference_id: 'u-123',
  metadata: { user_id: 'u-123', renonciation_le: '2026-11-22T10:00:00.000Z' },
  customer_details: { email: 'eleve@example.com' },
};

test('webhook : signature valide + paiement payé → accès accordé', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne(sessionPayee);
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(res.statusCode, 200, res.corps);
  const rpc = appels.find((a) => a.url.includes('accorder_acces'));
  assert.ok(rpc, 'accorder_acces appelé');
  assert.deepEqual(rpc.corps, {
    p_session_id: 'cs_test_abc', p_user_id: 'u-123', p_email: 'eleve@example.com',
    p_montant: 990, p_devise: 'eur', p_renonciation: '2026-11-22T10:00:00.000Z',
  });
  assert.equal(rpc.auth, 'Bearer cle-service');
});

test('webhook : signature falsifiée → 400, rien accordé', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge } = evenementSigne(sessionPayee);
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': 't=1,v1=faux' }, corps: charge }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(appels.length, 0);
});

test('webhook : paiement non finalisé → ignoré', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne({ ...sessionPayee, payment_status: 'unpaid' });
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(appels.length, 0);
});

test('webhook : mauvais montant → erreur 500, rien accordé', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne({ ...sessionPayee, amount_total: 1 });
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(res.statusCode, 500);
  assert.equal(appels.filter((a) => a.url.includes('accorder_acces')).length, 0);
});

test('creer-paiement : non connecté → 401', async () => {
  const { default: creer } = await import('../api/creer-paiement.js');
  const res = reponse();
  await creer(requete({ headers: { authorization: 'Bearer mauvais' }, corps: '{"cgv":true,"renonciation":true}' }), res);
  assert.equal(res.statusCode, 401);
});

test('creer-paiement : cases non cochées → 400', async () => {
  const { default: creer } = await import('../api/creer-paiement.js');
  const res = reponse();
  await creer(requete({ headers: { authorization: 'Bearer bon-jeton' }, corps: '{"cgv":true}' }), res);
  assert.equal(res.statusCode, 400);
});

test('verifier-paiement : identifiant de session invalide → 400', async () => {
  const { default: verifier } = await import('../api/verifier-paiement.js');
  const res = reponse();
  await verifier(requete({ headers: { authorization: 'Bearer bon-jeton' }, url: '/api/verifier-paiement?session_id=../x' }), res);
  assert.equal(res.statusCode, 400);
});

test('config : ne sert que les clés publiques', async () => {
  const { default: config } = await import('../api/config.js');
  const res = reponse();
  config(requete({ method: 'GET' }), res);
  assert.match(res.corps, /cle-anon/);
  assert.doesNotMatch(res.corps, /cle-service|sk_test|whsec/);
});

test('activer-code : code inconnu → 400, aucun appel base', async () => {
  const { default: activer } = await import('../api/activer-code.js');
  appels.length = 0;
  const res = reponse();
  await activer(requete({ headers: { authorization: 'Bearer bon-jeton' }, corps: '{"code":"FAUX-123"}' }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(appels.filter((a) => a.url.includes('activer_code')).length, 0);
});

test('activer-code : code valide (minuscules, espaces) → accès accordé au compte', async () => {
  const { EMPREINTES_CODES, cyrb53 } = await import('../api/_lib/codes.js');
  EMPREINTES_CODES.push(cyrb53('CODE-TEST42'), cyrb53('CODE-USAGE1'));
  globalThis.EMPREINTE_DEJA_UTILISEE = cyrb53('CODE-USAGE1');
  const { default: activer } = await import('../api/activer-code.js');
  appels.length = 0;
  let res = reponse();
  await activer(requete({ headers: { authorization: 'Bearer bon-jeton' }, corps: '{"code":" code-test42 "}' }), res);
  assert.equal(res.statusCode, 200, res.corps);
  const rpc = appels.find((a) => a.url.includes('activer_code'));
  assert.deepEqual(rpc.corps, { p_empreinte: cyrb53('CODE-TEST42'), p_user_id: 'u-123' });

  res = reponse();
  await activer(requete({ headers: { authorization: 'Bearer bon-jeton' }, corps: '{"code":"CODE-USAGE1"}' }), res);
  assert.equal(res.statusCode, 409);
  assert.match(res.corps, /déjà été utilisé/);
});

test('activer-code : non connecté → 401', async () => {
  const { default: activer } = await import('../api/activer-code.js');
  const res = reponse();
  await activer(requete({ headers: {}, corps: '{"code":"X"}' }), res);
  assert.equal(res.statusCode, 401);
});

test('cyrb53 serveur identique à celui de l’appli d’origine', async () => {
  const { cyrb53 } = await import('../api/_lib/codes.js');
  // version copiée telle quelle de l'appli d'origine
  function orig(s){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0,ch;i<s.length;i++){ch=s.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0);}
  for (const s of ['', 'CODE-ABC123', 'ÉCOLE-2026', 'x'.repeat(50)]) assert.equal(cyrb53(s), orig(s));
});

test('creer-paiement : annulation → retour à l’écran Accès complet de l’appli', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../api/creer-paiement.js', import.meta.url), 'utf8');
  assert.match(src, /cancel_url: `\$\{site\}\/\?ecran=premium&paiement=annule`/);
});

test('contenu : non connecté → 401', async () => {
  const { default: contenu } = await import('../api/contenu.js');
  const res = reponse();
  await contenu(requete({ method: 'GET', headers: {} }), res);
  assert.equal(res.statusCode, 401);
  assert.doesNotMatch(res.corps, /"questions"/);
});

test('contenu : connecté sans accès ou accès expiré → 403, aucun contenu', async () => {
  const { default: contenu } = await import('../api/contenu.js');
  for (const exp of [null, new Date(Date.now() - 1000).toISOString()]) {
    globalThis.EXPIRE_LE = exp;
    const res = reponse();
    await contenu(requete({ method: 'GET', headers: { authorization: 'Bearer bon-jeton' } }), res);
    assert.equal(res.statusCode, 403, String(exp));
    assert.doesNotMatch(res.corps, /"questions"/);
  }
});

test('contenu : accès actif → questions et fiches payantes, jamais en cache', async () => {
  const { default: contenu } = await import('../api/contenu.js');
  globalThis.EXPIRE_LE = new Date(Date.now() + 864e5).toISOString();
  const res = reponse();
  await contenu(requete({ method: 'GET', headers: { authorization: 'Bearer bon-jeton' } }), res);
  assert.equal(res.statusCode, 200, res.corps);
  const d = JSON.parse(res.corps);
  const { QUESTIONS_PREMIUM } = await import('../api/_lib/contenu-premium.js');
  assert.equal(Object.keys(d.questions).length, Object.keys(QUESTIONS_PREMIUM).length);
  assert.ok(Object.keys(d.questions).length >= 150);
  const { FICHES_PREMIUM } = await import('../api/_lib/contenu-premium.js');
  assert.equal(Object.keys(d.fiches).length, Object.keys(FICHES_PREMIUM).length);
  assert.equal(res.entetes['cache-control'], 'no-store');
});

test('webhook : paiement → payment_intent lié (pour les remboursements)', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne({ ...sessionPayee, payment_intent: 'pi_123' });
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(appels.find((a) => a.url.includes('lier_payment_intent')).corps, { p_session_id: 'cs_test_abc', p_payment_intent: 'pi_123' });
});

test('webhook : remboursement total → accès retiré ; partiel → ignoré', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  for (const [refunded, attendu] of [[true, 1], [false, 0]]) {
    const { charge, sig } = evenementType('charge.refunded', { id: 'ch_1', object: 'charge', refunded, payment_intent: 'pi_123' });
    appels.length = 0;
    const res = reponse();
    await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
    assert.equal(res.statusCode, 200);
    const r = appels.filter((a) => a.url.includes('rpc/rembourser'));
    assert.equal(r.length, attendu);
    if (attendu) assert.deepEqual(r[0].corps, { p_payment_intent: 'pi_123' });
  }
});

test('rappels : sans le secret du cron → 401, aucun e-mail', async () => {
  const { default: rappels } = await import('../api/rappels.js');
  globalThis.EMAILS = [];
  const res = reponse();
  await rappels(requete({ method: 'GET', headers: { authorization: 'Bearer faux' } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(globalThis.EMAILS.length, 0);
});

test('rappels : envoie chaque rappel une seule fois, avec lien de désinscription', async () => {
  const { default: rappels } = await import('../api/rappels.js');
  globalThis.EMAILS = []; globalThis.RESERVES = new Set();
  globalThis.CANDIDATS = [
    { user_id: 'u1', email: 'a@x.fr', type: 'inactivite', cle: '2026-11-18', jeton: '11111111-2222-3333-4444-555555555555', date_ref: new Date(Date.now() - 4 * 864e5).toISOString() },
    { user_id: 'u2', email: 'b@x.fr', type: 'fin_acces', cle: '2026-11-27', jeton: '66666666-2222-3333-4444-555555555555', date_ref: '2026-11-27T10:00:00Z' },
    { user_id: 'u3', email: 'c@x.fr', type: 'acces_termine', cle: '2026-11-20', jeton: '77777777-2222-3333-4444-555555555555', date_ref: '2026-11-20T10:00:00Z' },
  ];
  let res = reponse();
  await rappels(requete({ method: 'GET', headers: { authorization: 'Bearer secret-cron' } }), res);
  assert.equal(res.statusCode, 200, res.corps);
  assert.deepEqual(JSON.parse(res.corps), { envoyes: 3, deja: 0, erreurs: 0 });
  const [e1, e2, e3] = globalThis.EMAILS.map((e) => e.corps);
  assert.equal(globalThis.EMAILS[0].cle, 'cle-brevo');
  assert.equal(e1.to[0].email, 'a@x.fr');
  assert.match(e1.subject, /t’attend/);
  assert.match(e1.htmlContent, /4 jours/);
  assert.match(e1.htmlContent, /https:\/\/code-ludique\.fr\/api\/desinscription\?jeton=11111111/);
  assert.equal(e1.headers['List-Unsubscribe'], '<https://code-ludique.fr/api/desinscription?jeton=11111111-2222-3333-4444-555555555555>');
  assert.match(e2.subject, /se termine le 27 novembre/);
  assert.match(e3.subject, /est terminé/);
  assert.match(e3.textContent, /https:\/\/code-ludique\.fr\/compte/);
  // 2e passage le même jour : rien n'est renvoyé
  globalThis.EMAILS = [];
  res = reponse();
  await rappels(requete({ method: 'GET', headers: { authorization: 'Bearer secret-cron' } }), res);
  assert.deepEqual(JSON.parse(res.corps), { envoyes: 0, deja: 3, erreurs: 0 });
  assert.equal(globalThis.EMAILS.length, 0);
});

test('rappels : si Brevo échoue, la réservation est annulée (nouvel essai le lendemain)', async () => {
  const { default: rappels } = await import('../api/rappels.js');
  globalThis.RESERVES = new Set(); globalThis.SUPPRIMES = 0; globalThis.BREVO_EN_PANNE = true;
  globalThis.CANDIDATS = [{ user_id: 'u9', email: 'z@x.fr', type: 'inactivite', cle: 'k', jeton: '11111111-2222-3333-4444-555555555555', date_ref: new Date().toISOString() }];
  const res = reponse();
  await rappels(requete({ method: 'GET', headers: { authorization: 'Bearer secret-cron' } }), res);
  globalThis.BREVO_EN_PANNE = false;
  assert.deepEqual(JSON.parse(res.corps), { envoyes: 0, deja: 0, erreurs: 1 });
  assert.equal(globalThis.SUPPRIMES, 1);
});

test('rappels : contenu HTML échappé', async () => {
  const { htmlRappel } = await import('../api/_lib/emails.js');
  const h = htmlRappel({ titre: '<script>x</script>', texte: 'a & b', bouton: 'Go', lien: 'https://x.fr/?a=1&b=2' }, 'https://x.fr/d');
  assert.doesNotMatch(h, /<script>/);
  assert.match(h, /a &amp; b/);
});

test('désinscription : jeton valide → page de confirmation ; invalide → 400/404', async () => {
  const { default: des } = await import('../api/desinscription.js');
  let res = reponse();
  await des(requete({ method: 'GET', url: '/api/desinscription?jeton=11111111-2222-3333-4444-555555555555' }), res);
  assert.equal(res.statusCode, 200); assert.match(res.corps, /ne recevras plus/);
  res = reponse();
  await des(requete({ method: 'POST', url: '/api/desinscription?jeton=11111111-2222-3333-4444-555555555555' }), res);
  assert.equal(res.statusCode, 200); assert.equal(res.corps, 'OK');
  res = reponse();
  await des(requete({ method: 'GET', url: '/api/desinscription?jeton=99999999-2222-3333-4444-555555555555' }), res);
  assert.equal(res.statusCode, 404);
  res = reponse();
  await des(requete({ method: 'GET', url: '/api/desinscription?jeton=<script>' }), res);
  assert.equal(res.statusCode, 400);
});

test('tableau de bord : élève → 403 ; administrateur (casse ignorée) → statistiques', async () => {
  const { default: stats } = await import('../api/admin-stats.js');
  let res = reponse();
  await stats(requete({ method: 'GET', headers: { authorization: 'Bearer bon-jeton' } }), res);
  assert.equal(res.statusCode, 403);
  assert.doesNotMatch(res.corps, /total_centimes/);
  res = reponse();
  await stats(requete({ method: 'GET', headers: {} }), res);
  assert.equal(res.statusCode, 401);
  res = reponse();
  await stats(requete({ method: 'GET', headers: { authorization: 'Bearer jeton-admin' } }), res);
  assert.equal(res.statusCode, 200, res.corps);
  const d = JSON.parse(res.corps);
  assert.equal(d.total_centimes, 1980);
  const { EMPREINTES_CODES } = await import('../api/_lib/codes.js');
  assert.equal(d.codes_total, EMPREINTES_CODES.length);
});

test('tableau de bord : e-mail non confirmé → refusé', async () => {
  const { estAdmin } = await import('../api/admin-stats.js');
  assert.equal(estAdmin({ email: 'gerant@autoecole.fr' }), false);
  assert.equal(estAdmin({ email: 'gerant@autoecole.fr', email_confirmed_at: 'x' }), true);
  assert.equal(estAdmin({ email: 'intrus@autoecole.fr', email_confirmed_at: 'x' }), false);
});

test('parrainage : paiement avec un code → récompense demandée pour ce filleul', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne({ ...sessionPayee, id: 'cs_test_parrain', metadata: { ...sessionPayee.metadata, parrain: 'K7QM4X' } });
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(res.statusCode, 200);
  const r = appels.find((a) => a.url.includes('recompenser_parrain'));
  assert.deepEqual(r && r.corps, { p_session_id: 'cs_test_parrain', p_filleul: 'u-123', p_code: 'K7QM4X' });
});

test('parrainage : paiement sans code → aucune récompense demandée', async () => {
  const { default: webhook } = await import('../api/stripe-webhook.js');
  const { charge, sig } = evenementSigne(sessionPayee);
  appels.length = 0;
  const res = reponse();
  await webhook(requete({ headers: { 'stripe-signature': sig }, corps: charge }), res);
  assert.equal(appels.filter((a) => a.url.includes('recompenser_parrain')).length, 0);
});

test('plan du site : toutes les pages publiques, adresse du site', async () => {
  const { default: sitemap } = await import('../api/sitemap.js');
  const res = reponse();
  sitemap(requete({ method: 'GET' }), res);
  assert.match(res.corps, /<loc>https:\/\/code-ludique\.fr\/code\/test-gratuit<\/loc>/);
  assert.match(res.corps, /<loc>https:\/\/code-ludique\.fr\/code\/panneaux\/ab4<\/loc>/);
  assert.doesNotMatch(res.corps, /admin|compte|connexion/);
  assert.ok((res.corps.match(/<url>/g) || []).length >= 70);
});

test('robots.txt : pages privées exclues, plan du site indiqué', async () => {
  const { default: robots } = await import('../api/robots.js');
  const res = reponse();
  robots(requete({ method: 'GET' }), res);
  assert.match(res.corps, /Disallow: \/admin/);
  assert.match(res.corps, /Disallow: \/api\//);
  assert.match(res.corps, /Sitemap: https:\/\/code-ludique\.fr\/sitemap\.xml/);
});
