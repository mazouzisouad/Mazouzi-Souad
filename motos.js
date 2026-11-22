/* =====================================================================
   MOTOS — flotte, pleins d'essence, où sont les motos
   Cartes ludiques : surnom, plaque, où se trouve la moto, dernier plein ;
   « ⛽ Plein » en deux touches ; « 📍 Où est-elle ? » en un tap ;
   statistiques : dépense du mois, consommation, moto la plus sobre.
   Les moniteurs peuvent noter les pleins et déplacer les motos.
   ===================================================================== */
'use strict';

const COULEURS_MOTO = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#db2777', '#111827'];
const CATEGORIES_MOTO = ['A2', 'A', '125 cm³', 'Autre'];

const motosActives = () => (DB.motos || []).filter((m) => !m.archivee);
const pleinsDe = (motoId) => (DB.pleins || []).filter((p) => p.motoId === motoId).sort((a, b) => (a.date + (a.creeLe || '')).localeCompare(b.date + (b.creeLe || '')));
const nomMoto = (m) => (m ? (m.surnom || m.modele || m.plaque || 'Moto') : '—');
const fmtPlaque = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]{2})(\d{3})([A-Z]{2})$/, '$1-$2-$3') || '—';
const auteurMoi = () => (Cloud.user ? (Cloud.user.email || '').toLowerCase() : 'local');
const nomAuteurMoi = () => (estMoniteur() ? moniteurNom(byId('moniteurs', Cloud.monId)) : 'Direction');

function ilYa(iso) {
  if (!iso) return '';
  const j = Math.round((parseISO(todayISO()) - parseISO(iso.slice(0, 10))) / 86400000);
  return j <= 0 ? "aujourd'hui" : j === 1 ? 'hier' : `il y a ${j} j`;
}

// Où est la moto ?
function lieuMoto(m) {
  const e = m.emplacement || {};
  if (e.type === 'agence') { const a = byId('agences', e.ref); return { emoji: '🏢', txt: a ? a.nom : 'Agence', couleur: a?.couleur }; }
  if (e.type === 'piste') return { emoji: '🏁', txt: 'Sur la piste' };
  if (e.type === 'garage') return { emoji: '🔧', txt: e.texte ? `Au garage · ${e.texte}` : 'Au garage' };
  if (e.type === 'moniteur') { const mo = byId('moniteurs', e.ref); return { emoji: '🧑‍🏫', txt: mo ? `Avec ${moniteurNom(mo)}` : 'Avec un moniteur', couleur: mo?.couleur }; }
  if (e.type === 'autre') return { emoji: '📍', txt: e.texte || 'Autre endroit' };
  return { emoji: '❓', txt: 'Endroit inconnu' };
}

// Consommation moyenne (L/100 km) à partir des pleins avec kilométrage
function consoMoto(motoId) {
  const p = pleinsDe(motoId).filter((x) => Number(x.km) > 0);
  if (p.length < 2) return null;
  const km = Number(p[p.length - 1].km) - Number(p[0].km);
  const litres = p.slice(1).reduce((s, x) => s + Number(x.litres || 0), 0);
  return km > 0 ? (litres / km) * 100 : null;
}

function statsMois(mois) {
  const l = (DB.pleins || []).filter((p) => p.date.startsWith(mois));
  return { euros: l.reduce((s, p) => s + Number(p.montant || 0), 0), litres: l.reduce((s, p) => s + Number(p.litres || 0), 0), nb: l.length };
}


/* ---------- Essence qui reste (estimation) ----------
   Après un plein, le réservoir est plein ; ensuite on retire ce que la moto
   consomme selon les km notés depuis (conso mesurée, sinon 5 L/100 km). */
function niveauEssence(m) {
  const pl = pleinsDe(m.id);
  const dernier = pl[pl.length - 1];
  if (!dernier) return null;
  const reservoir = Number(m.reservoir) || 14;
  const conso = consoMoto(m.id) || 5;
  const km = Number(m.km) > 0 && Number(dernier.km) > 0 ? Math.max(0, Number(m.km) - Number(dernier.km)) : 0;
  return Math.max(0, Math.min(1, 1 - (km * conso) / 100 / reservoir));
}

/* ---------- Moto dessinée (quand il n'y a pas encore de photo) ---------- */
function motoSVG(c) {
  const roue = (x) => `<g class="roue"><circle cx="${x}" cy="88" r="23" fill="#111827"/><circle cx="${x}" cy="88" r="16" fill="#9ca3af"/><circle cx="${x}" cy="88" r="12.5" fill="#374151"/>
    ${[0, 60, 120].map((a) => `<rect x="${x - 1.5}" y="76" width="3" height="24" fill="#d1d5db" transform="rotate(${a} ${x} 88)"/>`).join('')}<circle cx="${x}" cy="88" r="4" fill="#e5e7eb"/></g>`;
  const g = 'g' + c.replace(/[^0-9a-f]/gi, '');
  return `<svg class="moto-svg" viewBox="0 0 200 115" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <ellipse cx="100" cy="112" rx="82" ry="3.5" fill="rgba(0,0,0,.15)"/>
    ${roue(42)}${roue(158)}
    <g class="caisse">
      <path d="M42 88 L96 78" stroke="#4b5563" stroke-width="6" stroke-linecap="round"/>
      <path d="M130 40 L158 88" stroke="#d1d5db" stroke-width="6" stroke-linecap="round"/>
      <rect x="80" y="62" width="34" height="24" rx="5" fill="#4b5563"/>
      <rect x="86" y="66" width="22" height="4" rx="2" fill="#6b7280"/><rect x="86" y="74" width="22" height="4" rx="2" fill="#6b7280"/>
      <path d="M66 86 L116 84 L118 92 L70 95 Z" fill="#9ca3af"/>
      <path d="M36 50 L60 46 L64 58 L40 60 Z" fill="${c}"/>
      <path d="M56 50 Q72 42 88 48 L86 58 Q70 58 58 60 Z" fill="#111827"/>
      <path d="M84 50 Q98 32 126 40 L134 56 Q110 66 84 62 Z" fill="${c}"/>
      <path d="M84 50 Q98 32 126 40 L134 56 Q110 66 84 62 Z" fill="url(#${g})"/>
      <path d="M126 34 L140 28" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>
      <circle cx="141" cy="50" r="7" fill="#fde68a" stroke="#1f2937" stroke-width="2"/>
      <path d="M140 72 Q158 58 176 74" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g></svg>`;
}
const visuelMoto = (m) => (m.photo ? `<img class="moto-photo" src="${m.photo}" alt="${esc(nomMoto(m))}">` : motoSVG(m.couleur || '#2563eb'));

function jaugeSVG(n) {
  return `<svg class="jauge" viewBox="0 0 120 74" role="img" aria-label="${n == null ? 'Essence inconnue' : 'Essence environ ' + Math.round(n * 100) + ' %'}">
    <path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/>
    <path d="M12 60 A48 48 0 0 1 26 26" fill="none" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/>
    <path d="M94 26 A48 48 0 0 1 108 60" fill="none" stroke="#22c55e" stroke-width="10" stroke-linecap="round"/>
    <text x="7" y="73">E</text><text x="105" y="73">F</text>
    <g class="aiguille" data-angle="${n == null ? -90 : -90 + 180 * n}" style="transform:rotate(-90deg)"><path d="M58 60 L60 18 L62 60 Z" fill="var(--ink)"/></g>
    <circle cx="60" cy="60" r="6" fill="var(--ink)"/></svg>`;
}

/* ---------- Le plan : où sont les motos ---------- */
function zonesPlan() {
  const haut = DB.agences.map((a) => ({ cle: 'agence:' + a.id, type: 'agence', ref: a.id, e: '🏢', nom: a.nom, c: a.couleur || '#60a5fa' }));
  const bas = [{ cle: 'piste:', type: 'piste', ref: '', e: '🏁', nom: 'Piste', c: '#f97316' },
    ...DB.moniteurs.map((mo) => ({ cle: 'moniteur:' + mo.id, type: 'moniteur', ref: mo.id, e: '🧑‍🏫', nom: 'Avec ' + moniteurNom(mo), c: mo.couleur || '#a855f7' })),
    { cle: 'garage:', type: 'garage', ref: '', e: '🔧', nom: 'Garage', c: '#64748b' }];
  if (motosActives().some((m) => m.emplacement?.type === 'autre')) bas.push({ cle: 'autre:', type: 'autre', ref: '', e: '📍', nom: 'Ailleurs', c: '#0ea5e9' });
  const parRang = window.innerWidth < 600 ? 3 : 5;
  const rangs = [];
  for (const groupe of [haut, bas]) for (let i = 0; i < groupe.length; i += parRang) rangs.push(groupe.slice(i, i + parRang));
  rangs.forEach((r, ri) => r.forEach((z, i) => { z.x = ((i + 1) / (r.length + 1)) * 100; z.y = ((ri + 0.5) / rangs.length) * 100; }));
  return { zones: rangs.flat(), hauteur: rangs.length * 128 };
}
const cleLieu = (m) => { const e = m.emplacement || {}; return (e.type || 'agence') + ':' + (['agence', 'moniteur'].includes(e.type) ? (e.ref || '') : ''); };

function positionsPlan(zones, motos) {
  const pos = {};
  for (const z of zones) {
    const ici = motos.filter((m) => cleLieu(m) === z.cle);
    ici.forEach((m, i) => { pos[m.id] = { x: z.x, y: z.y, dx: (i - (ici.length - 1) / 2) * 44 - 21, dy: 6 }; });
  }
  return pos;
}

function planMotos(motos) {
  const { zones, hauteur } = zonesPlan();
  const pos = positionsPlan(zones, motos);
  const route = (z) => `<path d="M${z.x} ${z.y} Q ${(z.x + 50) / 2} 50 50 50" vector-effect="non-scaling-stroke"/>`;
  return `
  <div class="card plan-card">
    <div class="row between" style="margin-bottom:8px"><h2 style="margin:0">📍 Où sont les motos ?</h2><span class="small muted" id="plan-aide">Touchez une moto, puis l'endroit où elle va.</span></div>
    <div class="plan" id="plan" style="height:${hauteur}px">
      <svg class="routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${zones.map(route).join('')}${zones.map((z) => route(z).replace('<path', '<path class="ligne"')).join('')}
        <ellipse cx="50" cy="50" rx="4" ry="6" fill="var(--route)"/></svg>
      ${zones.map((z) => `<button class="zone" data-action="planZone" data-cle="${z.cle}" style="--z:${esc(z.c)};left:${z.x}%;top:${z.y}%"><span class="ze">${z.e}</span>${esc(z.nom)}</button>`).join('')}
      ${motos.filter((m) => pos[m.id]).map((m) => { const p = pos[m.id]; return `<button class="mchip ${m.photo ? 'photo' : ''}" data-action="planMoto" data-id="${m.id}" title="${esc(nomMoto(m))}" aria-label="${esc(nomMoto(m))}"
        style="--mc:${esc(m.couleur || '#2563eb')};left:calc(${p.x}% + ${p.dx}px);top:calc(${p.y}% + ${p.dy}px)">${m.photo ? `<img src="${m.photo}" alt="">` : motoSVG(m.couleur || '#2563eb')}<span class="bulle">${esc(nomMoto(m))}</span></button>`; }).join('')}
    </div>
  </div>`;
}

// Après affichage : aiguilles et compteurs qui bougent
const MEMO_JAUGES = {};
function animerMotos() {
  $$('.moto-card').forEach((c) => {
    const id = c.dataset.id;
    const a = c.querySelector('.aiguille');
    if (a) {
      const avant = MEMO_JAUGES[id] ?? -90;
      a.style.transition = 'none'; a.style.transform = `rotate(${avant}deg)`;
      a.getBoundingClientRect();
      a.style.transition = ''; a.style.transform = `rotate(${a.dataset.angle}deg)`;
      MEMO_JAUGES[id] = +a.dataset.angle;
    }
  });
}

const UI_MOTOS = { filtre: '', mois: '', choisie: null };

function viewMotos() {
  const motos = motosActives();
  const mois = todayISO().slice(0, 7);
  if (!UI_MOTOS.mois) UI_MOTOS.mois = mois;
  const st = statsMois(mois);
  const consos = motos.map((m) => ({ m, c: consoMoto(m.id) })).filter((x) => x.c);
  const sobre = consos.sort((a, b) => a.c - b.c)[0];
  requestAnimationFrame(animerMotos);
  const parLieu = {};
  for (const m of motos) { const l = lieuMoto(m); parLieu[l.emoji] = (parLieu[l.emoji] || 0) + 1; }

  // 6 derniers mois
  const moisList = Array.from({ length: 6 }, (_, i) => { const d = parseISO(mois + '-01'); d.setMonth(d.getMonth() - 5 + i); return toISODate(d).slice(0, 7); });
  const valeurs = moisList.map((k) => statsMois(k).euros);
  const max = Math.max(1, ...valeurs);

  const pleins = (DB.pleins || []).filter((p) => (!UI_MOTOS.filtre || p.motoId === UI_MOTOS.filtre) && p.date.startsWith(UI_MOTOS.mois))
    .sort((a, b) => (b.date + (b.creeLe || '')).localeCompare(a.date + (a.creeLe || '')));

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
    <div class="ms"><span class="ms-emoji">📍</span><div><strong>${motos.length} moto${motos.length > 1 ? 's' : ''}</strong><span>${Object.entries(parLieu).map(([e, n]) => `${e} ${n}`).join('  ') || 'aucune pour l\'instant'}</span></div></div>
  </div>

  ${motos.length ? `<div class="motos-grid">${motos.map(carteMoto).join('')}</div>${planMotos(motos)}`
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
        <thead><tr><th>Date</th><th>Moto</th><th class="num">Litres</th><th class="num">Montant</th><th class="num">€/L</th><th>Par</th></tr></thead>
        <tbody>${pleins.map((p) => { const m = byId('motos', p.motoId); return `<tr class="clickable" data-action="editPlein" data-id="${p.id}">
          <td>${fmtDate(p.date)}</td>
          <td><span class="dot" style="background:${esc(m?.couleur || '#94a3b8')}"></span>${esc(nomMoto(m))}</td>
          <td class="num">${fmtNombre(p.litres)} L</td><td class="num"><strong>${eur(p.montant)}</strong></td>
          <td class="num">${p.litres ? fmtNombre(p.montant / p.litres, 3) : '—'}</td>
          <td class="small muted">${esc(p.auteurNom || '')}</td></tr>`; }).join('')}</tbody>
        <tfoot><tr><td colspan="2"><strong>Total</strong></td><td class="num"><strong>${fmtNombre(pleins.reduce((s, p) => s + Number(p.litres || 0), 0))} L</strong></td><td class="num"><strong>${eur(pleins.reduce((s, p) => s + Number(p.montant || 0), 0))}</strong></td><td colspan="2"></td></tr></tfoot>
      </table></div>` : '<p class="muted">Aucun plein ce mois-ci.</p>'}
    </div>
  </div>`;
}

const fmtNombre = (n, d = 1) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });

function carteMoto(m) {
  const l = lieuMoto(m);
  const pl = pleinsDe(m.id);
  const dernier = pl[pl.length - 1];
  const conso = consoMoto(m.id);
  const niv = niveauEssence(m);
  const couleur = m.couleur || '#2563eb';
  return `
  <div class="moto-card" data-id="${m.id}" style="--mc:${esc(couleur)}">
    <div class="moto-top">
      <div class="moto-titre"><strong>${esc(nomMoto(m))}</strong><span>${esc([m.modele, m.categorie].filter(Boolean).join(' · '))}</span></div>
      ${estMoniteur() ? '' : `<button class="btn small ghost moto-edit" data-action="editMoto" data-id="${m.id}" title="Modifier / ajouter une photo">✏️</button>`}
    </div>
    <button class="scene ${m.photo ? 'avec-photo' : ''}" data-action="vroum" title="Vroum !">
      ${m.photo ? '' : '<div class="sol"></div>'}${visuelMoto(m)}
      ${!m.photo && !estMoniteur() ? '<span class="ajout-photo">📷 Ajoutez une photo avec ✏️</span>' : ''}
    </button>
    <div class="plaque"><span class="plaque-f">F</span><span class="plaque-n">${esc(fmtPlaque(m.plaque))}</span><span class="plaque-d"></span></div>
    <div class="moto-lieu" ${l.couleur ? `style="--lc:${esc(l.couleur)}"` : ''}><span>${l.emoji}</span> ${esc(l.txt)}${m.emplacement?.majLe ? `<small>${ilYa(m.emplacement.majLe)}</small>` : ''}</div>
    <div class="moto-tableau">
      <div class="jauge-bloc">${jaugeSVG(niv)}<strong class="${niv != null && niv < 0.2 ? 'bas' : ''}">${niv == null ? 'Essence ?' : niv < 0.2 ? '⚠️ Presque vide' : '≈ ' + Math.round(niv * 100) + ' %'}</strong></div>
      <dl class="moto-infos">
        <div><dt>Compteur</dt><dd class="odo">${m.km ? Number(m.km).toLocaleString('fr-FR') + ' km' : '—'}</dd></div>
        <div><dt>Dernier plein</dt><dd>${dernier ? `${ilYa(dernier.date)} · ${fmtNombre(dernier.litres)} L` : '—'}</dd></div>
        <div><dt>Conso</dt><dd>${conso ? fmtNombre(conso) + ' L/100' : '—'}</dd></div>
      </dl>
    </div>
    <div class="moto-actions">
      <button class="btn primary" data-action="nouveauPlein" data-moto="${m.id}">⛽ Plein</button>
      <button class="btn" data-action="deplacerMoto" data-id="${m.id}">📍 Où est-elle ?</button>
    </div>
  </div>`;
}

/* ---------- Faire le plein ---------- */
function openPlein(plein) {
  const isNew = !plein.id;
  const motos = motosActives();
  if (!motos.length) return toast("Ajoutez d'abord une moto", true);
  const p = Object.assign({ motoId: motos[0].id, date: todayISO() }, plein);
  openModal({
    title: isNew ? '⛽ Faire le plein' : '⛽ Plein',
    body: `
      <div class="lbl" style="margin-top:0">Quelle moto ?</div>
      <div class="choix-motos">${motos.map((m) => `<button class="choix-moto ${p.motoId === m.id ? 'on' : ''}" data-action="pleinMoto" data-id="${m.id}" style="--mc:${esc(m.couleur || '#2563eb')}">
        <span>🏍️</span><strong>${esc(nomMoto(m))}</strong><small>${esc(fmtPlaque(m.plaque))}</small></button>`).join('')}</div>
      <form id="plein-form" class="form-grid" onsubmit="return false" style="margin-top:12px">
        <input type="hidden" name="motoId" value="${esc(p.motoId)}">
        <label class="field gros"><span>Litres</span><input name="litres" type="number" inputmode="decimal" step="0.01" min="0" value="${p.litres ?? ''}" placeholder="ex : 12,5" data-on-input="pleinCalcul"></label>
        <label class="field gros"><span>Montant (€)</span><input name="montant" type="number" inputmode="decimal" step="0.01" min="0" value="${p.montant ?? ''}" placeholder="ex : 23,40" data-on-input="pleinCalcul"></label>
        <label class="field"><span>Compteur (km) — facultatif</span><input name="km" type="number" inputmode="numeric" min="0" value="${p.km ?? ''}" placeholder="pour calculer la conso"></label>
        <label class="field"><span>Date</span><input name="date" type="date" value="${p.date}"></label>
        <label class="field full"><span>Station — facultatif</span><input name="station" value="${esc(p.station || '')}" list="stations" placeholder="ex : Total, Leclerc…"></label>
        <datalist id="stations">${[...new Set((DB.pleins || []).map((x) => x.station).filter(Boolean))].map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
      </form>
      <div id="plein-prix" class="plein-prix"></div>`,
    foot: `${!isNew && peutModifierPlein(p) ? `<div class="left"><button class="btn danger" data-action="supprimerPlein" data-id="${p.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      ${isNew || peutModifierPlein(p) ? `<button class="btn primary" data-action="enregistrerPlein" data-id="${p.id || ''}">Enregistrer</button>` : ''}`,
    onMount: () => { MOTO_ACTIONS.pleinCalcul(); if (isNew) setTimeout(() => $('#plein-form [name=litres]')?.focus(), 80); },
  });
}
const peutModifierPlein = (p) => !Cloud.enabled || Cloud.role === 'admin' || p.auteur === auteurMoi();

/* ---------- Où est la moto ? ---------- */
function openDeplacer(m) {
  const options = [
    ...DB.agences.map((a) => ({ type: 'agence', ref: a.id, emoji: '🏢', txt: a.nom, couleur: a.couleur })),
    { type: 'piste', emoji: '🏁', txt: 'Sur la piste' },
    ...DB.moniteurs.map((mo) => ({ type: 'moniteur', ref: mo.id, emoji: '🧑‍🏫', txt: `Avec ${moniteurNom(mo)}`, couleur: mo.couleur })),
    { type: 'garage', emoji: '🔧', txt: 'Au garage / en réparation' },
    { type: 'autre', emoji: '📍', txt: 'Autre endroit…' },
  ];
  const e = m.emplacement || {};
  openModal({
    title: `📍 Où est ${esc(nomMoto(m))} ?`,
    body: `
      <div class="choix-lieux">${options.map((o, i) => `<button class="choix-lieu ${e.type === o.type && (e.ref || '') === (o.ref || '') ? 'on' : ''}" data-action="choisirLieu" data-i="${i}" ${o.couleur ? `style="--lc:${esc(o.couleur)}"` : ''}>
        <span>${o.emoji}</span>${esc(o.txt)}</button>`).join('')}</div>
      <label class="field" style="margin-top:12px"><span>Précision (garage, adresse, remarque…) — facultatif</span><input id="lieu-texte" value="${esc(e.texte || '')}"></label>
      <label class="field" style="margin-top:8px"><span>Compteur (km) — facultatif</span><input id="lieu-km" type="number" inputmode="numeric" min="0" value="${esc(m.km || '')}"></label>`,
    foot: '<button class="btn" data-action="closeModal">Fermer</button>',
  });
  openDeplacer.ctx = { motoId: m.id, options };
}

/* ---------- Ajouter / modifier une moto (direction) ---------- */
function openMoto(m) {
  const isNew = !m;
  openMoto.photo = m ? m.photo || '' : '';
  m = m || { couleur: COULEURS_MOTO[(DB.motos || []).length % COULEURS_MOTO.length], categorie: 'A2' };
  openModal({
    title: isNew ? '🏍️ Nouvelle moto' : `🏍️ ${esc(nomMoto(m))}`,
    body: `
      <form id="moto-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Surnom (ex : « La Bleue »)</span><input name="surnom" value="${esc(m.surnom || '')}"></label>
        <label class="field"><span>Modèle</span><input name="modele" value="${esc(m.modele || '')}" placeholder="ex : Yamaha MT-07"></label>
        <label class="field"><span>Plaque *</span><input name="plaque" value="${esc(m.plaque || '')}" required placeholder="AB-123-CD" style="text-transform:uppercase"></label>
        <label class="field"><span>Catégorie</span><select name="categorie">${CATEGORIES_MOTO.map((c) => `<option ${m.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="field"><span>Compteur (km)</span><input name="km" type="number" min="0" value="${esc(m.km || '')}"></label>
        <label class="field"><span>Réservoir (litres)</span><input name="reservoir" type="number" min="1" step="0.1" value="${esc(m.reservoir || 14)}"></label>
        <label class="field"><span>Couleur de la carte</span><input name="couleur" type="color" value="${esc(m.couleur || '#2563eb')}"></label>
        <div class="field full"><span>Photo de la moto</span>
          <div class="photo-moto-edit"><div id="moto-photo-apercu">${visuelMoto(m)}</div>
            <div class="row" style="gap:6px"><label class="btn">📷 ${m.photo ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/*" hidden data-on-change="motoPhoto"></label>
            ${m.photo ? '<button type="button" class="btn ghost" data-action="motoPhotoSuppr">Retirer</button>' : ''}</div>
            <span class="small muted">Prenez la moto de côté, sur un fond simple : c'est plus joli.</span></div></div>
        <label class="field full"><span>Notes (entretien, pneus, assurance…)</span><textarea name="notes">${esc(m.notes || '')}</textarea></label>
      </form>`,
    foot: `${!isNew ? `<div class="left"><button class="btn danger" data-action="archiverMoto" data-id="${m.id}">Retirer de la flotte</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="enregistrerMoto" data-id="${m.id || ''}">Enregistrer</button>`,
  });
}

const MOTO_ACTIONS = {
  async motoPhoto(d, el) {
    const file = el.files[0]; if (!file) return;
    try {
      openMoto.photo = await photoReduite(file);
      $('#moto-photo-apercu').innerHTML = `<img class="moto-photo" src="${openMoto.photo}" alt="">`;
    } catch (e) { toast('Photo non reconnue : ' + e.message, true); }
  },
  motoPhotoSuppr() { openMoto.photo = ''; $('#moto-photo-apercu').innerHTML = motoSVG($('#moto-form [name=couleur]').value); },
  vroum(d, el) {
    if (el.classList.contains('roule')) return;
    el.classList.add('roule'); setTimeout(() => el.classList.remove('roule'), 1600);
  },
  planMoto(d, el) {
    UI_MOTOS.choisie = UI_MOTOS.choisie === d.id ? null : d.id;
    $$('.mchip').forEach((c) => c.classList.toggle('choisie', c.dataset.id === UI_MOTOS.choisie));
    $('#plan').classList.toggle('en-choix', !!UI_MOTOS.choisie);
    $('#plan-aide').textContent = UI_MOTOS.choisie ? `${nomMoto(byId('motos', d.id))} : touchez l'endroit où elle va.` : "Touchez une moto, puis l'endroit où elle va.";
  },
  planZone(d) {
    if (!UI_MOTOS.choisie) { $('#plan-aide').textContent = "👆 Touchez d'abord une moto."; return; }
    const m = byId('motos', UI_MOTOS.choisie); UI_MOTOS.choisie = null;
    const [type, ref] = d.cle.split(':');
    if (type === 'autre') { openDeplacer(m); return; }
    m.emplacement = { type, ref: ref || '', texte: '', majLe: new Date().toISOString() };
    m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi();
    save();
    // la moto roule jusqu'à sa nouvelle place, puis on rafraîchit
    const { zones } = zonesPlan();
    const pos = positionsPlan(zones, motosActives());
    for (const c of $$('.mchip')) {
      const p = pos[c.dataset.id]; if (!p) continue;
      const avant = c.offsetLeft, apres = (p.x / 100) * $('#plan').clientWidth + p.dx;
      c.style.left = `calc(${p.x}% + ${p.dx}px)`; c.style.top = `calc(${p.y}% + ${p.dy}px)`;
      if (c.dataset.id === m.id) {
        c.classList.remove('choisie'); c.classList.add('roule');
        c.classList.toggle('gauche', apres < avant - 1);
      }
    }
    $('#plan').classList.remove('en-choix');
    $('#plan-aide').textContent = `${lieuMoto(m).emoji} ${nomMoto(m)} : ${lieuMoto(m).txt}`;
    setTimeout(() => { if (UI.view === 'motos' && !$('.modal')) render(); }, 1500);
  },
  motosFiltre(d, el) { UI_MOTOS.filtre = el.value; render(); },
  motosMois(d, el) { if (el.value) { UI_MOTOS.mois = el.value; render(); } },
  nouveauPlein(d) { openPlein({ motoId: d.moto || motosActives()[0]?.id }); },
  editPlein(d) { const p = (DB.pleins || []).find((x) => x.id === d.id); if (p) openPlein(p); },
  pleinMoto(d) {
    $('#plein-form [name=motoId]').value = d.id;
    $$('.choix-moto').forEach((b) => b.classList.toggle('on', b.dataset.id === d.id));
  },
  pleinCalcul() {
    const f = $('#plein-form'); if (!f) return;
    const l = Number(f.litres.value); const mt = Number(f.montant.value);
    $('#plein-prix').innerHTML = l > 0 && mt > 0 ? `soit <strong>${fmtNombre(mt / l, 3)} € / litre</strong>` : '';
  },
  enregistrerPlein(d) {
    const f = formData($('#plein-form'));
    const litres = round2(f.litres); const montant = round2(f.montant);
    if (!(litres > 0)) return toast('Indiquez le nombre de litres', true);
    if (!(montant > 0)) return toast('Indiquez le montant', true);
    DB.pleins = DB.pleins || [];
    let p = d.id ? DB.pleins.find((x) => x.id === d.id) : null;
    if (!p) { p = { id: uid(), auteur: auteurMoi(), auteurNom: nomAuteurMoi(), creeLe: new Date().toISOString() }; DB.pleins.push(p); }
    Object.assign(p, { motoId: f.motoId, date: f.date || todayISO(), litres, montant, km: f.km ? Number(f.km) : null, station: f.station || '' });
    const m = byId('motos', f.motoId);
    if (m && p.km && (!m.km || p.km > Number(m.km))) { m.km = p.km; m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi(); }
    save(); closeModal(); render();
    toast(`⛽ Plein enregistré : ${fmtNombre(litres)} L · ${eur(montant)}`);
  },
  supprimerPlein(d) {
    if (!confirm('Supprimer ce plein ?')) return;
    DB.pleins = DB.pleins.filter((x) => x.id !== d.id);
    save(); closeModal(); render();
  },
  deplacerMoto(d) { const m = byId('motos', d.id); if (m) openDeplacer(m); },
  choisirLieu(d) {
    const { motoId, options } = openDeplacer.ctx;
    const o = options[+d.i];
    const m = byId('motos', motoId);
    const texte = $('#lieu-texte').value.trim();
    if (o.type === 'autre' && !texte) { $('#lieu-texte').focus(); return toast('Précisez l\'endroit dans la case ci-dessous, puis touchez à nouveau « Autre endroit »', true); }
    m.emplacement = { type: o.type, ref: o.ref || '', texte: ['garage', 'autre'].includes(o.type) ? texte : '', majLe: new Date().toISOString() };
    const km = Number($('#lieu-km').value);
    if (km > 0) m.km = km;
    m.majLe = new Date().toISOString(); m.majPar = nomAuteurMoi();
    save(); closeModal(); render();
    toast(`${o.emoji} ${nomMoto(m)} : ${lieuMoto(m).txt}`);
  },
  editMoto(d) { openMoto(d.id ? byId('motos', d.id) : null); },
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
    else DB.motos.push({ id: uid(), ...f, emplacement: DB.agences[0] ? { type: 'agence', ref: DB.agences[0].id, texte: '', majLe: new Date().toISOString() } : {} });
    save(); closeModal(); render(); toast('🏍️ Moto enregistrée');
  },
  archiverMoto(d) {
    const m = byId('motos', d.id);
    if (!confirm(`Retirer « ${nomMoto(m)} » de la flotte ? (ses pleins restent dans l'historique)`)) return;
    m.archivee = true; save(); closeModal(); render();
  },
};

// Photo de moto : réduite (JPEG ~ 60 Ko) pour rester légère en ligne
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
