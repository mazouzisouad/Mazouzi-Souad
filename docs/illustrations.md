# Illustrations des questions

Chaque question peut avoir un champ `img`. Le dessin est fait par `public/js/illustrations.js`.
Aperçu : `node scripts/apercu-illustrations.cjs fichier.json sortie.png` (fichier = tableau de `{ "titre": "...", "img": {...} }`),
ou sans argument pour la galerie de tous les panneaux.

## 1. Panneau seul
```json
{ "panneau": "AB4" }
{ "panneau": "B14:90" }                 // valeur affichée (vitesse, nom de ville…)
{ "panneaux": ["B14:70", "B33:70"] }    // plusieurs panneaux côte à côte
```
Codes disponibles (catalogue officiel, annexe de l'arrêté du 24 novembre 1967) :

| Famille | Codes |
|---|---|
| Danger | A1a (virage à droite), A1b (virage à gauche), A1c (succession de virages, le 1er à droite), A2b (ralentisseur), A3 (chaussée rétrécie), A4 (chaussée glissante), A7 (passage à niveau avec barrières), A8 (passage à niveau sans barrière), A13a (enfants), A13b (passage pour piétons), A14 (autres dangers), A15a1 (animaux domestiques), A17 (feux tricolores), A18 (circulation dans les deux sens), A21 (débouché de cyclistes), A24 (vent latéral) |
| Intersection, priorité | AB1 (priorité à droite), AB2 (priorité ponctuelle), AB3a (cédez le passage), AB4 (stop), AB6 (route prioritaire), AB7 (fin de route prioritaire), AB25 (carrefour à sens giratoire) |
| Interdiction | B0 (circulation interdite), B1 (sens interdit), B2a / B2b / B2c (interdiction de tourner à gauche / à droite / de faire demi-tour), B3 (interdiction de dépasser), B6a1 (stationnement interdit), B6d (arrêt et stationnement interdits), B9a (accès interdit aux piétons), B9b (accès interdit aux cycles), B14:n (limitation de vitesse), B15 (céder le passage à la circulation venant en sens inverse) |
| Obligation | B21-1 / B21-2 (obligation de tourner à droite / à gauche avant le panneau), B21a1 (contournement par la droite), B21b (direction obligatoire tout droit), B21c1 / B21c2 (obligation de tourner à droite / à gauche après le panneau), B22a (piste ou bande cyclable obligatoire), B22b (chemin obligatoire pour piétons), B25:n (vitesse minimale) |
| Fin, zones | B31 (fin de toutes les interdictions), B33:n (fin de limitation de vitesse), B34 (fin d'interdiction de dépasser), B30 (zone 30), B51 (fin de zone 30), B52 (zone de rencontre), B54 (aire piétonne) |
| Indication | C1a (parking), C4a:n (vitesse conseillée), C12 (sens unique), C13a (impasse), C18 (priorité par rapport à la circulation venant en sens inverse), C20a (passage pour piétons), C27 (surélévation de chaussée) |
| Agglomération | EB10:NOM (entrée), EB20:NOM (sortie) |

## 2. Feu tricolore
```json
{ "feu": "rouge" }     // rouge | orange | vert | orange_clignotant
```

## 3. Situation vue de dessus (intersection)
```json
{
  "scene": "plan",
  "route": "croix",                       // croix | T_droite | T_gauche | T_haut | giratoire
  "axe": "discontinue",                   // ligne médiane : discontinue | continue | aucune (ou "axes": {"S": "continue"})
  "marquages": { "S": ["stop", "pieton"] },  // par bras : stop | cedez | feu | pieton (passage piéton)
  "panneaux": [ { "code": "AB4", "bras": "S" } ],  // panneau à droite de l'arrivée de ce bras
  "feux": { "S": "rouge", "W": "vert" },
  "moi": { "bras": "S", "action": "gauche", "clignotant": "gauche", "recul": 20 },
  "autres": [
    { "type": "voiture", "bras": "E", "action": "tout_droit", "couleur": "rouge", "lettre": "A" },
    { "type": "pieton", "x": 205, "y": 160, "traverse": { "x": 120, "y": 160 } }
  ]
}
```
- **Bras** : `N` (haut), `S` (bas), `E` (droite), `W` (gauche). Un usager « bras S » **arrive par le bas** et roule vers le haut,
  sur la voie de droite (on circule à droite).
- **moi** : votre voiture, bleue, marquée « VOUS ». Elle arrive en général par le bas (`"bras": "S"`).
- **action** : `tout_droit`, `droite` ou `gauche`. Une flèche pointillée montre la trajectoire.
- **type** : `voiture`, `camion`, `bus`, `moto`, `velo`, `trottinette`, `secours` (gyrophares bleus), `pieton`.
- **recul** : recule le véhicule de n pixels sur son bras (pour en placer deux l'un derrière l'autre).
- **lettre** : affiche une lettre (A, B, C) sur le véhicule, pour les questions « Qui passe en premier ? ».
- **freins** : `true` allume les feux stop.
- Repères (dessin de 320 × 240) : centre du carrefour (160, 120), chaussée de 60 de large, trottoirs autour.
  Piéton sur le trottoir à droite de l'arrivée sud : x ≈ 205, y ≈ 160.
- **Giratoire** : anneau de rayon 72 autour de (160, 120). Un véhicule sur l'anneau se place avec `x`, `y`, `dir`
  (la circulation tourne dans le sens inverse des aiguilles d'une montre vu de dessus : à gauche de l'îlot on descend, `dir: "S"`).

## 4. Vue du conducteur
```json
{
  "scene": "vue",
  "virage": "droite",            // droite | gauche | absent (ligne droite)
  "ligne": "continue",           // continue | discontinue | aucune
  "meteo": "pluie",              // pluie | nuit | brouillard | neige | absent (beau temps)
  "ville": true,                 // immeubles à l'horizon
  "panneau": ["A1a"],            // 1 ou 2 panneaux au bord droit
  "feu": "rouge",                // feu au bord droit
  "vehicule_devant": "proche",   // proche | loin ; "freins": true allume ses feux stop
  "vehicule_face": true,         // véhicule qui arrive en face
  "cycliste": "droite",
  "pieton": "droite",            // droite | gauche | route ; "pieton_enfant": true ; "ballon": true
  "passage_pieton": true
}
```

## 5. Vos propres photos
```json
{ "photo": "/photos/rond-point-centre.jpg", "alt": "Rond-point, vue depuis le siège conducteur" }
```
Déposez la photo dans `public/photos/`. N'utilisez que des photos que vous avez prises vous-même (ou dont vous avez les droits),
sans personnes ni plaques d'immatriculation reconnaissables.
