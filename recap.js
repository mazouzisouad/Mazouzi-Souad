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

const UI_RECAP = { mois: '', ouvert: null };
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
};
