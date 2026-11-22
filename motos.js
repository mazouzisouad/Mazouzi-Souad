/* =====================================================================
   MOTOS — le garage
   • Une carte par moto : dessin (ou photo), plaque, auto-école à qui elle
     appartient, où elle est, jauge d'essence estimée, compteur, conso.
   • Plan « Lieux + places » : touchez une moto puis un lieu, elle s'y gare.
   • « ⛽ Plein » : stations proches (prix officiels du jour), le moniteur tape
     le montant et les litres se calculent tout seuls.
   Les moniteurs notent leurs pleins et déplacent les motos ; seule la
   direction ajoute, modifie ou retire une moto.
   ===================================================================== */
'use strict';

const COULEURS_MOTO = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#0ea5e9', '#ec4899', '#334155', '#f97316', '#84cc16'];
const CATEGORIES_MOTO = ['A2', 'A', '125 cm³', 'Autre'];
const CARBURANTS = ['SP98', 'E10', 'SP95', 'Gazole'];

const motosActives = () => (DB.motos || []).filter((m) => !m.archivee);
const pleinsDe = (motoId) => (DB.pleins || []).filter((p) => p.motoId === motoId).sort((a, b) => (a.date + (a.creeLe || '')).localeCompare(b.date + (b.creeLe || '')));
const nomMoto = (m) => (m ? (m.surnom || m.modele || m.plaque || 'Moto') : '—');
const fmtPlaque = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]{2})(\d{3})([A-Z]{2})$/, '$1-$2-$3') || '—';
const fmtNombre = (n, d = 1) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });
const fmtFixe = (n, d = 2) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const auteurMoi = () => (Cloud.user ? (Cloud.user.email || '').toLowerCase() : 'local');
const nomAuteurMoi = () => (estMoniteur() ? moniteurNom(byId('moniteurs', Cloud.monId)) : 'Direction');
const reservoirDe = (m) => Number(m.reservoir) || 14;
const carburantDe = (m) => m.carburant || 'SP98';
const nomCourt = (a) => (a ? (a.nom || '').replace(/^\s*(my\s+)?auto[\s-]*[ée]cole\s*/i, '').trim() || a.nom : '');

function ilYa(iso) {
  if (!iso) return '';
  const j = Math.round((parseISO(todayISO()) - parseISO(iso.slice(0, 10))) / 86400000);
  return j <= 0 ? "aujourd'hui" : j === 1 ? 'hier' : `il y a ${j} j`;
}
function ilYaHeures(iso) {
  const t = Date.parse(iso); if (!t) return '';
  const h = Math.round((Date.now() - t) / 3600000);
  return h < 1 ? "à l'instant" : h < 24 ? `il y a ${h} h` : `il y a ${Math.round(h / 24)} j`;
}
function teinte(hex, k) {
  const n = parseInt(String(hex || '#64748b').replace('#', '').padEnd(6, '0').slice(0, 6), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
let nUid = 0;

/* ---------- Où est la moto ? ---------- */
const lieuParDefaut = (m) => ({ type: 'agence', ref: m.proprio || DB.agences[0]?.id || '' });
function emplacementDe(m) { const e = m.emplacement || {}; return e.type ? e : lieuParDefaut(m); }
function lieuMoto(m) {
  const e = emplacementDe(m);
  if (e.type === 'agence') { const a = byId('agences', e.ref); return { emoji: '🏢', txt: a ? a.nom : 'Agence', couleur: a?.couleur }; }
  if (e.type === 'piste') return { emoji: '🏁', txt: 'Sur la piste', couleur: '#f97316' };
  if (e.type === 'garage') return { emoji: '🔧', txt: e.texte ? `Au garage · ${e.texte}` : 'Au garage', couleur: '#64748b' };
  if (e.type === 'moniteur') { const mo = byId('moniteurs', e.ref); return { emoji: '🧑‍🏫', txt: mo ? `Avec ${moniteurNom(mo)}` : 'Avec un moniteur', couleur: mo?.couleur }; }
  if (e.type === 'autre') return { emoji: '📍', txt: e.texte || 'Autre endroit', couleur: '#0ea5e9' };
  return { emoji: '❓', txt: 'Endroit inconnu' };
}
// garée dans une autre auto-école que la sienne ?
const aRendre = (m) => { const e = emplacementDe(m); return !!m.proprio && e.type === 'agence' && e.ref && e.ref !== m.proprio; };

/* ---------- Consommation et essence ---------- */
function consoMoto(motoId) {
  const p = pleinsDe(motoId).filter((x) => Number(x.km) > 0);
  if (p.length < 2) return null;
  const km = Number(p[p.length - 1].km) - Number(p[0].km);
  const litres = p.slice(1).reduce((s, x) => s + Number(x.litres || 0), 0);
  return km > 0 ? (litres / km) * 100 : null;
}
// Essence restante estimée : on rejoue les pleins (litres ajoutés, « plein complet »
// = réservoir rempli) et on retire ce que la moto consomme selon les km notés.
function niveauEssence(m, sansPleinId) {
  const res = reservoirDe(m), conso = consoMoto(m.id) || 5;
  const pl = pleinsDe(m.id).filter((p) => p.id !== sansPleinId);
  if (!pl.length) return null;
  // un plein sans compteur est placé au compteur connu juste après lui (sinon au compteur actuel)
  const kmActuel = Number(m.km) > 0 ? Number(m.km) : null;
  const kmEffectif = pl.map((p, i) => {
    if (Number(p.km) > 0) return Number(p.km);
    for (let j = i + 1; j < pl.length; j++) if (Number(pl[j].km) > 0) return Number(pl[j].km);
    return kmActuel;
  });
  let niv = null, km = null;
  for (const [i, p] of pl.entries()) {
    const pk = kmEffectif[i];
    if (niv != null && pk && km && pk > km) niv = Math.max(0, niv - ((pk - km) * conso) / 100 / res);
    if (niv == null) niv = 0.15;
    niv = p.complet ? 1 : Math.min(1, niv + Number(p.litres || 0) / res);
    if (pk) km = pk;
  }
  const mk = Number(m.km) > 0 ? Number(m.km) : null;
  if (mk && km && mk > km) niv = Math.max(0, niv - ((mk - km) * conso) / 100 / res);
  return niv;
}
const texteNiveau = (n) => (n == null ? 'Essence ?' : n < 0.2 ? '⚠️ Presque vide' : '≈ ' + Math.round(n * 100) + ' %');
const couleurEssence = (n) => (n == null ? '#cbd5e1' : n < 0.2 ? '#ef4444' : n < 0.45 ? '#f59e0b' : '#22c55e');

function statsMois(mois) {
  const l = (DB.pleins || []).filter((p) => p.date.startsWith(mois));
  return { euros: l.reduce((s, p) => s + Number(p.montant || 0), 0), litres: l.reduce((s, p) => s + Number(p.litres || 0), 0), nb: l.length };
}

/* ---------- Dessins ---------- */
function motoSVG(c) {
  const u = 'm' + (++nUid), clair = teinte(c, 0.45), fonce = teinte(c, -0.35), veste = teinte(c, -0.55);
  const roue = (x) => `<g class="roue">
      <circle cx="${x}" cy="112" r="30" fill="#1f1d2b"/>
      <circle cx="${x}" cy="112" r="27" fill="none" stroke="#3a3650" stroke-width="4" stroke-dasharray="3.5 3"/>
      <circle cx="${x}" cy="112" r="20" fill="url(#${u}r)"/>
      <circle cx="${x}" cy="112" r="16" fill="#1f1d2b"/>
      ${[0, 72, 144, 216, 288].map((a) => `<rect x="${x - 2.2}" y="96" width="4.4" height="16" rx="2.2" fill="url(#${u}r)" transform="rotate(${a} ${x} 112)"/>`).join('')}
      <circle cx="${x}" cy="112" r="8" fill="url(#${u}c)"/><circle cx="${x}" cy="112" r="3" fill="#475569"/></g>`;
  return `<svg class="moto-svg" viewBox="0 0 250 150" aria-hidden="true">
    <defs>
      <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clair}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${fonce}"/></linearGradient>
      <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient>
      <linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${clair}"/><stop offset="1" stop-color="${fonce}"/></linearGradient>
      <linearGradient id="${u}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fef08a" stop-opacity=".9"/><stop offset="1" stop-color="#fef08a" stop-opacity="0"/></linearGradient>
    </defs>
    <ellipse cx="124" cy="143" rx="100" ry="5" fill="rgba(15,23,42,.22)"/>
    <polygon class="faisceau" points="180,50 250,24 250,80" fill="url(#${u}f)"/>
    <g class="fumee"><circle cx="34" cy="98" r="7" fill="#e2e8f0"/><circle cx="30" cy="94" r="6" fill="#f1f5f9"/><circle cx="36" cy="92" r="5" fill="#e2e8f0"/></g>
    ${roue(60)}${roue(192)}
    <g class="caisse">
      <path d="M60 112 L116 100" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
      <rect x="34" y="88" width="48" height="14" rx="7" fill="url(#${u}c)" transform="rotate(-12 58 95)"/>
      <path d="M120 100 Q112 118 80 100" stroke="url(#${u}c)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="100" y="78" width="48" height="36" rx="11" fill="#475569"/>
      <path d="M106 86 H142 M106 93 H142 M106 100 H142" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="116" cy="106" r="7" fill="url(#${u}c)"/>
      <path d="M40 72 Q60 58 96 64 L100 78 Q72 82 50 82 Z" fill="url(#${u}b)"/>
      <rect x="34" y="70" width="10" height="7" rx="3" fill="#ef4444"/>
      <path d="M70 64 Q88 54 108 58 L110 70 Q90 70 72 73 Z" fill="#1f1d2b"/>
      <path d="M104 60 Q114 34 150 40 Q166 44 166 62 Q142 80 106 74 Z" fill="url(#${u}b)"/>
      <path d="M114 52 Q124 41 146 44" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M106 74 Q132 82 154 70 L150 86 Q126 92 106 86 Z" fill="${fonce}"/>
      <path d="M160 42 L192 112" stroke="url(#${u}c)" stroke-width="9" stroke-linecap="round"/>
      <path d="M170 88 Q192 72 214 92" stroke="url(#${u}b)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M164 40 Q170 24 184 28 L180 42 Z" fill="#7dd3fc" opacity=".85"/>
      <circle cx="176" cy="50" r="11" fill="#fff7cc" stroke="#1f1d2b" stroke-width="3.5"/>
      <circle cx="173" cy="47" r="3.5" fill="#fff"/>
      <path d="M152 34 L168 28" stroke="#1f1d2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M158 31 L154 20" stroke="#1f1d2b" stroke-width="2.5"/><ellipse cx="153" cy="18" rx="6" ry="3.5" fill="#1f1d2b"/>
      <g class="pilote">
        <path d="M100 66 L128 88 L118 110" stroke="#1e293b" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="108" y="104" width="20" height="9" rx="4" fill="#0f172a"/>
        <path d="M98 64 L124 38" stroke="${veste}" stroke-width="18" stroke-linecap="round"/>
        <path d="M120 42 L146 50 L158 33" stroke="${veste}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="158" cy="32" r="5.5" fill="#0f172a"/>
        <circle cx="128" cy="22" r="16" fill="url(#${u}b)"/>
        <path d="M128 9 Q140 12 143 22" stroke="#fff" stroke-opacity=".8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M130 17 Q146 16 145 30 L130 31 Q126 24 130 17 Z" fill="#0f172a"/>
        <path d="M134 20 Q140 19 141 24" stroke="#7dd3fc" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
    </g></svg>`;
}
// moto vue de dessus (plan)
function motoHaut(c) {
  const u = 'h' + (++nUid), clair = teinte(c, 0.5), fonce = teinte(c, -0.35);
  const pneu = (y, h) => `<rect x="15.5" y="${y}" width="13" height="${h}" rx="6.5" fill="#111827"/>${Array.from({ length: Math.floor(h / 4) }, (_, i) => `<rect x="16.5" y="${y + 2 + i * 4}" width="11" height="1.2" rx=".6" fill="#374151"/>`).join('')}`;
  return `<svg class="moto-haut" viewBox="0 0 44 92" aria-hidden="true">
    <defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${fonce}"/><stop offset=".42" stop-color="${clair}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
    <ellipse cx="22" cy="48" rx="15" ry="42" fill="rgba(15,23,42,.18)"/>
    ${pneu(1, 22)}${pneu(67, 24)}
    <rect x="29" y="58" width="5" height="22" rx="2.5" fill="#cbd5e1" stroke="#64748b" stroke-width=".8"/>
    <path d="M5 16 H39" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="5" cy="16" r="2.6" fill="#111827"/><circle cx="39" cy="16" r="2.6" fill="#111827"/>
    <path d="M9 14 L6 8 M35 14 L38 8" stroke="#1f2937" stroke-width="1.4"/><ellipse cx="6" cy="7" rx="3" ry="2" fill="#1f2937"/><ellipse cx="38" cy="7" rx="3" ry="2" fill="#1f2937"/>
    <circle cx="22" cy="7" r="3.6" fill="#fef9c3" stroke="#1f2937" stroke-width="1.2"/>
    <path d="M12 21 Q22 11 32 21 L34 42 Q22 50 10 42 Z" fill="url(#${u})" stroke="${fonce}" stroke-width=".8"/>
    <path d="M17 19 Q22 15.5 27 19" stroke="#fff" stroke-opacity=".8" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <rect x="14.5" y="42" width="15" height="22" rx="7" fill="#1f2937"/>
    <path d="M15 62 H29 L26.5 78 H17.5 Z" fill="url(#${u})" stroke="${fonce}" stroke-width=".8"/>
    <rect x="18" y="76" width="8" height="3.2" rx="1.4" fill="#ef4444"/>
    <g class="pilote"><ellipse cx="22" cy="50" rx="14" ry="7.5" fill="${teinte(c, -0.55)}"/><circle cx="22" cy="44" r="9" fill="url(#${u})" stroke="#fff" stroke-width="1.2"/><path d="M15.5 40 Q22 35 28.5 40" stroke="#0f172a" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
  </svg>`;
}
function decor() {
  const un = `<svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 70 Q40 20 90 50 Q130 10 190 46 Q240 22 300 52 V70 Z" fill="#86efac"/>
    <rect x="30" y="34" width="22" height="36" rx="3" fill="#cbd5e1"/><rect x="56" y="22" width="26" height="48" rx="3" fill="#e2e8f0"/>
    <rect x="200" y="28" width="30" height="42" rx="3" fill="#cbd5e1"/><rect x="234" y="40" width="18" height="30" rx="3" fill="#e2e8f0"/>
    <circle cx="140" cy="44" r="14" fill="#4ade80"/><rect x="138" y="52" width="4" height="18" fill="#a16207"/>
    <circle cx="170" cy="50" r="10" fill="#22c55e"/><rect x="168" y="56" width="4" height="14" fill="#a16207"/>
    <path d="M110 66 L116 52 L122 66 Z" fill="#f97316"/><rect x="109" y="64" width="14" height="3" fill="#f97316"/></svg>`;
  return `<div class="decor">${un}${un}</div>`;
}
function jaugeSVG(n) {
  const u = 'j' + (++nUid);
  return `<svg class="jauge" viewBox="0 0 120 78" role="img" aria-label="${n == null ? 'Essence inconnue' : 'Essence environ ' + Math.round(n * 100) + ' %'}">
    <defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ef4444"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs>
    <path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="var(--line)" stroke-width="15" stroke-linecap="round"/>
    <path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="url(#${u})" stroke-width="11" stroke-linecap="round"/>
    <text x="5" y="77">E</text><text x="106" y="77">F</text>
    <g class="aiguille" data-angle="${n == null ? -90 : -90 + 180 * n}" style="transform:rotate(-90deg)"><path d="M57 62 L60 20 L63 62 Z" fill="var(--ink)"/></g>
    <circle cx="60" cy="62" r="9" fill="var(--ink)"/><text x="60" y="66" text-anchor="middle" style="font-size:10px">⛽</text></svg>`;
}
function lieuSVG(z) {
  if (z.type === 'agence') return `<svg viewBox="0 0 120 84" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="52" ry="5" fill="rgba(0,0,0,.12)"/>
    <rect x="18" y="30" width="84" height="50" rx="6" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M10 34 L60 6 L110 34 Z" fill="${z.c}" stroke="${teinte(z.c, -0.3)}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="34" y="18" width="52" height="11" rx="5" fill="${teinte(z.c, -0.25)}"/><text x="60" y="26.5" text-anchor="middle" style="font:800 7.5px system-ui,sans-serif;fill:#fff">AUTO-ÉCOLE</text>
    <rect x="26" y="40" width="20" height="16" rx="3" fill="#bae6fd"/><rect x="74" y="40" width="20" height="16" rx="3" fill="#bae6fd"/>
    <rect x="50" y="52" width="20" height="28" rx="3" fill="${teinte(z.c, -0.25)}"/><circle cx="65" cy="67" r="1.8" fill="#fff"/>
    <rect x="24" y="66" width="22" height="8" rx="3" fill="#86efac"/><rect x="74" y="66" width="22" height="8" rx="3" fill="#86efac"/></svg>`;
  if (z.type === 'piste') return `<svg viewBox="0 0 120 84" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="54" ry="5" fill="rgba(0,0,0,.12)"/>
    <rect x="6" y="30" width="108" height="48" rx="16" fill="#64748b"/>
    <path d="M24 54 Q60 30 96 54 Q60 78 24 54 Z" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 5"/>
    ${[22, 46, 74, 98].map((x, i) => `<path d="M${x} ${i % 2 ? 66 : 46} l5 -11 l5 11 Z" fill="#f97316"/>`).join('')}
    <rect x="58" y="8" width="3" height="32" fill="#334155"/>
    ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${61 + c * 6}" y="${8 + r * 5}" width="6" height="5" fill="${(r + c) % 2 ? '#fff' : '#0f172a'}"/>`).join('')).join('')}</svg>`;
  if (z.type === 'garage') return `<svg viewBox="0 0 120 84" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="52" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M14 30 L60 12 L106 30 V80 H14 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/>
    <rect x="28" y="40" width="64" height="40" rx="4" fill="#94a3b8"/>
    ${[46, 54, 62, 70].map((y) => `<rect x="30" y="${y}" width="60" height="3" rx="1.5" fill="#64748b"/>`).join('')}
    <circle cx="60" cy="27" r="9" fill="#f97316"/><text x="60" y="31" text-anchor="middle" style="font-size:10px">🔧</text></svg>`;
  if (z.type === 'autre') return `<svg viewBox="0 0 120 84" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="30" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M60 78 C 40 52, 36 44, 36 34 A24 24 0 0 1 84 34 C 84 44, 80 52, 60 78 Z" fill="${z.c}" stroke="${teinte(z.c, -0.3)}" stroke-width="2"/>
    <circle cx="60" cy="34" r="9" fill="#fff"/></svg>`;
  return `<svg viewBox="0 0 120 84" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="40" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M34 80 Q34 52 60 50 Q86 52 86 80 Z" fill="${teinte(z.c, -0.45)}"/>
    <path d="M52 52 L60 64 L68 52" fill="#fff"/>
    <circle cx="60" cy="32" r="20" fill="${z.c}"/>
    <path d="M44 26 Q50 14 64 13" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M47 30 Q60 26 76 30 L75 42 Q60 46 46 42 Z" fill="#0f172a"/>
    <path d="M52 34 Q60 32 70 34" stroke="#7dd3fc" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
}
const visuelMoto = (m) => (m.photo ? `<img class="moto-photo" src="${m.photo}" alt="${esc(nomMoto(m))}">` : motoSVG(m.couleur || '#3b82f6'));

/* ---------- Vue ---------- */
const UI_MOTOS = { filtre: '', mois: '', agence: '', choisie: null, garee: null };

function viewMotos() {
  const tout = motosActives();
  const motos = tout.filter((m) => !UI_MOTOS.agence || m.proprio === UI_MOTOS.agence);
  const mois = todayISO().slice(0, 7);
  if (!UI_MOTOS.mois) UI_MOTOS.mois = mois;
  const st = statsMois(mois);
  const consos = tout.map((m) => ({ m, c: consoMoto(m.id) })).filter((x) => x.c);
  const sobre = consos.sort((a, b) => a.c - b.c)[0];
  const moisList = Array.from({ length: 6 }, (_, i) => { const d = parseISO(mois + '-01'); d.setMonth(d.getMonth() - 5 + i); return toISODate(d).slice(0, 7); });
  const valeurs = moisList.map((k) => statsMois(k).euros);
  const max = Math.max(1, ...valeurs);
  const pleins = (DB.pleins || []).filter((p) => (!UI_MOTOS.filtre || p.motoId === UI_MOTOS.filtre) && p.date.startsWith(UI_MOTOS.mois))
    .sort((a, b) => (b.date + (b.creeLe || '')).localeCompare(a.date + (a.creeLe || '')));
  requestAnimationFrame(animerMotos);

  return `
  <div class="toolbar">
    <h1>🏍️ Motos</h1>
    <div class="spacer"></div>
    <button class="btn primary" data-action="nouveauPlein">⛽ Faire le plein</button>
    ${estMoniteur() ? '' : '<button class="btn" data-action="editMoto">+ Ajouter une moto</button>'}
  </div>

  <div class="motos-stats">
    <div class="ms"><span class="ms-emoji">⛽</span><div><strong>${eur(st.euros)}</strong><span>ce mois-ci · ${fmtNombre(st.litres)} L · ${st.nb} plein${st.nb > 1 ? 's' : ''}</span></div></div>
    <div class="ms"><span class="ms-emoji">🏆</span><div><strong>${sobre ? esc(nomMoto(sobre.m)) : '—'}</strong><span>${sobre ? `la plus sobre · ${fmtNombre(sobre.c)} L/100 km` : 'la plus sobre (notez les km au plein)'}</span></div></div>
    <div class="ms"><span class="ms-emoji">🏍️</span><div><strong>${tout.length} moto${tout.length > 1 ? 's' : ''}</strong><span>${DB.agences.map((a) => `${esc(nomCourt(a))} ${tout.filter((m) => m.proprio === a.id).length}`).join(' · ') || ''}</span></div></div>
  </div>

  ${tout.length && DB.agences.length > 1 ? `<div class="filtres-motos">${[{ id: '', nom: 'Toutes', couleur: '#64748b' }, ...DB.agences].map((a) => `<button class="filtre-moto ${UI_MOTOS.agence === a.id ? 'on' : ''}" data-action="motosAgence" data-id="${a.id}" style="--fc:${esc(a.couleur || '#64748b')}">${a.id ? '🏷️ ' + esc(nomCourt(a)) : 'Toutes'} <b>${a.id ? tout.filter((m) => m.proprio === a.id).length : tout.length}</b></button>`).join('')}</div>` : ''}

  ${tout.length ? `<div class="motos-grid">${motos.map(carteMoto).join('') || '<div class="card empty">Aucune moto pour cette auto-école.</div>'}</div>
    <div class="card plan-card"><div class="plan-tete"><h2>📍 Où sont les motos ?</h2><span class="small muted" id="plan-aide">Touchez une moto, puis l'endroit où elle va.</span></div><div id="plan-motos">${planMotos()}</div></div>`
    : `<div class="card empty">Aucune moto pour l'instant.${estMoniteur() ? '' : '<br><br><button class="btn primary" data-action="editMoto">+ Ajouter votre première moto</button>'}</div>`}

  <div class="grid cols-2" style="margin-top:16px">
    <div class="card">
      <h2>Dépenses d'essence (6 mois)</h2>
      <div class="barres">${moisList.map((k, i) => `<div class="barre-col" title="${eur(valeurs[i])}">
        <span class="barre-val">${valeurs[i] ? Math.round(valeurs[i]) + ' €' : ''}</span>
        <div class="barre" style="height:${Math.round((valeurs[i] / max) * 100)}%"></div>
        <span class="barre-lbl">${parseISO(k + '-01').toLocaleDateString('fr-FR', { month: 'short' })}</span></div>`).join('')}</div>
    </div>
    <div class="card">
      <div class="row between" style="margin-bottom:8px"><h2 style="margin:0">Pleins</h2>
        <div class="row" style="gap:6px">
          <select data-on-change="motosFiltre" style="width:auto"><option value="">Toutes les motos</option>${(DB.motos || []).map((m) => `<option value="${m.id}" ${UI_MOTOS.filtre === m.id ? 'selected' : ''}>${esc(nomMoto(m))}</option>`).join('')}</select>
          <input type="month" value="${UI_MOTOS.mois}" data-on-change="motosMois" style="width:auto">
        </div></div>
      ${pleins.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Moto</th><th class="num">Litres</th><th class="num">Montant</th><th class="num">€/L</th><th>Station</th><th>Par</th></tr></thead>
        <tbody>${pleins.map((p) => { const m = byId('motos', p.motoId); return `<tr class="clickable" data-action="editPlein" data-id="${p.id}">
          <td>${fmtDate(p.date)}</td>
          <td><span class="dot" style="background:${esc(m?.couleur || '#94a3b8')}"></span>${esc(nomMoto(m))}${p.complet ? ' <span class="small" title="Plein complet">⛽</span>' : ''}</td>
          <td class="num">${fmtNombre(p.litres, 2)} L</td><td class="num"><strong>${eur(p.montant)}</strong></td>
          <td class="num">${p.litres ? fmtNombre(p.montant / p.litres, 3) : '—'}</td>
          <td class="small">${esc(p.station || '')}</td>
          <td class="small muted">${esc(p.auteurNom || '')}</td></tr>`; }).join('')}</tbody>
        <tfoot><tr><td colspan="2"><strong>Total</strong></td><td class="num"><strong>${fmtNombre(pleins.reduce((s, p) => s + Number(p.litres || 0), 0))} L</strong></td><td class="num"><strong>${eur(pleins.reduce((s, p) => s + Number(p.montant || 0), 0))}</strong></td><td colspan="3"></td></tr></tfoot>
      </table></div>` : '<p class="muted">Aucun plein ce mois-ci.</p>'}
    </div>
  </div>`;
}

function carteMoto(m) {
  const l = lieuMoto(m);
  const pl = pleinsDe(m.id);
  const dernier = pl[pl.length - 1];
  const conso = consoMoto(m.id);
  const niv = niveauEssence(m);
  const a = byId('agences', m.proprio);
  return `
  <div class="moto-card" data-id="${m.id}" style="--mc:${esc(m.couleur || '#3b82f6')}">
    <div class="moto-top">
      <div class="pastille">${esc((nomMoto(m)[0] || '?').toUpperCase())}</div>
      <div class="moto-titre"><strong>${esc(nomMoto(m))}</strong><span>${esc([m.modele, m.categorie].filter(Boolean).join(' · '))}</span></div>
      ${a ? `<span class="proprio" style="--pc:${esc(a.couleur || '#64748b')}" title="Appartient à ${esc(a.nom)}">🏷️ ${esc(nomCourt(a))}</span>` : (estMoniteur() ? '' : '<span class="proprio vide" title="Choisissez son auto-école avec ✏️">🏷️ ?</span>')}
      ${estMoniteur() ? '' : `<button class="btn small ghost moto-edit" data-action="editMoto" data-id="${m.id}" title="Modifier / ajouter une photo">✏️</button>`}
    </div>
    <button class="scene ${m.photo ? 'photo' : ''}" data-action="vroum" aria-label="Faire rouler ${esc(nomMoto(m))}">
      ${m.photo ? `<img src="${m.photo}" alt="${esc(nomMoto(m))}">` : `<div class="soleil"></div>${decor()}<div class="route"></div>${motoSVG(m.couleur || '#3b82f6')}<span class="astuce">👆 Touchez-moi</span>`}
      <span class="vroum">VROUM !</span>
    </button>
    <div class="ligne-plaque">
      <div class="plaque"><span class="plaque-f">F</span><span class="plaque-n">${esc(fmtPlaque(m.plaque))}</span><span class="plaque-d"></span></div>
      <span class="lieu-pill" style="--lc:${esc(l.couleur || '#64748b')}"><span>${l.emoji}</span>${esc(l.txt)}${aRendre(m) ? ` <em>↩︎ à rendre à ${esc(nomCourt(a))}</em>` : ''}</span>
    </div>
    <div class="moto-tableau">
      <div class="jauge-bloc">${jaugeSVG(niv)}<strong class="${niv != null && niv < 0.2 ? 'bas' : ''}">${texteNiveau(niv)}</strong></div>
      <dl class="moto-infos">
        <div><span class="ic">🛣️</span><dt>Compteur</dt><dd>${m.km ? Number(m.km).toLocaleString('fr-FR') + ' km' : '—'}</dd></div>
        <div><span class="ic">⛽</span><dt>Plein</dt><dd>${dernier ? `${ilYa(dernier.date)} · ${fmtNombre(dernier.litres)} L` : '—'}</dd></div>
        <div><span class="ic">🌱</span><dt>Conso</dt><dd>${conso ? fmtNombre(conso) + ' L/100' : '—'}</dd></div>
      </dl>
    </div>
    <div class="moto-actions">
      <button class="btn primary" data-action="nouveauPlein" data-moto="${m.id}">⛽ Plein</button>
      <button class="btn" data-action="ouEstElle" data-id="${m.id}">📍 Où est-elle ?</button>
    </div>
  </div>`;
}

// Après affichage : les aiguilles montent jusqu'à leur niveau
const MEMO_JAUGES = {};
function animerMotos() {
  $$('.moto-card').forEach((c) => {
    const a = c.querySelector('.aiguille'); if (!a) return;
    const id = c.dataset.id, avant = MEMO_JAUGES[id] ?? -90;
    a.style.transition = 'none'; a.style.transform = `rotate(${avant}deg)`;
    a.getBoundingClientRect();
    a.style.transition = ''; a.style.transform = `rotate(${a.dataset.angle}deg)`;
    MEMO_JAUGES[id] = +a.dataset.angle;
  });
}

/* ---------- Plan « Lieux + places » ---------- */
function zonesLieux() {
  const z = DB.agences.map((a) => ({ cle: 'agence:' + a.id, type: 'agence', ref: a.id, nom: a.nom, c: a.couleur || '#60a5fa' }));
  z.push({ cle: 'piste:', type: 'piste', ref: '', nom: 'Piste', c: '#f97316' });
  for (const mo of DB.moniteurs) z.push({ cle: 'moniteur:' + mo.id, type: 'moniteur', ref: mo.id, nom: 'Avec ' + moniteurNom(mo), c: mo.couleur || '#a855f7' });
  z.push({ cle: 'garage:', type: 'garage', ref: '', nom: 'Garage', c: '#64748b' });
  z.push({ cle: 'autre:', type: 'autre', ref: '', nom: 'Ailleurs', c: '#0ea5e9' });
  return z;
}
const cleLieu = (m) => { const e = emplacementDe(m); return e.type + ':' + (['agence', 'moniteur'].includes(e.type) ? (e.ref || '') : ''); };

function planMotos() {
  const motos = motosActives();
  const n = (f) => motos.filter(f).length;
  const rendre = n(aRendre), route = n((m) => ['piste', 'moniteur'].includes(emplacementDe(m).type)), garage = n((m) => emplacementDe(m).type === 'garage');
  const vides = n((m) => { const v = niveauEssence(m); return v != null && v < 0.2; });
  const chip = (e, t, k = '') => `<span class="rchip ${k}">${e} ${t}</span>`;
  const resume = `<div class="resume-motos">${rendre ? chip('↩︎', `${rendre} à rendre`, 'alerte') : ''}${chip('🏍️', `${route} en leçon / piste`)}${chip('🔧', `${garage} au garage`)}${vides ? chip('⛽', `${vides} presque vide${vides > 1 ? 's' : ''}`, 'alerte') : ''}</div>`;
  const choix = UI_MOTOS.choisie;
  return resume + `<div class="tlieux ${choix ? 'en-choix' : ''}">${zonesLieux().map((z) => {
    const ici = motos.filter((m) => cleLieu(m) === z.cle);
    if (z.type === 'autre' && !ici.length && !choix) return '';
    const nb = Math.max(3, ici.length + 1);
    return `<div class="tlieu" role="button" tabindex="0" data-action="planZone" data-cle="${z.cle}" style="--z:${esc(z.c)}">
      <div class="tlieu-tete">${lieuSVG(z)}<div><strong>${esc(z.nom)}</strong><small>${ici.length ? ici.length + ' moto' + (ici.length > 1 ? 's' : '') + ' garée' + (ici.length > 1 ? 's' : '') : 'places libres'}</small></div><span class="compte">${ici.length}<i>/${nb}</i></span></div>
      <div class="places-legeres ${ici.length ? '' : 'vides'}">${Array.from({ length: nb }, (_, i) => {
        const m = ici[i];
        if (!m) return '<div class="pl libre"><span class="p">P</span><span class="ici">Ici ?</span></div>';
        const niv = niveauEssence(m), a = byId('agences', m.proprio);
        const estompe = UI_MOTOS.agence && m.proprio !== UI_MOTOS.agence ? 'estompe' : '';
        return `<div class="pl"><button class="pm ${estompe} ${choix === m.id ? 'choisie' : ''} ${UI_MOTOS.garee === m.id ? 'garee' : ''}" data-action="planMoto" data-id="${m.id}" aria-label="${esc(nomMoto(m))}, ${esc(fmtPlaque(m.plaque))}" style="--mc:${esc(m.couleur || '#3b82f6')};--r:${i % 2 ? 5 : -5}deg">
          <span class="corps">${m.photo ? `<img src="${m.photo}" alt="">` : motoHaut(m.couleur || '#3b82f6')}</span>
          ${a ? `<span class="dot-ae" style="--pc:${esc(a.couleur || '#64748b')}" title="${esc(a.nom)}">${esc((nomCourt(a)[0] || '?').toUpperCase())}</span>` : ''}
          ${aRendre(m) ? '<span class="loin" title="À rendre à son auto-école">↩︎</span>' : ''}
          <span class="bulle-choix">${esc(nomMoto(m))}${a ? ' · ' + esc(nomCourt(a)) : ''}</span>
          <span class="fumee-garage"><i></i><i></i><i></i></span>
          <span class="petit-nom">${esc(nomMoto(m))}</span>
          <span class="mini-jauge" title="${texteNiveau(niv)}"><b style="width:${niv == null ? 0 : Math.round(niv * 100)}%;background:${couleurEssence(niv)}"></b></span>
        </button></div>`;
      }).join('')}</div>
    </div>`;
  }).join('')}</div>`;
}
function majPlan() { const el = $('#plan-motos'); if (el) el.innerHTML = planMotos(); }

// la moto glisse de son ancienne place à la nouvelle
function garerMoto(m, emplacement) {
  const avant = {};
  $$('#plan-motos [data-id].pm').forEach((el) => { avant[el.dataset.id] = el.getBoundingClientRect(); });
  m.emplacement = Object.assign({ texte: '' }, emplacement, { majLe: new Date().toISOString() });
  m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi();
  UI_MOTOS.choisie = null; UI_MOTOS.garee = m.id;
  save();
  majPlan();
  UI_MOTOS.garee = null;
  $$('#plan-motos [data-id].pm').forEach((el) => {
    const a = avant[el.dataset.id]; if (!a) return;
    const b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.style.transition = 'none'; el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.getBoundingClientRect();
    el.style.transition = 'transform 1.2s cubic-bezier(.45,.05,.3,1)'; el.style.transform = '';
    if (el.dataset.id === m.id) el.classList.add('roule');
    setTimeout(() => { el.classList.remove('roule'); el.style.transition = ''; }, 1250);
  });
  const l = lieuMoto(m);
  const aide = $('#plan-aide'); if (aide) aide.textContent = `${l.emoji} ${nomMoto(m)} : ${l.txt}`;
  // la carte de la moto suit
  const carte = $(`.moto-card[data-id="${m.id}"] .lieu-pill`);
  if (carte) {
    const a = byId('agences', m.proprio);
    carte.style.setProperty('--lc', l.couleur || '#64748b');
    carte.innerHTML = `<span>${l.emoji}</span>${esc(l.txt)}${aRendre(m) ? ` <em>↩︎ à rendre à ${esc(nomCourt(a))}</em>` : ''}`;
  }
}

/* ---------- Faire le plein ---------- */
const PLEIN = { motoId: null, editId: null, station: null, stations: null, litresTapes: false, position: null };

function openPlein(plein) {
  const motos = motosActives();
  if (!motos.length) return toast("Ajoutez d'abord une moto", true);
  const isNew = !plein.id;
  const p = Object.assign({ motoId: motos[0].id, date: todayISO() }, plein);
  Object.assign(PLEIN, { motoId: p.motoId, editId: p.id || null, station: p.station ? { id: p.stationId || '', nom: p.station, prix: p.prixLitre ? { [p.carburant || carburantDe(byId('motos', p.motoId))]: p.prixLitre } : {} } : null, stations: null, litresTapes: !isNew });
  const peut = isNew || peutModifierPlein(p);
  openModal({
    title: isNew ? '⛽ Faire le plein' : '⛽ Plein',
    body: `
      <div class="pf-motos">${motos.map((m) => `<button class="pf-moto-choix ${p.motoId === m.id ? 'on' : ''}" data-action="pfMoto" data-id="${m.id}" style="--mc:${esc(m.couleur || '#3b82f6')}">
        <span class="pf-mini">${m.photo ? `<img src="${m.photo}" alt="">` : motoHaut(m.couleur || '#3b82f6')}</span><b>${esc(nomMoto(m))}</b><small>${esc(fmtPlaque(m.plaque))}</small></button>`).join('')}</div>
      <div class="pf-etape"><b>1</b> Où avez-vous fait le plein ? <span class="carbu" id="pf-carbu">${carburantDe(byId('motos', p.motoId))}</span></div>
      <div id="pf-stations">${blocStations()}</div>
      <div class="pf-etape"><b>2</b> Combien avez-vous payé ?</div>
      <div class="pf-ecran">
        <label for="pf-euros"><span>MONTANT €</span><input id="pf-euros" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${p.montant ?? ''}" data-on-input="pfCalc"></label>
        <label for="pf-litres"><span>LITRES</span><input id="pf-litres" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${p.litres ?? ''}" data-on-input="pfLitres"></label>
        <div class="pf-prix" id="pf-prix"></div>
      </div>
      <div class="pf-jauge" id="pf-jauge"></div>
      <label class="pf-complet"><input type="checkbox" id="pf-complet" ${p.complet ? 'checked' : ''} data-on-change="pfCalc"> <span>⛽ Plein complet <em>(réservoir rempli jusqu'au bout)</em></span></label>
      <div class="form-grid" style="margin-top:4px">
        <label class="field"><span>🛣️ Compteur (km) — facultatif</span><input id="pf-km" type="number" inputmode="numeric" min="0" value="${p.km ?? ''}" placeholder="${esc(String(byId('motos', p.motoId)?.km || 'pour la jauge et la conso'))}"></label>
        <label class="field"><span>Date</span><input id="pf-date" type="date" value="${p.date}"></label>
      </div>`,
    foot: `${!isNew && peutModifierPlein(p) ? `<div class="left"><button class="btn danger" data-action="supprimerPlein" data-id="${p.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      ${peut ? `<button class="btn primary" data-action="enregistrerPlein">✅ Enregistrer le plein</button>` : ''}`,
    onMount: () => { pfCalcul(); },
  });
}
const peutModifierPlein = (p) => !Cloud.enabled || Cloud.role === 'admin' || p.auteur === auteurMoi();

function blocStations() {
  if (PLEIN.stations === 'chargement') return '<div class="pf-recherche"><span class="radar"></span> Recherche des stations autour de vous…</div>';
  const m = byId('motos', PLEIN.motoId), c = carburantDe(m);
  const autreOn = PLEIN.station === 'autre';
  if (Array.isArray(PLEIN.stations)) {
    const avecPrix = PLEIN.stations.filter((s) => s.prix[c]);
    const moinsCher = avecPrix.length ? Math.min(...avecPrix.map((s) => s.prix[c])) : null;
    return `<div class="pf-liste" role="radiogroup" aria-label="Stations proches">${PLEIN.stations.map((s) => `
      <button class="pf-station ${PLEIN.station && PLEIN.station.id === s.id ? 'on' : ''}" role="radio" aria-checked="${PLEIN.station && PLEIN.station.id === s.id}" data-action="pfStation" data-id="${esc(s.id)}">
        <span class="pump">⛽</span>
        <span class="st-txt"><b>${esc(s.nom)}</b><small>${esc(s.ville)}${s.dist != null ? ' · ' + fmtNombre(s.dist, 1) + ' km' : ''}${s.maj[c] ? ' · prix ' + ilYaHeures(s.maj[c]) : ''}</small></span>
        <span class="st-prix">${s.prix[c] ? `${fmtFixe(s.prix[c], 3)} €<small>${c} / L</small>${s.prix[c] === moinsCher ? '<i>💰 le moins cher</i>' : ''}` : `<small>pas de ${c}</small>`}</span>
      </button>`).join('')}
      <button class="pf-station autre ${autreOn ? 'on' : ''}" role="radio" aria-checked="${autreOn}" data-action="pfStation" data-id="autre"><span class="pump">✏️</span><span class="st-txt"><b>Autre station</b><small>pas dans la liste : je tape les litres moi-même</small></span></button>
    </div>`;
  }
  const deja = PLEIN.station && PLEIN.station !== 'autre' ? `<div class="pf-station on"><span class="pump">⛽</span><span class="st-txt"><b>${esc(PLEIN.station.nom)}</b></span></div>` : '';
  return `${deja}${typeof PLEIN.stations === 'string' ? `<div class="pf-erreur">${esc(PLEIN.stations)}</div>` : ''}
    <div class="pf-boutons"><button class="btn pf-chercher" data-action="pfChercher">📍 Chercher les stations autour de moi</button>
    <button class="btn ghost ${autreOn ? 'on' : ''}" data-action="pfStation" data-id="autre">✏️ Je tape les litres</button></div>`;
}

// Prix officiels des carburants (data.economie.gouv.fr, mis à jour en continu par les stations)
const URL_PRIX_CARBURANTS = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
function distanceKm(a, b) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const joliNom = (s) => String(s || '').toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (x, a, b) => a + b.toUpperCase());
async function stationsProches(pos) {
  const pt = `geom'POINT(${pos.lon} ${pos.lat})'`;
  const q = new URLSearchParams({ where: `within_distance(geom, ${pt}, 8km)`, order_by: `distance(geom, ${pt})`, limit: '12' });
  const r = await fetch(`${URL_PRIX_CARBURANTS}?${q}`);
  if (!r.ok) throw new Error('service des prix indisponible (' + r.status + ')');
  const j = await r.json();
  const num = (v) => (v == null || v === '' ? null : Number(v) > 10 ? Number(v) / 1000 : Number(v));
  return (j.results || []).map((x) => {
    const g = x.geom || {};
    const lat = g.lat ?? (x.latitude ? Number(x.latitude) / 100000 : null), lon = g.lon ?? (x.longitude ? Number(x.longitude) / 100000 : null);
    return {
      id: String(x.id), nom: joliNom(x.adresse) || 'Station', ville: joliNom(x.ville),
      dist: lat != null ? distanceKm(pos, { lat, lon }) : null,
      prix: { SP98: num(x.sp98_prix), E10: num(x.e10_prix), SP95: num(x.sp95_prix), Gazole: num(x.gazole_prix) },
      maj: { SP98: x.sp98_maj, E10: x.e10_maj, SP95: x.sp95_maj, Gazole: x.gazole_maj },
    };
  });
}
function maPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("ce téléphone ne donne pas sa position"));
    navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => reject(new Error(e.code === 1 ? "la position n'est pas autorisée (réglages du téléphone)" : 'position introuvable, réessayez dehors')),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  });
}

function niveauAvantPlein() {
  const m = byId('motos', PLEIN.motoId);
  const n = niveauEssence(m, PLEIN.editId);
  return n == null ? 0.15 : n;
}
function pfCalcul() {
  const m = byId('motos', PLEIN.motoId); if (!m || !$('#pf-euros')) return;
  const c = carburantDe(m);
  const eu = parseFloat($('#pf-euros').value), li = $('#pf-litres');
  const st = PLEIN.station && PLEIN.station !== 'autre' ? PLEIN.station : null;
  const prixL = st ? st.prix[c] : null;
  if (prixL && !PLEIN.litresTapes) { li.value = eu > 0 ? (eu / prixL).toFixed(2) : ''; li.classList.toggle('auto', eu > 0); }
  else li.classList.remove('auto');
  const l = parseFloat(li.value);
  $('#pf-prix').innerHTML = prixL
    ? (PLEIN.litresTapes ? `Litres corrigés à la main${l > 0 && eu > 0 ? ` · soit <b>${fmtFixe(eu / l, 3)} € / L</b>` : ''}` : `${c} à <b>${fmtFixe(prixL, 3)} € / L</b> ici · ${eu > 0 ? '✨ litres calculés tout seuls' : 'tapez le montant'}`)
    : l > 0 && eu > 0 ? `soit <b>${fmtFixe(eu / l, 3)} € / litre</b>` : PLEIN.station === 'autre' ? 'Tapez le montant et les litres du ticket' : 'Choisissez la station : les litres se calculeront tout seuls';
  // aperçu de la jauge
  const res = reservoirDe(m), av = niveauAvantPlein(), complet = $('#pf-complet').checked;
  const ap = complet ? 1 : Math.min(1, av + (l > 0 ? l / res : 0));
  $('#pf-jauge').innerHTML = `<div class="pfj-barre"><span class="avant" style="width:${Math.round(av * 100)}%"></span><span class="ajout" style="left:${Math.round(av * 100)}%;width:${Math.max(0, Math.round(ap * 100) - Math.round(av * 100))}%"></span></div>
    <div class="pfj-txt">Jauge : <b>${Math.round(av * 100)} %</b> → <b>${Math.round(ap * 100)} %</b> <em>· réservoir ${fmtNombre(res, 1)} L, il manquait ≈ ${fmtNombre(res * (1 - av), 1)} L</em></div>`;
}

/* ---------- Où est-elle ? (lieu « autre », précision) ---------- */
function openDeplacer(m) {
  const options = [
    ...DB.agences.map((a) => ({ type: 'agence', ref: a.id, emoji: '🏢', txt: a.nom, couleur: a.couleur })),
    { type: 'piste', emoji: '🏁', txt: 'Sur la piste' },
    ...DB.moniteurs.map((mo) => ({ type: 'moniteur', ref: mo.id, emoji: '🧑‍🏫', txt: `Avec ${moniteurNom(mo)}`, couleur: mo.couleur })),
    { type: 'garage', emoji: '🔧', txt: 'Au garage / en réparation' },
    { type: 'autre', emoji: '📍', txt: 'Autre endroit…' },
  ];
  const e = emplacementDe(m);
  openModal({
    title: `📍 Où est ${esc(nomMoto(m))} ?`,
    body: `
      <div class="choix-lieux">${options.map((o, i) => `<button class="choix-lieu ${e.type === o.type && (e.ref || '') === (o.ref || '') ? 'on' : ''}" data-action="choisirLieu" data-i="${i}" ${o.couleur ? `style="--lc:${esc(o.couleur)}"` : ''}>
        <span>${o.emoji}</span>${esc(o.txt)}</button>`).join('')}</div>
      <label class="field" style="margin-top:12px"><span>Précision (garage, adresse, remarque…) — obligatoire pour « Autre endroit »</span><input id="lieu-texte" value="${esc(e.texte || '')}"></label>
      <label class="field" style="margin-top:8px"><span>Compteur (km) — facultatif</span><input id="lieu-km" type="number" inputmode="numeric" min="0" value="${esc(m.km || '')}"></label>`,
    foot: '<button class="btn" data-action="closeModal">Fermer</button>',
  });
  openDeplacer.ctx = { motoId: m.id, options };
}

/* ---------- Ajouter / modifier une moto (direction) ---------- */
function openMoto(m) {
  const isNew = !m;
  m = m || { couleur: COULEURS_MOTO[(DB.motos || []).length % COULEURS_MOTO.length], categorie: 'A2', carburant: 'SP98', reservoir: 14, proprio: UI_MOTOS.agence || DB.agences[0]?.id || '' };
  openMoto.photo = m.photo || '';
  openModal({
    title: isNew ? '🏍️ Nouvelle moto' : `🏍️ ${esc(nomMoto(m))}`,
    body: `
      <form id="moto-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Surnom (ex : « La Bleue »)</span><input name="surnom" value="${esc(m.surnom || '')}"></label>
        <label class="field"><span>Modèle</span><input name="modele" value="${esc(m.modele || '')}" placeholder="ex : Yamaha MT-07"></label>
        <label class="field"><span>Plaque *</span><input name="plaque" value="${esc(m.plaque || '')}" required placeholder="AB-123-CD" style="text-transform:uppercase"></label>
        <label class="field"><span>🏷️ Appartient à l'auto-école *</span><select name="proprio" required>${DB.agences.map((a) => `<option value="${a.id}" ${m.proprio === a.id ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select></label>
        <label class="field"><span>Catégorie</span><select name="categorie">${CATEGORIES_MOTO.map((c) => `<option ${m.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="field"><span>Carburant</span><select name="carburant">${CARBURANTS.map((c) => `<option ${carburantDe(m) === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="field"><span>Réservoir (litres)</span><input name="reservoir" type="number" min="1" step="0.1" value="${esc(m.reservoir || 14)}"></label>
        <label class="field"><span>Compteur (km)</span><input name="km" type="number" min="0" value="${esc(m.km || '')}"></label>
        <label class="field"><span>Couleur</span><input name="couleur" type="color" value="${esc(m.couleur || '#3b82f6')}"></label>
        <div class="field full"><span>Photo de la moto</span>
          <div class="photo-moto-edit"><div id="moto-photo-apercu">${visuelMoto(m)}</div>
            <div class="row" style="gap:6px"><label class="btn">📷 ${m.photo ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/*" hidden data-on-change="motoPhoto"></label>
            ${m.photo ? '<button type="button" class="btn ghost" data-action="motoPhotoSuppr">Retirer</button>' : ''}</div>
            <span class="small muted">Sans photo, la moto est dessinée à sa couleur. Conseil : prenez-la de côté, sur un fond simple.</span></div></div>
        <label class="field full"><span>Notes (entretien, pneus, assurance…)</span><textarea name="notes">${esc(m.notes || '')}</textarea></label>
      </form>`,
    foot: `${!isNew ? `<div class="left"><button class="btn danger" data-action="archiverMoto" data-id="${m.id}">Retirer de la flotte</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="enregistrerMoto" data-id="${m.id || ''}">Enregistrer</button>`,
  });
}
// Photo réduite (JPEG ~ 60 Ko) pour rester légère en ligne
function photoReduite(file, max = 640) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image illisible')); };
    img.src = url;
  });
}

const MOTO_ACTIONS = {
  motosFiltre(d, el) { UI_MOTOS.filtre = el.value; render(); },
  motosMois(d, el) { if (el.value) { UI_MOTOS.mois = el.value; render(); } },
  motosAgence(d) { UI_MOTOS.agence = d.id || ''; render(); },
  vroum(d, el) { if (el.classList.contains('roule')) return; el.classList.add('roule'); setTimeout(() => el.classList.remove('roule'), 2400); },

  // plan
  planMoto(d, el, e) {
    if (e) e.stopPropagation();
    UI_MOTOS.choisie = UI_MOTOS.choisie === d.id ? null : d.id;
    majPlan();
    const aide = $('#plan-aide');
    if (aide) aide.textContent = UI_MOTOS.choisie ? `${nomMoto(byId('motos', d.id))} : touchez l'endroit où elle va.` : "Touchez une moto, puis l'endroit où elle va.";
  },
  planZone(d) {
    if (!UI_MOTOS.choisie) { const aide = $('#plan-aide'); if (aide) aide.textContent = "👆 Touchez d'abord une moto."; return; }
    const m = byId('motos', UI_MOTOS.choisie);
    const [type, ref] = d.cle.split(':');
    if (type === 'autre') { UI_MOTOS.choisie = null; majPlan(); return openDeplacer(m); }
    garerMoto(m, { type, ref: ref || '' });
  },
  ouEstElle(d) {
    UI_MOTOS.choisie = d.id; majPlan();
    const plan = $('#plan-motos'); if (plan) plan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const aide = $('#plan-aide'); if (aide) aide.textContent = `${nomMoto(byId('motos', d.id))} : touchez l'endroit où elle va.`;
  },

  // plein
  nouveauPlein(d) { openPlein({ motoId: d.moto || motosActives()[0]?.id }); },
  editPlein(d) { const p = (DB.pleins || []).find((x) => x.id === d.id); if (p) openPlein(p); },
  pfMoto(d) {
    PLEIN.motoId = d.id;
    $$('.pf-moto-choix').forEach((b) => b.classList.toggle('on', b.dataset.id === d.id));
    $('#pf-carbu').textContent = carburantDe(byId('motos', d.id));
    $('#pf-stations').innerHTML = blocStations(); pfCalcul();
  },
  async pfChercher() {
    PLEIN.stations = 'chargement'; $('#pf-stations').innerHTML = blocStations();
    try {
      PLEIN.position = await maPosition();
      PLEIN.stations = await stationsProches(PLEIN.position);
      if (!PLEIN.stations.length) PLEIN.stations = 'Aucune station trouvée à moins de 8 km.';
    } catch (e) {
      PLEIN.stations = 'Impossible de trouver les stations : ' + e.message + '. Vous pouvez taper les litres vous-même.';
    }
    if ($('#pf-stations')) { $('#pf-stations').innerHTML = blocStations(); pfCalcul(); }
  },
  pfStation(d) {
    PLEIN.station = d.id === 'autre' ? 'autre' : (Array.isArray(PLEIN.stations) ? PLEIN.stations.find((s) => s.id === d.id) : null);
    if (PLEIN.station !== 'autre') PLEIN.litresTapes = false;
    $('#pf-stations').innerHTML = blocStations(); pfCalcul();
    setTimeout(() => $('#pf-euros')?.focus(), 50);
  },
  pfCalc() { pfCalcul(); },
  pfLitres() { PLEIN.litresTapes = true; pfCalcul(); },
  enregistrerPlein() {
    const montant = round2($('#pf-euros').value), litres = round2($('#pf-litres').value);
    if (!(montant > 0)) { $('#pf-euros').focus(); return toast('Indiquez le montant payé en euros', true); }
    if (!(litres > 0)) { $('#pf-litres').focus(); return toast('Indiquez les litres, ou choisissez la station pour les calculer', true); }
    const m = byId('motos', PLEIN.motoId);
    DB.pleins = DB.pleins || [];
    let p = PLEIN.editId ? DB.pleins.find((x) => x.id === PLEIN.editId) : null;
    if (!p) { p = { id: uid(), auteur: auteurMoi(), auteurNom: nomAuteurMoi(), creeLe: new Date().toISOString() }; DB.pleins.push(p); }
    const st = PLEIN.station && PLEIN.station !== 'autre' ? PLEIN.station : null;
    const km = Number($('#pf-km').value) || null;
    Object.assign(p, {
      motoId: m.id, date: $('#pf-date').value || todayISO(), litres, montant, km,
      complet: $('#pf-complet').checked, carburant: carburantDe(m),
      station: st ? [st.nom, st.ville].filter(Boolean).join(', ') : (PLEIN.station === 'autre' ? '' : p.station || ''),
      stationId: st ? st.id : '', prixLitre: st && st.prix[carburantDe(m)] ? st.prix[carburantDe(m)] : round2(montant / litres * 1000) / 1000,
    });
    if (km && (!m.km || km > Number(m.km))) { m.km = km; m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi(); }
    save(); closeModal(); render();
    toast(`⛽ Plein de ${nomMoto(m)} enregistré : ${fmtFixe(litres)} L · ${eur(montant)}${st ? ' · ' + st.nom : ''}`);
  },
  supprimerPlein(d) {
    if (!confirm('Supprimer ce plein ?')) return;
    DB.pleins = DB.pleins.filter((x) => x.id !== d.id);
    save(); closeModal(); render();
  },

  // où est-elle (fenêtre)
  deplacerMoto(d) { const m = byId('motos', d.id); if (m) openDeplacer(m); },
  choisirLieu(d) {
    const { motoId, options } = openDeplacer.ctx;
    const o = options[+d.i];
    const m = byId('motos', motoId);
    const texte = $('#lieu-texte').value.trim();
    if (o.type === 'autre' && !texte) { $('#lieu-texte').focus(); return toast("Précisez l'endroit dans la case ci-dessous, puis touchez à nouveau « Autre endroit »", true); }
    m.emplacement = { type: o.type, ref: o.ref || '', texte: ['garage', 'autre'].includes(o.type) ? texte : '', majLe: new Date().toISOString() };
    const km = Number($('#lieu-km').value);
    if (km > 0) m.km = km;
    m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi();
    save(); closeModal(); render();
    toast(`${o.emoji} ${nomMoto(m)} : ${lieuMoto(m).txt}`);
  },

  // fiche moto (direction)
  editMoto(d) { openMoto(d.id ? byId('motos', d.id) : null); },
  async motoPhoto(d, el) {
    const file = el.files[0]; if (!file) return;
    try {
      openMoto.photo = await photoReduite(file);
      $('#moto-photo-apercu').innerHTML = `<img class="moto-photo" src="${openMoto.photo}" alt="">`;
    } catch (e) { toast('Photo non reconnue : ' + e.message, true); }
  },
  motoPhotoSuppr() { openMoto.photo = ''; $('#moto-photo-apercu').innerHTML = motoSVG($('#moto-form [name=couleur]').value); },
  enregistrerMoto(d) {
    const form = $('#moto-form');
    if (!form.reportValidity()) return;
    const f = formData(form);
    f.plaque = fmtPlaque(f.plaque);
    f.km = f.km ? Number(f.km) : '';
    f.reservoir = Number(f.reservoir) || 14;
    f.photo = openMoto.photo || '';
    DB.motos = DB.motos || [];
    if (d.id) Object.assign(byId('motos', d.id), f);
    else DB.motos.push({ id: uid(), ...f, emplacement: { type: 'agence', ref: f.proprio || DB.agences[0]?.id || '', texte: '', majLe: new Date().toISOString() } });
    save(); closeModal(); render(); toast('🏍️ Moto enregistrée');
  },
  archiverMoto(d) {
    const m = byId('motos', d.id);
    if (!confirm(`Retirer « ${nomMoto(m)} » de la flotte ? (ses pleins restent dans l'historique)`)) return;
    m.archivee = true; save(); closeModal(); render();
  },
};
