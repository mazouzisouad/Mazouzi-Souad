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

const UI_MOTOS = { filtre: '', mois: '' };

function viewMotos() {
  const motos = motosActives();
  const mois = todayISO().slice(0, 7);
  if (!UI_MOTOS.mois) UI_MOTOS.mois = mois;
  const st = statsMois(mois);
  const consos = motos.map((m) => ({ m, c: consoMoto(m.id) })).filter((x) => x.c);
  const sobre = consos.sort((a, b) => a.c - b.c)[0];
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

  ${motos.length ? `<div class="motos-grid">${motos.map(carteMoto).join('')}</div>`
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
  const couleur = m.couleur || '#2563eb';
  return `
  <div class="moto-card" style="--mc:${esc(couleur)}">
    <div class="moto-top">
      <div class="moto-emoji">🏍️</div>
      <div class="moto-titre"><strong>${esc(nomMoto(m))}</strong><span>${esc([m.modele, m.categorie].filter(Boolean).join(' · '))}</span></div>
      ${estMoniteur() ? '' : `<button class="btn small ghost moto-edit" data-action="editMoto" data-id="${m.id}" title="Modifier">✏️</button>`}
    </div>
    <div class="plaque"><span class="plaque-f">F</span><span class="plaque-n">${esc(fmtPlaque(m.plaque))}</span><span class="plaque-d"></span></div>
    <div class="moto-lieu" ${l.couleur ? `style="--lc:${esc(l.couleur)}"` : ''}><span>${l.emoji}</span> ${esc(l.txt)}${m.emplacement?.majLe ? `<small>${ilYa(m.emplacement.majLe)}</small>` : ''}</div>
    <div class="moto-infos">
      <div><span>Dernier plein</span><strong>${dernier ? `${ilYa(dernier.date)} · ${fmtNombre(dernier.litres)} L` : '—'}</strong></div>
      <div><span>Compteur</span><strong>${m.km ? Number(m.km).toLocaleString('fr-FR') + ' km' : '—'}</strong></div>
      <div><span>Conso</span><strong>${conso ? fmtNombre(conso) + ' L/100' : '—'}</strong></div>
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
        <label class="field"><span>Couleur de la carte</span><input name="couleur" type="color" value="${esc(m.couleur || '#2563eb')}"></label>
        <label class="field full"><span>Notes (entretien, pneus, assurance…)</span><textarea name="notes">${esc(m.notes || '')}</textarea></label>
      </form>`,
    foot: `${!isNew ? `<div class="left"><button class="btn danger" data-action="archiverMoto" data-id="${m.id}">Retirer de la flotte</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="enregistrerMoto" data-id="${m.id || ''}">Enregistrer</button>`,
  });
}

const MOTO_ACTIONS = {
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
