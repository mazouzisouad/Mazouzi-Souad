/* =====================================================================
   DESIGN DES DOCUMENTS PDF — carte de rendez-vous, facture, contrat
   Style moderne : police Poppins, formes arrondies, rendez-vous en
   « tickets », étiquettes colorées. Couleurs : Paramètres → Couleurs.
   ===================================================================== */
'use strict';

/* ---------- Police Poppins (chargée une fois au démarrage) ---------- */
const POLICES = {};
(async function chargerPolices() {
  const enB64 = (buf) => {
    const o = new Uint8Array(buf); let s = '';
    for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
    return btoa(s);
  };
  try {
    for (const [cle, f] of [['R', 'Poppins-Regular.ttf'], ['SB', 'Poppins-SemiBold.ttf'], ['B', 'Poppins-Bold.ttf']]) {
      const r = await fetch('vendor/fonts/' + f);
      if (!r.ok) return;
      POLICES[cle] = enB64(await r.arrayBuffer());
    }
  } catch (e) { /* hors ligne sans cache : police standard */ }
}());

function polices(doc) {
  const ok = !!(POLICES.R && POLICES.SB && POLICES.B);
  if (ok) {
    doc.addFileToVFS('Poppins-Regular.ttf', POLICES.R); doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
    doc.addFileToVFS('Poppins-Bold.ttf', POLICES.B); doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
    doc.addFileToVFS('Poppins-SemiBold.ttf', POLICES.SB); doc.addFont('Poppins-SemiBold.ttf', 'PoppinsSB', 'normal');
  }
  return {
    ok,
    reg: () => doc.setFont(ok ? 'Poppins' : 'helvetica', 'normal'),
    semi: () => doc.setFont(ok ? 'PoppinsSB' : 'helvetica', ok ? 'normal' : 'bold'),
    bold: () => doc.setFont(ok ? 'Poppins' : 'helvetica', 'bold'),
    t: (s) => pdfText(s),
    eur: (n) => (ok ? round2(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' €' : eurPdf(n)),
  };
}

/* ---------- Petits outils de dessin ---------- */
const ENCRE = [15, 23, 42];
const GRIS = [100, 116, 139];
const GRIS_CLAIR = [241, 245, 249];
const BORD = [226, 232, 240];
const COULEURS_TYPE = {
  plateau: { fond: [224, 242, 254], texte: [3, 105, 161] },
  circulation: { fond: [237, 233, 254], texte: [109, 40, 217] },
  blanc: { fond: [254, 243, 199], texte: [146, 64, 14] },
  exam: { fond: [255, 228, 230], texte: [190, 18, 60] },
};
const couleurType = (type) => (isExam(type) ? COULEURS_TYPE.exam : isBlanc(type) ? COULEURS_TYPE.blanc : COULEURS_TYPE[baseDe(type)]);

function transparent(doc, opacite, dessin) {
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: opacite }));
  dessin();
  doc.restoreGraphicsState();
}
// Pastille de texte arrondie ; renvoie sa largeur
function pastille(doc, f, x, y, texte, fond, couleur, { taille = 7.5, droite = false } = {}) {
  f.semi(); doc.setFontSize(taille);
  const w = doc.getTextWidth(texte) + 5;
  const h = taille * 0.55 + 2.6;
  const x0 = droite ? x - w : x;
  doc.setFillColor(...fond); doc.roundedRect(x0, y - h + 1.4, w, h, h / 2, h / 2, 'F');
  doc.setTextColor(...couleur); doc.text(texte, x0 + 2.5, y);
  return w;
}
// Bandeau d'en-tête : nom de l'auto-école, coordonnées, décor
function bandeau(doc, f, pl, ec, { W, h, M }) {
  doc.setFillColor(...pl.fonce); doc.rect(0, 0, W, h, 'F');
  transparent(doc, 0.22, () => {
    doc.setFillColor(...pl.accent);
    doc.circle(W - 6, 4, h * 0.62, 'F');
    doc.circle(W - h * 1.45, -2, h * 0.32, 'F');
  });
  doc.setFillColor(...pl.accent); doc.rect(0, h, W, 1.6, 'F');
  const lh = h - 14;
  const lw = logoPdf(doc, ec.logo, M, 7, Math.min(lh * 2.2, 52), lh, { fond: true });
  if (lw) M += lw + 5;
  doc.setTextColor(...surFonce()); f.bold(); doc.setFontSize(h > 40 ? 18 : 15);
  doc.text(f.t(ec.nom), M, h > 40 ? 17 : 14);
  f.reg(); doc.setFontSize(7.8); doc.setTextColor(...sousFonce());
  const lignes = [
    [ec.adresse, [ec.cp, ec.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    [ec.tel, ec.email].filter(Boolean).join('  ·  '),
    [ec.siret && 'SIRET ' + ec.siret, ec.agrement && 'Agrément ' + ec.agrement].filter(Boolean).join('  ·  '),
  ].filter(Boolean);
  lignes.forEach((l, i) => doc.text(f.t(l), M, (h > 40 ? 23 : 19.5) + i * 4));
}
const fmtImgPdf = (img) => (/^data:image\/jpe?g/.test(img) ? 'JPEG' : 'PNG');
// Dessine le logo dans un cadre (maxW × maxH), centré verticalement ; renvoie la largeur utilisée (0 sans logo)
function logoPdf(doc, logo, x, y, maxW, maxH, { fond = false } = {}) {
  if (!logo) return 0;
  try {
    const pr = doc.getImageProperties(logo);
    const k = Math.min(maxW / pr.width, maxH / pr.height);
    const w = pr.width * k, h = pr.height * k;
    const y0 = y + (maxH - h) / 2;
    if (fond) { doc.setFillColor(255, 255, 255); doc.roundedRect(x, y0 - 2.5, w + 5, h + 5, 2.5, 2.5, 'F'); }
    doc.addImage(logo, fmtImgPdf(logo), x + (fond ? 2.5 : 0), y0, w, h);
    return w + (fond ? 5 : 0);
  } catch (e) { return 0; }
}

/* =====================================================================
   CARTE DE RENDEZ-VOUS (A5 portrait, lisible sur téléphone)
   ===================================================================== */
function buildCarteRdvPdfModerne(eleveId, seances) {
  const { jsPDF } = window.jspdf;
  const e = byId('eleves', eleveId);
  const ec = ecoleDe(agenceDe(e));
  const pl = palette();
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const f = polices(doc);
  const W = 148, H = 210, M = 11;
  const parPage = 5;
  const pages = Math.max(1, Math.ceil(seances.length / parPage));

  for (let pg = 0; pg < pages; pg++) {
    if (pg > 0) doc.addPage('a5', 'portrait');
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, W, H, 'F');
    bandeau(doc, f, pl, Object.assign({}, ec, { siret: '', agrement: '' }), { W, h: 34, M });
    pastille(doc, f, W - M, 30, 'CARTE DE RENDEZ-VOUS', pl.accent, surAccent(), { taille: 7, droite: true });

    // Accueil
    doc.setTextColor(...(pl.encre || pl.fonce)); f.bold(); doc.setFontSize(18);
    doc.text(f.t(`Bonjour ${e.prenom} !`), M, 50);
    f.reg(); doc.setFontSize(9); doc.setTextColor(...GRIS);
    doc.text(f.t(`Voici vos prochains rendez-vous moto${e.formation ? '  ·  ' + e.formation : ''}`), M, 56);

    // Tickets
    let y = 62;
    const chunk = seances.slice(pg * parPage, (pg + 1) * parPage);
    if (!chunk.length) {
      doc.setFillColor(255, 255, 255); doc.setDrawColor(...BORD); doc.roundedRect(M, y, W - 2 * M, 24, 4, 4, 'FD');
      f.semi(); doc.setFontSize(10); doc.setTextColor(...GRIS);
      doc.text('Aucun rendez-vous programmé pour le moment.', W / 2, y + 13.5, { align: 'center' });
    }
    for (const s of chunk) {
      const w = W - 2 * M, h = 21;
      transparent(doc, 0.08, () => { doc.setFillColor(15, 23, 42); doc.roundedRect(M + 0.4, y + 0.8, w, h, 4, 4, 'F'); });
      doc.setFillColor(255, 255, 255); doc.setDrawColor(...BORD); doc.roundedRect(M, y, w, h, 4, 4, 'FD');
      // pavé date
      const d = parseISO(s.date);
      doc.setFillColor(...pl.accent); doc.roundedRect(M, y, 22, h, 4, 4, 'F'); doc.rect(M + 18, y, 4, h, 'F');
      doc.setTextColor(...surAccent());
      f.semi(); doc.setFontSize(6.5); doc.text(d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').toUpperCase(), M + 11, y + 5.5, { align: 'center' });
      f.bold(); doc.setFontSize(16); doc.text(String(d.getDate()), M + 11, y + 13.2, { align: 'center' });
      f.semi(); doc.setFontSize(6.5); doc.text(d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(), M + 11, y + 18, { align: 'center' });
      // horaire + type
      doc.setTextColor(...ENCRE); f.bold(); doc.setFontSize(12);
      const hz = horaireDe(s, eleveId);
      doc.text(`${hz.debut} – ${hz.fin}`, M + 26, y + 8);
      const ct = couleurType(s.type);
      let px = M + w - 3;
      const modeEl = modeDe(s, eleveId);
      const libType = categorie(s.type) === 'lecon' && modeEl === 'blanc' ? 'Examen blanc ' + baseDe(s.type) : TYPES[s.type].label;
      const ctAff = categorie(s.type) === 'lecon' && modeEl === 'blanc' ? COULEURS_TYPE.blanc : ct;
      px -= pastille(doc, f, px, y + 7.6, f.t(libType), ctAff.fond, ctAff.texte, { taille: 7, droite: true }) + 1.5;
      if (modeEl === 'prepa') pastille(doc, f, px, y + 7.6, 'Prépa examen', pl.clair, (pl.encre || pl.fonce), { taille: 6.5, droite: true });
      // détails
      f.reg(); doc.setFontSize(8); doc.setTextColor(...GRIS);
      const m = byId('moniteurs', s.moniteurId);
      const detail1 = `Moniteur : ${moniteurNom(m)}`;
      const lieu = isExam(s.type)
        ? `Rendez-vous à ${heureRdv(s)}${s.lieu ? '  ·  Examen : ' + s.lieu : ''}`
        : (s.lieu ? `Lieu : ${s.lieu}` : '');
      doc.text(f.t(detail1), M + 26, y + 13.5);
      if (lieu) doc.text(doc.splitTextToSize(f.t(lieu), w - 30)[0], M + 26, y + 17.8);
      y += h + 4.5;
    }

    // Pied : conditions
    f.reg(); doc.setFontSize(7);
    const cond = doc.splitTextToSize(f.t(DB.settings.conditionsRdv || ''), W - 2 * M - 8);
    const hc = cond.length * 3.2 + 6;
    doc.setFillColor(...pl.clair); doc.roundedRect(M, H - 10 - hc, W - 2 * M, hc, 3, 3, 'F');
    doc.setTextColor(...(pl.encre || pl.fonce)); doc.text(cond, M + 4, H - 10 - hc + 5.2);
    if (pages > 1) { doc.setTextColor(...GRIS); doc.setFontSize(7); doc.text(`${pg + 1}/${pages}`, W - M, H - 4, { align: 'right' }); }
  }
  return doc;
}

/* =====================================================================
   FACTURE (A4)
   ===================================================================== */
function buildFacturePdfModerne(fac) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const f = polices(doc);
  const e = byId('eleves', fac.eleveId);
  const ag = byId('agences', fac.agenceId) || agenceDe(e);
  const ec = ecoleDe(ag);
  const pl = palette();
  const tot = factureTotaux(fac);
  const paye = facturePaye(fac);
  const reste = Math.max(0, tot.ttc - paye);
  const W = 210, M = 16;

  bandeau(doc, f, pl, ec, { W, h: 44, M });
  doc.setTextColor(...surFonce()); f.bold(); doc.setFontSize(26);
  doc.text('FACTURE', W - M, 19, { align: 'right' });
  pastille(doc, f, W - M, 28, f.t(`N° ${fac.numero}`), pl.accent, surAccent(), { taille: 8.5, droite: true });
  f.reg(); doc.setFontSize(8.5); doc.setTextColor(...sousFonce());
  doc.text(`Émise le ${fmtDate(fac.date)}`, W - M, 37, { align: 'right' });

  // Deux cartes : client / récapitulatif
  const cy = 54, cw = (W - 2 * M - 8) / 2, ch = 38;
  const carte = (x, titre) => {
    doc.setFillColor(248, 250, 252); doc.setDrawColor(...BORD); doc.roundedRect(x, cy, cw, ch, 4, 4, 'FD');
    f.semi(); doc.setFontSize(7.5); doc.setTextColor(...pl.accent); doc.text(titre, x + 6, cy + 7.5);
  };
  carte(M, 'FACTURÉ À');
  doc.setTextColor(...ENCRE); f.bold(); doc.setFontSize(12.5);
  doc.text(f.t(e ? `${e.prenom} ${e.nom.toUpperCase()}` : ''), M + 6, cy + 15);
  f.reg(); doc.setFontSize(8.5); doc.setTextColor(...GRIS);
  [e?.adresse, [e?.cp, e?.ville].filter(Boolean).join(' '), e?.email, e?.neph && 'NEPH ' + e.neph]
    .filter(Boolean).slice(0, 4).forEach((l, i) => doc.text(f.t(l), M + 6, cy + 21 + i * 4.3));

  const rx = M + cw + 8;
  carte(rx, 'RÉCAPITULATIF');
  const ligneRecap = (lbl, val, i) => {
    f.reg(); doc.setFontSize(8.5); doc.setTextColor(...GRIS); doc.text(lbl, rx + 6, cy + 15 + i * 6.5);
    f.semi(); doc.setTextColor(...ENCRE); doc.text(f.t(val), rx + cw - 6, cy + 15 + i * 6.5, { align: 'right' });
  };
  ligneRecap('Date', fmtDate(fac.date), 0);
  ligneRecap('Formation', e?.formation || '—', 1);
  ligneRecap('Montant', f.eur(tot.ttc), 2);
  f.reg(); doc.setFontSize(8.5); doc.setTextColor(...GRIS); doc.text('Statut', rx + 6, cy + 15 + 3 * 6.5);
  const st = reste <= 0.005 ? ['Payée', [220, 252, 231], [21, 128, 61]] : paye > 0 ? ['Partiellement payée', [254, 243, 199], [146, 64, 14]] : ['À régler', [254, 226, 226], [185, 28, 28]];
  pastille(doc, f, rx + cw - 6, cy + 15 + 3 * 6.5, st[0], st[1], st[2], { taille: 7.5, droite: true });

  // Tableau des lignes
  let y = cy + ch + 12;
  const cols = { d: M + 4, q: 134, pu: 162, tot: W - M - 4 };
  doc.setFillColor(...pl.fonce); doc.roundedRect(M, y - 6, W - 2 * M, 10, 3, 3, 'F');
  doc.setTextColor(...surFonce()); f.semi(); doc.setFontSize(8.5);
  doc.text('Désignation', cols.d, y); doc.text('Qté', cols.q, y, { align: 'right' });
  doc.text('Prix unit. TTC', cols.pu, y, { align: 'right' }); doc.text('Total TTC', cols.tot, y, { align: 'right' });
  y += 6;
  fac.lignes.forEach((l, i) => {
    f.reg(); doc.setFontSize(9);
    const lignes = doc.splitTextToSize(f.t(l.libelle), 98);
    const h = lignes.length * 4.4 + 4;
    if (y + h > 250) { doc.addPage(); y = 20; }
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(M, y - 1, W - 2 * M, h, 'F'); }
    doc.setTextColor(...ENCRE); doc.text(lignes, cols.d, y + 3.4);
    doc.text(String(l.qte).replace('.', ','), cols.q, y + 3.4, { align: 'right' });
    doc.setTextColor(...GRIS); doc.text(f.eur(l.pu), cols.pu, y + 3.4, { align: 'right' });
    f.semi(); doc.setTextColor(...ENCRE); doc.text(f.eur(l.qte * l.pu), cols.tot, y + 3.4, { align: 'right' });
    y += h;
  });

  // Totaux
  y += 8;
  if (y > 225) { doc.addPage(); y = 20; }
  const tx = W - M - 82;
  const sousLigne = (lbl, val) => {
    f.reg(); doc.setFontSize(9); doc.setTextColor(...GRIS); doc.text(lbl, tx + 4, y);
    doc.setTextColor(...ENCRE); doc.text(val, W - M - 4, y, { align: 'right' }); y += 5.5;
  };
  if (tot.taux > 0) { sousLigne('Total HT', f.eur(tot.ht)); sousLigne(`TVA ${String(tot.taux).replace('.', ',')} %`, f.eur(tot.tva)); }
  y += 1;
  doc.setFillColor(...pl.accent); doc.roundedRect(tx, y - 6, 82, 13, 4, 4, 'F');
  doc.setTextColor(...surAccent()); f.semi(); doc.setFontSize(10); doc.text('Total TTC', tx + 5, y + 2);
  f.bold(); doc.setFontSize(15); doc.text(f.eur(tot.ttc), W - M - 5, y + 2.4, { align: 'right' });
  y += 13;
  if (paye > 0 && reste > 0.005) {
    sousLigne('Déjà réglé', '- ' + f.eur(paye));
    f.bold(); doc.setFontSize(11); doc.setTextColor(...(pl.encre || pl.fonce)); doc.text('Reste à payer', tx + 4, y + 1);
    doc.text(f.eur(reste), W - M - 4, y + 1, { align: 'right' }); y += 8;
  }
  if (tot.taux === 0) { f.reg(); doc.setFontSize(8); doc.setTextColor(...GRIS); doc.text('TVA non applicable, art. 293 B du CGI', W - M, y, { align: 'right' }); y += 5; }
  // tampon « PAYÉE »
  if (reste <= 0.005 && tot.ttc > 0) {
    transparent(doc, 0.5, () => {
      doc.setTextColor(22, 163, 74); f.bold(); doc.setFontSize(30);
      doc.text('PAYÉE', M + 30, y - 12, { angle: 12 });
    });
  }

  // Règlements reçus
  const pays = DB.paiements.filter((p) => p.factureId === fac.id).sort((a, b) => a.date.localeCompare(b.date));
  if (pays.length) {
    y += 6;
    f.semi(); doc.setFontSize(9); doc.setTextColor(...(pl.encre || pl.fonce)); doc.text('Règlements reçus', M, y); y += 5;
    f.reg(); doc.setFontSize(8.5); doc.setTextColor(...GRIS);
    pays.forEach((p) => {
      doc.setFillColor(...pl.accent); doc.circle(M + 1.2, y - 1.1, 0.9, 'F');
      doc.text(f.t(`${fmtDate(p.date)}  ·  ${p.mode}${p.reference ? ' (' + p.reference + ')' : ''}  ·  ${f.eur(p.montant)}`), M + 4, y); y += 4.6;
    });
  }

  // Pied de page
  doc.setFillColor(...pl.accent); doc.rect(M, 279, W - 2 * M, 0.5, 'F');
  f.reg(); doc.setFontSize(7.2); doc.setTextColor(...GRIS);
  const pied = doc.splitTextToSize(f.t(DB.settings.mentionsFacture || ''), W - 2 * M);
  doc.text(pied, W / 2, 284, { align: 'center' });
  doc.text(f.t([ec.nom, ec.siret && 'SIRET ' + ec.siret, ec.agrement && 'Agrément ' + ec.agrement].filter(Boolean).join('  ·  ')), W / 2, 284 + pied.length * 3.3, { align: 'center' });
  return doc;
}

/* =====================================================================
   CONTRAT (A4)
   ===================================================================== */
function buildContratPdfModerne(c) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const f = polices(doc);
  const e = byId('eleves', c.eleveId);
  const ec = ecoleDe(agenceDe(e));
  if (c.ecoleNom) ec.nom = c.ecoleNom;
  const pl = palette();
  const W = 210, M = 18, BAS = 272;

  bandeau(doc, f, pl, ec, { W, h: 36, M });
  pastille(doc, f, W - M, 31, 'CONTRAT DE FORMATION', pl.accent, surAccent(), { taille: 7.5, droite: true });
  let y = 50;

  const saut = (h) => { if (y + h > BAS) { doc.addPage(); y = 22; } };
  const SIG_H = 52;
  const lignesTexte = c.texte.replace(/\s+$/, '').split('\n');
  const derniere = lignesTexte.length - 1;
  let premierTitre = true;

  lignesTexte.forEach((ligne, idx) => {
    if (/^#\s+/.test(ligne)) {
      const titre = ligne.replace(/^#\s+/, '');
      const art = titre.match(/^Article\s+(\d+)\s*[–-]\s*(.*)$/i);
      if (premierTitre && !art) {
        f.bold(); doc.setFontSize(15); doc.setTextColor(...(pl.encre || pl.fonce));
        const t = doc.splitTextToSize(f.t(titre), W - 2 * M);
        saut(t.length * 6.5 + 4); doc.text(t, M, y); y += t.length * 6.5 + 3;
      } else if (art) {
        saut(14); y += 3;
        doc.setFillColor(...pl.accent); doc.circle(M + 3.6, y - 1.4, 3.6, 'F');
        doc.setTextColor(...surAccent()); f.bold(); doc.setFontSize(8.5); doc.text(art[1], M + 3.6, y + 0.2, { align: 'center' });
        f.semi(); doc.setFontSize(11); doc.setTextColor(...(pl.encre || pl.fonce));
        doc.text(f.t(art[2]), M + 10, y);
        y += 6.5;
      } else {
        saut(12); y += 2; f.semi(); doc.setFontSize(11); doc.setTextColor(...(pl.encre || pl.fonce));
        doc.text(f.t(titre), M, y); y += 6;
      }
      premierTitre = false;
      return;
    }
    if (!ligne.trim()) { y += 2.2; return; }
    f.reg(); doc.setFontSize(9.2); doc.setTextColor(51, 65, 85);
    const puce = /^-\s+/.test(ligne);
    const texte = puce ? ligne.replace(/^-\s+/, '') : ligne;
    const x = puce ? M + 5 : M;
    const t = doc.splitTextToSize(f.t(texte), W - M - x);
    if (idx === derniere) saut(t.length * 4.6 + SIG_H + 6);
    t.forEach((l, i) => {
      saut(4.6);
      if (puce && i === 0) { doc.setFillColor(...pl.accent); doc.circle(M + 1.6, y - 1.2, 0.9, 'F'); }
      doc.text(l, x, y); y += 4.6;
    });
  });

  // Signatures
  saut(SIG_H); y += 6;
  const colW = (W - 2 * M - 8) / 2;
  const bloc = (x, titre, nom, img, mention, tampon) => {
    doc.setFillColor(248, 250, 252); doc.setDrawColor(...BORD); doc.roundedRect(x, y, colW, 46, 4, 4, 'FD');
    f.semi(); doc.setFontSize(8); doc.setTextColor(...pl.accent); doc.text(f.t(titre.toUpperCase()), x + 5, y + 7);
    f.semi(); doc.setFontSize(9.5); doc.setTextColor(...ENCRE); doc.text(f.t(nom || ''), x + 5, y + 12.5);
    if (mention) { f.reg(); doc.setFontSize(7); doc.setTextColor(...GRIS); doc.text(doc.splitTextToSize(f.t(mention), colW - 10), x + 5, y + 16.5); }
    doc.setFillColor(255, 255, 255); doc.roundedRect(x + 4, y + 19, colW - 8, 24, 3, 3, 'F');
    const zoneW = tampon ? (colW - 8) * 0.58 : colW - 10;
    if (img) {
      try {
        const pr = doc.getImageProperties(img);
        const k = Math.min(zoneW / pr.width, 20 / pr.height);
        doc.addImage(img, fmtImgPdf(img), x + 5 + (zoneW - pr.width * k) / 2, y + 21 + (20 - pr.height * k) / 2, pr.width * k, pr.height * k);
      } catch (err) { /* image illisible */ }
    }
    if (tampon) {
      try {
        const pr = doc.getImageProperties(tampon);
        const k = Math.min(((colW - 8) * 0.4 - 2) / pr.width, 22 / pr.height);
        doc.addImage(tampon, fmtImgPdf(tampon), x + colW - 6 - pr.width * k, y + 20 + (22 - pr.height * k) / 2, pr.width * k, pr.height * k);
      } catch (err) { /* image illisible */ }
    }
  };
  bloc(M, "L'élève (ou son représentant légal)", c.signataireEleve, c.signatureEleve, c.signeLe ? `Lu et approuvé — signé électroniquement le ${fmtDateHeure(c.signeLe)}` : '');
  bloc(M + colW + 8, `Pour ${ec.nom}`, c.signataireEcole, c.signatureEcole, '', c.tamponEcole);

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    f.reg(); doc.setFontSize(7.5); doc.setTextColor(...GRIS);
    doc.text(f.t(`${c.titre}  ·  ${eleveNom(e)}`), M, 289);
    pastille(doc, f, W - M, 289.4, `${i} / ${n}`, GRIS_CLAIR, GRIS, { taille: 7, droite: true });
  }
  return doc;
}

/* =====================================================================
   Choix du style (Paramètres) : « classique » (par défaut) ou « moderne »
   ===================================================================== */
const styleModerne = () => DB.settings.designPdf !== 'classique'; // moderne par défaut
// La couleur suit l'auto-école de l'élève (si une couleur lui est attribuée)
function pourAgence(agence, fabrique) {
  PDF_AGENCE = agence || null;
  try { return fabrique(); } finally { PDF_AGENCE = null; }
}
function buildCarteRdvPdf(eleveId, seances) {
  return pourAgence(agenceDe(byId('eleves', eleveId)), () => (styleModerne() ? buildCarteRdvPdfModerne(eleveId, seances) : buildCarteRdvPdfClassique(eleveId, seances)));
}
function buildFacturePdf(f) {
  return pourAgence(byId('agences', f.agenceId) || agenceDe(byId('eleves', f.eleveId)), () => (styleModerne() ? buildFacturePdfModerne(f) : buildFacturePdfClassique(f)));
}
function buildContratPdf(c) {
  return pourAgence(agenceDe(byId('eleves', c.eleveId)), () => (styleModerne() ? buildContratPdfModerne(c) : buildContratPdfClassique(c)));
}

/* ---------- Ancien style (classique) ---------- */
function buildFacturePdfClassique(f) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ent = DB.entreprise;
  const e = byId('eleves', f.eleveId);
  const ag = byId('agences', f.agenceId) || agenceDe(e);
  const t = factureTotaux(f);
  const paye = facturePaye(f);
  const W = 210, M = 18;

  doc.setFillColor(...palette().accent); doc.rect(0, 0, W, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  const ec = ecoleDe(ag);
  const xe = M + (logoPdf(doc, ec.logo, M, 12, 40, 24) ? 45 : 0);
  doc.text(pdfText(ec.nom), xe, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const lignesEnt = [
    ec.adresse, [ec.cp, ec.ville].filter(Boolean).join(' '),
    [ec.tel && 'Tél. ' + ec.tel, ec.email].filter(Boolean).join(' - '),
    ec.siret && 'SIRET ' + ec.siret, ec.agrement && 'Agrément ' + ec.agrement,
  ].filter(Boolean);
  lignesEnt.forEach((l, i) => doc.text(pdfText(l), xe, 25 + i * 4.2));

  doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('FACTURE', W - M, 22, { align: 'right' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(pdfText(`N° ${f.numero}`), W - M, 29, { align: 'right' });
  doc.text(`Date : ${fmtDate(f.date)}`, W - M, 34, { align: 'right' });

  const cy = 54;
  doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
  doc.roundedRect(W - M - 85, cy, 85, 30, 2, 2, 'FD');
  doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text('FACTURÉ À', W - M - 81, cy + 6);
  doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(pdfText(e ? `${e.prenom} ${e.nom.toUpperCase()}` : ''), W - M - 81, cy + 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  [e?.adresse, [e?.cp, e?.ville].filter(Boolean).join(' '), e?.email, e?.neph && 'NEPH ' + e.neph]
    .filter(Boolean).forEach((l, i) => doc.text(pdfText(l), W - M - 81, cy + 17 + i * 4));

  let y = 96;
  doc.setFillColor(...palette().fonce); doc.rect(M, y - 5, W - 2 * M, 8, 'F');
  doc.setTextColor(...surFonce()); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Désignation', M + 2, y); doc.text('Qté', 130, y, { align: 'right' });
  doc.text('PU TTC', 165, y, { align: 'right' }); doc.text('Total TTC', W - M - 2, y, { align: 'right' });
  doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'normal');
  y += 9;
  for (const l of f.lignes) {
    const wrapped = doc.splitTextToSize(pdfText(l.libelle), 105);
    if (y + wrapped.length * 4.5 > 255) { doc.addPage(); y = 20; }
    doc.text(wrapped, M + 2, y);
    doc.text(String(l.qte).replace('.', ','), 130, y, { align: 'right' });
    doc.text(eurPdf(l.pu), 165, y, { align: 'right' });
    doc.text(eurPdf(l.qte * l.pu), W - M - 2, y, { align: 'right' });
    y += wrapped.length * 4.5 + 2;
    doc.setDrawColor(226, 232, 240); doc.line(M, y - 3, W - M, y - 3);
  }

  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  const tx = 125;
  const lineTot = (label, val, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 11 : 9.5);
    doc.text(pdfText(label), tx, y); doc.text(val, W - M - 2, y, { align: 'right' }); y += bold ? 7 : 5.5;
  };
  if (t.taux > 0) { lineTot('Total HT', eurPdf(t.ht)); lineTot(`TVA ${String(t.taux).replace('.', ',')} %`, eurPdf(t.tva)); }
  doc.setFillColor(...palette().clair); doc.rect(tx - 3, y - 5, W - M - tx + 3, 8, 'F');
  lineTot('Total TTC', eurPdf(t.ttc), true);
  if (paye > 0) { lineTot('Déjà réglé', '- ' + eurPdf(paye)); lineTot('Reste à payer', eurPdf(Math.max(0, t.ttc - paye)), true); }
  if (t.taux === 0) { doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.text('TVA non applicable, art. 293 B du CGI', M, y); y += 5; }

  const pays = DB.paiements.filter((p) => p.factureId === f.id).sort((a, b) => a.date.localeCompare(b.date));
  if (pays.length) {
    y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Règlements reçus', M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    pays.forEach((p) => { doc.text(pdfText(`${fmtDate(p.date)} - ${p.mode}${p.reference ? ' (' + p.reference + ')' : ''} : ${eurPdf(p.montant)}`), M, y); y += 4.5; });
  }

  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
  const foot = doc.splitTextToSize(pdfText(DB.settings.mentionsFacture || ''), W - 2 * M);
  doc.text(foot, W / 2, 285 - foot.length * 3.5, { align: 'center' });
  doc.text(pdfText([ec.nom, ec.siret && 'SIRET ' + ec.siret].filter(Boolean).join(' - ')), W / 2, 289, { align: 'center' });
  return doc;
}

function buildCarteRdvPdfClassique(eleveId, seances) {
  const { jsPDF } = window.jspdf;
  const e = byId('eleves', eleveId);
  const ent = DB.entreprise;
  const ag = agenceDe(e);
  const doc = new jsPDF({ unit: 'mm', format: [148, 105], orientation: 'landscape' });
  const W = 148, H = 105, M = 8;
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(seances.length / perPage));
  const ec = ecoleDe(ag);
  const coord = [ec.tel, [ec.adresse, ec.cp, ec.ville].filter(Boolean).join(' ')].filter(Boolean);
  for (let pg = 0; pg < pages; pg++) {
    if (pg > 0) doc.addPage([148, 105], 'landscape');
    doc.setFillColor(...palette().fonce); doc.rect(0, 0, W, 20, 'F');
    doc.setFillColor(...palette().accent); doc.rect(0, 20, W, 1.5, 'F');
    doc.setTextColor(...surFonce());
    const lwc = logoPdf(doc, ec.logo, M, 3.5, 26, 13, { fond: true });
    const xc = M + (lwc ? lwc + 4 : 0);
    doc.setTextColor(...surFonce());
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(pdfText(ec.nom), xc, 9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(pdfText(coord.join('  -  ')), xc, 15);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('CARTE DE RENDEZ-VOUS', W - M, 9, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Formation moto', W - M, 15, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(pdfText(`${e.prenom} ${e.nom.toUpperCase()}`), M, 29);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(pdfText([e.formation, e.neph && 'NEPH ' + e.neph].filter(Boolean).join('  -  ')), W - M, 29, { align: 'right' });

    let y = 37;
    doc.setFillColor(241, 245, 249); doc.rect(M, y - 4, W - 2 * M, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('DATE', M + 2, y); doc.text('HORAIRE', M + 52, y); doc.text('TYPE', M + 75, y); doc.text('MONITEUR', M + 96, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    y += 6;
    const chunk = seances.slice(pg * perPage, (pg + 1) * perPage);
    if (!chunk.length) doc.text('Aucun rendez-vous programmé.', M + 2, y);
    for (const s of chunk) {
      const d = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFont('helvetica', 'bold'); doc.text(pdfText(d), M + 2, y);
      doc.setFont('helvetica', 'normal');
      const hz = horaireDe(s, eleveId);
      doc.text(`${hz.debut} - ${hz.fin}`, M + 52, y);
      doc.text(pdfText(isExam(s.type) ? 'Examen ' + (s.type === 'exam_plateau' ? 'plateau' : 'circu') : TYPES[s.type].label), M + 75, y);
      doc.text(pdfText(moniteurNom(byId('moniteurs', s.moniteurId))), M + 96, y);
      doc.setDrawColor(226, 232, 240); doc.line(M, y + 2, W - M, y + 2);
      y += 6.6;
    }
    doc.setFontSize(6.5); doc.setTextColor(100, 116, 139);
    const cond = doc.splitTextToSize(pdfText(DB.settings.conditionsRdv || ''), W - 2 * M);
    doc.text(cond, M, H - 4 - (cond.length - 1) * 2.8);
    if (pages > 1) doc.text(`${pg + 1}/${pages}`, W - M, H - 4, { align: 'right' });
  }
  return doc;
}

function buildContratPdfClassique(c) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const e = byId('eleves', c.eleveId);
  const ec = ecoleDe(agenceDe(e));
  const W = 210, M = 18, BAS = 275;
  let y = 16;

  doc.setFillColor(...palette().accent); doc.rect(0, 0, W, 4, 'F');
  if (logoPdf(doc, ec.logo, W - M - 34, 8, 34, 16)) { /* logo en haut à droite */ }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(pdfText(c.ecoleNom || ec.nom), M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text(pdfText([[ec.adresse, ec.cp, ec.ville].filter(Boolean).join(' '), ec.siret && 'SIRET ' + ec.siret, ec.agrement && 'Agrément ' + ec.agrement].filter(Boolean).join('  -  ')), M, y + 4.5);
  doc.setTextColor(15, 23, 42);
  y += 14;

  const saut = (h) => { if (y + h > BAS) { doc.addPage(); y = 20; } };
  const SIG_H = 50; // hauteur du bloc signatures
  const lignesTexte = c.texte.replace(/\s+$/, '').split('\n');
  const derniere = lignesTexte.length - 1;
  lignesTexte.forEach((ligne, idx) => {
    if (/^#\s+/.test(ligne)) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      const t = doc.splitTextToSize(pdfText(ligne.replace(/^#\s+/, '')), W - 2 * M);
      saut(t.length * 5 + 4); y += 2;
      doc.text(t, M, y); y += t.length * 5 + 1;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    } else if (!ligne.trim()) {
      y += 2.5;
    } else {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      const t = doc.splitTextToSize(pdfText(ligne), W - 2 * M);
      // la dernière ligne (« Fait à …, le … ») reste sur la même page que les signatures
      if (idx === derniere) saut(t.length * 4.6 + SIG_H + 6);
      for (const l of t) { saut(4.6); doc.text(l, M, y); y += 4.6; }
    }
  });

  // Signatures
  saut(SIG_H); y += 6;
  const colW = (W - 2 * M - 10) / 2;
  const fmtImg = (img) => (/^data:image\/jpe?g/.test(img) ? 'JPEG' : 'PNG');
  const bloc = (x, titre, nom, img, mention, tampon) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(pdfText(titre), x, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(pdfText(nom || ''), x, y + 5);
    if (mention) { doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.text(doc.splitTextToSize(pdfText(mention), colW), x, y + 9.5); doc.setTextColor(15, 23, 42); }
    doc.setDrawColor(203, 213, 225); doc.roundedRect(x, y + 13, colW, 26, 2, 2);
    const zoneW = tampon ? colW * 0.58 : colW - 4;
    if (img) {
      try { // ajustée au cadre en gardant ses proportions
        const pr = doc.getImageProperties(img);
        const k = Math.min(zoneW / pr.width, 22 / pr.height);
        doc.addImage(img, fmtImg(img), x + 2 + (zoneW - pr.width * k) / 2, y + 15 + (22 - pr.height * k) / 2, pr.width * k, pr.height * k);
      } catch (err) { /* image illisible */ }
    }
    if (tampon) {
      try {
        const pr = doc.getImageProperties(tampon);
        const maxW = colW * 0.4 - 2; const maxH = 24;
        const k = Math.min(maxW / pr.width, maxH / pr.height);
        doc.addImage(tampon, fmtImg(tampon), x + colW - 2 - pr.width * k, y + 14 + (maxH - pr.height * k) / 2, pr.width * k, pr.height * k);
      } catch (err) { /* image illisible */ }
    }
  };
  bloc(M, "L'élève (ou son représentant légal)", c.signataireEleve, c.signatureEleve, c.signeLe ? `Lu et approuvé - signé électroniquement le ${fmtDateHeure(c.signeLe)}` : '');
  bloc(M + colW + 10, `Pour ${c.ecoleNom || ec.nom}`, c.signataireEcole, c.signatureEcole, '', c.tamponEcole);

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text(pdfText(`${c.titre} - ${eleveNom(e)}`), M, 290);
    doc.text(`Page ${i}/${n}`, W - M, 290, { align: 'right' });
  }
  return doc;
}

