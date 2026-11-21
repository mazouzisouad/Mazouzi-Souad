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
  auto_ecole: "Nom de l'auto-école de l'élève",
  auto_ecole_adresse: "Adresse de l'auto-école",
  auto_ecole_telephone: "Téléphone de l'auto-école",
  auto_ecole_email: "E-mail de l'auto-école",
  ville_agence: "Ville de l'auto-école",
  siret: 'SIRET',
  agrement: 'N° agrément',
  date_agrement: "Date de l'agrément",
  exploitant: 'Représentant / exploitant',
  assureur: 'Assureur',
  police_assurance: "N° de contrat d'assurance",
  garantie_financiere: 'Garantie financière',
  mediateur: 'Médiateur de la consommation',
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

// Version 2 du modèle fourni (gardée pour mettre à jour les modèles non modifiés)
const MODELE_V2 = `# CONTRAT DE FORMATION À LA CONDUITE DES MOTOCYCLETTES – {{formation}}

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

const MODELE_CONTRAT_DEFAUT = `# CONTRAT D'ENSEIGNEMENT DE LA CONDUITE – MOTOCYCLETTE – {{formation}}

Entre les soussignés :
L'école de conduite {{auto_ecole}}, {{auto_ecole_adresse}}, SIRET {{siret}}, représentée par {{exploitant}}, agréée sous le n° {{agrement}} délivré le {{date_agrement}}, assurée pour sa responsabilité civile auprès de {{assureur}}, contrat n° {{police_assurance}}, téléphone {{auto_ecole_telephone}}, e-mail {{auto_ecole_email}}, ci-après « l'école de conduite »,
et
{{prenom}} {{nom}}, né(e) le {{date_naissance}}, demeurant {{adresse_complete}}, téléphone {{telephone}}, e-mail {{email}}, N° NEPH {{neph}}, ci-après « l'élève ». Si l'élève est mineur, il est représenté par son représentant légal, signataire du présent contrat.

# Article 1 – Objet du contrat
Le présent contrat a pour objet l'enseignement de la conduite des motocyclettes en vue de l'obtention du permis de conduire (formation {{formation}}) : formation pratique hors circulation (plateau) et en circulation, et accompagnement de l'élève aux épreuves pratiques de l'examen.

# Article 2 – Évaluation préalable
Avant la signature du présent contrat, une évaluation du niveau de l'élève a été réalisée par un enseignant de l'école de conduite. À l'issue de cette évaluation, le volume prévisionnel de formation pratique est estimé à {{heures_prevues}} heures.
Ce volume est indicatif : il peut être révisé en fonction de la progression de l'élève. Toute modification est discutée au préalable avec l'élève.

# Article 3 – Programme et déroulement de la formation
La formation suit le programme officiel de formation à la conduite (référentiel pour l'éducation à une mobilité citoyenne). L'élève reçoit un livret d'apprentissage qui permet de suivre sa progression.
Elle comprend des leçons sur plateau hors circulation (jusqu'à {{max_plateau}} élèves par enseignant) et des leçons en circulation (jusqu'à {{max_circulation}} élèves par enseignant). Les leçons sont dispensées par des enseignants titulaires d'une autorisation d'enseigner en cours de validité, sur des motocyclettes adaptées et assurées.
L'élève doit porter un équipement conforme : casque homologué, gants certifiés, blouson ou veste à manches longues, pantalon ou combinaison, bottes ou chaussures montantes.

# Article 4 – Examen blanc et préparation aux examens
Avant chaque épreuve pratique, plateau (hors circulation) comme circulation, l'élève doit valider un examen blanc. L'examen blanc se déroule dans les mêmes conditions que l'examen final ; il est validé si l'élève ne commet aucune faute éliminatoire.
Une fois l'examen blanc validé, l'école de conduite inscrit l'élève sur une date d'examen, selon les places disponibles.
Avant cette date, une préparation à l'examen est planifiée : {{heures_preparation_min}} heures minimum et {{heures_preparation_max}} heures maximum, pour l'épreuve plateau comme pour l'épreuve circulation.

# Article 5 – Présentation aux épreuves
L'école de conduite présente l'élève aux épreuves pratiques dès que les conditions de l'article 4 sont remplies, selon les places d'examen qui lui sont attribuées. Elle met à disposition la motocyclette et l'accompagnement nécessaires le jour de l'examen.

# Article 6 – Obligations de l'école de conduite
L'école de conduite s'engage à :
- dispenser une formation conforme au programme officiel et au présent contrat ;
- informer régulièrement l'élève de sa progression ;
- présenter l'élève aux épreuves dans les conditions prévues aux articles 4 et 5 ;
- remettre une facture pour chaque paiement ;
- restituer gratuitement son dossier à l'élève qui en fait la demande.

# Article 7 – Obligations de l'élève
L'élève s'engage à :
- suivre la formation avec assiduité et respecter les horaires des leçons ;
- porter l'équipement obligatoire à chaque leçon et à l'examen ;
- se présenter aux leçons et aux examens en état de conduire (ni alcool, ni stupéfiants, ni médicament incompatible avec la conduite) ;
- respecter les consignes des enseignants et le règlement de l'école de conduite ;
- régler les prestations selon les modalités prévues à l'article 8.

# Article 8 – Prix et modalités de paiement (TTC)
Heure de formation plateau : {{prix_heure_plateau}}
Heure de formation circulation : {{prix_heure_circulation}}
Premier accompagnement à l'examen plateau : {{prix_examen_plateau}}
Premier accompagnement à l'examen circulation : {{prix_examen_circulation}}
En cas d'échec, chaque nouvelle présentation donne lieu à des frais de repassage :
- examen plateau : {{prix_repassage_plateau}}
- examen circulation : {{prix_repassage_circulation}}
Les prestations sont payables selon l'échéancier convenu entre les parties. Une facture est remise pour chaque paiement.

# Article 9 – Annulation et report des leçons
{{conditions_rdv}}
Une leçon annulée par l'école de conduite est reportée sans frais pour l'élève.

# Article 10 – Durée et résiliation
Le présent contrat est conclu pour la durée de la formation.
L'élève peut résilier le contrat à tout moment, par écrit, sans frais de résiliation. Les prestations effectuées jusqu'à la date de résiliation restent dues ; les sommes versées pour des prestations non effectuées lui sont remboursées.
L'école de conduite peut résilier le contrat en cas de manquement grave de l'élève à ses obligations, après une mise en demeure restée sans effet.
Le présent contrat est résilié de plein droit en cas de retrait de l'agrément de l'école de conduite. L'école de conduite rembourse alors sans délai à l'élève toutes les sommes payées n'ayant pas donné lieu à prestation.
En cas de résiliation, le dossier de l'élève lui est restitué sans frais.

# Article 11 – Droit de rétractation
Si le présent contrat est conclu à distance ou hors de l'établissement, l'élève dispose d'un délai de quatorze jours pour se rétracter, sans avoir à se justifier, conformément au Code de la consommation.

# Article 12 – Garantie financière
{{garantie_financiere}}

# Article 13 – Données personnelles
Les informations recueillies sont nécessaires à la formation et à l'inscription aux examens. Elles sont conservées par l'école de conduite pendant la durée nécessaire. L'élève peut y accéder et les faire rectifier en s'adressant à l'école de conduite.

# Article 14 – Litiges et médiation
En cas de litige, l'élève s'adresse d'abord à l'école de conduite. À défaut d'accord, il peut recourir gratuitement au médiateur de la consommation : {{mediateur}}.

Fait à {{ville_agence}}, le {{date_du_jour}}, en deux exemplaires.`;

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
  const debut = MODELE_V2.indexOf('# Article 4 –');
  const fin = MODELE_V2.indexOf('# Article 8 – Résiliation') + '# Article 8 – Résiliation'.length;
  const v1 = MODELE_V2.slice(0, debut) + ANCIEN_BLOC_V1 + MODELE_V2.slice(fin);
  for (const m of modeles) if (m.texte === v1 || m.texte === MODELE_V2) m.texte = MODELE_CONTRAT_DEFAUT;
}

function modelesParDefaut() {
  return [{ id: uid(), nom: 'Contrat de formation moto', texte: MODELE_CONTRAT_DEFAUT }];
}

/* ---------- Remplissage ---------- */
function variablesContrat(e) {
  const ec = ecoleDe(agenceDe(e));
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
    auto_ecole: ec.nom,
    agence: ec.nom,
    auto_ecole_adresse: adr(ec),
    agence_adresse: adr(ec),
    auto_ecole_telephone: ec.tel,
    auto_ecole_email: ec.email,
    ville_agence: ec.ville,
    siret: ec.siret,
    agrement: ec.agrement,
    date_agrement: ec.dateAgrement ? fmtDate(ec.dateAgrement) : '',
    exploitant: ec.exploitant,
    assureur: ec.assureur,
    police_assurance: ec.police,
    garantie_financiere: ec.garantie || "L'école de conduite ne dispose pas de garantie financière.",
    mediateur: ec.mediateur,
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
    image() { // PNG rogné autour du trait, à la taille d'affichage (léger)
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const cx = c.getContext('2d');
      cx.drawImage(canvas, 0, 0, W, H);
      const px = cx.getImageData(0, 0, W, H).data;
      let x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (px[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 < 0) return c.toDataURL('image/png');
      const m = 6;
      x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
      const r2 = document.createElement('canvas');
      r2.width = x1 - x0 + 1; r2.height = y1 - y0 + 1;
      r2.getContext('2d').drawImage(c, x0, y0, r2.width, r2.height, 0, 0, r2.width, r2.height);
      return r2.toDataURL('image/png');
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
  const a = agenceDe(e) || {};
  const sigEcole = a.signature;
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
            <div class="lbl">Pour ${esc(a.nom)} — ${esc(a.signataire || '')}</div>
            <div class="sig-pad sig-ok sig-tampon"><img src="${sigEcole}" alt="Signature">${a.tampon ? `<img src="${a.tampon}" alt="Tampon">` : ''}</div>
            <p class="muted small">Signature${a.tampon ? ' et tampon' : ''} de ${esc(a.nom)} ajouté${a.tampon ? 's' : 'e'} automatiquement.${a.tampon ? '' : ' Ajoutez le tampon dans Paramètres → Contrats.'}</p>` : `
            <label class="field"><span>Signataire pour ${esc(a.nom || "l'auto-école")}</span><input id="sg-ecole-nom" value="${esc(a.signataire || a.exploitant || '')}" placeholder="Nom et fonction"></label>
            <div class="lbl">Signature de ${esc(a.nom || "l'auto-école")}</div>
            <canvas id="sg-ecole" class="sig-pad"></canvas>
            <button class="btn small" data-action="sgEffacer" data-pad="ecole">Effacer</button>
            <label class="row small muted" style="gap:6px;margin-top:6px"><input type="checkbox" id="sg-memo" style="width:auto" checked> Enregistrer cette signature pour les prochains contrats de ${esc(a.nom || 'cette auto-école')}</label>`}
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
  const a = agenceDe(byId('eleves', c.eleveId)) || {};
  if (!$('#sg-lu').checked) return toast('Cochez « J\'ai lu le contrat et je l\'accepte »', true);
  if (!$('#sg-nom').value.trim()) return toast('Indiquez le nom du signataire', true);
  if (pe.vide) return toast("L'élève doit signer dans le cadre", true);
  if (pc && pc.vide) return toast("La signature de l'auto-école manque", true);
  c.signatureEleve = pe.image();
  c.signataireEleve = $('#sg-nom').value.trim();
  if (pc) {
    c.signatureEcole = pc.image();
    c.signataireEcole = $('#sg-ecole-nom').value.trim() || a.nom;
    if ($('#sg-memo').checked && a.id) { a.signature = c.signatureEcole; a.signataire = c.signataireEcole; }
  } else {
    c.signatureEcole = a.signature;
    c.signataireEcole = a.signataire || a.exploitant || a.nom;
  }
  c.tamponEcole = a.tampon || '';
  c.ecoleNom = a.nom || '';
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
        <div><div class="lbl">Pour ${esc(c.ecoleNom || "l'auto-école")} — ${esc(c.signataireEcole || '')}</div><div class="sig-pad sig-ok sig-tampon">${c.signatureEcole ? `<img src="${c.signatureEcole}" alt="">` : ''}${c.tamponEcole ? `<img src="${c.tamponEcole}" alt="Tampon">` : ''}</div></div>
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
  const e = byId('eleves', c.eleveId);
  const ec = ecoleDe(agenceDe(e));
  const W = 210, M = 18, BAS = 275;
  let y = 16;

  doc.setFillColor(249, 115, 22); doc.rect(0, 0, W, 4, 'F');
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

function sendContrat(id) {
  const c = byId('contrats', id);
  const e = byId('eleves', c.eleveId);
  const ec = ecoleDe(agenceDe(e));
  openSendDialog({
    title: 'Envoyer le contrat',
    doc: buildContratPdf(c),
    filename: `Contrat-${e.nom}-${e.prenom}.pdf`.replace(/\s+/g, '_'),
    eleve: e,
    subject: `Votre contrat de formation - ${ec.nom}`,
    text: `Bonjour ${e.prenom},\n\nVeuillez trouver ci-joint votre contrat de formation${c.statut === 'signe' ? ` signé le ${fmtDateHeure(c.signeLe)}` : ''}.\n\nCordialement,\n${ec.nom}${ec.tel ? '\n' + ec.tel : ''}`,
  });
}

/* ---------- Paramètres : modèles & signature de l'auto-école ---------- */
function viewParamContrats() {
  return `
    <div class="card">
      <h2>📝 Contrats</h2>
      <p class="muted small">Modèles remplis automatiquement avec la fiche de l'élève et les informations de <strong>son</strong> auto-école. Vérifiez le modèle fourni, ou collez le texte de votre contrat habituel.</p>
      ${DB.modeles.map((m) => `<div class="chip-row"><span class="name">${esc(m.nom)}</span><button class="btn small" data-action="editModele" data-id="${m.id}">Modifier</button></div>`).join('')}
      <button class="btn" data-action="editModele">+ Nouveau modèle</button>
      <hr>
      <h3>Signature et tampon de chaque auto-école</h3>
      <p class="muted small">Sur un contrat, seuls la signature et le tampon de l'auto-école <strong>où l'élève est inscrit</strong> apparaissent.</p>
      ${DB.agences.map((a) => `
        <div class="chip-row" style="flex-wrap:wrap">
          <span class="dot" style="background:${esc(a.couleur)}"></span>
          <span class="name">${esc(a.nom)}</span>
          ${a.signature ? `<img class="mini-sig" src="${a.signature}" alt="Signature">` : '<span class="badge warn">pas de signature</span>'}
          ${a.tampon ? `<img class="mini-sig" src="${a.tampon}" alt="Tampon">` : '<span class="badge warn">pas de tampon</span>'}
          <button class="btn small" data-action="editSignatureEcole" data-id="${a.id}">✍️ Signature</button>
          <label class="btn small">🔖 Tampon<input type="file" accept="image/*" hidden data-on-change="tamponUpload" data-id="${a.id}"></label>
          ${a.tampon ? `<button class="btn small ghost" data-action="delTampon" data-id="${a.id}" title="Retirer le tampon">✕</button>` : ''}
        </div>`).join('')}
      <p class="muted small">Tampon : prenez-le en photo (ou scannez-le) sur fond blanc, bien cadré.</p>
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

function openSignatureEcole(agenceId) {
  const a = byId('agences', agenceId);
  openModal({
    title: `Signature — ${esc(a.nom)}`,
    body: `
      <label class="field"><span>Nom et fonction du signataire</span><input id="se-nom" value="${esc(a.signataire || a.exploitant || '')}" placeholder="ex : Mme Dupont, gérante"></label>
      <div class="lbl">Signez dans le cadre</div>
      <canvas id="se-pad" class="sig-pad"></canvas>
      <button class="btn small" data-action="sgEffacer" data-pad="se">Effacer</button>
      ${a.signature ? `<button class="btn small danger" data-action="delSignatureEcole" data-id="${a.id}">Supprimer la signature enregistrée</button>` : ''}`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" data-action="saveSignatureEcole" data-id="${a.id}">Enregistrer</button>`,
    onMount: () => { openSignature.pads = { se: signaturePad($('#se-pad')) }; },
  });
}

// Réduit une photo de tampon (max 360 px) pour qu'elle reste légère
function chargerImageReduite(file, max = 360) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const ctx = c.getContext('2d');
      const png = file.type === 'image/png';
      if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image illisible')); };
    img.src = url;
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
  editSignatureEcole(d) { openSignatureEcole(d.id); },
  saveSignatureEcole(d) {
    const pad = openSignature.pads.se;
    if (pad.vide) return toast('Signez dans le cadre', true);
    const a = byId('agences', d.id);
    a.signature = pad.image();
    a.signataire = $('#se-nom').value.trim();
    save(); closeModal(); render(); toast(`Signature de ${a.nom} enregistrée`);
  },
  delSignatureEcole(d) {
    const a = byId('agences', d.id);
    if (!confirm(`Supprimer la signature enregistrée de ${a.nom} ?`)) return;
    delete a.signature; delete a.signataire;
    save(); closeModal(); render();
  },
  async tamponUpload(d, el) {
    const file = el.files[0];
    if (!file) return;
    try {
      const a = byId('agences', d.id);
      a.tampon = await chargerImageReduite(file);
      save(); render(); toast(`Tampon de ${a.nom} enregistré`);
    } catch (e) { toast('Image non reconnue : ' + e.message, true); }
  },
  delTampon(d) {
    const a = byId('agences', d.id);
    if (!confirm(`Retirer le tampon de ${a.nom} ?`)) return;
    delete a.tampon; save(); render();
  },
};
