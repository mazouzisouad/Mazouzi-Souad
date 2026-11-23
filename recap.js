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

const nomCourtAg = (a) => String(a?.nom || '').replace(/^\s*(my\s+)?auto[\s-]*[ée]cole\s+|^\s*(familys|french)\s+permis\s+/i, '').trim() || a?.nom || '';
function animerRecap() {
  $$('.rcp-anneau circle.p').forEach((c) => { c.style.strokeDashoffset = c.dataset.off; });
  $$('.rcp-heures .b span').forEach((x) => { x.style.width = x.dataset.w + '%'; });
}
function viewRecap() {
  if (!UI_RECAP.mois) UI_RECAP.mois = todayISO().slice(0, 7);
  const mois = UI_RECAP.mois;
  const { moniteurs, agences } = recapMois(mois);
  const prec = (() => { const x = parseISO(mois + '-01'); x.setMonth(x.getMonth() - 1); return toISODate(x).slice(0, 7); })();
  const hPrec = recapMois(prec).moniteurs.reduce((t, r) => t + r.faites, 0);
  const nomMois = parseISO(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const totH = moniteurs.reduce((t, r) => t + r.faites, 0), totDu = moniteurs.reduce((t, r) => t + r.du, 0), totEnc = agences.reduce((t, A) => t + A.encaisse, 0);
  const nonPayes = moniteurs.filter((r) => r.taux && r.faites && !r.paie).length;
  const { total } = statsReussite();
  const pres = total.plateau.pres + total.circulation.pres, adm = total.plateau.admis + total.circulation.admis;
  const evol = hPrec ? Math.round(((totH - hPrec) / hPrec) * 100) : null;
  requestAnimationFrame(() => requestAnimationFrame(animerRecap));

  // moniteurs
  const carteMon = (r) => {
    const R = 50, C = 2 * Math.PI * R, pct = r.faites + r.prevues ? Math.min(1, r.faites / (r.faites + r.prevues)) : 0;
    const parts = [...r.parAgence.entries()].sort((x, y) => y[1] - x[1]);
    return `<div class="rcp-mon" style="--c:${esc(r.m.couleur || '#f97316')}">
      <div class="rcp-mon-tete"><div class="rcp-av">${esc((moniteurNom(r.m)[0] || '?').toUpperCase())}</div>
        <div><strong>${esc(moniteurNom(r.m))}</strong><span>${r.taux ? eur(r.taux) + " de l'heure" : `<button class="btn small" data-action="editMoniteur" data-id="${r.m.id}">Indiquer son taux horaire</button>`}</span>
          ${joursAbsence(r.m, mois) ? `<span class="rcp-abs">🌴 ${joursAbsence(r.m, mois)} jour${joursAbsence(r.m, mois) > 1 ? 's' : ''} d'absence</span>` : ''}</div></div>
      <div class="rcp-mon-corps">
        <div class="rcp-anneau"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="12"/>
          <circle class="p" cx="60" cy="60" r="${R}" fill="none" stroke="var(--c)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${C * (1 - pct)}"/></svg>
          <div class="txt"><div><b>${fmtH(r.faites)}</b><small>faites${r.prevues ? `<br>+ ${fmtH(r.prevues)} prévues` : ''}</small></div></div></div>
        <div class="rcp-paie">
          ${r.taux ? `<div class="calc">${fmtH(r.faites)} × ${eur(r.taux)}</div><div class="du ${r.paie ? 'ok' : ''}">${eur(r.du)}</div>` : '<div class="calc">Taux horaire à indiquer pour calculer sa paie</div>'}
          ${r.paie ? `<span class="rcp-tampon">✅ PAYÉ ${eur(r.paie.montant)} le ${fmtDate(r.paie.date)}</span> <button class="btn small ghost" data-action="recapAnnulerPaie" data-id="${r.m.id}" title="Annuler le paiement">✕</button>`
            : r.taux && r.faites ? `<button class="btn primary" data-action="recapPayer" data-id="${r.m.id}" data-montant="${r.du}">💶 Marquer payé</button>` : ''}
        </div>
      </div>
      ${parts.length ? `<div class="rcp-repart"><div class="lbl">Ses heures par auto-école</div>
        <div class="rcp-pile">${parts.map(([aid, h]) => `<span style="width:${(h / r.faites) * 100}%;background:${esc(byId('agences', aid)?.couleur || '#94a3b8')}" title="${esc(aid ? byId('agences', aid)?.nom : 'Sans élève')} : ${fmtH(h)}"></span>`).join('')}</div>
        <div class="rcp-leg">${parts.map(([aid, h]) => `<span><i style="background:${esc(byId('agences', aid)?.couleur || '#94a3b8')}"></i>${esc(aid ? nomCourtAg(byId('agences', aid)) : 'Sans élève')} ${fmtH(h)}${r.taux ? ' · ' + eur(h * r.taux) : ''}</span>`).join('')}</div></div>` : ''}
      <button class="btn small ghost" data-action="recapDetail" data-id="${r.m.id}">${UI_RECAP.ouvert === r.m.id ? '▲ Masquer les leçons' : `▼ Voir ses ${r.lecons.length} leçon${r.lecons.length > 1 ? 's' : ''}`}</button>
      ${UI_RECAP.ouvert === r.m.id ? `<div class="recap-lecons">${r.lecons.map((x) => `<div class="small"><strong>${fmtDate(x.date)}</strong> ${x.debut}–${x.fin} · ${TYPES[x.type].short} · ${participants(x).length} élève${participants(x).length > 1 ? 's' : ''} · ${fmtH(durH(x))}</div>`).join('') || '<p class="muted">Aucune leçon faite.</p>'}</div>` : ''}
    </div>`;
  };

  // auto-écoles
  const ags = agences.filter((A) => A.a.id || A.nbEleves || A.encaisse);
  const maxH = Math.max(1, ...ags.map((A) => A.hPlateau + A.hCirculation));
  const classe = ags.filter((A) => A.a.id).map((A) => ({ A, h: A.hPlateau + A.hCirculation })).filter((x) => x.h > 0).sort((x, y) => y.h - x.h);
  const ordre = [classe[1], classe[0], classe[2]], hs = [80, 110, 60], meds = ['🥈', '🥇', '🥉'], socles = ['#94a3b8', '#eab308', '#c2793f'];
  const podium = classe.length ? `<div class="rcp-podbox"><div class="rcp-podtitre">🏆 Les auto-écoles qui ont fait le plus d'heures ce mois</div>
    <div class="rcp-podium">${ordre.map((x, i) => x ? `<div class="marche"><span class="med">${meds[i]}</span><span class="nom">${esc(nomCourtAg(x.A.a))}</span><span class="tx">${fmtH(x.h)}</span>
      <div class="socle" style="height:${hs[i]}px;background:linear-gradient(${esc(x.A.a.couleur || '#64748b')}, ${socles[i]})">${i === 1 ? 1 : i === 0 ? 2 : 3}</div></div>` : '<div></div>').join('')}</div></div>` : '';
  const carteAg = (A) => `<div class="rcp-ag" style="--c:${esc(A.a.couleur || '#64748b')}">
    <div class="rcp-ag-tete"><strong><span class="rcp-pastille"></span>${esc(A.a.nom)}</strong><span class="rcp-enc"><small>💰 encaissé</small>${eur(A.encaisse)}</span></div>
    <div class="rcp-mini"><div><b>${A.nbEleves}</b><span>élèves vus</span></div><div><b>${fmtH(A.hMoniteur)}</b><span>temps moniteur</span></div><div><b>${eur(A.cout)}</b><span>coût moniteur</span></div></div>
    <div class="rcp-heures">
      <div class="rang"><span>🅿️ Plateau</span><div class="b"><span style="width:0;background:var(--plateau)" data-w="${(A.hPlateau / maxH) * 100}"></span></div><strong>${fmtH(A.hPlateau)}</strong></div>
      <div class="rang"><span>🛣️ Circu</span><div class="b"><span style="width:0;background:var(--circu)" data-w="${(A.hCirculation / maxH) * 100}"></span></div><strong>${fmtH(A.hCirculation)}</strong></div>
    </div>
    <div class="rcp-badges"><span>🎓 ${A.examens} examen${A.examens > 1 ? 's' : ''}</span><span>📝 ${A.blancs} ex. blanc${A.blancs > 1 ? 's' : ''}</span><span>🧭 ${A.evaluations} évaluation${A.evaluations > 1 ? 's' : ''}</span></div>
  </div>`;

  return `
  <div class="toolbar">
    <h1>📊 Récap du mois</h1>
    <div class="rcp-mois"><button data-action="recapMois" data-d="-1" aria-label="Mois précédent">◀</button>
      <input type="month" value="${mois}" data-on-change="recapMoisChoisi" aria-label="Mois"><button data-action="recapMois" data-d="1" aria-label="Mois suivant">▶</button></div>
    <div class="spacer"></div>
    <button class="btn" data-action="recapExport">⬇️ Export Excel</button>
  </div>
  <div class="rcp-heros">
    <div class="rcp-hero h1"><div class="ic">⏱️</div><div class="v">${fmtH(totH)}</div><div class="l">de conduite en ${esc(nomMois)}</div><div class="s">${evol == null ? 'moniteurs, leçons faites' : `${evol >= 0 ? '+' : ''}${evol} % par rapport au mois d'avant`}</div></div>
    <div class="rcp-hero h2"><div class="ic">💶</div><div class="v">${eur(totDu)}</div><div class="l">à payer aux moniteurs</div><div class="s">${nonPayes ? `${nonPayes} moniteur${nonPayes > 1 ? 's' : ''} pas encore payé${nonPayes > 1 ? 's' : ''}` : 'tout le monde est payé ✅'}</div></div>
    <div class="rcp-hero h3"><div class="ic">💰</div><div class="v">${eur(totEnc)}</div><div class="l">encaissés</div><div class="s">${DB.agences.length} auto-école${DB.agences.length > 1 ? 's' : ''}</div></div>
    <div class="rcp-hero h4"><div class="ic">🎯</div><div class="v">${pres ? Math.round((adm / pres) * 100) + ' %' : '—'}</div><div class="l">de réussite aux examens</div><div class="s">${pres ? `${adm} admis sur ${pres} · ${esc(periodeStats().nom)}` : 'aucun résultat sur la période'}</div></div>
  </div>

  <div class="card rcp-carte"><h2>👨‍🏫 Moniteurs</h2>
    ${moniteurs.length ? `<div class="rcp-mons">${moniteurs.map(carteMon).join('')}</div>` : '<p class="muted">Ajoutez vos moniteurs dans Paramètres.</p>'}
    <p class="small muted">Le moniteur est payé <strong>à l'heure</strong> : durée des leçons × son taux, quel que soit le nombre d'élèves (un plateau de 2 h avec 5 élèves = 2 h). Une leçon compte dès qu'elle est passée et qu'au moins un élève n'était pas excusé. Les accompagnements d'examen comptent pour leur durée.</p>
  </div>

  <div class="card rcp-carte"><h2>🏢 Auto-écoles</h2>
    ${podium}
    <div class="rcp-ags">${ags.map(carteAg).join('')}</div>
    <p class="small muted">Plateau / Circu : heures de leçon faites par les élèves de l'auto-école. Temps moniteur : les heures payées au moniteur, partagées selon le nombre d'élèves de chaque auto-école dans chaque leçon (ex. 2 h avec 3 élèves de Tremblay et 2 de Smile → Tremblay 1h12, Smile 0h48). Coût moniteur = ce temps × le taux horaire.</p>
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
function jaugeReussite(titre, x) {
  if (!x.pres) return `<div class="rcp-jauge"><svg viewBox="0 0 120 70"><path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/></svg><b class="muted">—</b><span>${titre} · aucun résultat</span></div>`;
  const t = Math.round((x.admis / x.pres) * 100), ang = Math.PI * (1 - t / 100);
  const ex = 60 + 48 * Math.cos(ang), ey = 62 - 48 * Math.sin(ang);
  const col = t >= 70 ? 'var(--ok)' : t >= 50 ? 'var(--warn)' : 'var(--bad)';
  return `<div class="rcp-jauge"><svg viewBox="0 0 120 70"><path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/>
    ${t > 0 ? `<path d="M12 62 A48 48 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/>` : ''}</svg>
    <b style="color:${col}">${t} %</b><span>${titre} · ${x.admis}/${x.pres} admis${x.prem ? ` · 1er passage ${Math.round((x.premAdmis / x.prem) * 100)} %` : ''}</span></div>`;
}
function puceTaux(x) {
  if (!x.pres) return '<span class="rcp-puce vide">—</span>';
  const t = Math.round((x.admis / x.pres) * 100);
  return `<span class="rcp-puce ${t >= 70 ? 'ok' : t >= 50 ? 'moyen' : 'bas'}" title="${x.admis}/${x.pres} admis">${t} %</span>`;
}
function blocReussite() {
  const { parAg, parMon, total } = statsReussite();
  const per = periodeStats();
  const ligne = (nom, couleur, x) => `<div class="rang"><span><span class="rcp-pastille" style="--c:${esc(couleur)}"></span>${nom}</span>${puceTaux(x.plateau)}${puceTaux(x.circulation)}<span class="muted small">${x.absents ? x.absents + ' abs.' : ''}</span></div>`;
  const ags = DB.agences.filter((a) => parAg.has(a.id));
  const mons = DB.moniteurs.filter((m) => parMon.has(m.id));
  return `
  <div class="card rcp-carte">
    <div class="row between"><h2 style="margin:0">🎯 Réussite aux examens <span class="small muted" style="font-weight:600">· ${esc(per.nom)}</span></h2>
      <div class="seg">${[['mois', 'Ce mois'], ['annee', 'Année'], ['12mois', '12 derniers mois']].map(([k, l]) => `<button class="${UI_RECAP.periodeStats === k ? 'on' : ''}" data-action="recapPeriode" data-p="${k}">${l}</button>`).join('')}</div></div>
    <div class="rcp-reu">
      <div class="rcp-jauges">${jaugeReussite('🅿️ Plateau', total.plateau)}${jaugeReussite('🛣️ Circulation', total.circulation)}</div>
      <div class="rcp-liste">
        <div class="rang tete"><span></span><span>🅿️ Plateau</span><span>🛣️ Circu</span><span></span></div>
        ${ags.map((a) => ligne(esc(a.nom), a.couleur || '#64748b', parAg.get(a.id))).join('') || '<p class="muted small">Aucun résultat d\'examen sur cette période.</p>'}
        ${mons.length ? `<div class="rang tete" style="margin-top:6px"><span>Par moniteur accompagnateur</span><span></span><span></span><span></span></div>${mons.map((m) => ligne(esc(moniteurNom(m)), m.couleur || '#64748b', parMon.get(m.id))).join('')}` : ''}
      </div>
    </div>
    <p class="small muted">Examens notés « Admis » ou « Ajourné » ; les absents sont comptés à part. Le moniteur est celui qui a accompagné l'élève à l'examen.</p>
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
