// Outils partagés par les fonctions serverless (Vercel ignore les dossiers commençant par « _ »).
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const PRIX_CENTIMES = 990;          // 9,90 € TTC
export const DEVISE = 'eur';
export const LIBELLE_OFFRE = 'Accès complet au code de la route – 3 mois';

export function env(nom) {
  const v = process.env[nom];
  if (!v) throw new Error(`Variable d'environnement manquante : ${nom}`);
  return v;
}

let _stripe, _admin;
export function stripe() {
  return (_stripe ??= new Stripe(env('STRIPE_SECRET_KEY')));
}

// Client Supabase « administrateur » (clé service_role) : ne JAMAIS l'exposer au navigateur.
export function supabaseAdmin() {
  return (_admin ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}

// Vérifie le jeton de connexion envoyé par le navigateur (en-tête Authorization: Bearer …).
export async function utilisateurConnecte(req) {
  const h = req.headers.authorization || '';
  const jeton = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!jeton) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(jeton);
  if (error || !data?.user) return null;
  return data.user;
}

export function urlDuSite(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

export function json(res, statut, corps) {
  res.statusCode = statut;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corps));
}

export async function lireCorpsBrut(req) {
  const morceaux = [];
  for await (const m of req) morceaux.push(typeof m === 'string' ? Buffer.from(m) : m);
  return Buffer.concat(morceaux);
}

export async function lireJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const brut = await lireCorpsBrut(req);
  if (!brut.length) return {};
  try { return JSON.parse(brut.toString('utf8')); } catch { return {}; }
}

// Débloque l'accès si la session Stripe est bien payée. Sans effet si déjà traitée.
export async function traiterSessionPayee(session) {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return null;
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) throw new Error(`Session ${session.id} sans user_id`);
  if (session.amount_total !== PRIX_CENTIMES || session.currency !== DEVISE) {
    throw new Error(`Session ${session.id} : montant inattendu ${session.amount_total} ${session.currency}`);
  }
  const renonciation = session.metadata?.renonciation_le || null;
  const { data, error } = await supabaseAdmin().rpc('accorder_acces', {
    p_session_id: session.id,
    p_user_id: userId,
    p_email: session.customer_details?.email || session.customer_email || null,
    p_montant: session.amount_total,
    p_devise: session.currency,
    p_renonciation: renonciation,
  });
  if (error) throw new Error(`accorder_acces : ${error.message}`);
  if (session.payment_intent) {
    const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
    await supabaseAdmin().rpc('lier_payment_intent', { p_session_id: session.id, p_payment_intent: pi });
  }
  return data; // date de fin d'accès
}
