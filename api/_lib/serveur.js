// Outils partagés par les fonctions serverless (Vercel ignore les dossiers commençant par « _ »).
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const PRIX_CENTIMES = 990;          // 9,90 € TTC
export const DEVISE = 'eur';
export const LIBELLE_OFFRE = 'Accès complet au code de la route – 3 mois';
// Lots de codes pour les auto-écoles (prix TTC en centimes) : modifiez ici si besoin.
export const LOTS = {
  l10: { quantite: 10, centimes: 6900 },
  l30: { quantite: 30, centimes: 17900 },
  l100: { quantite: 100, centimes: 49000 },
};

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
  if (session.metadata?.type === 'lot') return (await traiterLot(session)).codes;
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
  if (session.metadata?.parrain) await recompenserParrain(session, userId);
  return data; // date de fin d'accès
}

// Parrainage : +1 mois au parrain si c'est le premier achat de l'ami. Ne bloque jamais le paiement.
async function recompenserParrain(session, filleulId) {
  try {
    const { data: parrainId, error } = await supabaseAdmin().rpc('recompenser_parrain', {
      p_session_id: session.id, p_filleul: filleulId, p_code: session.metadata.parrain,
    });
    if (error) throw new Error(error.message);
    if (!parrainId || !process.env.BREVO_API_KEY) return;
    const { data: u } = await supabaseAdmin().auth.admin.getUserById(parrainId);
    if (!u?.user?.email) return;
    const { contenuParrainage, htmlRappel, texteRappel, envoyerEmail } = await import('./emails.js');
    const site = (process.env.SITE_URL || '').replace(/\/$/, '');
    const c = contenuParrainage(site);
    const lien = `${site}/compte`;
    await envoyerEmail({ a: u.user.email, sujet: c.sujet, html: htmlRappel(c, lien), texte: texteRappel(c, lien), lienDesinscription: lien });
  } catch (e) {
    console.error('Parrainage non traité :', e.message);
  }
}

// Lot de codes acheté par une auto-école : crée les codes (une seule fois) et les envoie par e-mail.
export async function traiterLot(session) {
  const lot = LOTS[session.metadata?.lot];
  if (!lot || session.amount_total !== lot.centimes || session.currency !== DEVISE) {
    throw new Error(`Lot ${session.id} : montant ou lot inattendu`);
  }
  const champ = (session.custom_fields || []).find((c) => c.key === 'auto_ecole');
  const acheteur = (champ && champ.text && champ.text.value) || session.customer_details?.name || null;
  const email = session.customer_details?.email || session.customer_email || null;
  const { data, error } = await supabaseAdmin().rpc('creer_commande_codes', {
    p_session_id: session.id, p_email: email, p_acheteur: acheteur,
    p_quantite: lot.quantite, p_montant: session.amount_total, p_devise: session.currency,
  });
  if (error) throw new Error(`creer_commande_codes : ${error.message}`);
  const codes = (data || []).map((x) => (typeof x === 'string' ? x : x.creer_commande_codes));
  if (session.payment_intent) {
    const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
    await supabaseAdmin().rpc('lier_payment_intent', { p_session_id: session.id, p_payment_intent: pi });
  }
  // e-mail avec les codes (une seule fois, à la réception du webhook)
  if (email && process.env.BREVO_API_KEY && session.__depuisWebhook) {
    try {
      const { contenuCodes, envoyerEmail } = await import('./emails.js');
      const c = contenuCodes(codes, acheteur, (process.env.SITE_URL || '').replace(/\/$/, ''));
      await envoyerEmail({ a: email, sujet: c.sujet, html: c.html, texte: c.texte, lienDesinscription: (process.env.SITE_URL || '') + '/auto-ecoles' });
    } catch (e) { console.error('E-mail des codes non envoyé :', e.message); }
  }
  return { codes, acheteur, quantite: lot.quantite };
}
