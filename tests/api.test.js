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
        if (req.headers.authorization === 'Bearer bon-jeton') return res.end(JSON.stringify({ id: 'u-123', email: 'eleve@example.com' }));
        res.statusCode = 401; return res.end(JSON.stringify({ msg: 'invalid' }));
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
