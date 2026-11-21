/* =====================================================================
   FICHE DE SUIVI — commentaires pédagogiques par élève
   Après une leçon : un avis en 1 clic (😊 / 😐 / 😟), les points travaillés
   (cases à cocher) et un commentaire libre. Historique sur la fiche élève,
   visible par la direction et les moniteurs.
   ===================================================================== */
'use strict';

const AVIS = {
  bien: { label: 'Bien', emoji: '😊', cls: 'ok' },
  moyen: { label: 'Moyen', emoji: '😐', cls: 'warn' },
  arevoir: { label: 'À revoir', emoji: '😟', cls: 'bad' },
};
const POINTS_TRAVAILLES = {
  plateau: ['Équipement / vérifications', 'Déplacement sans moteur', 'Maniabilité lente', 'Maniabilité rapide', 'Freinage', 'Évitement', 'Slalom', 'Huit'],
  circulation: ['Installation / départ', 'Regards / contrôles', 'Positionnement', 'Intersections / priorités', 'Insertion', 'Dépassement', 'Virages', 'Autonomie / itinéraire'],
};
const typeBase = (type) => (String(type || '').includes('plateau') ? 'plateau' : 'circulation');

function suiviDe(eleveId) {
  return (DB.suivi || []).filter((x) => x.eleveId === eleveId).sort((a, b) => (b.date + (b.creeLe || '')).localeCompare(a.date + (a.creeLe || '')));
}
function auteurActuel() {
  if (Cloud.user) return (Cloud.user.email || '').toLowerCase();
  return 'local';
}
function nomAuteur(x) {
  if (x.moniteurId && byId('moniteurs', x.moniteurId)) return moniteurNom(byId('moniteurs', x.moniteurId));
  return x.auteurNom || 'Direction';
}
const peutModifier = (x) => !Cloud.enabled || Cloud.role === 'admin' || x.auteur === auteurActuel();

// Formulaire (nouvel avis ou modification)
function formSuivi({ eleveId, seance, existant }) {
  const type = typeBase(existant?.type || seance?.type || 'circulation');
  const tags = new Set(existant?.points || []);
  return `
    <div class="suivi-form" data-eleve="${eleveId}" data-seance="${seance?.id || existant?.seanceId || ''}" data-id="${existant?.id || ''}" data-type="${type}">
      <div class="lbl" style="margin-top:0">Comment ça s'est passé ?</div>
      <div class="avis-choix">
        ${Object.entries(AVIS).map(([k, a]) => `<button class="avis-btn ${existant?.avis === k ? 'on' : ''}" data-action="suiviAvis" data-k="${k}">${a.emoji}<span>${a.label}</span></button>`).join('')}
      </div>
      <div class="row between" style="margin-top:10px">
        <div class="lbl" style="margin:0">Points travaillés</div>
        <div class="seg small-seg">
          <button class="${type === 'plateau' ? 'on' : ''}" data-action="suiviType" data-t="plateau">Plateau</button>
          <button class="${type === 'circulation' ? 'on' : ''}" data-action="suiviType" data-t="circulation">Circulation</button>
        </div>
      </div>
      <div class="tags-choix">
        ${POINTS_TRAVAILLES[type].map((p) => `<button class="tag-btn ${tags.has(p) ? 'on' : ''}" data-action="suiviTag" data-p="${esc(p)}">${esc(p)}</button>`).join('')}
      </div>
      <textarea class="suivi-texte" placeholder="Commentaire (facultatif) : ce qui va bien, ce qu'il faut retravailler, objectif de la prochaine leçon…">${esc(existant?.texte || '')}</textarea>
      <div class="row" style="justify-content:flex-end;margin-top:8px">
        ${existant ? '<button class="btn" data-action="suiviAnnulerEdit">Annuler</button>' : ''}
        <button class="btn primary" data-action="suiviSave">${existant ? 'Enregistrer' : '＋ Ajouter au suivi'}</button>
      </div>
    </div>`;
}

function historiqueSuivi(eleveId) {
  const list = suiviDe(eleveId);
  if (!list.length) return '<p class="muted small">Aucun commentaire pour l\'instant.</p>';
  return `<div class="suivi-liste">${list.map((x) => {
    const a = AVIS[x.avis];
    return `<div class="suivi-item ${a ? a.cls : ''}">
      <div class="row between">
        <div><strong>${a ? a.emoji + ' ' + a.label : '📝 Note'}</strong>
          <span class="muted small">· ${fmtDate(x.date)} · ${esc(nomAuteur(x))}${x.type ? ' · ' + (x.type === 'plateau' ? 'Plateau' : 'Circulation') : ''}</span></div>
        ${peutModifier(x) ? `<div class="row" style="gap:2px"><button class="btn small ghost" data-action="suiviEdit" data-id="${x.id}" title="Modifier">✏️</button><button class="btn small ghost" data-action="suiviDelete" data-id="${x.id}" title="Supprimer">🗑️</button></div>` : ''}
      </div>
      ${x.points?.length ? `<div class="suivi-tags">${x.points.map((p) => `<span class="badge">${esc(p)}</span>`).join('')}</div>` : ''}
      ${x.texte ? `<div class="suivi-texte-lu">${esc(x.texte).replace(/\n/g, '<br>')}</div>` : ''}
    </div>`;
  }).join('')}</div>`;
}

// Onglet « Suivi » de la fiche élève (direction)
function viewSuiviEleve(eid) {
  return `<div class="card" style="background:#f8fafc;margin-bottom:12px">${formSuivi({ eleveId: eid })}</div>
    <div id="suivi-historique">${historiqueSuivi(eid)}</div>`;
}

// Fenêtre de suivi (depuis une séance du planning, pour la direction et les moniteurs)
let suiviRetour = null;
function openSuivi(eleveId, seanceId, retour) {
  suiviRetour = retour || null;
  const e = byId('eleves', eleveId);
  const s = seanceId ? byId('seances', seanceId) : null;
  const dejaFait = s ? (DB.suivi || []).find((x) => x.seanceId === s.id && x.eleveId === eleveId && x.auteur === auteurActuel()) : null;
  openModal({
    title: `📋 Suivi — ${esc(eleveNom(e))}`,
    wide: true,
    body: `
      ${s ? `<p class="muted small">Leçon du ${fmtDate(s.date)} à ${s.debut} · ${TYPES[s.type].label}</p>` : ''}
      ${formSuivi({ eleveId, seance: s, existant: dejaFait })}
      <hr>
      <h3>Historique</h3>
      <div id="suivi-historique">${historiqueSuivi(eleveId)}</div>`,
    foot: `${suiviRetour ? '<div class="left"><button class="btn" data-action="suiviRetour">◀ Retour à la leçon</button></div>' : ''}<button class="btn" data-action="closeModal">Fermer</button>`,
  });
}

function rafraichirSuivi(eleveId) {
  // Fenêtre de suivi ouverte : on la réaffiche ; sinon la fiche élève
  if ($('#modal-root').innerHTML && $('#modal-root .suivi-form')) {
    const f = $('#modal-root .suivi-form');
    openSuivi(eleveId, f.dataset.seance || null, suiviRetour);
  } else render();
}

const SUIVI_ACTIONS = {
  openSuivi(d, el, ev) {
    ev.stopPropagation();
    const retour = d.seance ? () => { const s = byId('seances', d.seance); if (s) (estMoniteur() ? openSeanceMoniteur(s) : openSeance(s)); } : null;
    openSuivi(d.eleve, d.seance || null, retour);
  },
  suiviRetour() { const r = suiviRetour; suiviRetour = null; if (r) r(); else closeModal(); },
  suiviAvis(d, el) {
    const box = el.closest('.suivi-form');
    $$('.avis-btn', box).forEach((b) => b.classList.toggle('on', b === el && !el.classList.contains('on')));
  },
  suiviTag(d, el) { el.classList.toggle('on'); },
  suiviType(d, el) {
    const box = el.closest('.suivi-form');
    box.dataset.type = d.t;
    $$('.small-seg button', box).forEach((b) => b.classList.toggle('on', b === el));
    const coches = new Set($$('.tag-btn.on', box).map((b) => b.dataset.p));
    $('.tags-choix', box).innerHTML = POINTS_TRAVAILLES[d.t].map((p) => `<button class="tag-btn ${coches.has(p) ? 'on' : ''}" data-action="suiviTag" data-p="${esc(p)}">${esc(p)}</button>`).join('');
  },
  suiviSave(d, el) {
    const box = el.closest('.suivi-form');
    const avis = $('.avis-btn.on', box)?.dataset.k || '';
    const points = $$('.tag-btn.on', box).map((b) => b.dataset.p);
    const texte = $('.suivi-texte', box).value.trim();
    if (!avis && !points.length && !texte) return toast('Choisissez un avis, un point travaillé ou écrivez un commentaire', true);
    const eleveId = box.dataset.eleve;
    const s = box.dataset.seance ? byId('seances', box.dataset.seance) : null;
    DB.suivi = DB.suivi || [];
    let x = box.dataset.id ? DB.suivi.find((y) => y.id === box.dataset.id) : null;
    if (!x) {
      x = {
        id: uid(), eleveId, seanceId: s?.id || '', date: s?.date || todayISO(),
        auteur: auteurActuel(), creeLe: new Date().toISOString(),
        moniteurId: estMoniteur() ? Cloud.monId : (s?.moniteurId && !Cloud.enabled ? s.moniteurId : ''),
        auteurNom: estMoniteur() ? '' : 'Direction',
      };
      DB.suivi.push(x);
    }
    Object.assign(x, { avis, points, texte, type: box.dataset.type });
    save();
    toast('Ajouté au suivi ✅');
    rafraichirSuivi(eleveId);
  },
  suiviEdit(d) {
    const x = DB.suivi.find((y) => y.id === d.id);
    const box = $('.suivi-form');
    if (!x || !box) return;
    box.outerHTML = formSuivi({ eleveId: x.eleveId, existant: x });
    $('.suivi-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  suiviAnnulerEdit(d, el) { rafraichirSuivi(el.closest('.suivi-form').dataset.eleve); },
  suiviDelete(d) {
    const x = DB.suivi.find((y) => y.id === d.id);
    if (!x || !confirm('Supprimer ce commentaire de suivi ?')) return;
    DB.suivi = DB.suivi.filter((y) => y.id !== d.id);
    save();
    rafraichirSuivi(x.eleveId);
  },
};
