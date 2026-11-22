// Contenu réservé à l'accès complet. Ce fichier reste sur le serveur : il n'est jamais
// servi tel quel au navigateur, seulement par /api/contenu aux élèves dont l'accès est actif.
//
// Les numéros sont la position de la question dans la liste Q de public/index.html, où chaque
// question payante est remplacée par un emplacement {t:'Thème', p:1}. Ne pas renuméroter :
// la progression des élèves est enregistrée par numéro de question.
// Format d'une question : { t: thème, q: question, o: [bonne réponse, autres réponses…], e: explication }

export const QUESTIONS_PREMIUM = {
  "4": {
    "t": "Priorités",
    "q": "Un piéton s’engage sur un passage protégé devant vous. Que devez-vous faire ?",
    "o": [
      "Lui céder le passage",
      "Klaxonner pour qu’il se dépêche",
      "Passer devant lui s’il marche lentement",
      "Accélérer pour passer avant lui"
    ],
    "e": "Le piéton engagé sur un passage protégé est prioritaire."
  },
  "5": {
    "t": "Priorités",
    "q": "Le feu passe à l’orange fixe alors que vous approchez. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez, sauf si l’arrêt est trop brusque pour être sûr",
      "Vous accélérez systématiquement",
      "Vous passez toujours, car l’orange est tolérée",
      "Vous freinez à fond dans tous les cas"
    ],
    "e": "L’orange fixe annonce le rouge : il faut s’arrêter, sauf si l’arrêt ne peut se faire dans de bonnes conditions de sécurité."
  },
  "6": {
    "t": "Priorités",
    "q": "Un véhicule d’intervention avec gyrophare bleu et sirène à deux tons arrive à un carrefour où vous avez le feu vert. Que faites-vous ?",
    "o": [
      "Vous lui cédez le passage sans mettre personne en danger",
      "Vous passez, car vous avez le feu vert",
      "Vous accélérez pour libérer le carrefour avant lui",
      "Vous klaxonnez pour le prévenir"
    ],
    "e": "Un véhicule prioritaire en intervention bénéficie de la priorité, même si le feu est vert pour vous. Cédez-lui le passage en restant prudent."
  },
  "7": {
    "t": "Priorités",
    "q": "Un véhicule a un gyrophare bleu et une sirène à trois tons. Que devez-vous faire ?",
    "o": [
      "Faciliter son passage, sans qu’il soit prioritaire aux intersections",
      "Lui céder la priorité à tous les carrefours, comme à un véhicule des pompiers",
      "L’ignorer, car il n’a aucun droit particulier",
      "Passer avant lui dans tous les cas"
    ],
    "e": "Avec une sirène à trois tons, le véhicule bénéficie de facilités de passage : vous l’aidez à passer, mais il doit respecter la signalisation et les priorités."
  },
  "12": {
    "t": "Vitesse et distances",
    "q": "La distance d’arrêt est égale à…",
    "o": [
      "la distance de réaction plus la distance de freinage",
      "la distance de freinage seulement",
      "la distance de réaction seulement",
      "la distance de sécurité"
    ],
    "e": "Pendant le temps de réaction, le véhicule roule encore avant même que le freinage commence."
  },
  "13": {
    "t": "Vitesse et distances",
    "q": "Sur chaussée mouillée, la distance de freinage…",
    "o": [
      "augmente nettement",
      "reste la même",
      "diminue légèrement",
      "diminue beaucoup"
    ],
    "e": "L’adhérence est moins bonne, il faut freiner plus tôt et rouler moins vite."
  },
  "14": {
    "t": "Vitesse et distances",
    "q": "Votre véhicule commence à aquaplaner. Que faites-vous ?",
    "o": [
      "Vous relâchez progressivement l’accélérateur et tenez fermement le volant",
      "Vous freinez très fort",
      "Vous donnez un coup de volant brusque",
      "Vous accélérez pour retrouver de l’adhérence"
    ],
    "e": "Évitez tout geste brusque : ralentissez progressivement jusqu’à ce que les pneus retrouvent le contact avec la route."
  },
  "15": {
    "t": "Vitesse et distances",
    "q": "Le brouillard réduit la visibilité à moins de 50 mètres. Quelle est la vitesse maximale sur tous types de route ?",
    "o": [
      "50 km/h",
      "30 km/h",
      "70 km/h",
      "80 km/h"
    ],
    "e": "Quand la visibilité est inférieure à 50 mètres, la vitesse est limitée à 50 km/h sur toutes les routes."
  },
  "16": {
    "t": "Vitesse et distances",
    "q": "Sur autoroute, quelle distance minimale respecter derrière le véhicule qui vous précède, avec les traits de la bande d’arrêt d’urgence ?",
    "o": [
      "Au moins deux traits",
      "Un seul trait",
      "Quatre traits en toutes circonstances",
      "Il n’y a pas de repère"
    ],
    "e": "Un trait correspond à un danger, deux traits au minimum de sécurité. Ce repère aide à garder environ 2 secondes ou plus d’écart."
  },
  "17": {
    "t": "Panneaux et feux",
    "q": "Un panneau triangulaire avec une bordure rouge indique…",
    "o": [
      "un danger",
      "une interdiction",
      "une obligation",
      "une indication de direction"
    ],
    "e": "Les panneaux triangulaires à bordure rouge avertissent d’un danger."
  },
  "18": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond avec une bordure rouge indique en général…",
    "o": [
      "une interdiction ou une restriction",
      "une obligation",
      "un danger",
      "un parking"
    ],
    "e": "Les panneaux ronds à bordure rouge interdisent ou limitent quelque chose."
  },
  "19": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond à fond bleu indique en général…",
    "o": [
      "une obligation",
      "une interdiction",
      "un danger",
      "une fin de limitation"
    ],
    "e": "Les panneaux ronds à fond bleu imposent une obligation."
  },
  "20": {
    "t": "Panneaux et feux",
    "q": "Que signifie une ligne continue au centre de la chaussée ?",
    "o": [
      "Il ne faut ni la franchir ni la chevaucher",
      "On peut la franchir pour doubler",
      "On peut la chevaucher si la route est libre",
      "Elle indique seulement un virage"
    ],
    "e": "La ligne continue interdit en principe de la franchir ou de la chevaucher. Une exception encadrée existe pour dépasser un cycliste."
  },
  "21": {
    "t": "Panneaux et feux",
    "q": "À un passage à niveau, les feux rouges clignotent. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez",
      "Vous passez vite avant le train",
      "Vous ralentissez et vous passez si la voie est libre",
      "Vous klaxonnez et vous passez"
    ],
    "e": "Les feux rouges clignotants imposent l’arrêt, même si aucun train n’est en vue."
  },
  "26": {
    "t": "Alcool, fatigue, santé",
    "q": "Lors d’un long trajet, il est recommandé de faire une pause…",
    "o": [
      "au moins toutes les 2 heures",
      "toutes les 6 heures",
      "seulement quand on s’endort",
      "une seule fois dans la journée"
    ],
    "e": "La fatigue réduit les réflexes avant même qu’on s’en aperçoive."
  },
  "27": {
    "t": "Alcool, fatigue, santé",
    "q": "Que provoque la fatigue sur votre temps de réaction ?",
    "o": [
      "Il augmente",
      "Il diminue",
      "Il ne change pas",
      "Il disparaît"
    ],
    "e": "En moyenne, il passe d’environ 1 seconde reposé à environ 2 secondes après 2 heures de conduite."
  },
  "28": {
    "t": "Alcool, fatigue, santé",
    "q": "Au feu rouge, pouvez-vous tenir votre téléphone en main ?",
    "o": [
      "Non, vous êtes toujours en circulation",
      "Oui, car vous êtes arrêté",
      "Oui, si le feu dure longtemps",
      "Oui, si vous ne téléphonez pas"
    ],
    "e": "Tenir un téléphone en main est interdit tant que vous êtes en circulation, même arrêté au feu."
  },
  "29": {
    "t": "Alcool, fatigue, santé",
    "q": "Quelle sanction encourt-on pour un téléphone tenu en main au volant ?",
    "o": [
      "135 € d’amende et le retrait de 3 points",
      "35 € d’amende sans retrait de points",
      "750 € et le retrait automatique du permis",
      "Un simple avertissement"
    ],
    "e": "C’est une contravention de 4e classe : amende forfaitaire de 135 € et retrait de 3 points."
  },
  "30": {
    "t": "Alcool, fatigue, santé",
    "q": "Avez-vous le droit de conduire avec des écouteurs ou un casque audio sur les oreilles ?",
    "o": [
      "Non, c’est interdit",
      "Oui, pour écouter de la musique",
      "Oui, avec un seul écouteur",
      "Oui, en dehors de la ville"
    ],
    "e": "Écouteurs, oreillettes et casques sont interdits au volant, avec la même sanction que le téléphone tenu en main."
  },
  "31": {
    "t": "Alcool, fatigue, santé",
    "q": "Que signifie un pictogramme rouge (niveau 3) sur une boîte de médicament ?",
    "o": [
      "Danger : ne pas conduire, et demander l’avis d’un médecin avant de reprendre le volant",
      "Soyez prudent : ne pas conduire sans avoir lu la notice",
      "Soyez très prudent : ne pas conduire sans l’avis d’un professionnel de santé",
      "Aucune restriction pour la conduite"
    ],
    "e": "Le rouge (niveau 3) indique un risque élevé : on ne conduit pas. Le jaune demande de la prudence, l’orange l’avis d’un professionnel de santé."
  },
  "32": {
    "t": "Alcool, fatigue, santé",
    "q": "Que faut-il faire avec un médicament portant un pictogramme orange (niveau 2) ?",
    "o": [
      "Ne pas conduire sans l’avis d’un professionnel de santé",
      "Conduire normalement",
      "Ne pas conduire du tout, quoi qu’en dise le médecin",
      "Seulement lire la notice avant de conduire"
    ],
    "e": "Le niveau 2 demande d’être très prudent et de prendre l’avis d’un médecin ou d’un pharmacien avant de conduire."
  },
  "37": {
    "t": "Véhicule et équipements",
    "q": "Dans quels cas peut-on utiliser les feux antibrouillard arrière ?",
    "o": [
      "Uniquement en cas de brouillard ou de chute de neige",
      "Dès qu’il pleut",
      "La nuit, en ville",
      "Toujours, pour être mieux vu"
    ],
    "e": "L’article R416-7 réserve les feux antibrouillard arrière au brouillard et à la neige. Par simple pluie, ils ne peuvent pas être utilisés."
  },
  "38": {
    "t": "Véhicule et équipements",
    "q": "Dans quels cas les feux antibrouillard avant peuvent-ils remplacer ou compléter les feux de croisement ?",
    "o": [
      "En cas de brouillard, de chute de neige ou de forte pluie",
      "Dès que la route est mouillée",
      "Uniquement la nuit sur autoroute",
      "Jamais, ils sont interdits en France"
    ],
    "e": "C’est ce que prévoit l’article R416-7 du Code de la route. On les éteint dès que la visibilité redevient normale."
  },
  "39": {
    "t": "Véhicule et équipements",
    "q": "Où doit se trouver le gilet de haute visibilité dans votre voiture ?",
    "o": [
      "Dans l’habitacle, à portée de main du conducteur",
      "Dans le coffre",
      "Sous le siège passager arrière",
      "Il n’est pas obligatoire"
    ],
    "e": "Il doit être rangé à portée de main, pour pouvoir l’enfiler sans sortir du véhicule."
  },
  "40": {
    "t": "Véhicule et équipements",
    "q": "Quels équipements doivent être à bord d’une voiture en circulation ?",
    "o": [
      "Un gilet de haute visibilité et un triangle de présignalisation",
      "Un extincteur et une lampe torche",
      "Une trousse de secours seulement",
      "Aucun équipement obligatoire"
    ],
    "e": "Depuis 2008, le gilet et le triangle sont obligatoires dans les voitures."
  },
  "41": {
    "t": "Véhicule et équipements",
    "q": "Votre voiture est immobilisée sur la route après un arrêt d’urgence. Que faites-vous avant de sortir ?",
    "o": [
      "Vous enfilez le gilet de haute visibilité",
      "Vous sortez vite puis vous cherchez le gilet",
      "Vous laissez le gilet dans le coffre",
      "Vous n’en avez pas besoin si les feux de détresse sont allumés"
    ],
    "e": "Le conducteur revêt le gilet avant de quitter son véhicule immobilisé sur la chaussée ou ses abords."
  },
  "42": {
    "t": "Véhicule et équipements",
    "q": "Pour une voiture neuve, quand doit avoir lieu le premier contrôle technique ?",
    "o": [
      "Dans les 6 mois précédant les 4 ans de la voiture",
      "Dans l’année qui suit la mise en circulation",
      "Au bout de 10 ans",
      "Il n’y en a pas pour une voiture neuve"
    ],
    "e": "Le premier contrôle a lieu dans les 6 mois précédant le 4e anniversaire de la mise en circulation, puis tous les 2 ans."
  },
  "43": {
    "t": "Véhicule et équipements",
    "q": "Après un contrôle technique défavorable, dans quel délai faut-il passer la contre-visite ?",
    "o": [
      "Dans les 2 mois",
      "Dans les 15 jours",
      "Dans les 6 mois",
      "Dans l’année"
    ],
    "e": "Pour une voiture particulière, la contre-visite doit être faite dans les 2 mois."
  },
  "44": {
    "t": "Circulation et stationnement",
    "q": "Sur autoroute, sur quelle voie roulez-vous normalement ?",
    "o": [
      "La voie la plus à droite, sauf pour dépasser",
      "La voie du milieu, pour être tranquille",
      "La voie la plus à gauche, pour aller plus vite",
      "Celle qui est la plus libre, sans règle"
    ],
    "e": "On revient à droite dès que le dépassement est terminé."
  },
  "45": {
    "t": "Circulation et stationnement",
    "q": "Dans quel cas est-il interdit de dépasser ?",
    "o": [
      "À l’approche d’un sommet de côte où la visibilité est insuffisante",
      "Sur une route droite et dégagée",
      "Sur une ligne discontinue",
      "Sur une route droite en rase campagne"
    ],
    "e": "On ne dépasse jamais sans voir suffisamment loin devant soi, notamment dans un virage ou au sommet d’une côte."
  },
  "46": {
    "t": "Circulation et stationnement",
    "q": "Quand vous dépassez un cycliste hors agglomération, quelle distance latérale devez-vous laisser ?",
    "o": [
      "Au moins 1,5 mètre",
      "Au moins 50 centimètres",
      "Au moins 3 mètres",
      "Aucune règle"
    ],
    "e": "Il faut laisser au moins 1 mètre en agglomération et 1,5 mètre hors agglomération."
  },
  "47": {
    "t": "Circulation et stationnement",
    "q": "En agglomération, quelle distance latérale minimale laissez-vous en dépassant un cycliste ?",
    "o": [
      "Au moins 1 mètre",
      "Au moins 50 centimètres",
      "Au moins 1,5 mètre",
      "Aucune règle"
    ],
    "e": "Le minimum est de 1 mètre en agglomération et de 1,5 mètre hors agglomération."
  },
  "48": {
    "t": "Circulation et stationnement",
    "q": "Peut-on stationner sur un passage piéton ?",
    "o": [
      "Non, et aussi à moins de 5 mètres avant",
      "Oui, si on reste dans la voiture",
      "Oui, pour moins de 5 minutes",
      "Oui, la nuit"
    ],
    "e": "Le stationnement est interdit sur le passage piéton et à moins de 5 mètres avant, pour garder la visibilité entre piétons et conducteurs."
  },
  "49": {
    "t": "Circulation et stationnement",
    "q": "Avant de changer de file, que devez-vous faire ?",
    "o": [
      "Mettre le clignotant, regarder dans les rétroviseurs et vérifier l’angle mort",
      "Mettre le clignotant seulement",
      "Regarder dans le rétroviseur intérieur seulement",
      "Klaxonner"
    ],
    "e": "L’angle mort ne se voit pas dans les rétroviseurs : il faut tourner la tête."
  },
  "50": {
    "t": "Permis et examen",
    "q": "Combien de points compte un permis probatoire au départ ?",
    "o": [
      "6 points",
      "12 points",
      "8 points",
      "10 points"
    ],
    "e": "Le capital augmente ensuite progressivement, jusqu’à 12 points au bout de 3 ans, ou 2 ans après une conduite accompagnée, sans infraction."
  },
  "51": {
    "t": "Permis et examen",
    "q": "Quelle est la durée de la période probatoire après un apprentissage classique ?",
    "o": [
      "3 ans",
      "1 an",
      "2 ans",
      "5 ans"
    ],
    "e": "Elle dure 3 ans, ou 2 ans après une conduite accompagnée."
  },
  "52": {
    "t": "Permis et examen",
    "q": "À partir de quel âge peut-on commencer la conduite accompagnée ?",
    "o": [
      "15 ans",
      "14 ans",
      "16 ans",
      "17 ans"
    ],
    "e": "L’apprentissage anticipé de la conduite est possible dès 15 ans."
  },
  "53": {
    "t": "Permis et examen",
    "q": "Combien de bonnes réponses faut-il pour réussir l’examen du code ?",
    "o": [
      "35 sur 40",
      "30 sur 40",
      "32 sur 40",
      "38 sur 40"
    ],
    "e": "L’examen compte 40 questions et il faut au moins 35 bonnes réponses, soit 5 erreurs maximum."
  },
  "54": {
    "t": "Permis et examen",
    "q": "Combien de temps le code reste-t-il valable pour passer l’épreuve pratique ?",
    "o": [
      "5 ans",
      "2 ans",
      "1 an",
      "10 ans"
    ],
    "e": "Une fois le code réussi, il reste valable 5 ans pour passer l’examen pratique."
  },
  "55": {
    "t": "Accident et secours",
    "q": "Vous arrivez sur un accident. Quelles sont les trois actions à mener, dans l’ordre ?",
    "o": [
      "Protéger, alerter, secourir",
      "Secourir, protéger, alerter",
      "Alerter, filmer, protéger",
      "Déplacer les victimes, alerter, partir"
    ],
    "e": "On sécurise d’abord les lieux pour éviter un suraccident, puis on appelle les secours et on aide les victimes."
  },
  "56": {
    "t": "Accident et secours",
    "q": "Quel est le numéro d’urgence européen, valable dans tous les pays de l’Union européenne ?",
    "o": [
      "112",
      "100",
      "911",
      "118"
    ],
    "e": "Le 112 est le numéro d’urgence européen."
  },
  "57": {
    "t": "Accident et secours",
    "q": "Quel est le numéro du SAMU en France ?",
    "o": [
      "15",
      "18",
      "17",
      "19"
    ],
    "e": "Le 15 est le numéro du SAMU, le 18 celui des pompiers et le 112 le numéro d’urgence européen."
  },
  "58": {
    "t": "Accident et secours",
    "q": "Un motard blessé porte son casque et respire normalement. Que faites-vous ?",
    "o": [
      "Vous ne retirez pas le casque et vous attendez les secours",
      "Vous retirez le casque tout de suite",
      "Vous relevez le motard pour l’asseoir",
      "Vous lui donnez à boire"
    ],
    "e": "Retirer le casque peut aggraver une blessure à la nuque. On ne le fait que si la victime ne respire plus."
  },
  "59": {
    "t": "Accident et secours",
    "q": "Un motard blessé porte son casque. Que pouvez-vous faire, si c’est possible, pour l’aider ?",
    "o": [
      "Ouvrir sa visière sans retirer le casque",
      "Retirer son casque",
      "Le tirer par les épaules pour le dégager",
      "Lui faire boire un peu d’eau"
    ],
    "e": "On ne retire pas le casque, mais on ouvre la visière si possible."
  },
  "60": {
    "t": "Accident et secours",
    "q": "Lorsque vous appelez les secours, que devez-vous indiquer en priorité ?",
    "o": [
      "Le lieu précis de l’accident",
      "Le nom de l’assureur",
      "La marque des véhicules",
      "Le nom des témoins"
    ],
    "e": "Sans le lieu exact, les secours ne peuvent pas arriver vite. Précisez aussi le nombre de victimes et leur état."
  },
  "61": {
    "t": "Accident et secours",
    "q": "Une victime d’accident vous demande à boire. Que faites-vous ?",
    "o": [
      "Vous ne lui donnez pas à boire",
      "Vous lui donnez un peu d’eau",
      "Vous lui donnez du café chaud",
      "Vous lui donnez à boire s’il est conscient"
    ],
    "e": "On ne donne rien à boire à un blessé : mieux vaut le rassurer et attendre les secours."
  },
  "62": {
    "t": "Accident et secours",
    "q": "Il n’y a aucun risque de feu ni d’explosion. Que faites-vous des victimes de l’accident ?",
    "o": [
      "Vous ne les déplacez pas",
      "Vous les déplacez sur le bas-côté",
      "Vous les faites asseoir",
      "Vous les faites marcher"
    ],
    "e": "La règle générale est de ne pas déplacer les blessés, sauf danger immédiat comme un incendie ou un risque d’explosion."
  }
};

// Points des fiches de cours payantes (titre et durée restent dans index.html)
export const FICHES_PREMIUM = {
  "f2": [
    "Sans panneau ni feu : priorité à droite.",
    "STOP : arrêt complet, même si la voie semble libre.",
    "Rond-point avec « cédez le passage » à l’entrée : on cède aux véhicules déjà engagés sur l’anneau.",
    "Piéton engagé sur un passage protégé : il est prioritaire.",
    "Véhicule de secours avec sirène et gyrophare : on facilite son passage en se rangeant, sans prendre de risque."
  ],
  "f3": [
    "En agglomération : 50 km/h, sauf indication contraire.",
    "Route à double sens sans séparateur central, hors agglomération : 80 km/h.",
    "Autoroute : 130 km/h par temps sec, 110 km/h par temps de pluie. Un jeune conducteur reste à 110 km/h.",
    "Visibilité inférieure à 50 mètres (brouillard) : 50 km/h sur toutes les routes."
  ],
  "f5": [
    "Autoroute : voie la plus à droite, sauf pour dépasser. On revient à droite dès le dépassement terminé.",
    "Dépasser est interdit quand la visibilité est insuffisante (virage, sommet de côte).",
    "Dépasser un cycliste : au moins 1 mètre en agglomération, 1,5 mètre hors agglomération.",
    "Le stationnement est interdit sur un passage piéton et à moins de 5 mètres avant.",
    "Changer de file : clignotant, rétroviseurs, puis coup d’œil dans l’angle mort."
  ],
  "f6": [
    "Conducteur confirmé : conduite interdite dès 0,5 g/L de sang (0,25 mg/L d’air expiré).",
    "Permis probatoire : 0,2 g/L de sang (0,10 mg/L d’air expiré), y compris en conduite accompagnée.",
    "Pour un jeune conducteur, un seul verre peut suffire à dépasser la limite : la règle sûre est de ne pas boire."
  ],
  "f7": [
    "Faites une pause au moins toutes les 2 heures. La fatigue augmente le temps de réaction.",
    "Téléphone tenu en main : interdit, même arrêté au feu. Sanction : 135 € et 3 points.",
    "Écouteurs, oreillettes et casque audio : interdits au volant.",
    "Pictogramme orange (niveau 2) sur un médicament : très prudent, avis d’un médecin ou d’un pharmacien avant de conduire.",
    "Pictogramme rouge (niveau 3) : on ne conduit pas, et on demande l’avis d’un médecin avant de reprendre le volant."
  ],
  "f8": [
    "Permis probatoire : 6 points au départ, jusqu’à 12 points en 3 ans (2 ans après une conduite accompagnée) sans infraction.",
    "La conduite accompagnée est possible dès 15 ans.",
    "Examen du code : 40 questions, 35 bonnes réponses minimum (5 erreurs maximum).",
    "Une fois le code réussi, il reste valable 5 ans pour passer l’examen pratique."
  ],
  "f9": [
    "Pneus : profondeur minimale des sculptures de 1,6 mm.",
    "Ceinture de sécurité obligatoire à toutes les places équipées.",
    "Enfant de moins de 10 ans : dispositif de retenue adapté à sa taille et à son poids, en principe à l’arrière.",
    "Feux antibrouillard arrière : brouillard ou chute de neige seulement. Avant : brouillard, neige ou forte pluie.",
    "Gilet de haute visibilité (à portée de main) et triangle obligatoires. On enfile le gilet avant de sortir du véhicule.",
    "Contrôle technique : le premier dans les 6 mois avant les 4 ans de la voiture, puis tous les 2 ans. Contre-visite sous 2 mois."
  ],
  "f10": [
    "Dans l’ordre : protéger, alerter, secourir.",
    "Numéros : 112 (urgence européen), 15 (SAMU), 18 (pompiers).",
    "Au téléphone, indiquez en priorité le lieu précis de l’accident, puis le nombre de victimes et leur état.",
    "Ne déplacez pas les blessés, sauf danger immédiat (incendie, risque d’explosion).",
    "Motard blessé : on ne retire pas le casque. On ouvre la visière si c’est possible.",
    "On ne donne rien à boire à un blessé."
  ]
};
