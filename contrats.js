/* =====================================================================
   CONTRATS — modèles, remplissage automatique, signature électronique
   - Modèles de contrat avec des champs {{...}} remplis depuis la fiche élève
   - Signature au doigt / à la souris (élève ou représentant légal)
   - Signature de l'auto-école enregistrée une fois, ajoutée automatiquement
   - Contrat signé en PDF, envoi par e-mail / WhatsApp…
   ===================================================================== */
'use strict';

const CHAMPS_CONTRAT = {
  nom: "Nom de l'élève",
  prenom: "Prénom de l'élève",
  date_naissance: 'Date de naissance',
  adresse_complete: 'Adresse complète',
  telephone: 'Téléphone',
  email: 'E-mail',
  neph: 'N° NEPH',
  formation: 'Formation (A2, A…)',
  heures_prevues: 'Heures prévues',
  agence: 'Agence',
  agence_adresse: "Adresse de l'agence",
  ville_agence: "Ville de l'agence",
  auto_ecole: "Nom de l'auto-école",
  auto_ecole_adresse: "Adresse de l'auto-école",
  siret: 'SIRET',
  agrement: 'N° agrément',
  date_du_jour: 'Date du jour',
  prix_heure_plateau: 'Prix heure plateau',
  prix_heure_circulation: 'Prix heure circulation',
  prix_examen_plateau: '1er accompagnement examen plateau',
  prix_examen_circulation: '1er accompagnement examen circulation',
  prix_repassage_plateau: 'Frais de repassage plateau',
  prix_repassage_circulation: 'Frais de repassage circulation',
  heures_preparation_min: 'Heures de préparation (min)',
  heures_preparation_max: 'Heures de préparation (max)',
  max_plateau: 'Max élèves plateau',
  max_circulation: 'Max élèves circulation',
  conditions_rdv: "Conditions d'annulation",
};

const MODELE_CONTRAT_DEFAUT = `# CONTRAT DE FORMATION À LA CONDUITE DES MOTOCYCLETTES – {{formation}}

Entre les soussignés :
{{auto_ecole}}, {{auto_ecole_adresse}}, SIRET {{siret}}, agrément n° {{agrement}}, agence : {{agence}} ({{agence_adresse}}), ci-après « l'établissement »,
et
{{prenom}} {{nom}}, né(e) le {{date_naissance}}, demeurant {{adresse_complete}}, téléphone {{telephone}}, e-mail {{email}}, N° NEPH {{neph}}, ci-après « l'élève ».

# Article 1 – Objet
Le présent contrat a pour objet la formation pratique de l'élève à la conduite des motocyclettes (formation {{formation}}) en vue de sa présentation aux épreuves du permis de conduire.

# Article 2 – Volume de formation
À l'issue de l'évaluation de départ, le volume de formation prévisionnel est estimé à {{heures_prevues}} heures. Ce volume est indicatif : il peut être revu en fonction de la progression de l'élève, après en avoir discuté avec lui.

# Article 3 – Déroulement
La formation comprend des leçons sur plateau hors circulation (jusqu'à {{max_plateau}} élèves par moniteur) et des leçons en circulation (jusqu'à {{max_circulation}} élèves par moniteur). L'élève doit porter un équipement conforme : casque homologué, gants certifiés, blouson ou veste à manches longues, pantalon ou combinaison, bottes ou chaussures montantes.

# Article 4 – Examen blanc et préparation aux examens
Avant chaque épreuve pratique, plateau (hors circulation) comme circulation, l'élève doit valider un examen blanc. L'examen blanc se déroule dans les mêmes conditions que l'examen final ; il est validé si l'élève ne commet aucune faute éliminatoire.
Une fois l'examen blanc validé, l'établissement inscrit l'élève sur une date d'examen, selon les places disponibles.
Avant cette date, une préparation à l'examen est planifiée : {{heures_preparation_min}} heures minimum et {{heures_preparation_max}} heures maximum, pour l'épreuve plateau comme pour l'épreuve circulation.

# Article 5 – Tarifs (TTC)
Heure de formation plateau : {{prix_heure_plateau}}
Heure de formation circulation : {{prix_heure_circulation}}
Premier accompagnement à l'examen plateau : {{prix_examen_plateau}}
Premier accompagnement à l'examen circulation : {{prix_examen_circulation}}
En cas d'échec, chaque nouvelle présentation donne lieu à des frais de repassage :
- examen plateau : {{prix_repassage_plateau}}
- examen circulation : {{prix_repassage_circulation}}

# Article 6 – Paiement
Les prestations sont payables selon les modalités convenues avec l'établissement. Une facture est remise pour chaque règlement.

# Article 7 – Annulation des leçons
{{conditions_rdv}}

# Article 8 – Résiliation
L'élève peut mettre fin au contrat à tout moment. Les prestations déjà effectuées restent dues ; les sommes versées pour des prestations non effectuées sont remboursées. Le dossier de l'élève lui est restitué sur demande.

# Article 9 – Litiges
En cas de litige, l'élève peut recourir gratuitement à un médiateur de la consommation : ________________.

Fait à {{ville_agence}}, le {{date_du_jour}}.`;

// Ancienne version (v1) du modèle fourni : remplacée automatiquement si elle n'a pas été modifiée
const ANCIEN_BLOC_V1 = `# Article 4 – Tarifs (TTC)
Heure de formation plateau : {{prix_heure_plateau}}
Heure de formation circulation : {{prix_heure_circulation}}
Accompagnement à l'examen plateau : {{prix_examen_plateau}}
Accompagnement à l'examen circulation : {{prix_examen_circulation}}

# Article 5 – Paiement
Les prestations sont payables selon les modalités convenues avec l'établissement. Une facture est remise pour chaque règlement.

# Article 6 – Annulation des leçons
{{conditions_rdv}}

# Article 7 – Présentation aux examens
L'établissement présente l'élève aux épreuves lorsque son niveau le permet, selon les places d'examen disponibles.

# Article 8 – Résiliation`;
function majModelesFournis(modeles) {
  const debut = MODELE_CONTRAT_DEFAUT.indexOf('# Article 4 –');
  const fin = MODELE_CONTRAT_DEFAUT.indexOf('# Article 8 – Résiliation') + '# Article 8 – Résiliation'.length;
  const ancien = MODELE_CONTRAT_DEFAUT.slice(0, debut) + ANCIEN_BLOC_V1 + MODELE_CONTRAT_DEFAUT.slice(fin);
  for (const m of modeles) if (m.texte === ancien) m.texte = MODELE_CONTRAT_DEFAUT;
}

function modelesParDefaut() {
  return [{ id: uid(), nom: 'Contrat de formation moto', texte: MODELE_CONTRAT_DEFAUT }];
}

/* ---------- Remplissage ---------- */
function variablesContrat(e) {
  const ent = DB.entreprise;
  const a = agenceDe(e) || {};
  const s = DB.settings;
  const adr = (x) => [x.adresse, [x.cp, x.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return {
    nom: (e.nom || '').toUpperCase(),
    prenom: e.prenom,
    date_naissance: e.naissance ? fmtDate(e.naissance) : '',
    adresse_complete: adr(e),
    telephone: e.tel,
    email: e.email,
    neph: e.neph,
    formation: e.formation,
    heures_prevues: e.heuresPrevues,
    agence: a.nom,
    agence_adresse: adr(a),
    ville_agence: a.ville || ent.ville,
    auto_ecole: ent.nom,
    auto_ecole_adresse: adr(ent),
    siret: ent.siret,
    agrement: ent.agrement,
    date_du_jour: fmtDate(todayISO()),
    prix_heure_plateau: eur(s.tarifHeure.plateau),
    prix_heure_circulation: eur(s.tarifHeure.circulation),
    prix_examen_plateau: s.tarifExamen.exam_plateau ? eur(s.tarifExamen.exam_plateau) : 'offert',
    prix_examen_circulation: s.tarifExamen.exam_circulation ? eur(s.tarifExamen.exam_circulation) : 'offert',
    prix_repassage_plateau: eur(s.fraisRepassage.exam_plateau),
    prix_repassage_circulation: eur(s.fraisRepassage.exam_circulation),
    heures_preparation_min: s.heuresPrepa.min,
    heures_preparation_max: s.heuresPrepa.max,
    max_plateau: s.capacite.plateau,
    max_circulation: s.capacite.circulation,
    conditions_rdv: s.conditionsRdv,
  };
}
function remplirContrat(texte, e) {
  const v = variablesContrat(e);
  return texte.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (k in v ? (String(v[k] ?? '').trim() || '__________') : m));
}
function contratHtml(texte) {
  return texte.split(/\n/).map((l) => {
    if (/^#\s+/.test(l)) return `<h3>${esc(l.replace(/^#\s+/, ''))}</h3>`;
    if (!l.trim()) return '<div class="sp"></div>';
    return `<p>${esc(l)}</p>`;
  }).join('');
}
const fmtDateHeure = (iso) => { const d = new Date(iso); return `${d.toLocaleDateString('fr-FR')} à ${pad(d.getHours())}h${pad(d.getMinutes())}`; };

/* ---------- Zone de signature (doigt / souris / stylet) ---------- */
function signaturePad(canvas) {
  const ctx = canvas.getContext('2d');
  let longueur = 0; let dessine = false; let last = null;
  const W = canvas.clientWidth; const H = canvas.clientHeight;
  const r = window.devicePixelRatio || 1;
  canvas.width = W * r; canvas.height = H * r;
  ctx.scale(r, r);
  ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f172a';
  const pos = (ev) => { const b = canvas.getBoundingClientRect(); return { x: ev.clientX - b.left, y: ev.clientY - b.top }; };
  canvas.addEventListener('pointerdown', (ev) => { dessine = true; last = pos(ev); canvas.setPointerCapture(ev.pointerId); ctx.beginPath(); ctx.arc(last.x, last.y, 1.1, 0, Math.PI * 2); ctx.fill(); ev.preventDefault(); });
  canvas.addEventListener('pointermove', (ev) => {
    if (!dessine) return;
    const p = pos(ev);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    longueur += Math.hypot(p.x - last.x, p.y - last.y);
    last = p; ev.preventDefault();
  });
  const fin = () => { dessine = false; };
  canvas.addEventListener('pointerup', fin);
  canvas.addEventListener('pointercancel', fin);
  return {
    get vide() { return longueur < 40; }, // un simple point ne compte pas comme signature
    effacer() { ctx.clearRect(0, 0, W, H); longueur = 0; },
    image() { // PNG à la taille d'affichage (léger)
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      c.getContext('2d').drawImage(canvas, 0, 0, W, H);
      return c.toDataURL('image/png');
    },
  };
}

/* ---------- Onglet « Contrats » de la fiche élève ---------- */
function viewContratsEleve(eid) {
  const list = DB.contrats.filter((c) => c.eleveId === eid).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `
    <div class="row" style="margin-bottom:10px"><button class="btn primary" data-action="newContrat" data-eleve="${eid}">📝 Nouveau contrat</button></div>
    ${list.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Contrat</th><th>Créé le</th><th>Statut</th><th></th></tr></thead>
      <tbody>${list.map((c) => `<tr class="clickable" data-action="openContrat" data-id="${c.id}">
        <td><strong>${esc(c.titre)}</strong></td>
        <td>${fmtDate(c.date)}</td>
        <td>${c.statut === 'signe' ? `<span class="badge ok">✍️ Signé le ${fmtDateHeure(c.signeLe)}</span>` : '<span class="badge warn">À signer</span>'}</td>
        <td class="num">${c.statut === 'signe'
          ? `<button class="btn small" data-action="sendContrat" data-id="${c.id}">📤 Envoyer</button>`
          : `<button class="btn small primary" data-action="signerContrat" data-id="${c.id}">✍️ Faire signer</button>`}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="muted">Aucun contrat pour cet élève.</p>'}`;
}

/* ---------- Création / modification avant signature ---------- */
let draftContrat = null;

function openContratBrouillon(c) {
  draftContrat = JSON.parse(JSON.stringify(c));
  const e = byId('eleves', c.eleveId);
  openModal({
    title: `Contrat — ${esc(eleveNom(e))}`,
    wide: true,
    body: `
      <label class="field"><span>Titre</span><input id="ct-titre" value="${esc(draftContrat.titre)}"></label>
      <div class="alert info small" style="margin-top:10px">Le contrat est rempli automatiquement avec la fiche de l'élève. Vous pouvez encore modifier le texte avant la signature. Les « __________ » sont des informations manquantes sur la fiche.</div>
      <textarea id="ct-texte" class="contrat-edit">${esc(draftContrat.texte)}</textarea>`,
    foot: `
      ${c.id ? '<div class="left"><button class="btn danger" data-action="deleteContrat">Supprimer</button></div>' : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn" data-action="saveContratBrouillon">Enregistrer</button>
      <button class="btn primary" data-action="saveEtSigner">✍️ Faire signer</button>`,
  });
}

function enregistrerBrouillon() {
  draftContrat.titre = $('#ct-titre').value.trim() || 'Contrat';
  draftContrat.texte = $('#ct-texte').value;
  if (draftContrat.id) Object.assign(byId('contrats', draftContrat.id), draftContrat);
  else { draftContrat.id = uid(); DB.contrats.push(draftContrat); }
  save();
  return byId('contrats', draftContrat.id);
}

/* ---------- Signature ---------- */
function openSignature(c) {
  const e = byId('eleves', c.eleveId);
  const ent = DB.entreprise;
  const sigEcole = ent.signature;
  let padEleve = null; let padEcole = null;
  openModal({
    title: '✍️ Signature du contrat',
    wide: true,
    body: `
      <div class="contrat-lecture">${contratHtml(c.texte)}</div>
      <label style="display:flex;align-items:center;margin:12px 0;gap:10px;font-weight:600"><input type="checkbox" id="sg-lu" style="width:auto;flex:none;transform:scale(1.3)"> J'ai lu le contrat et je l'accepte (lu et approuvé)</label>
      <div class="grid cols-2">
        <div>
          <label class="field"><span>Nom du signataire (élève, ou représentant légal si mineur)</span><input id="sg-nom" value="${esc(eleveNom(e))}"></label>
          <div class="lbl">Signature de l'élève</div>
          <canvas id="sg-eleve" class="sig-pad"></canvas>
          <button class="btn small" data-action="sgEffacer" data-pad="eleve">Effacer</button>
        </div>
        <div>
          ${sigEcole ? `
            <div class="lbl">Pour l'auto-école — ${esc(ent.signataire || ent.nom)}</div>
            <div class="sig-pad sig-ok"><img src="${sigEcole}" alt="Signature de l'auto-école"></div>
            <p class="muted small">Signature de l'auto-école ajoutée automatiquement.</p>` : `
            <label class="field"><span>Signataire pour l'auto-école</span><input id="sg-ecole-nom" value="${esc(ent.signataire || '')}" placeholder="Nom et fonction"></label>
            <div class="lbl">Signature de l'auto-école</div>
            <canvas id="sg-ecole" class="sig-pad"></canvas>
            <button class="btn small" data-action="sgEffacer" data-pad="ecole">Effacer</button>
            <label class="row small muted" style="gap:6px;margin-top:6px"><input type="checkbox" id="sg-memo" style="width:auto" checked> Enregistrer cette signature pour les prochains contrats</label>`}
        </div>
      </div>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="validerSignature">Valider la signature</button>`,
    onMount: () => {
      padEleve = signaturePad($('#sg-eleve'));
      if (!sigEcole) padEcole = signaturePad($('#sg-ecole'));
      openSignature.pads = { eleve: padEleve, ecole: padEcole };
      openSignature.contratId = c.id;
    },
  });
}

function validerSignature() {
  const { eleve: pe, ecole: pc } = openSignature.pads;
  const c = byId('contrats', openSignature.contratId);
  const ent = DB.entreprise;
  if (!$('#sg-lu').checked) return toast('Cochez « J\'ai lu le contrat et je l\'accepte »', true);
  if (!$('#sg-nom').value.trim()) return toast('Indiquez le nom du signataire', true);
  if (pe.vide) return toast("L'élève doit signer dans le cadre", true);
  if (pc && pc.vide) return toast("La signature de l'auto-école manque", true);
  c.signatureEleve = pe.image();
  c.signataireEleve = $('#sg-nom').value.trim();
  if (pc) {
    c.signatureEcole = pc.image();
    c.signataireEcole = $('#sg-ecole-nom').value.trim() || ent.nom;
    if ($('#sg-memo').checked) { ent.signature = c.signatureEcole; ent.signataire = c.signataireEcole; }
  } else {
    c.signatureEcole = ent.signature;
    c.signataireEcole = ent.signataire || ent.nom;
  }
  c.signeLe = new Date().toISOString();
  c.statut = 'signe';
  save();
  closeModal();
  render();
  toast('Contrat signé ✅');
  sendContrat(c.id);
}

/* ---------- Contrat signé : lecture ---------- */
function openContratSigne(c) {
  openModal({
    title: `${esc(c.titre)} — signé`,
    wide: true,
    body: `
      <div class="contrat-lecture">${contratHtml(c.texte)}</div>
      <div class="grid cols-2" style="margin-top:12px">
        <div><div class="lbl">L'élève — ${esc(c.signataireEleve)}</div><div class="sig-pad sig-ok"><img src="${c.signatureEleve}" alt=""></div>
          <p class="muted small">Lu et approuvé, signé électroniquement le ${fmtDateHeure(c.signeLe)}</p></div>
        <div><div class="lbl">Pour l'auto-école — ${esc(c.signataireEcole || '')}</div><div class="sig-pad sig-ok">${c.signatureEcole ? `<img src="${c.signatureEcole}" alt="">` : ''}</div></div>
      </div>`,
    foot: `<div class="left"><button class="btn danger" data-action="deleteContrat">Supprimer</button></div>
      <button class="btn" data-action="closeModal">Fermer</button>
      <button class="btn primary" data-action="sendContrat" data-id="${c.id}">📤 Envoyer / PDF</button>`,
  });
  draftContrat = c;
}

/* ---------- PDF ---------- */
function buildContratPdf(c) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ent = DB.entreprise;
  const e = byId('eleves', c.eleveId);
  const a = agenceDe(e);
  const W = 210, M = 18, BAS = 275;
  let y = 16;

  doc.setFillColor(249, 115, 22); doc.rect(0, 0, W, 4, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(pdfText(ent.nom + (a && DB.agences.length > 1 ? ' - ' + a.nom : '')), M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text(pdfText([[ent.adresse, ent.cp, ent.ville].filter(Boolean).join(' '), ent.siret && 'SIRET ' + ent.siret, ent.agrement && 'Agrément ' + ent.agrement].filter(Boolean).join('  -  ')), M, y + 4.5);
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
  const bloc = (x, titre, nom, img, mention) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(pdfText(titre), x, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(pdfText(nom || ''), x, y + 5);
    if (mention) { doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.text(doc.splitTextToSize(pdfText(mention), colW), x, y + 9.5); doc.setTextColor(15, 23, 42); }
    doc.setDrawColor(203, 213, 225); doc.roundedRect(x, y + 13, colW, 26, 2, 2);
    if (img) { try { const h = 24; const w = Math.min(colW - 4, h / 0.32); doc.addImage(img, 'PNG', x + (colW - w) / 2, y + 14, w, w * 0.32); } catch (err) { /* image illisible */ } }
  };
  bloc(M, "L'élève (ou son représentant légal)", c.signataireEleve, c.signatureEleve, c.signeLe ? `Lu et approuvé - signé électroniquement le ${fmtDateHeure(c.signeLe)}` : '');
  bloc(M + colW + 10, "Pour l'auto-école", c.signataireEcole, c.signatureEcole, '');

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text(pdfText(`${c.titre} - ${eleveNom(e)}`), M, 290);
    doc.text(`Page ${i}/${n}`, W - M, 290, { align: 'right' });
  }
  return doc;
}

function sendContrat(id) {
  const c = byId('contrats', id);
  const e = byId('eleves', c.eleveId);
  const ent = DB.entreprise;
  openSendDialog({
    title: 'Envoyer le contrat',
    doc: buildContratPdf(c),
    filename: `Contrat-${e.nom}-${e.prenom}.pdf`.replace(/\s+/g, '_'),
    eleve: e,
    subject: `Votre contrat de formation - ${ent.nom}`,
    text: `Bonjour ${e.prenom},\n\nVeuillez trouver ci-joint votre contrat de formation${c.statut === 'signe' ? ` signé le ${fmtDateHeure(c.signeLe)}` : ''}.\n\nCordialement,\n${ent.nom}${ent.tel ? '\n' + ent.tel : ''}`,
  });
}

/* ---------- Paramètres : modèles & signature de l'auto-école ---------- */
function viewParamContrats() {
  const ent = DB.entreprise;
  return `
    <div class="card">
      <h2>📝 Contrats</h2>
      <p class="muted small">Modèles remplis automatiquement avec la fiche de l'élève. Le modèle fourni est indicatif : vérifiez-le ou collez à la place le texte de votre contrat habituel.</p>
      ${DB.modeles.map((m) => `<div class="chip-row"><span class="name">${esc(m.nom)}</span><button class="btn small" data-action="editModele" data-id="${m.id}">Modifier</button></div>`).join('')}
      <button class="btn" data-action="editModele">+ Nouveau modèle</button>
      <hr>
      <h3>Signature de l'auto-école</h3>
      ${ent.signature
        ? `<div class="row"><div class="sig-pad sig-ok" style="max-width:260px;height:84px"><img src="${ent.signature}" alt=""></div>
            <span class="small">${esc(ent.signataire || '')}<br><span class="muted">Ajoutée automatiquement sur les contrats</span></span></div>
            <div class="row" style="margin-top:8px"><button class="btn small" data-action="editSignatureEcole">Refaire</button><button class="btn small danger" data-action="delSignatureEcole">Supprimer</button></div>`
        : '<p class="muted small">Aucune : elle sera demandée à la première signature.</p><button class="btn" data-action="editSignatureEcole">✍️ Enregistrer la signature</button>'}
    </div>`;
}

function openModele(m) {
  const isNew = !m;
  m = m || { nom: 'Nouveau contrat', texte: '' };
  openModal({
    title: isNew ? 'Nouveau modèle de contrat' : 'Modèle de contrat',
    wide: true,
    body: `
      <label class="field"><span>Nom du modèle</span><input id="md-nom" value="${esc(m.nom)}"></label>
      <div class="lbl">Champs automatiques (cliquez pour insérer)</div>
      <div class="champs">${Object.entries(CHAMPS_CONTRAT).map(([k, l]) => `<button class="badge" data-action="insChamp" data-k="${k}" title="{{${k}}}">${esc(l)}</button>`).join('')}</div>
      <p class="muted small">Astuce : une ligne qui commence par « # » devient un titre. Vous pouvez coller le texte de votre contrat actuel.</p>
      <textarea id="md-texte" class="contrat-edit">${esc(m.texte)}</textarea>`,
    foot: `<div class="left">${!isNew ? `<button class="btn danger" data-action="delModele" data-id="${m.id}">Supprimer</button>` : ''}
      <button class="btn" data-action="modeleFourni">Remettre le modèle fourni</button></div>
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="saveModele" data-id="${m.id || ''}">Enregistrer</button>`,
  });
}

function openSignatureEcole() {
  const ent = DB.entreprise;
  let pad;
  openModal({
    title: "Signature de l'auto-école",
    body: `
      <label class="field"><span>Nom et fonction du signataire</span><input id="se-nom" value="${esc(ent.signataire || '')}" placeholder="ex : Mme Dupont, gérante"></label>
      <div class="lbl">Signez dans le cadre</div>
      <canvas id="se-pad" class="sig-pad"></canvas>
      <button class="btn small" data-action="sgEffacer" data-pad="se">Effacer</button>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" data-action="saveSignatureEcole">Enregistrer</button>`,
    onMount: () => { pad = signaturePad($('#se-pad')); openSignature.pads = { se: pad }; },
  });
}

/* ---------- Actions ---------- */
const CONTRAT_ACTIONS = {
  newContrat(d) {
    const e = byId('eleves', d.eleve);
    const creer = (m) => openContratBrouillon({ eleveId: e.id, modeleId: m.id, titre: m.nom, texte: remplirContrat(m.texte, e), date: todayISO(), statut: 'brouillon' });
    if (!DB.modeles.length) return toast('Créez d\'abord un modèle dans Paramètres → Contrats', true);
    if (DB.modeles.length === 1) return creer(DB.modeles[0]);
    openModal({
      title: 'Quel contrat ?',
      body: DB.modeles.map((m) => `<button class="result" style="width:100%" data-action="newContratModele" data-eleve="${e.id}" data-id="${m.id}">📝 ${esc(m.nom)}</button>`).join(''),
      foot: '<button class="btn" data-action="closeModal">Annuler</button>',
    });
  },
  newContratModele(d) {
    const e = byId('eleves', d.eleve); const m = byId('modeles', d.id);
    openContratBrouillon({ eleveId: e.id, modeleId: m.id, titre: m.nom, texte: remplirContrat(m.texte, e), date: todayISO(), statut: 'brouillon' });
  },
  openContrat(d, el, ev) {
    if (ev.target.closest('button')) return;
    const c = byId('contrats', d.id);
    c.statut === 'signe' ? openContratSigne(c) : openContratBrouillon(c);
  },
  saveContratBrouillon() { enregistrerBrouillon(); closeModal(); render(); toast('Contrat enregistré'); },
  saveEtSigner() { const c = enregistrerBrouillon(); render(); openSignature(c); },
  signerContrat(d) { openSignature(byId('contrats', d.id)); },
  sgEffacer(d) { openSignature.pads[d.pad]?.effacer(); },
  validerSignature,
  sendContrat(d) { sendContrat(d.id); },
  deleteContrat() {
    if (!draftContrat?.id) return closeModal();
    const signe = draftContrat.statut === 'signe';
    if (!confirm(signe ? 'Supprimer ce contrat SIGNÉ ? (pensez à garder le PDF)' : 'Supprimer ce contrat ?')) return;
    DB.contrats = DB.contrats.filter((x) => x.id !== draftContrat.id);
    save(); closeModal(); render(); toast('Contrat supprimé');
  },
  editModele(d) { openModele(d.id ? byId('modeles', d.id) : null); },
  insChamp(d) {
    const t = $('#md-texte');
    const ins = `{{${d.k}}}`;
    const a = t.selectionStart ?? t.value.length; const b = t.selectionEnd ?? a;
    t.value = t.value.slice(0, a) + ins + t.value.slice(b);
    t.focus(); t.setSelectionRange(a + ins.length, a + ins.length);
  },
  saveModele(d) {
    const nom = $('#md-nom').value.trim() || 'Contrat';
    const texte = $('#md-texte').value;
    if (d.id) Object.assign(byId('modeles', d.id), { nom, texte });
    else DB.modeles.push({ id: uid(), nom, texte });
    save(); closeModal(); render(); toast('Modèle enregistré');
  },
  delModele(d) {
    if (!confirm('Supprimer ce modèle ? (les contrats déjà faits sont conservés)')) return;
    DB.modeles = DB.modeles.filter((x) => x.id !== d.id);
    save(); closeModal(); render();
  },
  modeleFourni() {
    if ($('#md-texte').value.trim() && !confirm('Remplacer le texte par le modèle fourni ? (pensez à Enregistrer ensuite)')) return;
    $('#md-texte').value = MODELE_CONTRAT_DEFAUT;
  },
  editSignatureEcole() { openSignatureEcole(); },
  saveSignatureEcole() {
    const pad = openSignature.pads.se;
    if (pad.vide) return toast('Signez dans le cadre', true);
    DB.entreprise.signature = pad.image();
    DB.entreprise.signataire = $('#se-nom').value.trim();
    save(); closeModal(); render(); toast('Signature enregistrée');
  },
  delSignatureEcole() {
    if (!confirm("Supprimer la signature enregistrée de l'auto-école ?")) return;
    delete DB.entreprise.signature; delete DB.entreprise.signataire;
    save(); render();
  },
};
