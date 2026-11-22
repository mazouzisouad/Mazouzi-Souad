/* =====================================================================
   COMPTE DE L'ÉLÈVE — forfait, paiements libres, heures payées
   • L'élève prend un forfait (ex. « Forfait 20h A2 », 950 € pour 20 h, soit
     47,50 € l'heure) et le paie quand il veut, du montant qu'il veut.
   • Ce qu'il a payé lui donne droit à des heures : on lui pose des leçons à
     hauteur de son règlement. L'appli montre les heures payées, les heures
     posées, celles qui ne sont pas encore payées et ce qu'il reste à régler
     sur le forfait. Au-delà des heures du forfait : tarif horaire.
   • Sans forfait : chaque heure est au tarif horaire.
   • Examens (accompagnement / repassage) et lignes ajoutées à la main sur une
     facture s'ajoutent ; les paiements les couvrent en premier.
   ===================================================================== */
'use strict';

const STATUTS_FAITS = ['present', 'absent', 'valide', 'nonvalide']; // heures dues (l'absence non excusée est due)

const forfaitDe = (e) => (e && e.forfait && (Number(e.forfait.prix) > 0 || Number(e.forfait.heures) > 0) ? e.forfait : null);
const heuresDuForfait = (p) => Number(p.heures) || 0;
const prixHeureForfait = (f) => (f && heuresDuForfait(f) > 0 ? Number(f.prix) / heuresDuForfait(f) : null);

// ajout : une leçon en cours de création / modification, à compter à la place de sa version enregistrée
function compteEleve(eid, ajout) {
  const e = byId('eleves', eid);
  const f = forfaitDe(e);
  const auj = todayISO();
  const tauxF = prixHeureForfait(f);
  const res = {
    forfait: f, inclus: f ? heuresDuForfait(f) : 0, tauxForfait: tauxF,
    heuresFaites: 0, heuresPrevues: 0, heuresPosees: 0, heuresSup: 0, montantHeuresSup: 0,
    valeurPosee: 0, examens: 0, autres: 0, paye: 0,
    heuresPayees: 0, heuresNonPayees: 0, montantNonPaye: 0, nonPayeFait: 0, nonPayePrevu: 0,
    heuresPossibles: 0, total: 0, reste: 0, resteForfait: 0,
  };
  let seances = eleveSeances(eid);
  if (ajout) {
    seances = seances.filter((s) => s.id !== ajout.id);
    if (ajout.eleves.some((p) => p.eleveId === eid)) seances = [...seances, ajout].sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
  }
  // 1) leçons posées (faites + à venir), dans l'ordre : d'abord les heures du forfait, puis au tarif horaire
  let resteForfait = res.inclus;
  const lecons = [];
  for (const s of seances) {
    const p = s.eleves.find((x) => x.eleveId === eid);
    if (isExam(s.type)) {
      if (!['admis', 'ajourne', 'absent'].includes(p.statut)) continue;
      const l = ligneSeance(s, eid);
      if (l.pu > 0) res.examens += l.pu;
      continue;
    }
    const fait = STATUTS_FAITS.includes(p.statut);
    const prevu = p.statut === 'prevu' && (s.date >= auj || s.id === ajout?.id);
    if (!fait && !prevu) continue;
    const h = durH(s);
    if (fait) res.heuresFaites += h; else res.heuresPrevues += h;
    const dans = Math.min(resteForfait, h); resteForfait -= dans;
    const enPlus = h - dans;
    const tarif = DB.settings.tarifHeure[baseDe(s.type)] || 0;
    if (enPlus > 0 && fait) { res.heuresSup += enPlus; res.montantHeuresSup += enPlus * tarif; }
    lecons.push({ h, fait, valeur: dans * (tauxF || tarif) + enPlus * tarif });
  }
  res.heuresPosees = res.heuresFaites + res.heuresPrevues;
  res.valeurPosee = round2(lecons.reduce((t, l) => t + l.valeur, 0));
  res.montantHeuresSup = round2(res.montantHeuresSup);
  // 2) lignes ajoutées à la main sur les factures (frais de dossier, code…), sauf le forfait lui-même
  const libForfait = f ? norm(f.libelle) : null;
  for (const fa of DB.factures.filter((x) => x.eleveId === eid)) {
    for (const l of fa.lignes || []) {
      if (l.seanceId || (libForfait && norm(l.libelle) === libForfait)) continue;
      res.autres += round2(Number(l.qte || 0) * Number(l.pu || 0));
    }
  }
  res.examens = round2(res.examens); res.autres = round2(res.autres);
  // 3) paiements : d'abord les frais (examens, autres), puis les heures dans l'ordre
  res.paye = round2(DB.paiements.filter((x) => x.eleveId === eid).reduce((t, x) => t + Number(x.montant || 0), 0));
  let dispo = Math.max(0, res.paye - res.examens - res.autres);
  for (const l of lecons) {
    const couvert = Math.min(dispo, l.valeur); dispo -= couvert;
    const part = l.valeur > 0 ? couvert / l.valeur : 1;
    res.heuresPayees += l.h * part;
    const manque = l.valeur - couvert;
    if (manque > 0.005) {
      res.heuresNonPayees += l.h * (1 - part); res.montantNonPaye += manque;
      if (l.fait) res.nonPayeFait += manque; else res.nonPayePrevu += manque;
    }
  }
  res.montantNonPaye = round2(res.montantNonPaye); res.nonPayeFait = round2(res.nonPayeFait); res.nonPayePrevu = round2(res.nonPayePrevu);
  // ce qu'il a payé en plus permet de poser encore des heures
  if (dispo > 0.005) {
    const hForfaitDispo = Math.max(0, resteForfait);
    const enForfait = tauxF ? Math.min(hForfaitDispo, dispo / tauxF) : 0;
    const resteArgent = dispo - enForfait * (tauxF || 0);
    res.heuresPossibles = enForfait + (resteArgent > 0 ? resteArgent / (DB.settings.tarifHeure.plateau || 45) : 0);
  }
  // 4) total à régler à terme : le forfait + les heures en plus déjà faites + les frais
  res.total = round2((f ? Number(f.prix) || 0 : res.valeurPosee) + res.montantHeuresSup + res.examens + res.autres);
  if (!f) res.total = round2(lecons.filter((l) => l.fait).reduce((t, l) => t + l.valeur, 0) + res.examens + res.autres);
  res.reste = round2(res.total - res.paye);
  res.resteForfait = f ? round2(Math.max(0, Number(f.prix) - Math.max(0, res.paye - res.examens - res.autres))) : 0;
  return res;
}

/* ---------- Affichage dans la fiche (onglet Compte) ---------- */
function blocCompte(eid) {
  const c = compteEleve(eid);
  const f = c.forfait;
  const tarifs = DB.settings.tarifHeure;
  const etat = c.nonPayeFait > 0 ? 'en-retard' : c.montantNonPaye > 0 ? 'du' : 'ok';
  // barre : heures payées / posées
  const ref = Math.max(c.inclus || 0, c.heuresPosees, c.heuresPayees + c.heuresPossibles, 1);
  const pct = (h) => Math.max(0, Math.min(100, (h / ref) * 100));
  const ligne = (lib, m, cls = '') => `<div class="cpt-l ${cls}"><span>${lib}</span><strong>${eur(m)}</strong></div>`;
  return `
  <div class="cpt ${etat}">
    <div class="cpt-tete">
      ${f ? `<div><div class="cpt-titre">📦 ${esc(f.libelle || 'Forfait')} · ${eur(f.prix)}</div>
            <div class="small muted">${f.heures ? `${fmtH(heuresDuForfait(f))} de conduite incluses · soit ${eur(c.tauxForfait)} l'heure · ` : ''}paiement libre, en plusieurs fois</div></div>`
          : `<div><div class="cpt-titre">⚠️ Aucun forfait choisi</div><div class="small muted">Les heures sont comptées au tarif horaire (${eur(tarifs.plateau)} plateau, ${eur(tarifs.circulation)} circulation).</div></div>`}
      <button class="btn ${f ? '' : 'primary'}" data-action="choisirForfait" data-id="${eid}">${f ? '✏️ Modifier le forfait' : '📦 Choisir un forfait'}</button>
    </div>

    <div class="cpt-heures">
      <div class="cpt-barre" title="Heures payées / posées">
        <span class="payee" style="width:${pct(Math.min(c.heuresPayees, c.heuresPosees))}%"></span>
        <span class="nonpayee" style="width:${pct(c.heuresNonPayees)}%"></span>
        <span class="credit" style="width:${pct(c.heuresPossibles)}%"></span>
      </div>
      <div class="cpt-legende small">
        <span><i class="payee"></i>Payées et posées : <strong>${fmtH(Math.min(c.heuresPayees, c.heuresPosees))}</strong></span>
        ${c.heuresNonPayees > 0.01 ? `<span><i class="nonpayee"></i>Posées non payées : <strong>${fmtH(c.heuresNonPayees)}</strong></span>` : ''}
        ${c.heuresPossibles > 0.01 ? `<span><i class="credit"></i>Payées, encore à poser : <strong>${fmtH(c.heuresPossibles)}</strong></span>` : ''}
        ${f && c.inclus ? `<span class="muted">Forfait : ${fmtH(c.heuresPosees)} posées sur ${fmtH(c.inclus)} (${fmtH(c.heuresFaites)} faites)</span>` : `<span class="muted">${fmtH(c.heuresFaites)} faites · ${fmtH(c.heuresPrevues)} à venir</span>`}
      </div>
    </div>

    ${c.montantNonPaye > 0.005
      ? `<div class="alert ${c.nonPayeFait > 0 ? 'bad' : 'warn'}" style="margin:10px 0 0">⚠️ <strong>${fmtH(c.heuresNonPayees)}</strong> posée${c.heuresNonPayees > 1 ? 's' : ''} pas encore payée${c.heuresNonPayees > 1 ? 's' : ''} : <strong>${eur(c.montantNonPaye)}</strong> à encaisser${c.nonPayeFait > 0 ? ` (dont ${eur(c.nonPayeFait)} pour des leçons déjà faites)` : ' avant ces leçons'}.</div>`
      : c.heuresPosees > 0 || c.paye > 0 ? `<div class="alert ok-msg" style="margin:10px 0 0">✅ Toutes les heures posées sont payées${c.heuresPossibles > 0.01 ? ` · il peut encore poser <strong>${fmtH(c.heuresPossibles)}</strong> avec ce qu'il a réglé` : ''}.</div>` : ''}

    <div class="cpt-recap">
      ${f ? ligne(esc(f.libelle || 'Forfait'), Number(f.prix) || 0) : ligne(`Leçons faites (${fmtH(c.heuresFaites)})`, round2(c.total - c.examens - c.autres))}
      ${f && c.montantHeuresSup ? ligne(`Heures en plus du forfait (${fmtH(c.heuresSup)})`, c.montantHeuresSup) : ''}
      ${c.examens ? ligne('Examens (accompagnement / repassage)', c.examens) : ''}
      ${c.autres ? ligne('Autres (ajoutés sur les factures)', c.autres) : ''}
      ${ligne('Déjà payé', c.paye, 'paye')}
      ${f ? ligne('Reste à payer sur le forfait', c.resteForfait, c.resteForfait > 0.005 ? 'reste' : 'solde') : ''}
      ${ligne(c.reste >= 0 ? 'Reste à payer au total' : 'Trop-perçu (à reporter ou rembourser)', Math.abs(c.reste), c.reste > 0.005 ? 'total' : 'solde')}
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn primary" data-action="encaisserCompte" data-id="${eid}" data-montant="${c.montantNonPaye > 0.005 ? c.montantNonPaye : ''}">💶 Encaisser un règlement${c.montantNonPaye > 0.005 ? ` (${eur(c.montantNonPaye)} pour les heures posées)` : ''}</button>
    </div>
  </div>`;
}

// Avertissement dans la fenêtre d'une leçon : élèves dont les heures posées dépassent ce qu'ils ont payé
function alertesPaiementSeance(draft) {
  if (isExam(draft.type) || !draft.date) return [];
  const out = [];
  for (const p of draft.eleves) {
    if (p.statut === 'excuse') continue;
    const c = compteEleve(p.eleveId, draft);
    if (c.montantNonPaye > 0.005) out.push(`${eleveNom(byId('eleves', p.eleveId))} : ${fmtH(c.heuresNonPayees)} posée${c.heuresNonPayees > 1 ? 's' : ''} non payée${c.heuresNonPayees > 1 ? 's' : ''} avec cette leçon (${eur(c.montantNonPaye)} à encaisser)${c.forfait ? '' : ' · aucun forfait'}.`);
  }
  return out;
}

/* ---------- Choisir / modifier le forfait ---------- */
function openForfait(eid) {
  const e = byId('eleves', eid);
  const f = e.forfait || {};
  const forfaits = DB.prestations.filter((p) => heuresDuForfait(p) > 0 || /forfait/i.test(p.libelle));
  openModal({
    title: `📦 Forfait de ${esc(e.prenom)} ${esc(e.nom.toUpperCase())}`,
    body: `
      <form id="forfait-form" class="form-grid" onsubmit="return false">
        <label class="field full"><span>Forfait choisi</span>
          <select id="ff-choix" data-on-change="forfaitChoix">
            <option value="">— Personnalisé —</option>
            ${forfaits.map((p) => `<option value="${p.id}" data-lib="${esc(p.libelle)}" data-prix="${p.prix}" data-h="${heuresDuForfait(p)}" ${f.prestationId === p.id ? 'selected' : ''}>${esc(p.libelle)} — ${eur(p.prix)}${heuresDuForfait(p) ? ` · ${fmtH(heuresDuForfait(p))}` : ''}</option>`).join('')}
          </select></label>
        <label class="field full"><span>Libellé</span><input name="libelle" id="ff-lib" value="${esc(f.libelle || '')}" required placeholder="ex : Forfait 20h A2"></label>
        <label class="field"><span>Prix total (€)</span><input name="prix" id="ff-prix" type="number" step="0.01" min="0" value="${esc(f.prix ?? '')}" required></label>
        <label class="field"><span>Heures de conduite incluses</span><input name="heures" id="ff-h" type="number" step="0.5" min="0" value="${esc(f.heures ?? '')}" placeholder="ex : 20"></label>
        <label class="field"><span>Pris le</span><input name="date" type="date" value="${esc(f.date || todayISO())}"></label>
      </form>
      <p class="muted small">L'élève règle quand il veut, du montant qu'il veut. Chaque règlement lui donne droit à des heures (prix du forfait ÷ heures incluses) : posez-lui des leçons à hauteur de ce qu'il a payé. Au-delà des heures du forfait, les heures sont au tarif horaire.</p>`,
    foot: `${e.forfait ? '<div class="left"><button class="btn danger" data-action="retirerForfait" data-id="' + eid + '">Retirer le forfait</button></div>' : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="enregistrerForfait" data-id="${eid}">Enregistrer</button>`,
  });
}

const COMPTE_ACTIONS = {
  choisirForfait(d) { openForfait(d.id); },
  forfaitChoix(d, el) {
    const o = el.selectedOptions[0]; if (!o || !o.value) return;
    $('#ff-lib').value = o.dataset.lib; $('#ff-prix').value = o.dataset.prix; $('#ff-h').value = o.dataset.h || '';
  },
  enregistrerForfait(d) {
    const form = $('#forfait-form'); if (!form.reportValidity()) return;
    const v = formData(form);
    const e = byId('eleves', d.id);
    e.forfait = { prestationId: $('#ff-choix').value || '', libelle: v.libelle.trim(), prix: round2(v.prix), heures: Number(v.heures) || 0, date: v.date || todayISO() };
    save(); closeModal(); render(); toast('📦 Forfait enregistré');
  },
  retirerForfait(d) {
    if (!confirm("Retirer le forfait de cet élève ? Les heures seront comptées au tarif horaire.")) return;
    delete byId('eleves', d.id).forfait; save(); closeModal(); render();
  },
  encaisserCompte(d) { openPaiement({ eleveId: d.id, mode: 'CB', montant: Number(d.montant) > 0 ? round2(d.montant) : '' }); },
};
