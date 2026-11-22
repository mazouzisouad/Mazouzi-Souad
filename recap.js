/* =====================================================================
   RÉCAP DU MOIS (direction uniquement)
   • Par moniteur : heures faites (leçons, examens blancs, accompagnements
     d'examen), heures encore prévues, taux horaire, montant dû, répartition
     par auto-école, détail des leçons, « payé ».
   • Par auto-école : heures faites par ses élèves, part du temps moniteur
     (au prorata des élèves présents) et son coût, examens, évaluations,
     encaissements.
   • Export Excel (CSV).
   Une leçon compte pour le moniteur dès qu'elle est passée et qu'au moins un
   élève n'était pas « excusé » (un absent non excusé compte : il était là).
   ===================================================================== */
'use strict';

const UI_RECAP = { mois: '', ouvert: null, periodeStats: 'annee' };
const tauxDe = (m) => Number(m && m.tauxHoraire) || 0;

function seancePassee(s) {
  const auj = todayISO();
  if (s.date < auj) return true;
  if (s.date > auj) return false;
  return s.fin <= new Date().toTimeString().slice(0, 5);
}
// participants qui comptent (pas les excusés)
const participants = (s) => s.eleves.filter((p) => p.statut !== 'excuse');
const seanceCompte = (s) => !s.eleves.length || participants(s).length > 0;

function recapMois(mois) {
  const seances = DB.seances.filter((s) => s.date.startsWith(mois)).sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
  const parMon = new Map(DB.moniteurs.map((m) => [m.id, { m, faites: 0, prevues: 0, lecons: [], parAgence: new Map() }]));
  const parAg = new Map(DB.agences.map((a) => [a.id, { a, eleves: new Set(), hPlateau: 0, hCirculation: 0, hMoniteur: 0, cout: 0, examens: 0, blancs: 0, evaluations: 0, encaisse: 0 }]));
  const agSans = { a: { id: '', nom: 'Sans auto-école' }, eleves: new Set(), hPlateau: 0, hCirculation: 0, hMoniteur: 0, cout: 0, examens: 0, blancs: 0, evaluations: 0, encaisse: 0 };
  const ag = (id) => parAg.get(id) || agSans;
  for (const s of seances) {
    const r = parMon.get(s.moniteurId); if (!r) continue;
    if (!seanceCompte(s)) continue;
    const h = durH(s);
    if (!seancePassee(s)) { r.prevues += h; continue; }
    r.faites += h;
    r.lecons.push(s);
    // part du temps du moniteur par auto-école, au prorata des élèves
    const ps = participants(s);
    if (!ps.length) { const x = r.parAgence.get('') || 0; r.parAgence.set('', x + h); continue; }
    for (const p of ps) {
      const e = byId('eleves', p.eleveId); const aid = e?.agenceId || '';
      const part = h / ps.length;
      r.parAgence.set(aid, (r.parAgence.get(aid) || 0) + part);
      const A = ag(aid);
      A.hMoniteur += part; A.cout += part * tauxDe(r.m);
      A.eleves.add(p.eleveId);
      if (isExam(s.type)) A.examens++;
      else {
        const mode = modeP(s, p);
        if (mode === 'evaluation') A.evaluations++;
        else if (mode === 'blanc') A.blancs++;
        if (['present', 'absent', 'valide', 'nonvalide', 'prevu'].includes(p.statut)) { if (baseDe(s.type) === 'circulation') A.hCirculation += h; else A.hPlateau += h; }
      }
    }
  }
  for (const p of DB.paiements.filter((x) => (x.date || '').startsWith(mois))) {
    const e = byId('eleves', p.eleveId);
    ag(e?.agenceId || '').encaisse += Number(p.montant || 0);
  }
  const moniteurs = [...parMon.values()].map((r) => ({ ...r, taux: tauxDe(r.m), du: round2(r.faites * tauxDe(r.m)), paie: (r.m.paies || {})[mois] || null }));
  const agences = [...parAg.values(), ...(agSans.eleves.size || agSans.encaisse ? [agSans] : [])].map((A) => ({ ...A, nbEleves: A.eleves.size, cout: round2(A.cout), encaisse: round2(A.encaisse) }));
  return { moniteurs, agences };
}

function viewRecap() {
  if (!UI_RECAP.mois) UI_RECAP.mois = todayISO().slice(0, 7);
  const mois = UI_RECAP.mois;
  const { moniteurs, agences } = recapMois(mois);
  const nomMois = parseISO(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const totH = moniteurs.reduce((t, r) => t + r.faites, 0), totDu = moniteurs.reduce((t, r) => t + r.du, 0), totEnc = agences.reduce((t, A) => t + A.encaisse, 0);
  const agNom = (id) => (id ? byId('agences', id)?.nom || '—' : 'Sans élève / sans auto-école');
  return `
  <div class="toolbar">
    <h1>📊 Récap du mois</h1>
    <button class="btn" data-action="recapMois" data-d="-1" aria-label="Mois précédent">◀</button>
    <input type="month" value="${mois}" data-on-change="recapMoisChoisi" style="width:auto">
    <button class="btn" data-action="recapMois" data-d="1" aria-label="Mois suivant">▶</button>
    <div class="spacer"></div>
    <button class="btn" data-action="recapExport">⬇️ Export Excel</button>
  </div>
  <div class="mini-stats card" style="margin-bottom:14px">
    <div><span>Heures moniteurs (${esc(nomMois)})</span><strong>${fmtH(totH)}</strong></div>
    <div><span>À payer aux moniteurs</span><strong style="color:var(--bad)">${eur(totDu)}</strong></div>
    <div><span>Encaissé (toutes auto-écoles)</span><strong style="color:var(--ok)">${eur(totEnc)}</strong></div>
  </div>

  <div class="card">
    <h2>👨‍🏫 Moniteurs</h2>
    ${moniteurs.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Moniteur</th><th class="num">Heures faites</th><th class="num">Encore prévues ce mois</th><th class="num">Taux horaire</th><th class="num">Montant dû</th><th>Paiement</th><th></th></tr></thead>
      <tbody>${moniteurs.map((r) => `
        <tr>
          <td><span class="dot" style="background:${esc(r.m.couleur)}"></span><strong>${esc(moniteurNom(r.m))}</strong></td>
          <td class="num"><strong>${fmtH(r.faites)}</strong></td>
          <td class="num muted">${r.prevues ? fmtH(r.prevues) : '—'}</td>
          <td class="num">${r.taux ? eur(r.taux) + ' /h' : `<button class="btn small" data-action="editMoniteur" data-id="${r.m.id}">Indiquer le taux</button>`}</td>
          <td class="num"><strong class="${r.paie ? '' : 'txt-bad'}">${r.taux ? eur(r.du) : '—'}</strong></td>
          <td>${r.paie ? `<span class="badge ok">✅ Payé ${eur(r.paie.montant)} le ${fmtDate(r.paie.date)}</span> <button class="btn small ghost" data-action="recapAnnulerPaie" data-id="${r.m.id}" title="Annuler">✕</button>`
            : r.taux && r.faites ? `<button class="btn small primary" data-action="recapPayer" data-id="${r.m.id}" data-montant="${r.du}">Marquer payé</button>` : ''}</td>
          <td><button class="btn small" data-action="recapDetail" data-id="${r.m.id}">${UI_RECAP.ouvert === r.m.id ? 'Masquer' : 'Détail'}</button></td>
        </tr>
        ${UI_RECAP.ouvert === r.m.id ? `<tr class="recap-detail"><td colspan="7">
          <div class="recap-cols">
            <div><div class="lbl">Temps par auto-école (au prorata des élèves)</div>
              ${[...r.parAgence.entries()].sort((a, b) => b[1] - a[1]).map(([aid, h]) => `<div class="cpt-l"><span>${esc(agNom(aid))}</span><strong>${fmtH(h)}${r.taux ? ' · ' + eur(h * r.taux) : ''}</strong></div>`).join('') || '<p class="muted">Aucune heure.</p>'}</div>
            <div><div class="lbl">Leçons faites (${r.lecons.length})</div>
              <div class="recap-lecons">${r.lecons.map((s) => `<div class="small"><strong>${fmtDate(s.date)}</strong> ${s.debut}–${s.fin} · ${TYPES[s.type].short} · ${participants(s).length} élève${participants(s).length > 1 ? 's' : ''} · ${fmtH(durH(s))}</div>`).join('') || '<p class="muted">Aucune.</p>'}</div></div>
          </div></td></tr>` : ''}`).join('')}</tbody>
      <tfoot><tr><td><strong>Total</strong></td><td class="num"><strong>${fmtH(totH)}</strong></td><td></td><td></td><td class="num"><strong>${eur(totDu)}</strong></td><td colspan="2"></td></tr></tfoot>
    </table></div>` : '<p class="muted">Ajoutez vos moniteurs dans Paramètres.</p>'}
    <p class="small muted">Une leçon compte dès qu'elle est passée et qu'au moins un élève n'était pas excusé (un absent non excusé compte : le moniteur était là). Les accompagnements d'examen comptent pour leur durée.</p>
  </div>

  <div class="card" style="margin-top:14px">
    <h2>🏢 Auto-écoles</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Auto-école</th><th class="num">Élèves vus</th><th class="num">Heures plateau</th><th class="num">Heures circu</th><th class="num">Temps moniteur</th><th class="num">Coût moniteur</th><th class="num">Examens</th><th class="num">Ex. blancs</th><th class="num">Évaluations</th><th class="num">Encaissé</th></tr></thead>
      <tbody>${agences.map((A) => `<tr>
        <td>${A.a.id ? agenceBadge(A.a) : esc(A.a.nom)}</td>
        <td class="num">${A.nbEleves || '—'}</td>
        <td class="num">${A.hPlateau ? fmtH(A.hPlateau) : '—'}</td><td class="num">${A.hCirculation ? fmtH(A.hCirculation) : '—'}</td>
        <td class="num"><strong>${A.hMoniteur ? fmtH(A.hMoniteur) : '—'}</strong></td><td class="num">${A.cout ? eur(A.cout) : '—'}</td>
        <td class="num">${A.examens || '—'}</td><td class="num">${A.blancs || '—'}</td><td class="num">${A.evaluations || '—'}</td>
        <td class="num"><strong style="color:var(--ok)">${A.encaisse ? eur(A.encaisse) : '—'}</strong></td></tr>`).join('')}</tbody>
    </table></div>
    <p class="small muted">« Heures plateau / circu » : heures de leçon suivies par les élèves de l'auto-école (un élève = ses heures). « Temps moniteur » : la durée de chaque leçon partagée entre les auto-écoles selon le nombre de leurs élèves présents ; « Coût moniteur » = ce temps × le taux horaire du moniteur, pour les comptes entre auto-écoles.</p>
  </div>
  ${blocReussite()}`;
}


/* ---------- Réussite aux examens (par auto-école et par moniteur accompagnateur) ---------- */
function periodeStats() {
  const mois = UI_RECAP.mois || todayISO().slice(0, 7);
  if (UI_RECAP.periodeStats === 'mois') return { du: mois + '-01', au: mois + '-31', nom: parseISO(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) };
  if (UI_RECAP.periodeStats === '12mois') { const d = parseISO(mois + '-01'); d.setMonth(d.getMonth() - 11); return { du: toISODate(d), au: mois + '-31', nom: '12 derniers mois' }; }
  return { du: mois.slice(0, 4) + '-01-01', au: mois.slice(0, 4) + '-12-31', nom: 'année ' + mois.slice(0, 4) };
}
function statsReussite() {
  const { du, au } = periodeStats();
  const vide = () => ({ plateau: { pres: 0, admis: 0, prem: 0, premAdmis: 0 }, circulation: { pres: 0, admis: 0, prem: 0, premAdmis: 0 }, absents: 0 });
  const parAg = new Map(), parMon = new Map(), total = vide();
  for (const s of DB.seances) {
    if (!isExam(s.type) || s.date < du || s.date > au) continue;
    const base = baseDe(s.type);
    for (const p of s.eleves) {
      const e = byId('eleves', p.eleveId);
      const cibles = [total, parAg.get(e?.agenceId || '') || parAg.set(e?.agenceId || '', vide()).get(e?.agenceId || ''), parMon.get(s.moniteurId) || parMon.set(s.moniteurId, vide()).get(s.moniteurId)];
      if (p.statut === 'absent') { cibles.forEach((c) => c.absents++); continue; }
      if (!['admis', 'ajourne'].includes(p.statut)) continue;
      const premier = numeroPassage(p.eleveId, s) === 1;
      for (const c of cibles) {
        c[base].pres++; if (p.statut === 'admis') c[base].admis++;
        if (premier) { c[base].prem++; if (p.statut === 'admis') c[base].premAdmis++; }
      }
    }
  }
  return { parAg, parMon, total };
}
function cellTaux(x) {
  if (!x.pres) return '<td class="num muted">—</td>';
  const t = Math.round((x.admis / x.pres) * 100);
  return `<td class="num"><strong class="taux ${t >= 70 ? 'ok' : t >= 50 ? 'moyen' : 'bas'}">${t} %</strong><br><span class="small muted">${x.admis}/${x.pres}${x.prem ? ` · 1er passage ${Math.round((x.premAdmis / x.prem) * 100)} %` : ''}</span></td>`;
}
function blocReussite() {
  const { parAg, parMon, total } = statsReussite();
  const per = periodeStats();
  const ligne = (nom, x) => `<tr><td>${nom}</td>${cellTaux(x.plateau)}${cellTaux(x.circulation)}<td class="num">${x.absents || '—'}</td></tr>`;
  const ags = DB.agences.filter((a) => parAg.has(a.id));
  const mons = DB.moniteurs.filter((m) => parMon.has(m.id));
  return `
  <div class="card" style="margin-top:14px">
    <div class="row between"><h2 style="margin:0">🎯 Réussite aux examens</h2>
      <div class="seg">${[['mois', 'Ce mois'], ['annee', 'Année'], ['12mois', '12 derniers mois']].map(([k, l]) => `<button class="${UI_RECAP.periodeStats === k ? 'on' : ''}" data-action="recapPeriode" data-p="${k}">${l}</button>`).join('')}</div></div>
    <p class="small muted">${esc(per.nom)} · examens notés « Admis » ou « Ajourné ». Le moniteur est celui qui a accompagné l'élève à l'examen.</p>
    ${total.plateau.pres || total.circulation.pres || total.absents ? `
    <div class="table-wrap"><table>
      <thead><tr><th></th><th class="num">Plateau</th><th class="num">Circulation</th><th class="num">Absents</th></tr></thead>
      <tbody>
        ${ligne('<strong>Toutes les auto-écoles</strong>', total)}
        ${ags.map((a) => ligne(agenceBadge(a), parAg.get(a.id))).join('')}
        ${mons.length ? `<tr class="sous-titre"><td colspan="4">Par moniteur</td></tr>${mons.map((m) => ligne(`<span class="dot" style="background:${esc(m.couleur)}"></span>${esc(moniteurNom(m))}`, parMon.get(m.id))).join('')}` : ''}
      </tbody></table></div>` : '<p class="muted">Aucun résultat d\'examen sur cette période.</p>'}
  </div>`;
}

function exportRecapCsv() {
  const mois = UI_RECAP.mois;
  const { moniteurs, agences } = recapMois(mois);
  const n = (x) => String(round2(x)).replace('.', ',');
  const l = [];
  l.push(`Récap du mois ${mois}`, '', 'MONITEURS', 'Moniteur;Heures faites;Heures encore prévues;Taux horaire (€);Montant dû (€);Payé le');
  for (const r of moniteurs) l.push([moniteurNom(r.m), n(r.faites), n(r.prevues), n(r.taux), n(r.du), r.paie ? fmtDate(r.paie.date) : ''].join(';'));
  l.push('', 'TEMPS MONITEUR PAR AUTO-ÉCOLE', 'Moniteur;Auto-école;Heures;Montant (€)');
  for (const r of moniteurs) for (const [aid, h] of r.parAgence) l.push([moniteurNom(r.m), aid ? byId('agences', aid)?.nom : 'Sans auto-école', n(h), n(h * r.taux)].join(';'));
  l.push('', 'AUTO-ÉCOLES', 'Auto-école;Élèves vus;Heures plateau;Heures circulation;Temps moniteur;Coût moniteur (€);Examens;Examens blancs;Évaluations;Encaissé (€)');
  for (const A of agences) l.push([A.a.nom, A.nbEleves, n(A.hPlateau), n(A.hCirculation), n(A.hMoniteur), n(A.cout), A.examens, A.blancs, A.evaluations, n(A.encaisse)].join(';'));
  l.push('', 'DÉTAIL DES LEÇONS', 'Moniteur;Date;Début;Fin;Type;Durée (h);Élèves (auto-école)');
  for (const r of moniteurs) for (const s of r.lecons) l.push([moniteurNom(r.m), fmtDate(s.date), s.debut, s.fin, TYPES[s.type].label, n(durH(s)), participants(s).map((p) => { const e = byId('eleves', p.eleveId); return `${eleveNom(e)} (${agenceDe(e)?.nom || '—'})`; }).join(' / ')].join(';'));
  downloadBlob(new Blob(['﻿' + l.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `recap-${mois}.csv`);
}


/* ---------- Export pour le comptable : factures et encaissements du mois, par auto-école ---------- */
function exportComptable(mois, agenceId) {
  const n = (x) => String(round2(x)).replace('.', ',');
  const agOk = (eid) => !agenceId || byId('eleves', eid)?.agenceId === agenceId;
  const ags = agenceId ? [byId('agences', agenceId)] : [...DB.agences, { id: '', nom: 'Sans auto-école' }];
  const l = [`Export comptable ${mois}${agenceId ? ' - ' + byId('agences', agenceId).nom : ''}`, ''];
  let totF = 0, totE = 0;
  for (const a of ags) {
    const fac = DB.factures.filter((f) => f.date.startsWith(mois) && agOk(f.eleveId) && (f.agenceId || byId('eleves', f.eleveId)?.agenceId || '') === a.id).sort((x, y) => x.numero.localeCompare(y.numero));
    const enc = DB.paiements.filter((p) => (p.date || '').startsWith(mois) && agOk(p.eleveId) && (byId('eleves', p.eleveId)?.agenceId || '') === a.id).sort((x, y) => x.date.localeCompare(y.date));
    if (!fac.length && !enc.length) continue;
    const ec = a.id ? ecoleDe(a) : {};
    l.push(`AUTO-ÉCOLE : ${a.nom}${ec.siret ? ' - SIRET ' + ec.siret : ''}`);
    l.push('FACTURES', 'Date;Numéro;Élève;Total HT (€);TVA (€);Total TTC (€);Taux TVA;Payé (€);Statut');
    let sHT = 0, sTVA = 0, sTTC = 0;
    for (const f of fac) {
      const t = factureTotaux(f); sHT += t.ht; sTVA += t.tva; sTTC += t.ttc;
      l.push([fmtDate(f.date), f.numero, eleveNom(byId('eleves', f.eleveId)), n(t.ht), n(t.tva), n(t.ttc), t.taux + ' %', n(facturePaye(f)), factureStatut(f).label].join(';'));
    }
    l.push(`Total factures;;;${n(sHT)};${n(sTVA)};${n(sTTC)};;;`, '');
    l.push('ENCAISSEMENTS', 'Date;Élève;Mode;Référence;Facture;Montant (€)');
    const parMode = {};
    let sE = 0;
    for (const p of enc) {
      sE += Number(p.montant || 0); parMode[p.mode] = (parMode[p.mode] || 0) + Number(p.montant || 0);
      l.push([fmtDate(p.date), eleveNom(byId('eleves', p.eleveId)), p.mode || '', (p.reference || '').replace(/;/g, ','), byId('factures', p.factureId)?.numero || 'acompte', n(p.montant)].join(';'));
    }
    l.push(`Total encaissé;;;;;${n(sE)}`, ...Object.entries(parMode).map(([m, v]) => `dont ${m};;;;;${n(v)}`), '', '');
    totF += sTTC; totE += sE;
  }
  if (!agenceId) l.push(`TOTAL TOUTES AUTO-ÉCOLES;Factures TTC;${n(totF)};Encaissé;${n(totE)}`);
  downloadBlob(new Blob(['﻿' + l.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `compta-${mois}${agenceId ? '-' + prefixeFactureDe(byId('agences', agenceId)) : ''}.csv`);
}
function openExportComptable() {
  openModal({
    title: '⬇️ Export pour le comptable',
    body: `<div class="form-grid">
      <label class="field"><span>Mois</span><input type="month" id="cpt-mois" value="${(UI.moisEnc || todayISO()).slice(0, 7)}"></label>
      <label class="field"><span>Auto-école</span><select id="cpt-ag"><option value="">Toutes (une partie par auto-école)</option>${DB.agences.map((a) => `<option value="${a.id}" ${UI.filtreAgence === a.id ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select></label>
    </div>
    <p class="small muted">Fichier Excel (CSV) : pour chaque auto-école, la liste des factures du mois (HT, TVA, TTC, payé) et des encaissements (mode, référence, facture), avec les totaux.</p>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" data-action="comptaTelecharger">⬇️ Télécharger</button>`,
  });
}

const RECAP_ACTIONS = {
  recapMois(d) { const x = parseISO(UI_RECAP.mois + '-01'); x.setMonth(x.getMonth() + Number(d.d)); UI_RECAP.mois = toISODate(x).slice(0, 7); render(); },
  recapMoisChoisi(d, el) { if (el.value) { UI_RECAP.mois = el.value; render(); } },
  recapDetail(d) { UI_RECAP.ouvert = UI_RECAP.ouvert === d.id ? null : d.id; render(); },
  recapPayer(d) {
    const m = byId('moniteurs', d.id); if (!m) return;
    openModal({
      title: `💶 Paiement de ${esc(moniteurNom(m))}`,
      body: `<form id="paie-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Montant payé (€)</span><input name="montant" type="number" step="0.01" min="0" value="${esc(d.montant)}" required></label>
        <label class="field"><span>Payé le</span><input name="date" type="date" value="${todayISO()}" required></label>
        <label class="field full"><span>Note (facultatif)</span><input name="note" placeholder="ex : virement, espèces…"></label>
      </form>
      <p class="small muted">Pour ${esc(parseISO(UI_RECAP.mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))} : ${fmtH(recapMois(UI_RECAP.mois).moniteurs.find((r) => r.m.id === m.id)?.faites || 0)} × ${eur(tauxDe(m))} = ${eur(d.montant)}.</p>`,
      foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" data-action="recapPayerOk" data-id="${m.id}">Enregistrer</button>`,
    });
  },
  recapPayerOk(d) {
    const form = $('#paie-form'); if (!form.reportValidity()) return;
    const v = formData(form); const m = byId('moniteurs', d.id);
    m.paies = m.paies || {};
    m.paies[UI_RECAP.mois] = { montant: round2(v.montant), date: v.date, note: v.note || '' };
    save(); closeModal(); render(); toast(`✅ Paiement de ${moniteurNom(m)} noté : ${eur(v.montant)}`);
  },
  recapAnnulerPaie(d) {
    const m = byId('moniteurs', d.id); if (!m || !confirm('Annuler ce paiement ?')) return;
    delete m.paies[UI_RECAP.mois]; save(); render();
  },
  recapExport() { exportRecapCsv(); },
  recapPeriode(d) { UI_RECAP.periodeStats = d.p; render(); },
  exportComptable() { openExportComptable(); },
  comptaTelecharger() { const m = $('#cpt-mois').value; if (!m) return; exportComptable(m, $('#cpt-ag').value); closeModal(); toast('⬇️ Export téléchargé'); },
};
