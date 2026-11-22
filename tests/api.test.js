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
