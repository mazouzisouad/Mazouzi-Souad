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
  },
  "63": {
    "t": "Priorités",
    "q": "Vous circulez sur une route signalée par un panneau carré posé sur la pointe, jaune bordé de blanc. Que signifie-t-il ?",
    "o": [
      "Vous êtes prioritaire aux intersections jusqu’à la fin de cette signalisation",
      "Vous êtes prioritaire à la prochaine intersection seulement",
      "Vous devez céder le passage à droite à chaque intersection",
      "Vous entrez dans une zone où le stationnement est interdit"
    ],
    "e": "Ce panneau indique une route à caractère prioritaire : vous gardez la priorité aux intersections tant que le panneau de fin n’apparaît pas."
  },
  "64": {
    "t": "Priorités",
    "q": "Le même panneau jaune en losange apparaît, mais barré d’un trait noir. Qu’est-ce que cela signifie ?",
    "o": [
      "La route n’est plus prioritaire : aux prochaines intersections, vous suivez la signalisation ou la priorité à droite",
      "Vous êtes prioritaire jusqu’à la fin de l’agglomération",
      "La route devient une autoroute",
      "Le stationnement est de nouveau autorisé"
    ],
    "e": "Le losange barré annonce la fin de la route à caractère prioritaire. Les règles habituelles s’appliquent ensuite à chaque intersection."
  },
  "65": {
    "t": "Priorités",
    "q": "Un panneau triangulaire à bordure rouge montre une croix noire. Que vous annonce-t-il ?",
    "o": [
      "Une intersection où s’applique la priorité à droite",
      "Une intersection où vous êtes prioritaire",
      "Un passage à niveau sans barrière",
      "Une route barrée"
    ],
    "e": "Ce panneau de danger annonce une intersection où vous devez céder le passage aux véhicules venant de votre droite."
  },
  "66": {
    "t": "Priorités",
    "q": "Un panneau triangulaire à bordure rouge montre un gros trait vertical noir coupé par un trait horizontal plus fin. Que signifie-t-il ?",
    "o": [
      "Vous êtes prioritaire à la prochaine intersection seulement",
      "Vous êtes prioritaire jusqu’à la fin de la route",
      "Vous devez céder le passage à droite",
      "Vous approchez d’un carrefour à sens giratoire"
    ],
    "e": "Ce panneau annonce une intersection où les usagers de la route croisée doivent vous céder le passage. Il ne vaut que pour cette intersection."
  },
  "67": {
    "t": "Priorités",
    "q": "Vous sortez d’un parking de supermarché pour rejoindre la route. Qui est prioritaire ?",
    "o": [
      "Les véhicules qui circulent sur la route",
      "Vous, si la route vient de votre gauche",
      "Vous, car vous venez de la droite",
      "Le véhicule le plus rapide"
    ],
    "e": "En sortant d’un parking, d’un chemin de terre ou d’un lieu non ouvert à la circulation publique, vous cédez le passage à tous les véhicules de la route."
  },
  "68": {
    "t": "Priorités",
    "q": "Vous sortez de votre garage en traversant le trottoir. Un piéton marche sur ce trottoir. Que faites-vous ?",
    "o": [
      "Vous le laissez passer avant de traverser le trottoir",
      "Vous avancez, car il doit vous laisser sortir",
      "Vous klaxonnez pour qu’il s’écarte",
      "Vous passez s’il est encore à quelques mètres"
    ],
    "e": "Le trottoir appartient aux piétons : en sortant d’une propriété, vous leur cédez le passage."
  },
  "69": {
    "t": "Priorités",
    "q": "À une intersection sans panneau ni feu, vous roulez sur une grande avenue. Une voiture arrive d’une petite rue sur votre droite. Qui passe en premier ?",
    "o": [
      "La voiture qui vient de la petite rue à droite",
      "Vous, car l’avenue est plus large",
      "Vous, car vous roulez plus vite",
      "Celui qui klaxonne le premier"
    ],
    "e": "Sans signalisation, la priorité à droite s’applique quelle que soit la taille des routes."
  },
  "70": {
    "t": "Priorités",
    "q": "Vous arrivez à un carrefour à sens giratoire sans aucun panneau ni marquage à l’entrée. Qui est prioritaire ?",
    "o": [
      "Les véhicules qui entrent sur l’anneau, car ils viennent de la droite",
      "Les véhicules déjà engagés sur l’anneau",
      "Les véhicules les plus gros",
      "Celui qui arrive en premier sur l’anneau"
    ],
    "e": "Sans « cédez le passage » à l’entrée, c’est la priorité à droite qui s’applique : ceux qui entrent sont prioritaires sur ceux qui circulent sur l’anneau."
  },
  "71": {
    "t": "Priorités",
    "q": "Au feu vert, vous tournez à gauche. Une voiture arrive en face et va tout droit. Que faites-vous ?",
    "o": [
      "Vous la laissez passer avant de tourner",
      "Vous tournez, car vous avez le feu vert",
      "Vous tournez, car elle doit vous céder le passage",
      "Vous klaxonnez pour qu’elle s’arrête"
    ],
    "e": "Pour tourner à gauche, vous cédez le passage aux véhicules qui arrivent en sens inverse, même si votre feu est vert."
  },
  "72": {
    "t": "Priorités",
    "q": "Au feu vert, vous tournez à droite. Des piétons traversent la rue dans laquelle vous vous engagez. Que faites-vous ?",
    "o": [
      "Vous les laissez traverser avant de passer",
      "Vous passez, car votre feu est vert",
      "Vous passez entre deux piétons",
      "Vous klaxonnez pour qu’ils se dépêchent"
    ],
    "e": "En tournant, vous cédez le passage aux piétons qui traversent la chaussée où vous vous engagez."
  },
  "73": {
    "t": "Priorités",
    "q": "Un piéton attend au bord du trottoir, devant un passage piéton, et montre clairement qu’il veut traverser. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez pour le laisser traverser",
      "Vous passez, car il n’est pas encore sur la chaussée",
      "Vous lui faites signe d’attendre",
      "Vous accélérez pour passer avant lui"
    ],
    "e": "Selon l’article R415-11 du Code de la route, vous devez céder le passage au piéton qui s’engage ou qui manifeste clairement l’intention de traverser."
  },
  "74": {
    "t": "Priorités",
    "q": "Votre feu passe au vert, mais un piéton n’a pas fini de traverser devant vous. Que faites-vous ?",
    "o": [
      "Vous attendez qu’il ait fini de traverser",
      "Vous démarrez, car le feu est vert pour vous",
      "Vous klaxonnez pour qu’il se dépêche",
      "Vous le contournez lentement"
    ],
    "e": "Un piéton déjà engagé sur la chaussée doit pouvoir terminer sa traversée en sécurité."
  },
  "75": {
    "t": "Priorités",
    "q": "Un piéton avec une canne blanche s’apprête à traverser devant vous. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez et vous le laissez traverser",
      "Vous klaxonnez pour le prévenir de votre présence",
      "Vous passez avant lui, car il ne vous voit pas",
      "Vous le contournez sans ralentir"
    ],
    "e": "La canne blanche signale une personne aveugle ou malvoyante. Arrêtez-vous et laissez-la traverser, sans klaxonner, ce qui pourrait la désorienter."
  },
  "76": {
    "t": "Priorités",
    "q": "Hors agglomération, sur une route sans trottoir ni accotement aménagé, de quel côté un piéton seul doit-il marcher en principe ?",
    "o": [
      "Sur le bord gauche, face aux véhicules",
      "Sur le bord droit, dans le sens des véhicules",
      "Au milieu de la chaussée",
      "Du côté de son choix, sans règle"
    ],
    "e": "Hors agglomération, le piéton isolé marche en principe à gauche, pour voir arriver les véhicules en face, sauf si cela met sa sécurité en danger."
  },
  "77": {
    "t": "Priorités",
    "q": "En agglomération, un bus arrêté à un arrêt signalé met son clignotant pour repartir. Que faites-vous ?",
    "o": [
      "Vous ralentissez et, au besoin, vous vous arrêtez pour le laisser partir",
      "Vous accélérez pour le dépasser avant qu’il démarre",
      "Vous klaxonnez pour qu’il attende",
      "Vous continuez, car vous êtes déjà sur la voie"
    ],
    "e": "En agglomération, il faut faciliter le départ des véhicules de transport en commun qui quittent un arrêt signalé."
  },
  "78": {
    "t": "Priorités",
    "q": "Un car de ramassage scolaire est arrêté au bord de la route, feux de détresse allumés. Que faites-vous ?",
    "o": [
      "Vous ralentissez fortement et vous êtes prêt à vous arrêter",
      "Vous le dépassez rapidement pour ne pas rester derrière",
      "Vous klaxonnez pour prévenir les enfants",
      "Vous gardez votre vitesse, car il est à l’arrêt"
    ],
    "e": "Des enfants peuvent surgir devant ou derrière le car. Il faut ralentir fortement et anticiper un arrêt."
  },
  "79": {
    "t": "Priorités",
    "q": "À un carrefour sans feu ni agent, un tramway arrive sur votre gauche. Qui passe en premier ?",
    "o": [
      "Le tramway",
      "Vous, car il vient de votre gauche",
      "Le premier arrivé au carrefour",
      "Vous, si vous allez tout droit"
    ],
    "e": "Le tramway ne peut ni dévier ni freiner court : il est prioritaire, sauf signalisation contraire."
  },
  "80": {
    "t": "Priorités",
    "q": "Vous tournez à droite et votre trajectoire coupe une piste cyclable. Des cyclistes y circulent dans les deux sens. Que faites-vous ?",
    "o": [
      "Vous laissez passer les cyclistes, dans les deux sens, avant de tourner",
      "Vous ne laissez passer que ceux qui viennent de votre droite",
      "Vous passez, car la piste n’est pas une route",
      "Vous klaxonnez pour qu’ils s’arrêtent"
    ],
    "e": "En quittant une route, vous cédez le passage aux cycles qui circulent sur une piste cyclable que vous traversez, quel que soit leur sens."
  },
  "81": {
    "t": "Priorités",
    "q": "Vous voulez tourner à droite. Une trottinette électrique arrive sur la bande cyclable, à votre droite, et va tout droit. Que faites-vous ?",
    "o": [
      "Vous la laissez passer avant de tourner",
      "Vous tournez, car elle doit s’arrêter",
      "Vous accélérez pour tourner avant elle",
      "Vous klaxonnez pour qu’elle freine"
    ],
    "e": "Comme pour un cycliste, vous ne devez pas couper la route d’un usager qui continue tout droit sur sa voie : attendez qu’il soit passé."
  },
  "82": {
    "t": "Priorités",
    "q": "Dans une zone de rencontre, qui bénéficie de la priorité ?",
    "o": [
      "Les piétons, qui peuvent marcher sur la chaussée",
      "Les voitures, qui restent sur la chaussée",
      "Les véhicules venant de droite uniquement",
      "Les cyclistes seulement"
    ],
    "e": "En zone de rencontre, les piétons peuvent circuler sur la chaussée et sont prioritaires. La vitesse des véhicules y est limitée à 20 km/h."
  },
  "83": {
    "t": "Priorités",
    "q": "Vous êtes autorisé à entrer en voiture dans une aire piétonne. Comment devez-vous circuler ?",
    "o": [
      "Au pas, en laissant la priorité aux piétons",
      "À 30 km/h au maximum",
      "À 20 km/h, en klaxonnant pour prévenir",
      "Normalement, car vous êtes autorisé"
    ],
    "e": "Dans une aire piétonne, les rares véhicules autorisés roulent à l’allure du pas et les piétons sont prioritaires."
  },
  "84": {
    "t": "Priorités",
    "q": "Vous êtes sur la voie d’insertion d’une autoroute. Qui est prioritaire ?",
    "o": [
      "Les véhicules qui circulent déjà sur l’autoroute",
      "Vous, car vous arrivez par la droite",
      "Vous, si vous avez mis votre clignotant",
      "Le véhicule le plus rapide"
    ],
    "e": "Vous adaptez votre vitesse et vous vous insérez en cédant le passage aux véhicules déjà sur l’autoroute."
  },
  "85": {
    "t": "Priorités",
    "q": "Votre feu est vert, mais la circulation est bloquée juste après le carrefour. Que faites-vous ?",
    "o": [
      "Vous attendez avant le carrefour",
      "Vous avancez dans le carrefour, car le feu est vert",
      "Vous avancez jusqu’au milieu du carrefour",
      "Vous klaxonnez pour faire avancer la file"
    ],
    "e": "Même au vert, on ne s’engage pas dans un carrefour si l’on risque d’y rester bloqué et de gêner la circulation transversale."
  },
  "86": {
    "t": "Priorités",
    "q": "Avant un passage étroit, un panneau rond à bordure rouge montre deux flèches de sens opposés : une rouge vers le haut et une noire vers le bas. Que devez-vous faire ?",
    "o": [
      "Céder le passage aux véhicules qui arrivent en face",
      "Passer en premier, car vous êtes prioritaire",
      "Klaxonner avant d’entrer dans le passage",
      "Faire demi-tour, car la route est fermée"
    ],
    "e": "Ce panneau impose de céder le passage à la circulation venant en sens inverse. La flèche rouge, vers le haut, représente votre sens, qui doit attendre."
  },
  "87": {
    "t": "Priorités",
    "q": "Avant un passage étroit, un panneau carré bleu montre une flèche blanche vers le haut et une flèche rouge vers le bas. Que signifie-t-il ?",
    "o": [
      "Vous êtes prioritaire par rapport aux véhicules venant en face",
      "Vous devez céder le passage aux véhicules venant en face",
      "Vous entrez dans une rue à sens unique",
      "Vous devez faire demi-tour"
    ],
    "e": "Ce panneau carré bleu vous donne la priorité sur la circulation venant en sens inverse. La flèche blanche représente votre sens, la flèche rouge celui qui doit vous céder le passage."
  },
  "88": {
    "t": "Panneaux et feux",
    "q": "À un carrefour, le feu clignote à l’orange. Que devez-vous faire ?",
    "o": [
      "Passer avec prudence en respectant les panneaux ou, à défaut, la priorité à droite",
      "Vous arrêter comme à un feu rouge",
      "Passer en priorité, car le feu ne fonctionne pas",
      "Attendre qu’il passe au vert"
    ],
    "e": "Le feu orange clignotant n’impose pas l’arrêt : il demande une prudence particulière, et ce sont les panneaux ou la priorité à droite qui s’appliquent."
  },
  "89": {
    "t": "Panneaux et feux",
    "q": "Le feu est rouge, mais une flèche jaune clignote à côté de lui. Que pouvez-vous faire ?",
    "o": [
      "Passer dans la direction de la flèche, en cédant le passage aux piétons et aux véhicules",
      "Passer dans toutes les directions",
      "Passer dans la direction de la flèche sans vous soucier des autres usagers",
      "Rien, vous attendez obligatoirement le vert"
    ],
    "e": "La flèche jaune clignotante autorise à franchir le feu rouge dans la direction indiquée, à condition de céder le passage aux autres usagers."
  },
  "90": {
    "t": "Panneaux et feux",
    "q": "Sous un feu tricolore, un petit panneau triangulaire montre un vélo et une flèche. Que signifie-t-il ?",
    "o": [
      "Les cyclistes peuvent franchir le feu rouge dans la direction de la flèche, en cédant le passage",
      "Les voitures peuvent tourner au feu rouge s’il n’y a pas de vélo",
      "Les cyclistes doivent toujours s’arrêter, même au vert",
      "Le feu ne s’adresse qu’aux cyclistes"
    ],
    "e": "Ce panonceau permet aux cyclistes de franchir le feu rouge dans la direction indiquée, en cédant le passage aux piétons et aux autres véhicules. Il ne concerne pas les voitures."
  },
  "91": {
    "t": "Panneaux et feux",
    "q": "À un carrefour, un petit feu affiche une barre blanche sur fond noir. À qui s’adresse-t-il ?",
    "o": [
      "Aux bus et aux tramways",
      "Aux voitures qui tournent à droite",
      "Aux cyclistes",
      "Aux piétons"
    ],
    "e": "Les feux à barres blanches sur fond noir sont réservés aux véhicules de transport en commun. Vous ne devez pas en tenir compte."
  },
  "92": {
    "t": "Panneaux et feux",
    "q": "Un agent de circulation lève un bras à la verticale. Que signifie ce geste ?",
    "o": [
      "Arrêt pour tous les usagers, sauf ceux déjà engagés dans le carrefour",
      "Vous pouvez passer",
      "Vous devez accélérer",
      "Seuls les piétons doivent s’arrêter"
    ],
    "e": "Le bras levé à la verticale signifie « attention, arrêt » pour tous, sauf pour ceux qui sont déjà dans l’intersection et doivent la dégager."
  },
  "93": {
    "t": "Panneaux et feux",
    "q": "Un agent de circulation se tient face à vous, les bras tendus à l’horizontale. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez",
      "Vous passez",
      "Vous tournez à droite seulement",
      "Vous klaxonnez pour qu’il vous laisse passer"
    ],
    "e": "Les usagers qui arrivent face ou dos à l’agent doivent s’arrêter. Ceux qui arrivent sur ses côtés peuvent passer."
  },
  "94": {
    "t": "Panneaux et feux",
    "q": "Le feu est vert, mais un agent de circulation vous fait signe de vous arrêter. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez, car les indications de l’agent passent avant le feu",
      "Vous passez, car le feu est vert",
      "Vous passez en ralentissant",
      "Vous klaxonnez pour lui signaler que le feu est vert"
    ],
    "e": "Les ordres des agents chargés de la circulation l’emportent sur les feux et les panneaux."
  },
  "95": {
    "t": "Panneaux et feux",
    "q": "Au milieu de la chaussée, une ligne continue est doublée d’une ligne discontinue. Pouvez-vous la franchir ?",
    "o": [
      "Oui, seulement si la ligne discontinue est de votre côté",
      "Oui, dans les deux sens",
      "Non, jamais",
      "Oui, seulement si la ligne continue est de votre côté"
    ],
    "e": "Pour une ligne mixte, on ne tient compte que de la ligne la plus proche de soi : on peut franchir seulement du côté de la ligne discontinue."
  },
  "96": {
    "t": "Panneaux et feux",
    "q": "Une ligne blanche transversale discontinue est tracée au sol à l’entrée d’une intersection. Que vous indique-t-elle ?",
    "o": [
      "Vous devez céder le passage",
      "Vous devez marquer l’arrêt complet",
      "Vous êtes prioritaire",
      "Vous devez stationner derrière la ligne"
    ],
    "e": "La ligne transversale discontinue matérialise un « cédez le passage ». Le STOP et les feux utilisent une ligne transversale continue."
  },
  "97": {
    "t": "Panneaux et feux",
    "q": "Sur la chaussée, des flèches blanches obliques sont peintes sur votre voie. Que vous indiquent-elles ?",
    "o": [
      "Vous devez vous rabattre dans la direction de la flèche",
      "Vous pouvez dépasser sans risque",
      "Vous approchez d’une sortie d’autoroute",
      "La voie est réservée aux bus"
    ],
    "e": "Ces flèches de rabattement annoncent une ligne continue ou la fin d’une voie : il faut se rabattre."
  },
  "98": {
    "t": "Panneaux et feux",
    "q": "Sur une zone de travaux, des lignes jaunes sont tracées par-dessus les lignes blanches. Lesquelles suivez-vous ?",
    "o": [
      "Les lignes jaunes",
      "Les lignes blanches",
      "Celles qui vous arrangent",
      "Aucune, la vitesse suffit"
    ],
    "e": "Le marquage jaune est temporaire : il remplace les lignes blanches pendant la durée des travaux."
  },
  "99": {
    "t": "Panneaux et feux",
    "q": "Au bord du trottoir, une ligne jaune discontinue est peinte. Que signifie-t-elle ?",
    "o": [
      "Le stationnement est interdit",
      "Le stationnement est autorisé sans limite",
      "Le stationnement est payant",
      "Le stationnement est réservé aux deux-roues"
    ],
    "e": "La ligne jaune discontinue interdit le stationnement. La ligne jaune continue interdit l’arrêt et le stationnement."
  },
  "100": {
    "t": "Panneaux et feux",
    "q": "Un marquage jaune en zigzag est peint le long du trottoir. Que signifie-t-il ?",
    "o": [
      "C’est un arrêt de bus : arrêt et stationnement interdits aux autres véhicules",
      "C’est une place de livraison ouverte à tous",
      "C’est une zone où le dépassement est autorisé",
      "C’est une place de stationnement gratuite"
    ],
    "e": "Le zigzag jaune délimite l’emplacement d’arrêt des autobus. Les autres véhicules ne doivent ni s’y arrêter ni y stationner."
  },
  "101": {
    "t": "Panneaux et feux",
    "q": "Au feu rouge, un espace marqué d’un logo vélo est délimité devant la ligne d’arrêt. Où arrêtez-vous votre voiture ?",
    "o": [
      "Avant la première ligne, sans entrer dans cet espace",
      "Dans l’espace vélo, s’il est libre",
      "Sur la seconde ligne, au plus près du feu",
      "Où vous voulez, si aucun cycliste n’est présent"
    ],
    "e": "Ce sas est réservé aux cyclistes : les voitures s’arrêtent avant la première ligne pour leur laisser la place."
  },
  "102": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond rouge porte une barre blanche horizontale. Que signifie-t-il ?",
    "o": [
      "Sens interdit à tout véhicule",
      "Arrêt et stationnement interdits",
      "Fin de toutes les interdictions",
      "Route prioritaire"
    ],
    "e": "C’est le panneau de sens interdit : vous ne pouvez pas entrer dans cette voie."
  },
  "103": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond, blanc à l’intérieur et bordé de rouge, ne porte aucun symbole. Que signifie-t-il ?",
    "o": [
      "Circulation interdite à tout véhicule dans les deux sens",
      "Fin de limitation de vitesse",
      "Vitesse libre",
      "Stationnement autorisé"
    ],
    "e": "Ce panneau interdit la circulation de tous les véhicules dans les deux sens."
  },
  "104": {
    "t": "Panneaux et feux",
    "q": "À l’entrée d’une rue, un panneau de sens interdit porte un panonceau « sauf » avec un vélo. Que signifie-t-il ?",
    "o": [
      "La rue est interdite aux véhicules dans ce sens, sauf aux cyclistes",
      "La rue est interdite aux cyclistes",
      "Les cyclistes doivent descendre de vélo",
      "Les voitures peuvent entrer si aucun vélo n’arrive"
    ],
    "e": "C’est un double sens cyclable : les cyclistes peuvent emprunter la rue dans les deux sens. En roulant dans l’autre sens, attendez-vous à croiser des vélos."
  },
  "105": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond à fond bleu montre un vélo blanc. Que signifie-t-il ?",
    "o": [
      "Piste ou bande cyclable obligatoire pour les cyclistes",
      "Piste cyclable seulement conseillée",
      "Interdiction aux vélos",
      "Parking à vélos"
    ],
    "e": "Le panneau rond bleu impose une obligation : les cyclistes doivent emprunter cet aménagement, qui n’est pas destiné aux voitures."
  },
  "106": {
    "t": "Panneaux et feux",
    "q": "Un panneau rond à fond bleu et bordure rouge est barré de deux traits rouges qui se croisent. Que signifie-t-il ?",
    "o": [
      "Arrêt et stationnement interdits",
      "Stationnement interdit, arrêt autorisé",
      "Sens interdit",
      "Fin de zone de stationnement"
    ],
    "e": "La croix rouge interdit à la fois l’arrêt et le stationnement. Un seul trait rouge n’interdit que le stationnement."
  },
  "107": {
    "t": "Panneaux et feux",
    "q": "Hors agglomération, à quelle distance environ du danger un panneau de danger est-il placé en général ?",
    "o": [
      "150 mètres",
      "50 mètres",
      "500 mètres",
      "1 kilomètre"
    ],
    "e": "Hors agglomération, les panneaux de danger sont placés environ 150 m avant le danger, contre environ 50 m en agglomération. Un panonceau peut préciser une autre distance."
  },
  "108": {
    "t": "Panneaux et feux",
    "q": "Un panneau triangulaire à bordure rouge montre deux enfants qui courent. Que vous annonce-t-il ?",
    "o": [
      "Un endroit fréquenté par des enfants, comme une école",
      "Une aire de jeux interdite aux véhicules",
      "Un passage piéton réservé aux adultes",
      "Une zone de rencontre"
    ],
    "e": "Ce panneau de danger signale la sortie d’une école ou un lieu où des enfants peuvent traverser : ralentissez et redoublez d’attention."
  },
  "109": {
    "t": "Panneaux et feux",
    "q": "Que signifie un panneau de danger triangulaire à fond jaune ?",
    "o": [
      "Un danger temporaire, par exemple des travaux",
      "Un danger permanent",
      "Une obligation",
      "Une fin d’interdiction"
    ],
    "e": "Le fond jaune signale une signalisation temporaire, souvent liée à un chantier. Elle prime sur la signalisation habituelle."
  },
  "110": {
    "t": "Panneaux et feux",
    "q": "Vous passez un panneau rectangulaire blanc à bordure rouge, qui porte le nom d’une ville. Quelle est la vitesse maximale, sauf indication contraire ?",
    "o": [
      "50 km/h",
      "30 km/h",
      "70 km/h",
      "80 km/h"
    ],
    "e": "Ce panneau marque l’entrée d’une agglomération, où la vitesse est limitée à 50 km/h sauf autre signalisation."
  },
  "111": {
    "t": "Panneaux et feux",
    "q": "Un panneau indique « ZONE 30 ». Que signifie-t-il ?",
    "o": [
      "Vous entrez dans une zone où la vitesse est limitée à 30 km/h",
      "La vitesse est limitée à 30 km/h sur 30 mètres",
      "Le stationnement est limité à 30 minutes",
      "Il est conseillé de rouler à 30 km/h, sans obligation"
    ],
    "e": "La vitesse est limitée à 30 km/h dans toute la zone, jusqu’au panneau de sortie de zone 30."
  },
  "112": {
    "t": "Panneaux et feux",
    "q": "Un panneau rectangulaire bleu montre une grande flèche blanche vers le haut. Que signifie-t-il ?",
    "o": [
      "Vous circulez dans une voie à sens unique",
      "Vous devez obligatoirement aller tout droit au prochain carrefour",
      "Vous êtes prioritaire",
      "Vous entrez sur une autoroute"
    ],
    "e": "Ce panneau d’indication signale une rue à sens unique : les véhicules n’y circulent que dans le sens de la flèche."
  },
  "113": {
    "t": "Vitesse et distances",
    "q": "Vous êtes jeune conducteur en permis probatoire. Quelle est votre vitesse maximale sur autoroute ?",
    "o": [
      "110 km/h",
      "130 km/h",
      "100 km/h",
      "90 km/h"
    ],
    "e": "Pendant la période probatoire, la vitesse est limitée à 110 km/h sur autoroute, même par temps sec."
  },
  "114": {
    "t": "Vitesse et distances",
    "q": "Vous êtes jeune conducteur. Sauf indication contraire, quelle est votre vitesse maximale sur une route à deux chaussées séparées par un terre-plein central, limitée à 110 km/h ?",
    "o": [
      "100 km/h",
      "110 km/h",
      "90 km/h",
      "80 km/h"
    ],
    "e": "Un jeune conducteur est limité à 100 km/h sur les routes à chaussées séparées où la limite générale est de 110 km/h."
  },
  "115": {
    "t": "Vitesse et distances",
    "q": "Vous êtes jeune conducteur. Hors agglomération, une route à double sens sans séparateur central est limitée à 90 km/h. Quelle est votre vitesse maximale ?",
    "o": [
      "80 km/h",
      "90 km/h",
      "70 km/h",
      "100 km/h"
    ],
    "e": "En permis probatoire, la vitesse est limitée à 80 km/h sur ces routes, même quand la limite est relevée à 90 km/h pour les autres conducteurs."
  },
  "116": {
    "t": "Vitesse et distances",
    "q": "Sauf indication contraire, quelle est la vitesse maximale par temps sec sur une route hors agglomération à deux chaussées séparées par un terre-plein central ?",
    "o": [
      "110 km/h",
      "90 km/h",
      "130 km/h",
      "100 km/h"
    ],
    "e": "La limite générale est de 110 km/h sur ces routes, et de 100 km/h par temps de pluie."
  },
  "117": {
    "t": "Vitesse et distances",
    "q": "Par temps de pluie, quelle est la vitesse maximale sur une route à chaussées séparées normalement limitée à 110 km/h ?",
    "o": [
      "100 km/h",
      "110 km/h",
      "90 km/h",
      "80 km/h"
    ],
    "e": "Par temps de pluie, la limite passe de 110 km/h à 100 km/h sur ces routes."
  },
  "118": {
    "t": "Vitesse et distances",
    "q": "Sauf indication contraire, quelle est la vitesse maximale sur autoroute par temps sec pour un conducteur confirmé ?",
    "o": [
      "130 km/h",
      "110 km/h",
      "120 km/h",
      "150 km/h"
    ],
    "e": "Sur autoroute, la limite générale est de 130 km/h par temps sec et de 110 km/h par temps de pluie."
  },
  "119": {
    "t": "Vitesse et distances",
    "q": "Par temps de pluie, quelle est la vitesse maximale sur une route hors agglomération à double sens limitée à 80 km/h ?",
    "o": [
      "80 km/h",
      "70 km/h",
      "60 km/h",
      "50 km/h"
    ],
    "e": "La pluie abaisse les limites de 130, 110 et 90 km/h, mais une route déjà limitée à 80 km/h reste à 80 km/h. Il faut tout de même adapter sa vitesse."
  },
  "120": {
    "t": "Vitesse et distances",
    "q": "Pour un conducteur reposé et attentif, quel est le temps de réaction moyen ?",
    "o": [
      "Environ 1 seconde",
      "Environ 0,1 seconde",
      "Environ 5 secondes",
      "Environ 10 secondes"
    ],
    "e": "Il faut environ 1 seconde pour percevoir un danger et commencer à freiner. Ce temps augmente avec la fatigue, l’alcool ou une distraction."
  },
  "121": {
    "t": "Vitesse et distances",
    "q": "À 90 km/h, quelle distance parcourez-vous environ en 1 seconde ?",
    "o": [
      "Environ 25 mètres",
      "Environ 9 mètres",
      "Environ 50 mètres",
      "Environ 90 mètres"
    ],
    "e": "90 km/h correspondent à 25 mètres par seconde. Pendant votre temps de réaction, la voiture avance donc d’environ 25 mètres sans freiner."
  },
  "122": {
    "t": "Vitesse et distances",
    "q": "Si vous roulez deux fois plus vite, votre distance de freinage est environ…",
    "o": [
      "multipliée par 4",
      "multipliée par 2",
      "la même",
      "divisée par 2"
    ],
    "e": "La distance de freinage augmente avec le carré de la vitesse : deux fois plus vite, c’est environ quatre fois plus de distance pour s’arrêter."
  },
  "123": {
    "t": "Vitesse et distances",
    "q": "À 90 km/h, à quelle distance environ correspond un intervalle de sécurité de 2 secondes ?",
    "o": [
      "Environ 50 mètres",
      "Environ 10 mètres",
      "Environ 20 mètres",
      "Environ 150 mètres"
    ],
    "e": "À 90 km/h, on parcourt environ 25 mètres par seconde : 2 secondes représentent donc environ 50 mètres."
  },
  "124": {
    "t": "Vitesse et distances",
    "q": "Dans une zone de rencontre, quelle est la vitesse maximale autorisée ?",
    "o": [
      "20 km/h",
      "30 km/h",
      "50 km/h",
      "L’allure du pas"
    ],
    "e": "Dans une zone de rencontre, la vitesse est limitée à 20 km/h et les piétons sont prioritaires sur les véhicules."
  },
  "125": {
    "t": "Vitesse et distances",
    "q": "Sur autoroute, par temps sec, de jour et avec une circulation fluide, quelle vitesse minimale devez-vous respecter sur la voie la plus à gauche ?",
    "o": [
      "80 km/h",
      "50 km/h",
      "110 km/h",
      "Il n’y a jamais de vitesse minimale"
    ],
    "e": "Dans ces conditions, on ne peut pas circuler sur la voie la plus à gauche d’une autoroute à moins de 80 km/h."
  },
  "126": {
    "t": "Vitesse et distances",
    "q": "Avez-vous le droit de rouler à une vitesse anormalement lente sans raison particulière ?",
    "o": [
      "Non, car vous gênez la circulation",
      "Oui, rouler lentement est toujours plus sûr",
      "Oui, seulement sur autoroute",
      "Oui, si vous n’êtes pas pressé"
    ],
    "e": "Il est interdit de gêner la marche normale des autres véhicules en roulant à une vitesse anormalement réduite sans raison valable."
  },
  "127": {
    "t": "Vitesse et distances",
    "q": "À quel moment devez-vous ralentir pour aborder un virage ?",
    "o": [
      "Avant d’entrer dans le virage",
      "Au milieu du virage",
      "À la sortie du virage",
      "Seulement si le virage est serré"
    ],
    "e": "On adapte sa vitesse avant le virage, en ligne droite. Freiner fort dans la courbe risque de déséquilibrer le véhicule."
  },
  "128": {
    "t": "Vitesse et distances",
    "q": "Que devient votre champ de vision quand votre vitesse augmente ?",
    "o": [
      "Il se rétrécit",
      "Il s’élargit",
      "Il ne change pas",
      "Il devient plus net sur les côtés"
    ],
    "e": "Plus on roule vite, plus le regard se concentre loin devant : on perçoit moins bien ce qui arrive sur les côtés."
  },
  "129": {
    "t": "Vitesse et distances",
    "q": "Un choc contre un obstacle à 50 km/h équivaut environ à une chute de…",
    "o": [
      "10 mètres de haut",
      "1 mètre de haut",
      "3 mètres de haut",
      "30 mètres de haut"
    ],
    "e": "À 50 km/h, l’énergie du choc correspond à une chute d’environ 10 mètres, soit la hauteur d’un troisième étage."
  },
  "130": {
    "t": "Vitesse et distances",
    "q": "À quoi sert le limiteur de vitesse ?",
    "o": [
      "À empêcher le véhicule de dépasser la vitesse que vous avez choisie",
      "À maintenir le véhicule à une vitesse constante sans toucher à l’accélérateur",
      "À freiner automatiquement devant un obstacle",
      "À afficher la limitation de vitesse de la route"
    ],
    "e": "Avec le limiteur, vous gardez la main sur l’accélérateur, mais la voiture ne dépasse pas la vitesse programmée. C’est le régulateur qui maintient une vitesse constante."
  },
  "131": {
    "t": "Vitesse et distances",
    "q": "Dans une longue descente, comment évitez-vous de surchauffer les freins ?",
    "o": [
      "Vous utilisez le frein moteur en engageant un rapport inférieur",
      "Vous roulez au point mort",
      "Vous freinez sans arrêt avec la pédale",
      "Vous coupez le moteur"
    ],
    "e": "Le frein moteur retient le véhicule et soulage les freins. Rouler au point mort ou moteur coupé est dangereux."
  },
  "132": {
    "t": "Vitesse et distances",
    "q": "De quoi dépend principalement la distance parcourue pendant le temps de réaction ?",
    "o": [
      "De votre vitesse et de votre vigilance",
      "De l’état des pneus",
      "De l’état des freins",
      "De l’adhérence de la chaussée"
    ],
    "e": "Pendant le temps de réaction, on ne freine pas encore : la distance dépend de la vitesse et de l’état du conducteur. Les pneus, les freins et la route jouent sur le freinage."
  },
  "133": {
    "t": "Vitesse et distances",
    "q": "Quel élément a une influence directe sur la distance de freinage ?",
    "o": [
      "L’état des pneus et de la chaussée",
      "Le temps de réaction du conducteur",
      "La couleur du véhicule",
      "Le nombre de feux allumés"
    ],
    "e": "La distance de freinage dépend de la vitesse, de l’adhérence de la route, des pneus et des freins."
  },
  "134": {
    "t": "Vitesse et distances",
    "q": "Que signifie un panneau carré à fond bleu portant un nombre en blanc, par exemple 70 ?",
    "o": [
      "Une vitesse conseillée",
      "Une vitesse maximale obligatoire",
      "Une vitesse minimale obligatoire",
      "La fin d’une limitation de vitesse"
    ],
    "e": "Ce panneau indique une vitesse conseillée. Les vitesses maximales obligatoires sont indiquées par des panneaux ronds à bordure rouge."
  },
  "135": {
    "t": "Vitesse et distances",
    "q": "La nuit, en feux de croisement, comment adaptez-vous votre vitesse ?",
    "o": [
      "Vous roulez assez lentement pour pouvoir vous arrêter dans la zone éclairée",
      "Vous roulez comme de jour",
      "Vous roulez plus vite, car il y a moins de circulation",
      "Vous suivez de très près le véhicule devant pour profiter de ses feux"
    ],
    "e": "La nuit, vous voyez moins loin : votre distance d’arrêt doit rester dans la portée de vos feux."
  },
  "136": {
    "t": "Vitesse et distances",
    "q": "Un fort vent latéral souffle sur la route. Que faites-vous ?",
    "o": [
      "Vous ralentissez et tenez fermement le volant",
      "Vous accélérez pour passer plus vite",
      "Vous roulez au milieu de la chaussée",
      "Vous relâchez le volant pour laisser la voiture se stabiliser"
    ],
    "e": "Le vent peut déporter brusquement le véhicule, surtout en sortie de tunnel, sur un pont ou en dépassant un camion."
  },
  "137": {
    "t": "Circulation et stationnement",
    "q": "Dans quel cas devez-vous dépasser un véhicule par la droite ?",
    "o": [
      "Quand il a signalé qu’il va tourner à gauche et s’est placé à gauche",
      "Quand il roule lentement sur la voie de gauche d’une autoroute",
      "Quand il roule en dessous de la vitesse maximale",
      "Quand c’est un tracteur sur une route de campagne"
    ],
    "e": "On dépasse normalement par la gauche. On passe par la droite quand le conducteur devant a annoncé qu’il tourne à gauche ou qu’il va stationner à gauche."
  },
  "138": {
    "t": "Circulation et stationnement",
    "q": "Un véhicule est en train de vous dépasser. Que devez-vous faire ?",
    "o": [
      "Serrer à droite et ne pas accélérer",
      "Accélérer pour l’empêcher de passer",
      "Vous décaler vers la gauche",
      "Freiner brusquement"
    ],
    "e": "Le conducteur dépassé doit faciliter la manœuvre : il serre à droite et n’augmente pas sa vitesse."
  },
  "139": {
    "t": "Circulation et stationnement",
    "q": "Vous croisez un véhicule sur une route étroite. Que faites-vous ?",
    "o": [
      "Vous serrez à droite autant que possible",
      "Vous restez au milieu de la chaussée",
      "Vous accélérez pour passer en premier",
      "Vous allumez vos feux de route"
    ],
    "e": "Pour croiser, chaque conducteur serre à droite autant que le permet la présence des autres usagers, et ralentit si besoin."
  },
  "140": {
    "t": "Circulation et stationnement",
    "q": "Sur autoroute, vous avez manqué votre sortie. Que faites-vous ?",
    "o": [
      "Vous continuez jusqu’à la sortie suivante",
      "Vous reculez sur la bande d’arrêt d’urgence",
      "Vous faites demi-tour par le terre-plein central",
      "Vous vous arrêtez pour réfléchir"
    ],
    "e": "La marche arrière, le demi-tour et la traversée du terre-plein central sont interdits sur autoroute. On prend simplement la sortie suivante."
  },
  "141": {
    "t": "Circulation et stationnement",
    "q": "Pour sortir de l’autoroute, où ralentissez-vous principalement ?",
    "o": [
      "Sur la voie de décélération",
      "Sur la voie de droite, bien avant la sortie",
      "Sur la voie de gauche",
      "Sur la bande d’arrêt d’urgence"
    ],
    "e": "Vous mettez votre clignotant, vous vous engagez sur la voie de décélération, puis vous y réduisez votre vitesse sans gêner ceux qui vous suivent."
  },
  "142": {
    "t": "Circulation et stationnement",
    "q": "Quand pouvez-vous vous arrêter sur la bande d’arrêt d’urgence d’une autoroute ?",
    "o": [
      "Uniquement en cas de nécessité absolue, comme une panne ou un malaise",
      "Pour passer un appel téléphonique",
      "Pour vous reposer quelques minutes",
      "Pour consulter votre itinéraire"
    ],
    "e": "La bande d’arrêt d’urgence est réservée aux urgences. Pour se reposer ou téléphoner, on utilise une aire de repos."
  },
  "143": {
    "t": "Circulation et stationnement",
    "q": "Quels feux devez-vous allumer dans un tunnel ?",
    "o": [
      "Les feux de croisement",
      "Les feux de route",
      "Les feux antibrouillard arrière",
      "Aucun feu si le tunnel est éclairé"
    ],
    "e": "Dans un tunnel, on allume les feux de croisement, même s’il est éclairé, pour voir et être vu."
  },
  "144": {
    "t": "Circulation et stationnement",
    "q": "Un incendie se déclare dans un tunnel et vous ne pouvez pas en sortir en voiture. Que faites-vous ?",
    "o": [
      "Vous coupez le moteur, laissez la clé et rejoignez à pied l’issue de secours la plus proche",
      "Vous faites demi-tour",
      "Vous restez dans la voiture, vitres fermées",
      "Vous reculez jusqu’à l’entrée du tunnel"
    ],
    "e": "La fumée est le principal danger. On quitte le véhicule rapidement et on rejoint une issue de secours. La clé laissée permet de déplacer la voiture."
  },
  "145": {
    "t": "Circulation et stationnement",
    "q": "Sur une route à double sens, vous voulez tourner à gauche au prochain carrefour. Où vous placez-vous ?",
    "o": [
      "Près de l’axe médian de la chaussée",
      "Tout à fait à droite de la chaussée",
      "Sur la voie de gauche, à contresens",
      "Sur l’accotement"
    ],
    "e": "Pour tourner à gauche sur une route à double sens, on se rapproche de l’axe central, sans le franchir, après avoir mis son clignotant."
  },
  "146": {
    "t": "Circulation et stationnement",
    "q": "Une voiture est stationnée dans un virage où la visibilité est insuffisante. Comment ce stationnement est-il qualifié ?",
    "o": [
      "Dangereux",
      "Abusif",
      "Autorisé s’il dure moins d’une heure",
      "Autorisé si les feux de détresse sont allumés"
    ],
    "e": "Le stationnement est dangereux quand la visibilité est insuffisante, par exemple près d’un virage, d’un sommet de côte ou d’une intersection."
  },
  "147": {
    "t": "Circulation et stationnement",
    "q": "À partir de quelle durée un stationnement ininterrompu au même endroit sur la voie publique est-il considéré comme abusif ?",
    "o": [
      "Plus de 7 jours",
      "Plus de 24 heures",
      "Plus de 48 heures",
      "Plus de 30 jours"
    ],
    "e": "Un véhicule laissé sans bouger au même endroit sur la voie publique pendant plus de 7 jours est en stationnement abusif et peut être mis en fourrière."
  },
  "148": {
    "t": "Circulation et stationnement",
    "q": "Quelle est la différence entre un arrêt et un stationnement ?",
    "o": [
      "À l’arrêt, le conducteur reste aux commandes ou à proximité pour pouvoir repartir",
      "L’arrêt dure toujours moins de 5 minutes",
      "À l’arrêt, le moteur doit rester allumé",
      "Il n’y a aucune différence"
    ],
    "e": "L’arrêt est une immobilisation momentanée, conducteur aux commandes ou tout près. Dès qu’il s’éloigne, il s’agit d’un stationnement."
  },
  "149": {
    "t": "Circulation et stationnement",
    "q": "Vous laissez votre voiture en double file pour aller acheter du pain. Est-ce autorisé ?",
    "o": [
      "Non, le stationnement en double file est interdit",
      "Oui, si vous allumez les feux de détresse",
      "Oui, pour moins de 5 minutes",
      "Oui, si la rue est large"
    ],
    "e": "Le stationnement en double file gêne la circulation et est interdit, même brièvement et feux de détresse allumés."
  },
  "150": {
    "t": "Circulation et stationnement",
    "q": "Pouvez-vous stationner sur une place réservée aux personnes handicapées si vous n’avez pas la carte de stationnement ?",
    "o": [
      "Non, jamais, même pour quelques minutes",
      "Oui, pour moins de 5 minutes",
      "Oui, si les autres places sont prises",
      "Oui, la nuit"
    ],
    "e": "Ces places sont réservées aux titulaires de la carte de stationnement pour personnes handicapées. Les occuper sans carte est un stationnement très gênant."
  },
  "151": {
    "t": "Circulation et stationnement",
    "q": "Vous êtes stationné le long d’une rue. Avant d’ouvrir votre portière, que devez-vous faire ?",
    "o": [
      "Vérifier qu’aucun usager, notamment un cycliste, n’arrive",
      "Klaxonner pour prévenir",
      "Ouvrir d’un coup pour être vu",
      "Rien, les autres doivent faire attention"
    ],
    "e": "Il est interdit d’ouvrir une portière si cela crée un danger. Regardez dans le rétroviseur et par-dessus l’épaule avant d’ouvrir."
  },
  "152": {
    "t": "Circulation et stationnement",
    "q": "La nuit, hors agglomération, vous suivez de près un autre véhicule. Quels feux utilisez-vous ?",
    "o": [
      "Les feux de croisement",
      "Les feux de route",
      "Les feux de position seulement",
      "Les feux antibrouillard arrière"
    ],
    "e": "Les feux de route éblouiraient le conducteur devant vous à travers ses rétroviseurs. On passe en feux de croisement quand on suit ou que l’on croise un véhicule."
  },
  "153": {
    "t": "Circulation et stationnement",
    "q": "Pouvez-vous stationner sur un emplacement réservé à l’arrêt des bus ?",
    "o": [
      "Non, c’est interdit",
      "Oui, en dehors des heures de passage",
      "Oui, si vous restez moins de 10 minutes",
      "Oui, le dimanche"
    ],
    "e": "Ces emplacements sont réservés aux véhicules de transport en commun. Y stationner gêne les bus et la montée des voyageurs."
  },
  "154": {
    "t": "Circulation et stationnement",
    "q": "Hors agglomération, où devez-vous placer votre véhicule pour vous arrêter ou stationner ?",
    "o": [
      "Autant que possible en dehors de la chaussée",
      "Au milieu de la chaussée, feux de détresse allumés",
      "Sur la voie de gauche",
      "Toujours sur la chaussée, le long du bord droit"
    ],
    "e": "Hors agglomération, un véhicule à l’arrêt ou en stationnement doit être placé, autant que possible, hors de la chaussée, par exemple sur l’accotement ou un parking."
  },
  "155": {
    "t": "Alcool, fatigue, santé",
    "q": "En moyenne, de combien le taux d’alcool dans le sang baisse-t-il par heure ?",
    "o": [
      "De 0,10 à 0,15 g par litre",
      "De 0,5 g par litre",
      "De 1 g par litre",
      "De 0,01 g par litre"
    ],
    "e": "L’organisme élimine l’alcool lentement, environ 0,10 à 0,15 g/L par heure. Il faut donc plusieurs heures pour revenir à zéro."
  },
  "156": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous avez bu de l’alcool. Quel est le seul moyen de faire baisser votre taux ?",
    "o": [
      "Attendre, car seul le temps élimine l’alcool",
      "Boire plusieurs cafés",
      "Prendre une douche froide",
      "Manger beaucoup après avoir bu"
    ],
    "e": "Café, douche ou repas ne font pas baisser le taux d’alcool. Seul le temps permet à l’organisme de l’éliminer."
  },
  "157": {
    "t": "Alcool, fatigue, santé",
    "q": "Un demi de bière, un verre de vin et un whisky servis au bar contiennent…",
    "o": [
      "À peu près la même quantité d’alcool pur, environ 10 g",
      "Beaucoup plus d’alcool pour la bière",
      "Beaucoup plus d’alcool pour le vin",
      "Presque pas d’alcool pour la bière"
    ],
    "e": "Les verres « standard » servis dans un bar contiennent tous environ 10 g d’alcool pur. Une bière n’est pas moins dangereuse qu’un whisky."
  },
  "158": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous buvez de l’alcool au cours d’un repas. Au bout de combien de temps environ votre taux d’alcool est-il le plus élevé ?",
    "o": [
      "1 heure",
      "10 minutes",
      "4 heures",
      "8 heures"
    ],
    "e": "Le taux maximal est atteint environ 30 minutes après avoir bu à jeun, et environ 1 heure si l’on boit en mangeant."
  },
  "159": {
    "t": "Alcool, fatigue, santé",
    "q": "À partir de quel taux d’alcool dans le sang la conduite devient-elle un délit ?",
    "o": [
      "0,8 g par litre de sang",
      "0,2 g par litre de sang",
      "0,5 g par litre de sang",
      "1,5 g par litre de sang"
    ],
    "e": "À partir de 0,8 g/L de sang (0,40 mg/L d’air expiré), ce n’est plus une contravention mais un délit jugé par le tribunal."
  },
  "160": {
    "t": "Alcool, fatigue, santé",
    "q": "Un conducteur confirmé est contrôlé avec un taux compris entre 0,5 et 0,8 g/L de sang. Combien de points perd-il ?",
    "o": [
      "6 points",
      "1 point",
      "3 points",
      "4 points"
    ],
    "e": "Entre 0,5 et 0,8 g/L, c’est une contravention qui entraîne le retrait de 6 points, en plus de l’amende."
  },
  "161": {
    "t": "Alcool, fatigue, santé",
    "q": "Combien de points perd un conducteur qui a conduit après avoir fait usage de stupéfiants ?",
    "o": [
      "6 points",
      "2 points",
      "3 points",
      "4 points"
    ],
    "e": "La conduite après usage de stupéfiants est un délit qui entraîne le retrait de 6 points."
  },
  "162": {
    "t": "Alcool, fatigue, santé",
    "q": "Lors d’un contrôle routier, comment les forces de l’ordre dépistent-elles les stupéfiants ?",
    "o": [
      "Avec un test salivaire",
      "Avec un éthylotest",
      "Avec un test de vue",
      "En mesurant votre vitesse"
    ],
    "e": "Le dépistage des stupéfiants se fait par un test salivaire. L’éthylotest, lui, ne détecte que l’alcool."
  },
  "163": {
    "t": "Alcool, fatigue, santé",
    "q": "Quel est l’effet du cannabis sur la conduite ?",
    "o": [
      "Il allonge le temps de réaction et perturbe la perception des distances",
      "Il améliore la concentration",
      "Il rend plus vigilant la nuit",
      "Il n’a aucun effet sur les réflexes"
    ],
    "e": "Le cannabis ralentit les réflexes, diminue la vigilance et fausse l’appréciation des distances et des vitesses."
  },
  "164": {
    "t": "Alcool, fatigue, santé",
    "q": "Un conducteur a consommé à la fois de l’alcool et du cannabis. Que se passe-t-il ?",
    "o": [
      "Les effets se cumulent et le risque d’accident devient très élevé",
      "Le cannabis annule les effets de l’alcool",
      "L’alcool annule les effets du cannabis",
      "Le risque est le même qu’avec l’alcool seul"
    ],
    "e": "Les effets de l’alcool et du cannabis s’ajoutent et se renforcent : le risque d’accident mortel est fortement multiplié."
  },
  "165": {
    "t": "Alcool, fatigue, santé",
    "q": "Quels signes doivent vous faire penser que vous commencez à vous endormir au volant ?",
    "o": [
      "Bâillements, paupières lourdes, raideur dans la nuque",
      "Envie de doubler les autres véhicules",
      "Mains chaudes et faim",
      "Envie de mettre la musique plus fort pour chanter"
    ],
    "e": "Bâillements, picotements des yeux, paupières lourdes, raideur de la nuque ou besoin de bouger sont des signaux d’alerte de la somnolence."
  },
  "166": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous sentez que vous commencez à somnoler en conduisant. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez dans un endroit sûr et faites une courte sieste",
      "Vous ouvrez la fenêtre et continuez",
      "Vous montez le volume de la radio et continuez",
      "Vous accélérez pour arriver plus vite"
    ],
    "e": "Seul le repos est efficace contre la somnolence. Une sieste de 15 à 20 minutes sur une aire de repos permet de récupérer."
  },
  "167": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous roulez à 90 km/h et vous vous endormez 4 secondes. Quelle distance parcourez-vous environ sans rien contrôler ?",
    "o": [
      "100 mètres",
      "10 mètres",
      "25 mètres",
      "400 mètres"
    ],
    "e": "À 90 km/h, on parcourt 25 mètres par seconde : 4 secondes de micro-sommeil font donc environ 100 mètres sans contrôle."
  },
  "168": {
    "t": "Alcool, fatigue, santé",
    "q": "Quand est-il préférable de programmer votre GPS ?",
    "o": [
      "Avant de démarrer",
      "En roulant, sur une ligne droite",
      "En roulant doucement en ville",
      "Pendant un dépassement"
    ],
    "e": "Manipuler un GPS en roulant détourne le regard et l’attention de la route. On le règle avant de partir, ou après s’être arrêté en sécurité."
  },
  "169": {
    "t": "Alcool, fatigue, santé",
    "q": "Un écran qui diffuse un film peut-il être placé dans le champ de vision du conducteur ?",
    "o": [
      "Non, seuls les écrans d’aide à la conduite ou à la navigation sont autorisés",
      "Oui, si le son est coupé",
      "Oui, sur autoroute uniquement",
      "Oui, si l’écran est petit"
    ],
    "e": "Il est interdit de placer dans le champ de vision du conducteur un écran qui n’est pas une aide à la conduite ou à la navigation."
  },
  "170": {
    "t": "Alcool, fatigue, santé",
    "q": "Téléphoner avec un kit mains-libres intégré à la voiture, sans rien porter sur les oreilles, est-ce autorisé ?",
    "o": [
      "Oui, mais cela reste une source de distraction dangereuse",
      "Non, c’est interdit dans tous les cas",
      "Oui, et cela ne gêne pas l’attention",
      "Seulement sur autoroute"
    ],
    "e": "Le kit mains-libres intégré au véhicule est autorisé, mais la conversation détourne l’attention : il vaut mieux s’arrêter pour téléphoner."
  },
  "171": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous devez absolument passer un appel téléphonique. Que faites-vous ?",
    "o": [
      "Vous vous garez sur un emplacement autorisé avant d’appeler",
      "Vous vous arrêtez sur la bande d’arrêt d’urgence de l’autoroute",
      "Vous appelez pendant un arrêt au feu rouge",
      "Vous ralentissez et appelez en roulant"
    ],
    "e": "Il faut être stationné, hors de la circulation, pour utiliser son téléphone. La bande d’arrêt d’urgence est réservée aux vraies urgences."
  },
  "172": {
    "t": "Alcool, fatigue, santé",
    "q": "Votre permis indique que vous devez porter des lunettes pour conduire. Quand devez-vous les porter ?",
    "o": [
      "À chaque fois que vous conduisez",
      "Seulement la nuit",
      "Seulement hors agglomération",
      "Seulement pour les longs trajets"
    ],
    "e": "Une mention de correction de la vue sur le permis vous oblige à porter lunettes ou lentilles à chaque fois que vous conduisez."
  },
  "173": {
    "t": "Alcool, fatigue, santé",
    "q": "Vous êtes très en colère après une dispute et vous devez prendre la voiture. Que faites-vous ?",
    "o": [
      "Vous attendez d’être calmé avant de conduire",
      "Vous partez tout de suite pour vous changer les idées",
      "Vous conduisez plus vite pour évacuer la tension",
      "Vous téléphonez pendant le trajet pour en parler"
    ],
    "e": "Une émotion forte (colère, stress, tristesse) diminue l’attention et pousse à prendre des risques. Mieux vaut attendre d’avoir retrouvé son calme."
  },
  "174": {
    "t": "Alcool, fatigue, santé",
    "q": "Que signifie un pictogramme jaune (niveau 1) sur une boîte de médicament ?",
    "o": [
      "Soyez prudent : ne pas conduire sans avoir lu la notice",
      "Danger : ne pas conduire",
      "Ne pas conduire sans l’avis d’un professionnel de santé",
      "Ce médicament améliore la vigilance"
    ],
    "e": "Le niveau 1 (jaune) signale un risque faible : on lit la notice avant de prendre le volant."
  },
  "175": {
    "t": "Alcool, fatigue, santé",
    "q": "Que se passe-t-il si vous buvez de l’alcool alors que vous prenez un médicament qui fait somnoler ?",
    "o": [
      "Les effets peuvent se renforcer et rendre la conduite très dangereuse",
      "Le médicament fait baisser le taux d’alcool",
      "L’alcool annule l’effet du médicament",
      "Rien de particulier"
    ],
    "e": "L’alcool peut renforcer les effets de nombreux médicaments, notamment la somnolence. Il faut lire la notice et demander conseil."
  },
  "176": {
    "t": "Alcool, fatigue, santé",
    "q": "En fin de soirée, un ami qui a bu veut prendre le volant. Que faites-vous ?",
    "o": [
      "Vous l’en empêchez et proposez une autre solution : conducteur sobre, taxi ou dormir sur place",
      "Vous le laissez partir s’il dit qu’il se sent bien",
      "Vous lui conseillez de rouler lentement",
      "Vous lui proposez un café avant de partir"
    ],
    "e": "On ne se fie pas à son impression : l’alcool fait surestimer ses capacités. Il faut trouver un conducteur sobre ou une autre solution."
  },
  "177": {
    "t": "Alcool, fatigue, santé",
    "q": "Quel effet l’alcool a-t-il sur le comportement du conducteur ?",
    "o": [
      "Il pousse à surestimer ses capacités et à prendre plus de risques",
      "Il rend plus prudent",
      "Il améliore les réflexes",
      "Il améliore la vision de nuit"
    ],
    "e": "L’alcool donne une fausse impression de maîtrise, allonge le temps de réaction et rétrécit le champ visuel."
  },
  "178": {
    "t": "Permis et examen",
    "q": "Depuis le 1er janvier 2024, à partir de quel âge peut-on obtenir le permis B ?",
    "o": [
      "17 ans",
      "16 ans",
      "18 ans",
      "15 ans"
    ],
    "e": "Le permis B peut être obtenu dès 17 ans depuis le 1er janvier 2024, et permet alors de conduire seul."
  },
  "179": {
    "t": "Permis et examen",
    "q": "Avec le permis B, quel est le poids total autorisé en charge (PTAC) maximal du véhicule que vous pouvez conduire ?",
    "o": [
      "3,5 tonnes",
      "2,5 tonnes",
      "5 tonnes",
      "7,5 tonnes"
    ],
    "e": "Le permis B permet de conduire des véhicules dont le PTAC ne dépasse pas 3,5 tonnes."
  },
  "180": {
    "t": "Permis et examen",
    "q": "Avec le permis B seul, quelle remorque pouvez-vous atteler sans autre condition ?",
    "o": [
      "Une remorque dont le PTAC ne dépasse pas 750 kg",
      "Une remorque de 2 tonnes",
      "N’importe quelle remorque",
      "Une remorque de 3,5 tonnes"
    ],
    "e": "Avec le permis B, on peut tracter une remorque de PTAC inférieur ou égal à 750 kg. Au-delà, l’ensemble ne doit pas dépasser 3,5 tonnes."
  },
  "181": {
    "t": "Permis et examen",
    "q": "Avec un permis B, que faut-il pour tracter un ensemble voiture et remorque de plus de 3,5 tonnes, sans dépasser 4,25 tonnes ?",
    "o": [
      "Suivre la formation B96",
      "Rien, le permis B suffit",
      "Avoir 3 ans de permis",
      "Passer une visite médicale"
    ],
    "e": "La formation B96 (mention 96 sur le permis) permet de tracter un ensemble dont le PTAC est compris entre 3,5 et 4,25 tonnes."
  },
  "182": {
    "t": "Permis et examen",
    "q": "Avec un permis B, à quelles conditions pouvez-vous conduire une moto légère de 125 cm³ ?",
    "o": [
      "Avoir le permis B depuis au moins 2 ans et suivre une formation de 7 heures",
      "Aucune condition, dès l’obtention du permis B",
      "Avoir le permis B depuis 6 mois",
      "Passer un nouvel examen du code"
    ],
    "e": "Il faut être titulaire du permis B depuis au moins 2 ans et suivre une formation de 7 heures en école de conduite."
  },
  "183": {
    "t": "Permis et examen",
    "q": "Après une conduite accompagnée, combien de points gagne chaque année un jeune conducteur qui ne commet pas d’infraction ?",
    "o": [
      "3 points",
      "1 point",
      "2 points",
      "6 points"
    ],
    "e": "Après un apprentissage anticipé, le permis passe de 6 à 9 puis 12 points en 2 ans. Après une formation classique, c’est 2 points par an pendant 3 ans."
  },
  "184": {
    "t": "Permis et examen",
    "q": "Combien de points peut-on récupérer au maximum en suivant un stage de sensibilisation à la sécurité routière ?",
    "o": [
      "4 points",
      "2 points",
      "6 points",
      "12 points"
    ],
    "e": "Un stage de récupération de points permet de récupérer jusqu’à 4 points, dans la limite de 12 points, et au maximum une fois par an."
  },
  "185": {
    "t": "Permis et examen",
    "q": "Pendant votre période probatoire, vous perdez 3 points ou plus en une seule infraction. Que devez-vous faire ?",
    "o": [
      "Suivre un stage de sensibilisation obligatoire dans les 4 mois",
      "Repasser l’examen du code",
      "Rien, si votre solde reste positif",
      "Repasser l’examen de conduite"
    ],
    "e": "En période probatoire, un retrait d’au moins 3 points oblige à suivre un stage de sensibilisation dans un délai de 4 mois."
  },
  "186": {
    "t": "Permis et examen",
    "q": "Vous perdez 1 point pour une petite infraction. Au bout de combien de temps le récupérez-vous si vous ne commettez aucune autre infraction ?",
    "o": [
      "6 mois",
      "1 mois",
      "3 ans",
      "10 ans"
    ],
    "e": "Un point retiré pour une infraction ne coûtant qu’un point est récupéré automatiquement après 6 mois sans nouvelle infraction."
  },
  "187": {
    "t": "Permis et examen",
    "q": "Que se passe-t-il quand le solde de points de votre permis tombe à zéro ?",
    "o": [
      "Le permis est invalidé et vous devez le restituer",
      "Vous récupérez automatiquement 6 points",
      "Vous recevez un simple avertissement",
      "Vous pouvez continuer à conduire en période probatoire"
    ],
    "e": "À zéro point, le permis perd sa validité : il faut le rendre, attendre au moins 6 mois puis repasser le permis."
  },
  "188": {
    "t": "Permis et examen",
    "q": "Si vous commettez plusieurs infractions en même temps, combien de points pouvez-vous perdre au maximum ?",
    "o": [
      "8 points",
      "6 points",
      "10 points",
      "12 points"
    ],
    "e": "En cas d’infractions simultanées, le retrait de points est plafonné à 8 points."
  },
  "189": {
    "t": "Permis et examen",
    "q": "Où le disque « A » des jeunes conducteurs doit-il être placé ?",
    "o": [
      "À l’arrière du véhicule",
      "Sur le pare-brise",
      "Sur le capot",
      "Sur la portière du conducteur"
    ],
    "e": "Le disque « A » se place à l’arrière du véhicule pour que les autres usagers sachent qu’il s’agit d’un jeune conducteur."
  },
  "190": {
    "t": "Permis et examen",
    "q": "En conduite accompagnée (AAC), combien de kilomètres faut-il parcourir au minimum ?",
    "o": [
      "3 000 km",
      "500 km",
      "1 000 km",
      "10 000 km"
    ],
    "e": "L’apprentissage anticipé de la conduite impose au moins 3 000 km parcourus avec l’accompagnateur."
  },
  "191": {
    "t": "Permis et examen",
    "q": "Pendant la conduite accompagnée, combien de rendez-vous pédagogiques sont obligatoires avec l’école de conduite ?",
    "o": [
      "2",
      "1",
      "4",
      "6"
    ],
    "e": "La conduite accompagnée comprend deux rendez-vous pédagogiques obligatoires avec l’enseignant, pour faire le point sur la progression."
  },
  "192": {
    "t": "Permis et examen",
    "q": "Quelle condition l’accompagnateur doit-il remplir en conduite accompagnée ?",
    "o": [
      "Être titulaire du permis B depuis au moins 5 ans sans interruption",
      "Avoir le permis B depuis au moins 1 an",
      "Être obligatoirement un parent de l’élève",
      "Être moniteur d’auto-école"
    ],
    "e": "L’accompagnateur doit avoir le permis B depuis au moins 5 ans sans interruption, et l’assureur doit avoir donné son accord."
  },
  "193": {
    "t": "Permis et examen",
    "q": "En conduite accompagnée, quel document l’apprenti conducteur doit-il avoir avec lui ?",
    "o": [
      "Le livret d’apprentissage",
      "Son relevé de points",
      "Son diplôme scolaire",
      "La facture de l’auto-école"
    ],
    "e": "Le livret d’apprentissage doit être présenté en cas de contrôle : il prouve que l’élève est autorisé à conduire avec son accompagnateur."
  },
  "194": {
    "t": "Permis et examen",
    "q": "Lors d’un contrôle routier, quels documents devez-vous présenter ?",
    "o": [
      "Votre permis de conduire et le certificat d’immatriculation du véhicule",
      "Uniquement votre carte d’identité",
      "Le carnet d’entretien du véhicule",
      "La facture d’achat du véhicule"
    ],
    "e": "Le conducteur doit présenter son permis de conduire et le certificat d’immatriculation (carte grise) du véhicule."
  },
  "195": {
    "t": "Permis et examen",
    "q": "Depuis le 1er avril 2024, devez-vous coller une vignette verte d’assurance sur votre pare-brise ?",
    "o": [
      "Non, elle a été supprimée : l’assurance est vérifiée dans un fichier",
      "Oui, sinon vous n’êtes pas assuré",
      "Oui, mais seulement pour les voitures neuves",
      "Oui, sur la vitre arrière"
    ],
    "e": "La vignette et la carte verte ont été supprimées. Les forces de l’ordre vérifient l’assurance grâce au fichier des véhicules assurés."
  },
  "196": {
    "t": "Permis et examen",
    "q": "Quelle assurance est obligatoire au minimum pour circuler avec une voiture ?",
    "o": [
      "La responsabilité civile, appelée assurance « au tiers »",
      "L’assurance tous risques",
      "L’assurance contre le vol",
      "L’assurance bris de glace"
    ],
    "e": "La responsabilité civile est obligatoire : elle indemnise les dommages causés aux autres. Les autres garanties sont facultatives."
  },
  "197": {
    "t": "Permis et examen",
    "q": "À l’examen du code, de combien de temps disposez-vous pour répondre à chaque question ?",
    "o": [
      "20 secondes",
      "5 secondes",
      "1 minute",
      "2 minutes"
    ],
    "e": "Chaque question de l’examen du code doit être traitée en 20 secondes."
  },
  "198": {
    "t": "Permis et examen",
    "q": "À l’épreuve pratique du permis B, quel score minimal faut-il obtenir ?",
    "o": [
      "20 points sur 31, sans faute éliminatoire",
      "15 points sur 31",
      "31 points sur 31",
      "35 points sur 40"
    ],
    "e": "L’inspecteur évalue la conduite sur 31 points : il faut au moins 20 points et aucune erreur éliminatoire."
  },
  "199": {
    "t": "Permis et examen",
    "q": "Quel est le nombre minimal d’heures de conduite à suivre en école de conduite pour le permis B sur boîte manuelle ?",
    "o": [
      "20 heures",
      "10 heures",
      "30 heures",
      "40 heures"
    ],
    "e": "La formation au permis B comprend au minimum 20 heures de conduite (13 heures pour la boîte automatique)."
  },
  "200": {
    "t": "Permis et examen",
    "q": "Vous avez obtenu le permis B sur boîte automatique. Comment pouvoir conduire une voiture à boîte manuelle ?",
    "o": [
      "Suivre une formation de 7 heures en école de conduite, au moins 3 mois après l’obtention du permis",
      "Repasser entièrement l’examen pratique",
      "Attendre la fin de la période probatoire, sans formation",
      "Rien, le permis B autorise directement la boîte manuelle"
    ],
    "e": "Le permis obtenu sur boîte automatique porte la mention 78. Une formation de 7 heures, au moins 3 mois après le permis, permet de lever cette restriction."
  },
  "201": {
    "t": "Permis et examen",
    "q": "Le permis de conduire au format carte bancaire doit être renouvelé tous les…",
    "o": [
      "15 ans",
      "5 ans",
      "10 ans",
      "20 ans"
    ],
    "e": "Le titre a une validité administrative de 15 ans. Son renouvellement est une simple formalité : on ne repasse pas l’examen."
  },
  "202": {
    "t": "Véhicule et équipements",
    "q": "En roulant, un voyant rouge s’allume au tableau de bord. Que signifie en général cette couleur ?",
    "o": [
      "Une anomalie grave : il faut s’arrêter dès que possible",
      "Un équipement qui fonctionne normalement",
      "Un entretien à prévoir dans quelques mois",
      "Que les feux de route sont allumés"
    ],
    "e": "Un voyant rouge signale un danger ou une panne grave. On s’arrête dès que possible, en sécurité, et on consulte la notice."
  },
  "203": {
    "t": "Véhicule et équipements",
    "q": "Un voyant bleu en forme de phare, avec des traits horizontaux, s’allume au tableau de bord. Que signifie-t-il ?",
    "o": [
      "Les feux de route sont allumés",
      "Les feux de croisement sont allumés",
      "Les feux antibrouillard arrière sont allumés",
      "Une ampoule est grillée"
    ],
    "e": "Le voyant bleu indique les feux de route. Pensez à les éteindre dès que vous croisez ou suivez un autre usager."
  },
  "204": {
    "t": "Véhicule et équipements",
    "q": "Le voyant rouge en forme de burette d’huile s’allume en roulant. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez dès que possible en sécurité et coupez le moteur",
      "Vous continuez et vous verrez au prochain entretien",
      "Vous accélérez pour faire monter la pression",
      "Vous attendez qu’il s’éteigne tout seul"
    ],
    "e": "Ce voyant signale un manque de pression d’huile. Continuer à rouler peut détruire le moteur."
  },
  "205": {
    "t": "Véhicule et équipements",
    "q": "Le moteur a surchauffé. Pourquoi ne faut-il pas ouvrir tout de suite le bouchon du circuit de refroidissement ?",
    "o": [
      "Le liquide chaud et sous pression peut vous brûler",
      "Le moteur risque de caler",
      "Le liquide va geler",
      "Cela vide la batterie"
    ],
    "e": "Moteur chaud, le liquide de refroidissement est sous pression. On attend que le moteur refroidisse avant d’ouvrir."
  },
  "206": {
    "t": "Véhicule et équipements",
    "q": "De jour, il pleut fortement et la visibilité baisse. Quels feux allumez-vous ?",
    "o": [
      "Les feux de croisement",
      "Les feux de route",
      "Les feux antibrouillard arrière",
      "Les feux de détresse"
    ],
    "e": "Par mauvaise visibilité, même de jour, on allume les feux de croisement. Les antibrouillard arrière sont interdits par simple pluie."
  },
  "207": {
    "t": "Véhicule et équipements",
    "q": "La nuit, hors agglomération, vous roulez en feux de route. Un véhicule arrive en face. Que faites-vous ?",
    "o": [
      "Vous passez en feux de croisement",
      "Vous gardez vos feux de route",
      "Vous éteignez tous vos feux",
      "Vous allumez vos feux de détresse"
    ],
    "e": "Les feux de route éblouissent. On passe en feux de croisement quand on croise ou qu’on suit un autre usager."
  },
  "208": {
    "t": "Véhicule et équipements",
    "q": "Dans quel cas allumez-vous vos feux de détresse ?",
    "o": [
      "Votre voiture est immobilisée en panne sur la chaussée",
      "Vous vous arrêtez en double file pour une course rapide",
      "Vous voulez remercier un autre conducteur",
      "Vous roulez sous une pluie légère"
    ],
    "e": "Les feux de détresse signalent un danger : véhicule immobilisé, ou ralentissement brutal. Ils n’autorisent pas un arrêt interdit."
  },
  "209": {
    "t": "Véhicule et équipements",
    "q": "Sur autoroute, vous arrivez sur un bouchon et ralentissez fortement. Comment prévenir ceux qui vous suivent ?",
    "o": [
      "Vous allumez brièvement vos feux de détresse",
      "Vous klaxonnez longuement",
      "Vous changez de voie rapidement",
      "Vous allumez vos feux antibrouillard arrière"
    ],
    "e": "Les feux de détresse peuvent être utilisés pour avertir d’un ralentissement important. On les éteint une fois l’allure stabilisée."
  },
  "210": {
    "t": "Véhicule et équipements",
    "q": "À quoi servent principalement les feux de position ?",
    "o": [
      "À être vu des autres usagers",
      "À éclairer la route loin devant",
      "À signaler une panne",
      "À remplacer les feux de croisement la nuit hors agglomération"
    ],
    "e": "Les feux de position permettent d’être vu, pas de voir. Hors agglomération la nuit, ils ne suffisent pas."
  },
  "211": {
    "t": "Véhicule et équipements",
    "q": "Quelle distance minimale les feux de route doivent-ils éclairer ?",
    "o": [
      "100 mètres",
      "30 mètres",
      "10 mètres",
      "1 kilomètre"
    ],
    "e": "Les feux de route éclairent au moins 100 mètres, les feux de croisement environ 30 mètres."
  },
  "212": {
    "t": "Véhicule et équipements",
    "q": "La nuit, vous êtes ébloui par les feux d’un véhicule qui arrive en face. Que faites-vous ?",
    "o": [
      "Vous regardez vers le bord droit de la route et ralentissez",
      "Vous allumez vos feux de route pour lui répondre",
      "Vous fixez ses phares",
      "Vous accélérez pour le croiser plus vite"
    ],
    "e": "Regarder le bord droit de la chaussée limite l’éblouissement. On ralentit, car on voit moins bien."
  },
  "213": {
    "t": "Véhicule et équipements",
    "q": "Quand faut-il contrôler la pression des pneus ?",
    "o": [
      "Pneus froids, au moins une fois par mois",
      "Juste après un long trajet sur autoroute",
      "Seulement lors du contrôle technique",
      "Jamais, si les pneus sont neufs"
    ],
    "e": "La pression se mesure à froid : après avoir roulé, les pneus chauffent et la mesure est faussée."
  },
  "214": {
    "t": "Véhicule et équipements",
    "q": "Quelle est une conséquence de pneus sous-gonflés ?",
    "o": [
      "Une consommation de carburant et une usure plus importantes",
      "Un freinage plus court",
      "Une meilleure tenue de route",
      "Une consommation plus faible"
    ],
    "e": "Un pneu sous-gonflé chauffe, s’use plus vite, augmente la consommation et dégrade la tenue de route."
  },
  "215": {
    "t": "Véhicule et équipements",
    "q": "Vous partez en vacances avec une voiture très chargée. Que faites-vous pour les pneus ?",
    "o": [
      "Vous adaptez leur pression à la charge, selon les indications du constructeur",
      "Vous les dégonflez un peu pour plus de confort",
      "Vous ne changez rien",
      "Vous les gonflez à la pression maximale inscrite sur le flanc"
    ],
    "e": "Le constructeur indique les pressions à respecter selon la charge, souvent sur la portière ou la trappe à carburant."
  },
  "216": {
    "t": "Véhicule et équipements",
    "q": "Le coffre de votre voiture est très chargé. Quel réglage pensez-vous à faire ?",
    "o": [
      "Abaisser la hauteur des feux pour ne pas éblouir",
      "Remonter les feux au maximum",
      "Allumer les feux antibrouillard",
      "Aucun, les feux ne sont pas concernés"
    ],
    "e": "Chargée à l’arrière, la voiture lève le nez et les feux éclairent plus haut. On corrige leur hauteur."
  },
  "217": {
    "t": "Véhicule et équipements",
    "q": "Quand réglez-vous vos rétroviseurs ?",
    "o": [
      "Avant de démarrer, une fois bien installé",
      "En roulant, au premier virage",
      "Seulement une fois par an",
      "Seulement avant de prendre l’autoroute"
    ],
    "e": "On règle siège, volant et rétroviseurs à l’arrêt, avant de partir. Le faire en roulant détourne l’attention."
  },
  "218": {
    "t": "Véhicule et équipements",
    "q": "Qu’appelle-t-on l’angle mort ?",
    "o": [
      "Une zone autour du véhicule que les rétroviseurs ne montrent pas",
      "La zone éclairée par les feux de croisement",
      "Un virage très serré",
      "La distance parcourue pendant le temps de réaction"
    ],
    "e": "Pour le contrôler, on tourne brièvement la tête avant de changer de direction ou de voie."
  },
  "219": {
    "t": "Véhicule et équipements",
    "q": "Sur un même essieu, les deux pneus doivent…",
    "o": [
      "Être de même dimension et de même type",
      "Être de marques différentes",
      "Avoir des pressions différentes",
      "Être l’un neuf et l’autre usé"
    ],
    "e": "Deux pneus différents sur un même essieu déséquilibrent le véhicule, surtout au freinage."
  },
  "220": {
    "t": "Véhicule et équipements",
    "q": "Une remorque est dite « légère » quand son PTAC ne dépasse pas…",
    "o": [
      "750 kg",
      "500 kg",
      "1 000 kg",
      "3 500 kg"
    ],
    "e": "Le PTAC est le poids total autorisé en charge. Une remorque légère ne dépasse pas 750 kg."
  },
  "221": {
    "t": "Véhicule et équipements",
    "q": "Vous tractez une remorque qui cache les feux arrière de votre voiture. Que doit-elle avoir ?",
    "o": [
      "Ses propres feux arrière, feux stop, clignotants et une plaque d’immatriculation",
      "Seulement un triangle rouge",
      "Rien, la voiture suffit",
      "Seulement des feux de position"
    ],
    "e": "Les autres usagers doivent voir vos signaux et votre plaque : la remorque reprend ces équipements à l’arrière."
  },
  "222": {
    "t": "Véhicule et équipements",
    "q": "Pourquoi faut-il ranger ou arrimer les objets lourds dans la voiture ?",
    "o": [
      "En cas de choc, ils sont projetés avec une grande force",
      "Pour que la voiture consomme plus",
      "Pour passer le contrôle technique",
      "Cela n’a aucune importance"
    ],
    "e": "Lors d’un choc, un objet non attaché est projeté vers l’avant et peut blesser gravement les occupants."
  },
  "223": {
    "t": "Véhicule et équipements",
    "q": "Vous ne vous servez plus de votre coffre de toit. Que faites-vous pour consommer moins ?",
    "o": [
      "Vous le retirez",
      "Vous le laissez, cela ne change rien",
      "Vous roulez plus vite pour compenser",
      "Vous gonflez moins les pneus"
    ],
    "e": "Un coffre ou des barres de toit augmentent la résistance à l’air, donc la consommation."
  },
  "224": {
    "t": "Véhicule et équipements",
    "q": "Pour consommer moins de carburant, comment utilisez-vous les vitesses ?",
    "o": [
      "Vous passez assez tôt le rapport supérieur",
      "Vous restez en 2e le plus longtemps possible",
      "Vous faites monter le moteur dans les tours à chaque rapport",
      "Vous roulez toujours au point mort en descente"
    ],
    "e": "Rouler à régime modéré, en montant tôt les rapports, réduit la consommation et la pollution."
  },
  "225": {
    "t": "Véhicule et équipements",
    "q": "Par temps froid, faut-il laisser chauffer le moteur à l’arrêt avant de partir ?",
    "o": [
      "Non, il vaut mieux partir rapidement en roulant doucement",
      "Oui, au moins dix minutes",
      "Oui, en accélérant fort à l’arrêt",
      "Oui, jusqu’à ce que l’habitacle soit chaud"
    ],
    "e": "Le moteur chauffe plus vite en roulant doucement. Le faire tourner à l’arrêt gaspille du carburant et pollue."
  },
  "226": {
    "t": "Véhicule et équipements",
    "q": "Sur autoroute, rouler à 110 km/h plutôt qu’à 130 km/h…",
    "o": [
      "Réduit nettement la consommation de carburant",
      "Augmente la consommation",
      "Ne change rien à la consommation",
      "Use davantage le moteur"
    ],
    "e": "La résistance de l’air augmente fortement avec la vitesse : rouler un peu moins vite fait économiser du carburant."
  },
  "227": {
    "t": "Accident et secours",
    "q": "Vous arrivez le premier sur un accident. Quel est votre premier geste ?",
    "o": [
      "Allumer vos feux de détresse et vous arrêter en sécurité, si possible après l’accident",
      "Vous arrêter au milieu de la chaussée pour aller voir",
      "Sortir aussitôt votre téléphone pour filmer",
      "Déplacer les victimes vers le bas-côté"
    ],
    "e": "Protéger, c’est d’abord éviter un suraccident : feux de détresse, arrêt en sécurité, gilet avant de sortir."
  },
  "228": {
    "t": "Accident et secours",
    "q": "Sur une route, à quelle distance minimale du véhicule immobilisé placez-vous le triangle de présignalisation ?",
    "o": [
      "30 mètres",
      "5 mètres",
      "1 mètre",
      "500 mètres"
    ],
    "e": "Le triangle se place à au moins 30 mètres en amont, pour prévenir à temps les usagers qui arrivent."
  },
  "229": {
    "t": "Accident et secours",
    "q": "Votre voiture est en panne sur la bande d’arrêt d’urgence d’une autoroute. Où attendez-vous les secours ?",
    "o": [
      "Derrière la glissière de sécurité",
      "Assis dans la voiture",
      "Sur la bande d’arrêt d’urgence, devant la voiture",
      "Sur le terre-plein central"
    ],
    "e": "Les véhicules passent très vite et très près : tous les occupants s’abritent derrière la glissière."
  },
  "230": {
    "t": "Accident et secours",
    "q": "En panne sur la bande d’arrêt d’urgence, par où faites-vous descendre les passagers ?",
    "o": [
      "Par les portières du côté droit",
      "Par les portières du côté gauche",
      "Par le coffre",
      "Peu importe le côté"
    ],
    "e": "Côté gauche, on descend directement près des voies de circulation : c’est très dangereux."
  },
  "231": {
    "t": "Accident et secours",
    "q": "Sur autoroute, quel est l’avantage d’appeler depuis une borne d’appel d’urgence ?",
    "o": [
      "Les secours savent immédiatement où vous êtes",
      "L’appel est plus court",
      "Vous pouvez choisir votre dépanneur",
      "Vous n’avez pas besoin de gilet"
    ],
    "e": "La borne localise automatiquement l’appel. Vous pouvez aussi appeler le 112 en précisant le sens et le point kilométrique."
  },
  "232": {
    "t": "Accident et secours",
    "q": "Sur autoroute, qui peut remorquer votre voiture en panne ?",
    "o": [
      "Un dépanneur agréé pour cette autoroute",
      "N’importe quel ami venu avec une corde",
      "Un autre automobiliste qui passe",
      "Vous-même, en poussant la voiture"
    ],
    "e": "Sur les autoroutes, seuls les dépanneurs agréés peuvent intervenir."
  },
  "233": {
    "t": "Accident et secours",
    "q": "Quel numéro appelez-vous pour joindre les sapeurs-pompiers ?",
    "o": [
      "18",
      "15",
      "17",
      "114"
    ],
    "e": "Le 18 est le numéro des pompiers, le 15 celui du SAMU, le 17 celui de la police ou de la gendarmerie."
  },
  "234": {
    "t": "Accident et secours",
    "q": "Quel numéro d’urgence est destiné aux personnes sourdes ou malentendantes ?",
    "o": [
      "114",
      "17",
      "15",
      "118"
    ],
    "e": "Le 114 permet d’alerter les secours par SMS, visio ou tchat."
  },
  "235": {
    "t": "Accident et secours",
    "q": "Vous appelez les secours. Quand raccrochez-vous ?",
    "o": [
      "Quand votre interlocuteur vous dit de le faire",
      "Dès que vous avez donné l’adresse",
      "Après 30 secondes",
      "Dès que vous entendez une sirène"
    ],
    "e": "L’opérateur peut avoir besoin d’informations ou vous donner des consignes : on ne raccroche que lorsqu’il le demande."
  },
  "236": {
    "t": "Accident et secours",
    "q": "Un blessé saigne abondamment d’une plaie. Que faites-vous ?",
    "o": [
      "Vous appuyez fortement sur la plaie, si possible en protégeant votre main",
      "Vous le faites marcher jusqu’au bas-côté",
      "Vous lui donnez à boire",
      "Vous attendez les secours sans toucher la plaie"
    ],
    "e": "La compression directe arrête la plupart des hémorragies. On la maintient jusqu’à l’arrivée des secours."
  },
  "237": {
    "t": "Accident et secours",
    "q": "Un objet est planté dans la plaie d’un blessé. Que faites-vous ?",
    "o": [
      "Vous ne le retirez pas",
      "Vous le retirez rapidement",
      "Vous l’enfoncez pour qu’il tienne",
      "Vous le tournez pour vérifier la blessure"
    ],
    "e": "Retirer l’objet peut aggraver le saignement. On le laisse en place et on alerte les secours."
  },
  "238": {
    "t": "Accident et secours",
    "q": "Une victime ne répond pas mais respire normalement. Que faites-vous ?",
    "o": [
      "Vous la placez en position latérale de sécurité et faites alerter les secours",
      "Vous la laissez sur le dos sans rien faire",
      "Vous lui faites un massage cardiaque",
      "Vous la faites asseoir"
    ],
    "e": "La PLS évite qu’une victime inconsciente ne s’étouffe avec sa langue ou ses vomissements."
  },
  "239": {
    "t": "Accident et secours",
    "q": "À quoi sert la position latérale de sécurité ?",
    "o": [
      "À garder libres les voies respiratoires d’une victime inconsciente",
      "À relancer le cœur",
      "À arrêter une hémorragie",
      "À transporter la victime"
    ],
    "e": "Sur le côté, la langue ne bascule pas en arrière et les liquides peuvent s’écouler par la bouche."
  },
  "240": {
    "t": "Accident et secours",
    "q": "Comment vérifiez-vous si une victime est consciente ?",
    "o": [
      "Vous lui posez des questions simples et lui demandez de serrer votre main",
      "Vous la secouez violemment",
      "Vous lui jetez de l’eau au visage",
      "Vous lui donnez des gifles"
    ],
    "e": "Si elle ne répond pas et ne réagit à aucun ordre simple, la victime est inconsciente."
  },
  "241": {
    "t": "Accident et secours",
    "q": "Une victime est inconsciente et ne respire pas. Que faites-vous après avoir alerté ?",
    "o": [
      "Vous pratiquez un massage cardiaque et utilisez un défibrillateur",
      "Vous la placez en position latérale de sécurité",
      "Vous attendez les secours sans la toucher",
      "Vous lui donnez à boire"
    ],
    "e": "C’est un arrêt cardiaque : chaque minute compte. Massage cardiaque et défibrillateur augmentent les chances de survie."
  },
  "242": {
    "t": "Accident et secours",
    "q": "Qui peut utiliser un défibrillateur automatisé externe ?",
    "o": [
      "Toute personne, même sans formation",
      "Seulement un médecin",
      "Seulement les pompiers",
      "Seulement une personne diplômée en secourisme"
    ],
    "e": "Le défibrillateur guide l’utilisateur à la voix et ne délivre un choc que si c’est nécessaire."
  },
  "243": {
    "t": "Accident et secours",
    "q": "Lors d’un massage cardiaque sur un adulte, à quel rythme faites-vous les compressions ?",
    "o": [
      "Entre 100 et 120 par minute",
      "Environ 20 par minute",
      "Environ 50 par minute",
      "Plus de 200 par minute"
    ],
    "e": "Le massage doit être rapide, régulier et profond, sans interruption jusqu’à l’arrivée des secours ou la reprise de la respiration."
  },
  "244": {
    "t": "Accident et secours",
    "q": "En attendant les secours, que faites-vous pour un blessé conscient ?",
    "o": [
      "Vous lui parlez, le rassurez, le couvrez et surveillez son état",
      "Vous lui donnez un médicament contre la douleur",
      "Vous le laissez seul pour aller chercher de l’aide plus loin",
      "Vous lui proposez une cigarette pour le calmer"
    ],
    "e": "Le blessé se refroidit vite. Le couvrir, le rassurer et surveiller son état l’aide en attendant les secours."
  },
  "245": {
    "t": "Accident et secours",
    "q": "Un blessé conscient veut se relever après l’accident. Que faites-vous ?",
    "o": [
      "Vous lui conseillez de rester immobile",
      "Vous l’aidez à se mettre debout",
      "Vous l’encouragez à marcher",
      "Vous le faites asseoir dans sa voiture"
    ],
    "e": "Une blessure peut ne pas se voir, notamment au dos ou à la nuque. Mieux vaut ne pas bouger en attendant les secours."
  },
  "246": {
    "t": "Accident et secours",
    "q": "Pour protéger les lieux d’un accident, quel geste faites-vous sur les véhicules accidentés ?",
    "o": [
      "Vous coupez le contact",
      "Vous laissez tourner les moteurs",
      "Vous allumez une cigarette pour patienter",
      "Vous démarrez les véhicules pour les déplacer"
    ],
    "e": "Couper le contact limite le risque d’incendie. On ne fume pas près des véhicules accidentés."
  },
  "247": {
    "t": "Accident et secours",
    "q": "Une fois le constat amiable signé par les deux conducteurs, peut-on le modifier ?",
    "o": [
      "Non, il ne doit plus être modifié",
      "Oui, chacun peut le compléter chez lui",
      "Oui, mais seulement le croquis",
      "Oui, pendant une semaine"
    ],
    "e": "Après signature, le constat ne se modifie plus. On le relit avec soin avant de signer."
  },
  "248": {
    "t": "Accident et secours",
    "q": "Après avoir rempli un constat amiable avec un autre conducteur, que fait chacun ?",
    "o": [
      "Il garde un exemplaire et l’envoie à son assureur",
      "Il le garde chez lui, sans l’envoyer",
      "Il l’envoie à la police",
      "Il le remet à l’autre conducteur"
    ],
    "e": "Le constat comporte deux exemplaires : chaque conducteur transmet le sien à son assureur."
  },
  "249": {
    "t": "Accident et secours",
    "q": "Dans quel délai devez-vous en principe envoyer le constat amiable à votre assureur ?",
    "o": [
      "Dans les 5 jours ouvrés",
      "Dans les 24 heures",
      "Dans les 3 mois",
      "Dans l’année"
    ],
    "e": "Le délai légal minimum de déclaration d’un sinistre est de 5 jours ouvrés, sauf délai plus long prévu par le contrat."
  },
  "250": {
    "t": "Accident et secours",
    "q": "Vous n’êtes pas d’accord avec l’autre conducteur sur les circonstances de l’accident. Que pouvez-vous faire ?",
    "o": [
      "Indiquer votre désaccord dans la rubrique « observations » ou ne pas signer",
      "Signer, puis modifier le constat chez vous",
      "Rayer ce qu’a écrit l’autre conducteur",
      "Partir sans donner vos coordonnées"
    ],
    "e": "Le constat n’est pas obligatoire à signer. Partir sans donner son identité après un accident est un délit de fuite."
  },
  "251": {
    "t": "Accident et secours",
    "q": "Sur le constat amiable, pourquoi indique-t-on le nombre de cases cochées ?",
    "o": [
      "Pour éviter qu’on en ajoute après la signature",
      "Pour calculer le montant des réparations",
      "Pour savoir combien de points seront retirés",
      "Ce n’est pas utile"
    ],
    "e": "Le nombre de cases cochées, noté par chacun, protège contre toute modification ultérieure."
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
