/* ==========================================================================
   illustrations.js : panneaux et situations dessinés pour les questions.
   Panneaux dessinés d'après le catalogue officiel des signaux routiers
   (annexe de l'arrêté du 24 novembre 1967, version consolidée 2025, Cerema).

   Une question peut porter un champ « img » :
     { panneau: 'AB4' }                           un panneau seul
     { panneaux: ['B14:50', 'B33:50'] }           plusieurs panneaux côte à côte
     { feu: 'rouge' | 'orange' | 'vert' | 'orange_clignotant' }
     { scene: 'plan', route: 'croix'|'T_droite'|'T_gauche'|'T_haut'|'giratoire', ... }  vue de dessus
     { scene: 'vue', ... }                        vue du conducteur
     { photo: '/photos/xxx.jpg', alt: '…' }       photo fournie (vos propres photos)
   Voir docs/illustrations.md pour le détail.
   ========================================================================== */
(function () {
  'use strict';
  var ROUGE = '#d8202f', BLEU = '#1b5fc1', JAUNE = '#f6c400', NOIR = '#1a1a1a', BLANC = '#ffffff', VERT = '#2e9d4a';

  /* ---------------- formes de base (viewBox 0 0 100 100) ---------------- */
  function triangle(pic) {
    return '<path d="M50 9 L93 84 L7 84 Z" fill="' + BLANC + '" stroke="' + ROUGE + '" stroke-width="8" stroke-linejoin="round"/>' + (pic || '');
  }
  function triangleInverse(pic) {
    return '<path d="M7 14 L93 14 L50 90 Z" fill="' + BLANC + '" stroke="' + ROUGE + '" stroke-width="8" stroke-linejoin="round"/>' + (pic || '');
  }
  function rondRouge(pic, fond) {
    return '<circle cx="50" cy="50" r="40" fill="' + (fond || BLANC) + '" stroke="' + ROUGE + '" stroke-width="10"/>' + (pic || '');
  }
  function rondBleu(pic) {
    return '<circle cx="50" cy="50" r="45" fill="' + BLEU + '" stroke="' + BLANC + '" stroke-width="2"/>' + (pic || '');
  }
  function rondFin(pic) { // fin d'interdiction : fond blanc, liseré noir, barre noire
    return '<circle cx="50" cy="50" r="44" fill="' + BLANC + '" stroke="' + NOIR + '" stroke-width="2.5"/>' + (pic || '') +
      '<path d="M20 80 L80 20" stroke="' + NOIR + '" stroke-width="9" stroke-linecap="round"/>';
  }
  function carreBleu(pic) {
    return '<rect x="8" y="8" width="84" height="84" rx="6" fill="' + BLEU + '" stroke="' + BLANC + '" stroke-width="3"/>' + (pic || '');
  }
  function texte(t, x, y, taille, couleur, graisse) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="' + (graisse || 900) +
      '" font-size="' + taille + '" fill="' + (couleur || NOIR) + '">' + t + '</text>';
  }

  /* ---------------- petits pictogrammes ---------------- */
  function voitureFace(x, y, s, c) { // voiture vue de l'arrière/face (B3, B34)
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-11 0 L-9 -8 Q-8 -11 -5 -11 L5 -11 Q8 -11 9 -8 L11 0 L11 7 L-11 7 Z" fill="' + c + '"/>' +
      '<rect x="-7" y="-9" width="14" height="6" rx="1.500" fill="' + BLANC + '"/>' +
      '<rect x="-11" y="7" width="5" height="4" fill="' + c + '"/><rect x="6" y="7" width="5" height="4" fill="' + c + '"/></g>';
  }
  function pieton(x, y, s, c) {
    c = c || NOIR;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c + '" stroke="' + c + '" stroke-linecap="round" stroke-width="3.500">' +
      '<circle cx="1" cy="-15" r="4" stroke="none"/><path d="M0 -9 L-1 3 M-1 3 L-6 15 M-1 3 L5 15 M0 -7 L-7 0 M0 -7 L7 -1" fill="none"/></g>';
  }
  function enfant(x, y, s, c) { return pieton(x, y, s * 0.78, c); }
  function velo(x, y, s, c) {
    c = c || NOIR;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="none" stroke="' + c + '" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="-11" cy="6" r="7"/><circle cx="11" cy="6" r="7"/><path d="M-11 6 L-3 -6 L7 -6 L11 6 M-3 -6 L1 6 L7 -6 M-5 -9 L-1 -9 M7 -6 L6 -11 L10 -11"/></g>';
  }
  function cycliste(x, y, s, c) {
    c = c || NOIR;
    return velo(x, y + 5 * s, s, c) + '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c + '" stroke="' + c + '" stroke-width="3" stroke-linecap="round">' +
      '<circle cx="3" cy="-17" r="3.600" stroke="none"/><path d="M2 -12 L-2 -2 L3 6 M1 -10 L8 -4" fill="none"/></g>';
  }
  function feuPicto(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-6" y="-16" width="12" height="32" rx="3" fill="' + NOIR + '"/>' +
      '<circle cx="0" cy="-9" r="3.600" fill="' + ROUGE + '"/><circle cx="0" cy="0" r="3.600" fill="' + JAUNE + '"/><circle cx="0" cy="9" r="3.600" fill="' + VERT + '"/></g>';
  }
  function fleche(x1, y1, x2, y2, c, ep, pointe) { // flèche droite avec pointe
    var a = Math.atan2(y2 - y1, x2 - x1), p = pointe || ep * 2.4;
    var bx = x2 - Math.cos(a) * p, by = y2 - Math.sin(a) * p;
    var lx = bx + Math.cos(a + Math.PI / 2) * p * 0.75, ly = by + Math.sin(a + Math.PI / 2) * p * 0.75;
    var rx = bx + Math.cos(a - Math.PI / 2) * p * 0.75, ry = by + Math.sin(a - Math.PI / 2) * p * 0.75;
    return '<path d="M' + x1 + ' ' + y1 + ' L' + bx + ' ' + by + '" stroke="' + c + '" stroke-width="' + ep + '" stroke-linecap="butt"/>' +
      '<path d="M' + x2 + ' ' + y2 + ' L' + lx + ' ' + ly + ' L' + rx + ' ' + ry + ' Z" fill="' + c + '"/>';
  }
  function bus(x, y, s, c) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-17" y="-8" width="34" height="14" rx="2.500" fill="' + c + '"/>' +
      '<rect x="-14" y="-5" width="6" height="5" fill="' + BLANC + '"/><rect x="-6" y="-5" width="6" height="5" fill="' + BLANC + '"/><rect x="2" y="-5" width="6" height="5" fill="' + BLANC + '"/><rect x="10" y="-5" width="5" height="5" fill="' + BLANC + '"/>' +
      '<circle cx="-10" cy="7" r="3" fill="' + c + '"/><circle cx="10" cy="7" r="3" fill="' + c + '"/></g>';
  }

  /* ---------------- catalogue des panneaux ---------------- */
  var P = {
    // Danger (A)
    A1a: function () { return triangle('<path d="M42 74 L42 58 Q42 46 54 46 L60 46" fill="none" stroke="' + NOIR + '" stroke-width="7"/><path d="M58 38 L68 46 L58 54 Z" fill="' + NOIR + '"/>'); },
    A1b: function () { return triangle('<path d="M58 74 L58 58 Q58 46 46 46 L40 46" fill="none" stroke="' + NOIR + '" stroke-width="7"/><path d="M42 38 L32 46 L42 54 Z" fill="' + NOIR + '"/>'); },
    A1c: function () { return triangle('<path d="M44 76 L44 66 Q44 58 52 58 Q58 58 58 50 L58 46" fill="none" stroke="' + NOIR + '" stroke-width="6.500"/><path d="M51 46 L58 35 L65 46 Z" fill="' + NOIR + '"/>'); },
    A2b: function () { return triangle('<path d="M24 72 Q50 50 76 72 Z" fill="' + NOIR + '"/>'); },
    A3: function () { return triangle('<path d="M36 76 Q36 62 44 56 L44 44 M64 76 Q64 62 56 56 L56 44" fill="none" stroke="' + NOIR + '" stroke-width="5"/>'); },
    A4: function () { return triangle(voitureFace(50, 54, 1.05, NOIR) + '<path d="M36 70 q4 -4 0 -8 M44 74 q4 -5 0 -10 M58 74 q-4 -5 0 -10 M66 70 q-4 -4 0 -8" fill="none" stroke="' + NOIR + '" stroke-width="2.500" stroke-linecap="round"/>'); },
    A13a: function () { return triangle(enfant(42, 61, 0.95) + enfant(58, 63, 0.82)); },
    A13b: function () { return triangle('<path d="M30 76 L70 76" stroke="' + NOIR + '" stroke-width="2"/><path d="M33 77 L37 70 M42 77 L46 70 M51 77 L55 70 M60 77 L64 70" stroke="' + NOIR + '" stroke-width="3.500"/>' + pieton(51, 56, 0.85)); },
    A14: function () { return triangle('<path d="M50 38 L50 62" stroke="' + NOIR + '" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="73" r="4.800" fill="' + NOIR + '"/>'); },
    A15a1: function () { return triangle('<g fill="' + NOIR + '"><rect x="34" y="55" width="28" height="12" rx="4"/><rect x="60" y="51" width="9" height="8" rx="2"/><rect x="36" y="65" width="3.500" height="10"/><rect x="43" y="65" width="3.500" height="10"/><rect x="52" y="65" width="3.500" height="10"/><rect x="58" y="65" width="3.500" height="10"/><path d="M33 57 L28 66" stroke="' + NOIR + '" stroke-width="2"/></g>'); },
    A17: function () { return triangle(feuPicto(50, 60, 0.95)); },
    A18: function () { return triangle(fleche(42, 44, 42, 76, NOIR, 6, 10) + fleche(58, 76, 58, 44, NOIR, 6, 10)); },
    A21: function () { return triangle(cycliste(50, 58, 0.92)); },
    A24: function () { return triangle('<path d="M34 76 L34 46" stroke="' + NOIR + '" stroke-width="3"/><path d="M34 48 L66 52 L66 60 L34 62 Z" fill="' + ROUGE + '" stroke="' + NOIR + '" stroke-width="1.500"/><path d="M45 49.500 L45 61.500 M56 50.500 L56 60.500" stroke="' + BLANC + '" stroke-width="3"/>'); },
    A7: function () { return triangle('<g fill="' + NOIR + '"><rect x="30" y="64" width="40" height="4"/><rect x="30" y="72" width="40" height="4"/><rect x="32" y="56" width="4" height="22"/><rect x="40" y="56" width="4" height="22"/><rect x="48" y="56" width="4" height="22"/><rect x="56" y="56" width="4" height="22"/><rect x="64" y="56" width="4" height="22"/></g>'); },
    A8: function () { return triangle('<g fill="' + NOIR + '"><rect x="30" y="60" width="34" height="12" rx="2"/><rect x="56" y="52" width="12" height="20"/><rect x="36" y="52" width="6" height="8"/><path d="M36 50 q3 -8 9 -6 q5 -6 10 0" fill="none" stroke="' + NOIR + '" stroke-width="2.500"/><circle cx="36" cy="75" r="3.500"/><circle cx="47" cy="75" r="3.500"/><circle cx="61" cy="75" r="3.500"/><rect x="26" y="78" width="48" height="2.500"/></g>'); },
    // Intersection et priorité (AB)
    AB1: function () { return triangle('<path d="M38 50 L62 74 M62 50 L38 74" stroke="' + NOIR + '" stroke-width="7" stroke-linecap="butt"/>'); },
    AB2: function () { return triangle('<path d="M50 34 L57 46 L55 46 L55 78 L45 78 L45 46 L43 46 Z" fill="' + NOIR + '"/><path d="M32 60 L68 60" stroke="' + NOIR + '" stroke-width="3.500"/>'); },
    AB3a: function () { return triangleInverse(); },
    AB4: function () {
      return '<path d="M30 6 L70 6 L94 30 L94 70 L70 94 L30 94 L6 70 L6 30 Z" fill="' + ROUGE + '" stroke="' + BLANC + '" stroke-width="3"/>' +
        texte('STOP', 50, 60, 27, BLANC);
    },
    AB6: function () { return '<path d="M50 4 L96 50 L50 96 L4 50 Z" fill="' + BLANC + '" stroke="#8a8a8a" stroke-width="1.500"/><path d="M50 18 L82 50 L50 82 L18 50 Z" fill="' + JAUNE + '"/>'; },
    AB7: function () { return P.AB6() + '<path d="M26 74 L74 26" stroke="' + NOIR + '" stroke-width="7"/>'; },
    AB25: function () {
      var a = '';
      for (var i = 0; i < 3; i++) {
        a += '<g transform="rotate(' + (i * 120) + ' 50 60)"><path d="M41 52 A12 12 0 0 1 58 50" fill="none" stroke="' + NOIR + '" stroke-width="4"/><path d="M56 44 L63 52 L53 54 Z" fill="' + NOIR + '"/></g>';
      }
      return triangle('<g transform="translate(100 0) scale(-1 1)">' + a + '</g>');
    },
    // Interdiction (B)
    B0: function () { return rondRouge(); },
    B1: function () { return '<circle cx="50" cy="50" r="45" fill="' + ROUGE + '" stroke="' + BLANC + '" stroke-width="2"/><rect x="20" y="42" width="60" height="16" fill="' + BLANC + '"/>'; },
    B2a: function () { return rondRouge('<path d="M60 76 L60 50 Q60 38 48 38 L40 38" fill="none" stroke="' + NOIR + '" stroke-width="7"/><path d="M42 29 L30 38 L42 47 Z" fill="' + NOIR + '"/><path d="M22 22 L78 78" stroke="' + ROUGE + '" stroke-width="8"/>'); },
    B2b: function () { return rondRouge('<path d="M40 76 L40 50 Q40 38 52 38 L60 38" fill="none" stroke="' + NOIR + '" stroke-width="7"/><path d="M58 29 L70 38 L58 47 Z" fill="' + NOIR + '"/><path d="M22 22 L78 78" stroke="' + ROUGE + '" stroke-width="8"/>'); },
    B2c: function () { return rondRouge('<path d="M58 76 L58 44 Q58 32 48 32 Q38 32 38 44 L38 56" fill="none" stroke="' + NOIR + '" stroke-width="6.500"/><path d="M30 54 L38 66 L46 54 Z" fill="' + NOIR + '"/><path d="M22 22 L78 78" stroke="' + ROUGE + '" stroke-width="8"/>'); },
    B3: function () { return rondRouge(voitureFace(37, 50, 1.05, ROUGE) + voitureFace(63, 50, 1.05, NOIR)); },
    B6a1: function () { return '<circle cx="50" cy="50" r="40" fill="' + BLEU + '" stroke="' + ROUGE + '" stroke-width="10"/><path d="M24 24 L76 76" stroke="' + ROUGE + '" stroke-width="9"/>'; },
    B6d: function () { return '<circle cx="50" cy="50" r="40" fill="' + BLEU + '" stroke="' + ROUGE + '" stroke-width="10"/><path d="M24 24 L76 76 M76 24 L24 76" stroke="' + ROUGE + '" stroke-width="9"/>'; },
    B9a: function () { return rondRouge(pieton(50, 52, 1.2)); },
    B9b: function () { return rondRouge(velo(50, 52, 1.05)); },
    B14: function (v) { return rondRouge(texte(v || '50', 50, 63, (String(v || '50').length > 2 ? 30 : 38))); },
    B15: function () { return rondRouge(fleche(40, 30, 40, 72, NOIR, 7, 11) + fleche(60, 72, 60, 30, ROUGE, 7, 11)); },
    B21_1: function () { return rondBleu(fleche(24, 50, 78, 50, BLANC, 10, 16)); },
    B21_2: function () { return rondBleu(fleche(76, 50, 22, 50, BLANC, 10, 16)); },
    B21a1: function () { return rondBleu(fleche(30, 30, 70, 70, BLANC, 10, 16)); },
    B21b: function () { return rondBleu(fleche(50, 78, 50, 22, BLANC, 10, 16)); },
    B21c1: function () { return rondBleu('<path d="M42 80 L42 52 Q42 40 54 40 L58 40" fill="none" stroke="' + BLANC + '" stroke-width="10"/><path d="M56 27 L74 40 L56 53 Z" fill="' + BLANC + '"/>'); },
    B21c2: function () { return rondBleu('<path d="M58 80 L58 52 Q58 40 46 40 L42 40" fill="none" stroke="' + BLANC + '" stroke-width="10"/><path d="M44 27 L26 40 L44 53 Z" fill="' + BLANC + '"/>'); },
    B22a: function () { return rondBleu(velo(50, 52, 1.35, BLANC)); },
    B22b: function () { return rondBleu(pieton(44, 52, 1.25, BLANC) + enfant(62, 58, 0.95, BLANC)); },
    B25: function (v) { return rondBleu(texte(v || '30', 50, 63, 38, BLANC)); },
    B30: function () { // zone 30
      return '<rect x="14" y="4" width="72" height="92" rx="5" fill="' + BLANC + '" stroke="#c9c9c9" stroke-width="1.500"/>' + texte('ZONE', 50, 24, 15, NOIR, 900) +
        '<g transform="translate(50 60) scale(0.62) translate(-50 -50)">' + rondRouge(texte('30', 50, 63, 38)) + '</g>';
    },
    B31: function () { return rondFin(); },
    B33: function (v) { return rondFin('<g opacity=".9">' + texte(v || '50', 50, 63, 38, NOIR) + '</g>'); },
    B34: function () { return rondFin(voitureFace(37, 48, 1, NOIR) + voitureFace(63, 48, 1, NOIR)); },
    B51: function () {
      return '<rect x="14" y="4" width="72" height="92" rx="5" fill="' + BLANC + '" stroke="#c9c9c9" stroke-width="1.500"/>' + texte('FIN DE ZONE', 50, 22, 10, NOIR, 900) +
        '<g transform="translate(50 60) scale(0.62) translate(-50 -50)">' + '<circle cx="50" cy="50" r="40" fill="' + BLANC + '" stroke="#8a8a8a" stroke-width="10"/>' + texte('30', 50, 63, 38, '#555') + '</g>' +
        '<path d="M18 92 L82 26" stroke="' + NOIR + '" stroke-width="7"/>';
    },
    B52: function () { // zone de rencontre
      return '<rect x="6" y="6" width="88" height="88" rx="5" fill="' + BLEU + '" stroke="' + BLANC + '" stroke-width="3"/>' + pieton(28, 58, 1.15, BLANC) +
        voitureFace(68, 28, 0.95, BLANC) + cycliste(66, 55, 0.62, BLANC) +
        '<circle cx="74" cy="76" r="11" fill="' + BLANC + '" stroke="' + ROUGE + '" stroke-width="3"/>' + texte('20', 74, 80.500, 11, NOIR);
    },
    B54: function () { return '<rect x="6" y="6" width="88" height="88" rx="5" fill="' + BLEU + '" stroke="' + BLANC + '" stroke-width="3"/>' + pieton(42, 54, 1.5, BLANC) + enfant(64, 62, 1.15, BLANC); },
    // Indication (C)
    C1a: function () { return carreBleu(texte('P', 50, 72, 62, BLANC)); },
    C4a: function (v) { return carreBleu(texte(v || '70', 50, 66, 40, BLANC)); },
    C12: function () { return carreBleu(fleche(50, 82, 50, 18, BLANC, 16, 26)); },
    C13a: function () { return carreBleu('<rect x="44" y="40" width="12" height="44" fill="' + BLANC + '"/><rect x="26" y="20" width="48" height="16" fill="' + ROUGE + '"/>'); },
    C18: function () { return carreBleu(fleche(38, 22, 38, 78, ROUGE, 8, 13) + fleche(62, 78, 62, 22, BLANC, 8, 13)); },
    C20a: function () {
      return carreBleu('<path d="M50 16 L86 80 L14 80 Z" fill="' + BLANC + '"/><path d="M28 76 L72 76" stroke="' + NOIR + '" stroke-width="1.500"/><path d="M30 77 L34 70 M39 77 L43 70 M48 77 L52 70 M57 77 L61 70 M66 77 L69 71" stroke="' + NOIR + '" stroke-width="3"/>' + pieton(50, 54, 0.85));
    },
    C27: function () { return carreBleu('<path d="M50 18 L84 80 L16 80 Z" fill="' + BLANC + '"/><path d="M34 80 Q50 54 66 80 Z" fill="' + NOIR + '"/>'); },
    // Agglomération (EB10 : entrée, EB20 : sortie)
    EB10: function (nom) {
      nom = nom || 'VILLENEUVE';
      return '<rect x="3" y="24" width="94" height="52" rx="4" fill="' + BLANC + '" stroke="' + ROUGE + '" stroke-width="5"/>' + texte(nom, 50, 56, nom.length > 10 ? 10 : 12, NOIR, 900);
    },
    EB20: function (nom) { return P.EB10(nom) + '<path d="M8 72 L92 28" stroke="' + ROUGE + '" stroke-width="5"/>'; },
  };
  var ALIAS = { 'B21-1': 'B21_1', 'B21-2': 'B21_2' };

  function panneauInterne(code) { // « B14:50 » → panneau B14 avec la valeur 50
    var p = String(code).split(':'), c = ALIAS[p[0]] || p[0];
    if (!P[c]) return null;
    return P[c](p[1]);
  }
  function panneau(code, taille) {
    var interne = panneauInterne(code);
    if (interne === null) return '';
    var t = taille || 140;
    return '<svg class="illus-panneau" viewBox="0 0 100 100" width="' + t + '" height="' + t + '" role="img" aria-label="Panneau ' + code + '">' + interne + '</svg>';
  }

  /* ---------------- feu tricolore ---------------- */
  function feu(etat, taille) {
    var t = taille || 120, allume = { rouge: 0, orange: 1, orange_clignotant: 1, vert: 2 }[etat];
    var cou = [ROUGE, '#f39c12', VERT], eteint = '#3a3f4a', l = '';
    for (var i = 0; i < 3; i++) {
      l += '<circle cx="30" cy="' + (22 + i * 28) + '" r="11" fill="' + (i === allume ? cou[i] : eteint) + '"' + (i === allume && etat === 'orange_clignotant' ? ' class="illus-clignote"' : '') + '/>';
      if (i === allume) l += '<circle cx="30" cy="' + (22 + i * 28) + '" r="16" fill="' + cou[i] + '" opacity=".25"/>';
    }
    return '<svg class="illus-feu" viewBox="0 0 60 112" width="' + Math.round(t * 0.54) + '" height="' + t + '" role="img" aria-label="Feu ' + etat.replace('_', ' ') + '">' +
      '<rect x="12" y="4" width="36" height="92" rx="8" fill="' + NOIR + '"/>' + l + '<rect x="27" y="96" width="6" height="16" fill="#555"/></svg>';
  }

  /* ---------------- scène vue de dessus ---------------- */
  var W = 320, H = 240, CX = 160, CY = 120, L = 30; // largeur d'une voie
  var COULEURS = { moi: '#2f6fd6', rouge: '#d93a2f', jaune: '#e8b500', vert: '#3a9a4a', gris: '#8a93a5', noir: '#2b2f38', blanc: '#f2f2f2', orange: '#f08a24' };
  var DIRS = { N: -90, E: 0, S: 90, W: 180 }; // angle de déplacement (S : vers le bas)
  // point d'arrivée de chaque bras : on circule à droite
  function depart(bras, recul, voie) {
    recul = recul || 0;
    var dec = L / 2 + (voie === 'gauche' ? -L : 0);
    if (bras === 'S') return { x: CX + dec, y: 196 + recul, dir: 'N' };
    if (bras === 'N') return { x: CX - dec, y: 44 - recul, dir: 'S' };
    if (bras === 'E') return { x: 276 + recul, y: CY - dec, dir: 'W' };
    return { x: 44 - recul, y: CY + dec, dir: 'E' };
  }
  var TOURNE = { // bras d'arrivée → bras de sortie pour chaque action
    S: { tout_droit: 'N', droite: 'E', gauche: 'W' }, N: { tout_droit: 'S', droite: 'W', gauche: 'E' },
    E: { tout_droit: 'W', droite: 'N', gauche: 'S' }, W: { tout_droit: 'E', droite: 'S', gauche: 'N' }
  };
  function sortie(bras) { // point de sortie (voie de droite en s'éloignant)
    if (bras === 'N') return { x: CX + L / 2, y: 12 };
    if (bras === 'S') return { x: CX - L / 2, y: 228 };
    if (bras === 'E') return { x: 308, y: CY + L / 2 };
    return { x: 12, y: CY - L / 2 };
  }
  function vehicule(type, x, y, dir, couleur, opts) {
    opts = opts || {};
    var a = DIRS[dir] + 90, c = couleur, g = '';
    if (type === 'pieton') {
      return '<g transform="translate(' + x + ' ' + y + ')"><circle r="7" fill="' + (c || '#6a4bd0') + '" stroke="#fff" stroke-width="2"/><circle r="3" fill="#ffe0c2"/></g>';
    }
    if (type === 'velo' || type === 'trottinette') {
      g = '<rect x="-2.500" y="-12" width="5" height="24" rx="2" fill="' + NOIR + '"/><circle cx="0" cy="' + (type === 'velo' ? 0 : -6) + '" r="5" fill="' + (c || '#e8b500') + '" stroke="#fff" stroke-width="1.500"/>';
    } else if (type === 'moto') {
      g = '<rect x="-4" y="-14" width="8" height="28" rx="4" fill="' + NOIR + '"/><circle cx="0" cy="-1" r="5.500" fill="' + (c || '#d93a2f') + '" stroke="#fff" stroke-width="1.500"/>';
    } else {
      var lg = { voiture: 36, secours: 38, camion: 58, bus: 64 }[type] || 36, la = type === 'voiture' || type === 'secours' ? 20 : 24;
      g = '<rect x="' + (-la / 2) + '" y="' + (-lg / 2) + '" width="' + la + '" height="' + lg + '" rx="5" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="1"/>' +
        '<rect x="' + (-la / 2 + 3) + '" y="' + (-lg / 2 + 6) + '" width="' + (la - 6) + '" height="7" rx="2" fill="#cfe4ff"/>';
      if (type === 'voiture' || type === 'secours') g += '<rect x="' + (-la / 2 + 3) + '" y="' + (lg / 2 - 9) + '" width="' + (la - 6) + '" height="5" rx="2" fill="#cfe4ff"/>';
      if (type === 'bus') g += '<rect x="-9" y="-20" width="18" height="36" rx="2" fill="rgba(255,255,255,.25)"/>';
      if (type === 'secours') g += '<rect x="-6" y="-3" width="12" height="5" rx="1" fill="#2f6fd6"/><circle cx="-4" cy="-0.500" r="3" fill="#5aa0ff" class="illus-clignote"/><circle cx="4" cy="-0.500" r="3" fill="#5aa0ff" class="illus-clignote"/>';
      if (opts.clignotant) {
        var cx = opts.clignotant === 'droite' ? la / 2 - 1 : -la / 2 + 1;
        g += '<circle cx="' + cx + '" cy="' + (-lg / 2 + 3) + '" r="3.200" fill="#ffa726" class="illus-clignote"/><circle cx="' + cx + '" cy="' + (lg / 2 - 3) + '" r="3.200" fill="#ffa726" class="illus-clignote"/>';
      }
      if (opts.freins) g += '<rect x="' + (-la / 2) + '" y="' + (lg / 2 - 2) + '" width="5" height="3" fill="#ff1a1a"/><rect x="' + (la / 2 - 5) + '" y="' + (lg / 2 - 2) + '" width="5" height="3" fill="#ff1a1a"/>';
    }
    var label = opts.moi ? '<g transform="rotate(' + (-a) + ')"><rect x="-17" y="-8" width="34" height="16" rx="8" fill="#fff" stroke="' + COULEURS.moi + '" stroke-width="2"/>' + texte('VOUS', 0, 4, 10, COULEURS.moi) + '</g>' : '';
    if (opts.lettre) label = '<g transform="rotate(' + (-a) + ')"><circle r="9" fill="#fff" stroke="#333" stroke-width="1.500"/>' + texte(opts.lettre, 0, 4, 11, '#333') + '</g>';
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' + g + label + '</g>';
  }
  function cheminAction(bras, action, x0, y0) {
    var b = TOURNE[bras][action], s = sortie(b), p = depart(bras);
    var pts = [x0 !== undefined ? [x0, y0] : [p.x, p.y]];
    var ctrl = action === 'tout_droit' ? null : [bras === 'S' || bras === 'N' ? pts[0][0] : s.x, bras === 'S' || bras === 'N' ? s.y : pts[0][1]];
    var d = 'M' + pts[0][0] + ' ' + pts[0][1] + (ctrl ? ' Q' + ctrl[0] + ' ' + ctrl[1] + ' ' + s.x + ' ' + s.y : ' L' + s.x + ' ' + s.y);
    return d;
  }
  function flecheChemin(d, couleur) {
    var id = 'm' + Math.random().toString(36).slice(2, 8);
    return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="' + couleur + '"/></marker></defs>' +
      '<path d="' + d + '" fill="none" stroke="' + couleur + '" stroke-width="4" stroke-dasharray="7 5" marker-end="url(#' + id + ')" opacity=".9"/>';
  }
  function brasPresents(route) {
    return { croix: ['N', 'E', 'S', 'W'], T_droite: ['N', 'E', 'S'], T_gauche: ['N', 'W', 'S'], T_haut: ['E', 'W', 'N'], giratoire: ['N', 'E', 'S', 'W'] }[route] || ['N', 'E', 'S', 'W'];
  }
  function routePlan(s) {
    var route = s.route || 'croix', bras = brasPresents(route), o = '';
    var gris = '#5b6473';
    o += '<rect width="' + W + '" height="' + H + '" fill="#9fcf8a"/>';
    // trottoirs
    function rectBras(b, couleur, marge) {
      var m = marge || 0;
      if (b === 'N') return '<rect x="' + (CX - L - m) + '" y="0" width="' + (2 * (L + m)) + '" height="' + (CY + L + m) + '" fill="' + couleur + '"/>';
      if (b === 'S') return '<rect x="' + (CX - L - m) + '" y="' + (CY - L - m) + '" width="' + (2 * (L + m)) + '" height="' + (H - CY + L + m) + '" fill="' + couleur + '"/>';
      if (b === 'E') return '<rect x="' + (CX - L - m) + '" y="' + (CY - L - m) + '" width="' + (W - CX + L + m) + '" height="' + (2 * (L + m)) + '" fill="' + couleur + '"/>';
      return '<rect x="0" y="' + (CY - L - m) + '" width="' + (CX + L + m) + '" height="' + (2 * (L + m)) + '" fill="' + couleur + '"/>';
    }
    bras.forEach(function (b) { o += rectBras(b, '#d9d4cc', 8); });
    if (route === 'giratoire') o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (2 * L + 12 + 8) + '" fill="#d9d4cc"/>';
    bras.forEach(function (b) { o += rectBras(b, gris); });
    if (route === 'giratoire') {
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (2 * L + 12) + '" fill="' + gris + '"/><circle cx="' + CX + '" cy="' + CY + '" r="' + (L - 2) + '" fill="#7fbf6a" stroke="#e8e8e8" stroke-width="4"/>';
    }
    // marquages de l'axe
    var axe = s.axe || 'discontinue';
    bras.forEach(function (b) {
      var x1, y1, x2, y2, bord = route === 'giratoire' ? 2 * L + 12 : L;
      if (b === 'N') { x1 = x2 = CX; y1 = 0; y2 = CY - bord; }
      if (b === 'S') { x1 = x2 = CX; y1 = CY + bord; y2 = H; }
      if (b === 'E') { y1 = y2 = CY; x1 = CX + bord; x2 = W; }
      if (b === 'W') { y1 = y2 = CY; x1 = 0; x2 = CX - bord; }
      var t = (s.axes && s.axes[b]) || axe;
      if (t !== 'aucune') o += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff" stroke-width="3"' + (t === 'continue' ? '' : ' stroke-dasharray="12 10"') + '/>';
    });
    // lignes d'arrêt / cédez / passages piétons
    var mq = s.marquages || {};
    Object.keys(mq).forEach(function (b) {
      var t = mq[b], bord0 = route === 'giratoire' ? 2 * L + 12 : L;
      var lignes = [].concat(t), avecPassage = lignes.indexOf('pieton') >= 0;
      lignes.forEach(function (t) {
        var bord = (t !== 'pieton' && avecPassage) ? bord0 + 32 : bord0;
        if (t === 'pieton') {
          for (var i = 0; i < 6; i++) {
            var k = -L + 3 + i * 10.500;
            if (b === 'S') o += '<rect x="' + (CX + k) + '" y="' + (CY + bord + 6) + '" width="6" height="22" fill="#fff"/>';
            if (b === 'N') o += '<rect x="' + (CX + k) + '" y="' + (CY - bord - 28) + '" width="6" height="22" fill="#fff"/>';
            if (b === 'E') o += '<rect x="' + (CX + bord + 6) + '" y="' + (CY + k) + '" width="22" height="6" fill="#fff"/>';
            if (b === 'W') o += '<rect x="' + (CX - bord - 28) + '" y="' + (CY + k) + '" width="22" height="6" fill="#fff"/>';
          }
        } else {
          var pointille = t === 'cedez' ? ' stroke-dasharray="7 5"' : '';
          var ep = t === 'stop' ? 6 : (t === 'feu' ? 3 : 5);
          if (t === 'feu') pointille = ' stroke-dasharray="5 4"';
          if (b === 'S') o += '<line x1="' + CX + '" y1="' + (CY + bord + 2) + '" x2="' + (CX + L) + '" y2="' + (CY + bord + 2) + '" stroke="#fff" stroke-width="' + ep + '"' + pointille + '/>';
          if (b === 'N') o += '<line x1="' + (CX - L) + '" y1="' + (CY - bord - 2) + '" x2="' + CX + '" y2="' + (CY - bord - 2) + '" stroke="#fff" stroke-width="' + ep + '"' + pointille + '/>';
          if (b === 'E') o += '<line x1="' + (CX + bord + 2) + '" y1="' + (CY - L) + '" x2="' + (CX + bord + 2) + '" y2="' + CY + '" stroke="#fff" stroke-width="' + ep + '"' + pointille + '/>';
          if (b === 'W') o += '<line x1="' + (CX - bord - 2) + '" y1="' + CY + '" x2="' + (CX - bord - 2) + '" y2="' + (CY + L) + '" stroke="#fff" stroke-width="' + ep + '"' + pointille + '/>';
        }
      });
    });
    return o;
  }
  function posBordDroit(b) { // emplacement d'un panneau ou d'un feu, à droite de l'arrivée
    var r = 2 * L + 4;
    if (b === 'S') return { x: CX + L + 22, y: CY + r + 6 };
    if (b === 'N') return { x: CX - L - 22, y: CY - r - 6 };
    if (b === 'E') return { x: CX + r + 6, y: CY - L - 22 };
    return { x: CX - r - 6, y: CY + L + 22 };
  }
  function scenePlan(s) {
    var o = routePlan(s);
    // panneaux et feux au bord de la route
    (s.panneaux || []).forEach(function (p) {
      var pos = posBordDroit(p.bras), t = 30;
      o += '<g transform="translate(' + (pos.x - t / 2) + ' ' + (pos.y - t / 2) + ')"><svg width="' + t + '" height="' + t + '" viewBox="0 0 100 100">' + (panneauInterne(p.code) || '') + '</svg></g>';
    });
    Object.keys(s.feux || {}).forEach(function (b) {
      var pos = posBordDroit(b), e = s.feux[b], c = { rouge: ROUGE, orange: '#f39c12', orange_clignotant: '#f39c12', vert: VERT }[e];
      o += '<g transform="translate(' + pos.x + ' ' + pos.y + ')"><rect x="-6" y="-15" width="12" height="30" rx="3" fill="' + NOIR + '" stroke="#fff" stroke-width="1"/>' +
        ['rouge', 'orange', 'vert'].map(function (k, i) { return '<circle cx="0" cy="' + (-9 + i * 9) + '" r="3.300" fill="' + (e.indexOf(k) === 0 ? c : '#444') + '"' + (e === 'orange_clignotant' && k === 'orange' ? ' class="illus-clignote"' : '') + '/>'; }).join('') + '</g>';
    });
    // usagers
    var usagers = (s.autres || []).slice();
    if (s.moi) usagers.push(Object.assign({ type: 'voiture', moi: true }, s.moi));
    usagers.forEach(function (u) {
      if (u.type === 'pieton') {
        var px = u.x, py = u.y;
        if (px === undefined) { var bd = posBordDroit(u.bras || 'S'); px = bd.x - 4; py = bd.y + 10; }
        o += vehicule('pieton', px, py, 'N', u.couleur);
        if (u.traverse) {
          var cible = u.traverse === true ? null : u.traverse;
          if (cible) o += flecheChemin('M' + px + ' ' + py + ' L' + cible.x + ' ' + cible.y, '#6a4bd0');
        }
        return;
      }
      var p = depart(u.bras || 'S', u.recul || 0, u.voie);
      var x = u.x !== undefined ? u.x : p.x, y = u.y !== undefined ? u.y : p.y, dir = u.dir || p.dir;
      if (u.action && u.bras) o += flecheChemin(cheminAction(u.bras, u.action, x, y), u.moi ? COULEURS.moi : '#555');
      var c = u.moi ? COULEURS.moi : (COULEURS[u.couleur] || u.couleur || (u.type === 'secours' ? '#f2f2f2' : COULEURS.rouge));
      o += vehicule(u.type || 'voiture', x, y, dir, c, { moi: u.moi, clignotant: u.clignotant, freins: u.freins, lettre: u.lettre });
    });
    return o;
  }

  /* ---------------- scène vue du conducteur ---------------- */
  function sceneVue(s) {
    var nuit = s.meteo === 'nuit', o = '';
    var ciel = nuit ? ['#0b1430', '#1c2a55'] : (s.meteo === 'pluie' || s.meteo === 'brouillard' ? ['#9aa6b5', '#c7ced6'] : (s.meteo === 'neige' ? ['#c9d3de', '#e8edf2'] : ['#5f9ee8', '#b9dbf7']));
    var id = 'c' + Math.random().toString(36).slice(2, 7);
    o += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + ciel[0] + '"/><stop offset="1" stop-color="' + ciel[1] + '"/></linearGradient></defs>';
    o += '<rect width="320" height="240" fill="url(#' + id + ')"/>';
    var sol = nuit ? '#1d2b1f' : (s.meteo === 'neige' ? '#eef2f5' : '#86b86f');
    o += '<rect y="100" width="320" height="140" fill="' + sol + '"/>';
    if (!nuit && !s.ville) o += '<path d="M0 100 Q60 80 120 96 T240 92 T320 98 L320 100 L0 100 Z" fill="' + (s.meteo === 'neige' ? '#dfe6ec' : '#6aa25a') + '"/>';
    if (s.ville) {
      var imm = '';
      [[0, 46, 54], [50, 30, 40], [92, 58, 46], [205, 40, 50], [252, 62, 36], [282, 38, 50]].forEach(function (b) {
        imm += '<rect x="' + b[0] + '" y="' + (100 - b[1]) + '" width="' + b[2] + '" height="' + b[1] + '" fill="' + (nuit ? '#2a3350' : '#c9bfae') + '"/>';
      });
      o += imm;
    }
    // route en perspective (virage éventuel)
    var dx = s.virage === 'droite' ? 46 : s.virage === 'gauche' ? -46 : 0;
    var route = nuit ? '#2a2e36' : (s.meteo === 'pluie' ? '#4c535f' : '#666e7b');
    var hg = 152 + dx, hd = 168 + dx;
    // bords en courbe : droits sans virage, incurvés vers le virage sinon (t : 0 en bas, 1 à l'horizon)
    function bordX(x0, x1, t) { return x0 + (x1 - x0) * t - dx * 1.1 * t * (1 - t); }
    function yDe(t) { return 240 - 140 * t; }
    var gauche = [], droite = [], axe = [];
    for (var q = 0; q <= 20; q++) {
      var tp = 1 - Math.pow(1 - q / 20, 1.6);
      gauche.push([bordX(8, hg, tp), yDe(tp)]); droite.push([bordX(312, hd, tp), yDe(tp)]); axe.push([bordX(160, 160 + dx, tp), yDe(tp)]);
    }
    var poly = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '); };
    o += '<path d="' + poly(gauche) + ' ' + poly(droite.slice().reverse()).replace('M', 'L') + ' Z" fill="' + route + '"/>';
    o += '<path d="' + poly(gauche) + '" fill="none" stroke="#e9e9e9" stroke-width="2.500" opacity=".85"/><path d="' + poly(droite) + '" fill="none" stroke="#e9e9e9" stroke-width="2.500" opacity=".85"/>';
    var ligne = s.ligne || 'discontinue';
    if (ligne === 'continue') o += '<path d="' + poly(axe) + '" fill="none" stroke="#fff" stroke-width="4"/>';
    if (ligne === 'discontinue') {
      for (var i = 0; i < 20; i += 3) o += '<path d="' + poly(axe.slice(i, i + 2)) + '" fill="none" stroke="#fff" stroke-width="' + (4.5 * (1 - i / 26)) + '"/>';
    }
    if (s.passage_pieton) {
      for (var k = 0; k < 8; k++) o += '<path d="M' + (60 + k * 26) + ' 176 L' + (72 + k * 26) + ' 176 L' + (75 + k * 25.500) + ' 164 L' + (66 + k * 25.500) + ' 164 Z" fill="#fff" opacity=".95"/>';
    }
    // véhicule devant
    if (s.vehicule_devant) {
      var proche = s.vehicule_devant === 'proche', sc = proche ? 1.6 : 0.85, vx = 186 + dx * (proche ? 0.2 : 0.6), vy = proche ? 172 : 128;
      var c = s.couleur_devant || '#c0392b';
      o += '<g transform="translate(' + vx + ' ' + vy + ') scale(' + sc + ')"><path d="M-20 0 L-17 -14 Q-16 -19 -10 -19 L10 -19 Q16 -19 17 -14 L20 0 L20 10 L-20 10 Z" fill="' + c + '"/>' +
        '<rect x="-13" y="-16" width="26" height="9" rx="2" fill="#2a3442"/><rect x="-19" y="1" width="8" height="4" rx="1" fill="' + (s.freins ? '#ff2a2a' : '#7a1d1d') + '"/><rect x="11" y="1" width="8" height="4" rx="1" fill="' + (s.freins ? '#ff2a2a' : '#7a1d1d') + '"/>' +
        (s.freins ? '<circle cx="-15" cy="3" r="7" fill="#ff2a2a" opacity=".3"/><circle cx="15" cy="3" r="7" fill="#ff2a2a" opacity=".3"/>' : '') +
        '<rect x="-7" y="3" width="14" height="5" fill="#f2f2f2"/><rect x="-20" y="10" width="8" height="4" fill="#222"/><rect x="12" y="10" width="8" height="4" fill="#222"/></g>';
    }
    if (s.vehicule_face) { // véhicule venant en sens inverse
      o += '<g transform="translate(' + (128 + dx * 0.5) + ' 124) scale(0.8)"><path d="M-20 0 L-17 -14 Q-16 -19 -10 -19 L10 -19 Q16 -19 17 -14 L20 0 L20 10 L-20 10 Z" fill="#3d78d8"/><rect x="-13" y="-16" width="26" height="9" rx="2" fill="#9cc3ef"/>' +
        '<circle cx="-14" cy="3" r="3.500" fill="#fff8c4"/><circle cx="14" cy="3" r="3.500" fill="#fff8c4"/>' + (nuit ? '<circle cx="-14" cy="3" r="9" fill="#fff8c4" opacity=".35"/><circle cx="14" cy="3" r="9" fill="#fff8c4" opacity=".35"/>' : '') + '</g>';
    }
    if (s.cycliste) o += '<g transform="translate(' + (s.cycliste === 'gauche' ? 70 : 222) + ' 176) scale(1.7)">' + cycliste(0, 0, 0.9, '#1f2a44') + '</g>';
    if (s.pieton) {
      var px = s.pieton === 'route' ? 118 : (s.pieton === 'gauche' ? 54 : 212);
      o += '<g transform="translate(' + px + ' 160) scale(1.9)">' + pieton(0, 0, 1, '#6a4bd0') + '</g>';
      if (s.pieton_enfant) o += '<g transform="translate(' + (px + 22) + ' 168) scale(1.4)">' + enfant(0, 0, 1, '#e8b500') + '</g>';
    }
    if (s.ballon) o += '<circle cx="176" cy="186" r="9" fill="#e8b500" stroke="#b37a00" stroke-width="2"/>';
    // panneau(x) au bord droit
    var pans = [].concat(s.panneau || []), y0 = 116;
    pans.forEach(function (code, i) {
      var t = 46, x = 252 + (s.virage === 'droite' ? 18 : 0), y = y0 + i * (t + 4);
      o += '<rect x="' + (x + t / 2 - 2) + '" y="' + (y + t / 2) + '" width="4" height="' + (150 - y) + '" fill="#8a8f9c"/>';
      o += '<g transform="translate(' + x + ' ' + y + ')"><svg width="' + t + '" height="' + t + '" viewBox="0 0 100 100">' + (panneauInterne(code) || '') + '</svg></g>';
    });
    if (s.feu) {
      var fx = 262, fy = 92;
      o += '<rect x="' + (fx + 9) + '" y="' + (fy + 52) + '" width="4" height="60" fill="#5a5f6c"/>';
      o += '<g transform="translate(' + fx + ' ' + fy + ')">' + feu(s.feu, 60).replace(/^<svg[^>]*>/, '<svg width="22" height="56" viewBox="0 0 60 112">') + '</g>';
    }
    // météo
    if (s.meteo === 'pluie') {
      var pl = '';
      for (var r = 0; r < 70; r++) { var rx = (r * 47) % 320, ry = (r * 83) % 240; pl += '<path d="M' + rx + ' ' + ry + ' l-5 12" stroke="#dde8f5" stroke-width="1.300" opacity=".75"/>'; }
      o += pl + '<rect width="320" height="240" fill="#8fa2b8" opacity=".15"/>';
    }
    if (s.meteo === 'neige') {
      var ne = '';
      for (var n = 0; n < 70; n++) ne += '<circle cx="' + ((n * 53) % 320) + '" cy="' + ((n * 37) % 240) + '" r="' + (1.200 + (n % 3)) + '" fill="#fff"/>';
      o += ne;
    }
    if (s.meteo === 'brouillard') o += '<rect width="320" height="240" fill="#e7ebef" opacity=".72"/>';
    if (nuit) o += '<path d="M40 240 L150 128 L170 128 L280 240 Z" fill="#fff6c8" opacity="' + (s.feux_route ? 0.3 : 0.16) + '"/>';
    // tableau de bord (capot)
    o += '<path d="M0 240 L0 226 Q160 206 320 226 L320 240 Z" fill="' + (nuit ? '#0e1016' : '#26303d') + '"/>';
    return o;
  }

  /* ---------------- rendu générique ---------------- */
  function rendre(img, classe) {
    if (!img) return '';
    var cls = 'illus' + (classe ? ' ' + classe : '');
    if (img.scene) {
      var corps = img.scene === 'vue' ? sceneVue(img) : scenePlan(img);
      return '<figure class="' + cls + ' illus-scene"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (img.alt || 'Illustration de la situation') + '">' + corps + '</svg></figure>';
    }
    if (img.photo) return '<figure class="' + cls + ' illus-photo"><img src="' + img.photo + '" alt="' + (img.alt || 'Photo de la situation') + '" loading="lazy"></figure>';
    if (img.panneau) return '<figure class="' + cls + ' illus-seul">' + panneau(img.panneau, img.taille || 130) + '</figure>';
    if (img.panneaux) return '<figure class="' + cls + ' illus-seul">' + img.panneaux.map(function (c) { return panneau(c, img.taille || 104); }).join('') + '</figure>';
    if (img.feu) return '<figure class="' + cls + ' illus-seul">' + feu(img.feu, 120) + '</figure>';
    return '';
  }

  var api = { rendre: rendre, panneau: panneau, feu: feu, codes: Object.keys(P).map(function (k) { return k.replace('_', '-'); }) };
  if (typeof window !== 'undefined') window.Illus = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
