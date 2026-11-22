/* =====================================================================
   COMPTE DE L'ÉLÈVE — forfait, heures, échéances, reste à payer
   • Chaque élève peut avoir un forfait (ex. « Forfait 20h A2 », 950 €,
     20 h de conduite incluses), payé en une ou plusieurs fois.
   • Les leçons faites consomment les heures du forfait ; au-delà, chaque
     heure est comptée au tarif horaire. Sans forfait : tout est à l'heure.
   • Examens (accompagnement / repassage) et lignes ajoutées à la main sur
     une facture s'ajoutent. Tous les encaissements de l'élève se déduisent.
   ===================================================================== */
'use strict';

const STATUTS_FAITS = ['present', 'absent', 'valide', 'nonvalide']; // heures dues (l'absence non excusée est due)

function addMois(iso, n) {
  const d = parseISO(iso); const jour = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(jour, fin));
  return toISODate(d);
}
const forfaitDe = (e) => (e && e.forfait && (Number(e.forfait.prix) > 0 || Number(e.forfait.heures) > 0) ? e.forfait : null);
const heuresDuForfait = (p) => Number(p.heures) || 0;

// Échéancier : le prix du forfait réparti en N mensualités à partir de la date de début
function echeancesForfait(f) {
  const n = Math.max(1, parseInt(f.nbFois, 10) || 1);
  const prix = round2(f.prix);
  const base = Math.floor((prix / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => ({
    n: i + 1, date: addMois(f.date || todayISO(), i),
    montant: i === n - 1 ? round2(prix - base * (n - 1)) : base,
  }));
}

function compteEleve(eid) {
  const e = byId('eleves', eid);
  const f = forfaitDe(e);
  const auj = todayISO();
  const res = {
    forfait: f, inclus: f ? heuresDuForfait(f) : 0,
    heuresFaites: 0, heuresPrevues: 0, heuresSup: 0, montantHeures: 0, lignesHeures: [],
    examens: 0, lignesExamens: [], autres: 0, lignesAutres: [],
    total: 0, paye: 0, reste: 0, echeances: [], retard: 0, prochaine: null,
  };
  // leçons (plateau, circulation, examens blancs) dans l'ordre : d'abord le forfait, puis à l'heure
  let resteForfait = res.inclus;
  for (const s of eleveSeances(eid)) {
    const p = s.eleves.find((x) => x.eleveId === eid);
    if (isExam(s.type)) {
      if (!['admis', 'ajourne', 'absent'].includes(p.statut)) continue;
      const l = ligneSeance(s, eid);
      if (l.pu > 0) { res.examens += l.pu; res.lignesExamens.push(l); }
      continue;
    }
    const h = durH(s);
    if (p.statut === 'prevu') { if (s.date >= auj) res.heuresPrevues += h; continue; }
    if (!STATUTS_FAITS.includes(p.statut)) continue;
    res.heuresFaites += h;
    const dansForfait = Math.min(resteForfait, h);
    resteForfait -= dansForfait;
    const enPlus = h - dansForfait;
    if (enPlus > 0) {
      const pu = DB.settings.tarifHeure[baseDe(s.type)] || 0;
      res.heuresSup += enPlus; res.montantHeures += enPlus * pu;
      res.lignesHeures.push({ libelle: ligneSeance(s, eid).libelle, qte: enPlus, pu });
    }
  }
  res.montantHeures = round2(res.montantHeures);
  // lignes ajoutées à la main sur les factures (frais de dossier, code…), sauf le forfait lui-même
  const libForfait = f ? norm(f.libelle) : null;
  for (const fa of DB.factures.filter((x) => x.eleveId === eid)) {
    for (const l of fa.lignes || []) {
      if (l.seanceId) continue;
      if (libForfait && norm(l.libelle) === libForfait) continue;
      const m = round2(Number(l.qte || 0) * Number(l.pu || 0));
      if (m) { res.autres += m; res.lignesAutres.push(l); }
    }
  }
  res.total = round2((f ? Number(f.prix) || 0 : 0) + res.montantHeures + res.examens + res.autres);
  res.paye = round2(DB.paiements.filter((x) => x.eleveId === eid).reduce((t, x) => t + Number(x.montant || 0), 0));
  res.reste = round2(res.total - res.paye);
  // échéances du forfait : les paiements les couvrent dans l'ordre
  if (f && Number(f.prix) > 0) {
    let dispo = res.paye, cumulDu = 0;
    res.echeances = echeancesForfait(f).map((ec) => {
      const couvert = Math.min(dispo, ec.montant); dispo = round2(dispo - couvert);
      const etat = couvert >= ec.montant - 0.005 ? 'payee' : ec.date <= auj ? 'retard' : 'avenir';
      if (ec.date <= auj) cumulDu += ec.montant;
      return { ...ec, couvert: round2(couvert), etat };
    });
    res.retard = round2(Math.max(0, cumulDu - res.paye));
    res.prochaine = res.echeances.find((ec) => ec.etat !== 'payee') || null;
  }
  return res;
}

/* ---------- Affichage dans la fiche (onglet Compte) ---------- */
function blocCompte(eid) {
  const c = compteEleve(eid);
  const f = c.forfait;
  const tarifs = DB.settings.tarifHeure;
  const barre = () => {
    if (!f || !c.inclus) return '';
    const faitPct = Math.min(100, (c.heuresFaites / c.inclus) * 100);
    const prevPct = Math.max(0, Math.min(100 - faitPct, (c.heuresPrevues / c.inclus) * 100));
    const restant = c.inclus - c.heuresFaites - c.heuresPrevues;
    return `<div class="cpt-heures">
      <div class="cpt-barre"><span class="fait" style="width:${faitPct}%"></span><span class="prevu" style="width:${prevPct}%"></span></div>
      <div class="small">⏱️ <strong>${fmtH(c.heuresFaites)}</strong> faites${c.heuresPrevues ? ` · <strong>${fmtH(c.heuresPrevues)}</strong> prévues` : ''} sur <strong>${fmtH(c.inclus)}</strong> du forfait
        ${c.heuresSup > 0 ? ` · <span class="txt-bad">⚠️ ${fmtH(c.heuresSup)} en plus du forfait</span>` : restant >= 0 ? ` · reste ${fmtH(restant)}` : ` · <span class="txt-warn">⚠️ les leçons prévues dépassent le forfait de ${fmtH(-restant)}</span>`}</div>
    </div>`;
  };
  const ligne = (lib, m, cls = '') => `<div class="cpt-l ${cls}"><span>${lib}</span><strong>${eur(m)}</strong></div>`;
  return `
  <div class="cpt ${c.retard > 0 ? 'en-retard' : c.reste > 0.005 ? 'du' : 'ok'}">
    <div class="cpt-tete">
      ${f ? `<div><div class="cpt-titre">📦 ${esc(f.libelle || 'Forfait')} · ${eur(f.prix)}</div>
            <div class="small muted">${f.heures ? `${fmtH(heuresDuForfait(f))} de conduite incluses · ` : ''}${(parseInt(f.nbFois, 10) || 1) > 1 ? `payé en ${f.nbFois} fois à partir du ${fmtDate(f.date)}` : `payé en 1 fois${f.date ? ' le ' + fmtDate(f.date) : ''}`}</div></div>`
          : `<div><div class="cpt-titre">⚠️ Aucun forfait choisi</div><div class="small muted">Les leçons sont comptées à l'heure (${eur(tarifs.plateau)} plateau, ${eur(tarifs.circulation)} circulation).</div></div>`}
      <button class="btn ${f ? '' : 'primary'}" data-action="choisirForfait" data-id="${eid}">${f ? '✏️ Modifier le forfait' : '📦 Choisir un forfait'}</button>
    </div>
    ${barre()}
    <div class="cpt-recap">
      ${f ? ligne(esc(f.libelle || 'Forfait'), Number(f.prix) || 0) : ''}
      ${c.montantHeures ? ligne(`${f ? 'Heures en plus du forfait' : 'Leçons faites'} (${fmtH(c.heuresSup)})`, c.montantHeures) : (!f ? ligne(`Leçons faites (${fmtH(c.heuresFaites)})`, 0) : '')}
      ${c.examens ? ligne('Examens (accompagnement / repassage)', c.examens) : ''}
      ${c.autres ? ligne('Autres (ajoutés sur les factures)', c.autres) : ''}
      ${ligne('Total à payer', c.total, 'total')}
      ${ligne('Déjà payé', c.paye, 'paye')}
      ${ligne(c.reste >= 0 ? 'Reste à payer' : 'Trop-perçu (à rembourser ou à reporter)', Math.abs(c.reste), c.reste > 0.005 ? 'reste' : 'solde')}
    </div>
    ${c.retard > 0 ? `<div class="alert bad" style="margin:10px 0 0">⚠️ Paiement en retard : <strong>${eur(c.retard)}</strong> auraient dû être payés à ce jour.</div>` : ''}
    ${c.echeances.length > 1 ? `<div class="cpt-ech"><div class="lbl">Échéances du forfait</div>
      <table><tbody>${c.echeances.map((ec) => `<tr class="${ec.etat}"><td>${ec.n}/${c.echeances.length}</td><td>${fmtDate(ec.date)}</td><td class="num">${eur(ec.montant)}</td>
        <td>${ec.etat === 'payee' ? '✅ Payée' : ec.etat === 'retard' ? `⚠️ En retard${ec.couvert ? ` (${eur(ec.couvert)} reçus)` : ''}` : `⏳ À venir${ec.couvert ? ` (${eur(ec.couvert)} reçus)` : ''}`}</td></tr>`).join('')}</tbody></table></div>` : ''}
    <div class="row" style="margin-top:12px">
      <button class="btn primary" data-action="encaisserCompte" data-id="${eid}" data-montant="${c.prochaine ? round2(c.prochaine.montant - c.prochaine.couvert) : Math.max(0, c.reste)}">💶 Encaisser${c.prochaine ? ` l'échéance ${c.prochaine.n} (${eur(c.prochaine.montant - c.prochaine.couvert)})` : c.reste > 0.005 ? ` ${eur(c.reste)}` : ''}</button>
    </div>
  </div>`;
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
        <label class="field"><span>Payé en</span><select name="nbFois">${[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => `<option value="${n}" ${(parseInt(f.nbFois, 10) || 1) === n ? 'selected' : ''}>${n === 1 ? '1 fois' : n + ' fois (mensualités)'}</option>`).join('')}</select></label>
        <label class="field"><span>1re échéance le</span><input name="date" type="date" value="${esc(f.date || todayISO())}" required></label>
      </form>
      <p class="muted small">Les heures de leçon faites sont déduites du forfait ; au-delà, elles sont comptées au tarif horaire. Les encaissements de l'élève couvrent les échéances dans l'ordre.</p>`,
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
    e.forfait = { prestationId: $('#ff-choix').value || '', libelle: v.libelle.trim(), prix: round2(v.prix), heures: Number(v.heures) || 0, nbFois: parseInt(v.nbFois, 10) || 1, date: v.date };
    save(); closeModal(); render(); toast('📦 Forfait enregistré');
  },
  retirerForfait(d) {
    if (!confirm('Retirer le forfait de cet élève ? Les leçons seront comptées à l\'heure.')) return;
    delete byId('eleves', d.id).forfait; save(); closeModal(); render();
  },
  encaisserCompte(d) { openPaiement({ eleveId: d.id, mode: 'CB', montant: Number(d.montant) > 0 ? round2(d.montant) : '' }); },
};
