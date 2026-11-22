// Contenu réservé à l'accès complet. Ce fichier reste sur le serveur : il n'est jamais
// servi tel quel au navigateur, seulement par /api/contenu aux élèves dont l'accès est actif.
//
// Les numéros sont la position de la question dans la liste Q de public/index.html, où chaque
// question payante est remplacée par un emplacement {t:'Thème', p:1}. Ne pas renuméroter :
// la progression des élèves est enregistrée par numéro de question.
// Format d'une question : { t: thème, q: question, o: [bonne réponse, autres réponses…], e: explication }

export const QUESTIONS_PREMIUM = {
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
  "65": {
    "t": "Priorités",
    "q": "Un panneau triangulaire à bordure rouge montre une croix noire. Que vous annonce-t-il ?",
    "o": [
      "Une intersection où s’applique la priorité à droite",
      "Une intersection où vous êtes prioritaire",
      "Un passage à niveau sans barrière",
      "Une route barrée"
    ],
    "e": "Ce panneau de danger annonce une intersection où vous devez céder le passage aux véhicules venant de votre droite.",
    "img": {
      "panneau": "AB1"
    }
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
    "e": "Ce panneau annonce une intersection où les usagers de la route croisée doivent vous céder le passage. Il ne vaut que pour cette intersection.",
    "img": {
      "panneau": "AB2"
    }
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
    "e": "Sans signalisation, la priorité à droite s’applique quelle que soit la taille des routes.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250
        }
      ]
    }
  },
  "70": {
    "t": "Priorités",
    "q": "Vous arrivez sur une place à îlot central (rond-point) qui n’est pas signalée comme carrefour à sens giratoire : aucun panneau ni marquage « cédez le passage » à l’entrée. Qui est prioritaire ?",
    "o": [
      "Les véhicules qui entrent sur l’anneau, car ils viennent de la droite",
      "Les véhicules déjà engagés sur l’anneau",
      "Les véhicules les plus gros",
      "Celui qui arrive en premier sur l’anneau"
    ],
    "e": "Seul un carrefour à sens giratoire signalé comme tel donne la priorité aux véhicules qui circulent sur l’anneau. Sur un simple rond-point sans signalisation, la priorité à droite s’applique : ceux qui entrent sont prioritaires."
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
    "e": "Pour tourner à gauche, vous cédez le passage aux véhicules qui arrivent en sens inverse, même si votre feu est vert.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "vert",
        "N": "vert"
      },
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "N",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
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
    "e": "En tournant, vous cédez le passage aux piétons qui traversent la chaussée où vous vous engagez.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "vert"
      },
      "marquages": {
        "E": "pieton"
      },
      "moi": {
        "bras": "S",
        "action": "droite",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "pieton",
          "x": 249,
          "y": 95,
          "traverse": {
            "x": 249,
            "y": 145
          }
        }
      ]
    }
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
    "e": "Selon l’article R415-11 du Code de la route, vous devez céder le passage au piéton qui s’engage ou qui manifeste clairement l’intention de traverser.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "marquages": {
        "S": "pieton"
      },
      "moi": {
        "bras": "S",
        "recul": 22
      },
      "autres": [
        {
          "type": "pieton",
          "x": 205,
          "y": 167
        }
      ]
    }
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
    "e": "Un piéton déjà engagé sur la chaussée doit pouvoir terminer sa traversée en sécurité.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "marquages": {
        "S": [
          "feu",
          "pieton"
        ]
      },
      "feux": {
        "S": "vert"
      },
      "moi": {
        "bras": "S",
        "recul": 25
      },
      "autres": [
        {
          "type": "pieton",
          "x": 170,
          "y": 167,
          "traverse": {
            "x": 135,
            "y": 167
          }
        }
      ]
    }
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
    "e": "En agglomération, il faut faciliter le départ des véhicules de transport en commun qui quittent un arrêt signalé.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "E",
        "x": 300
      },
      "autres": [
        {
          "type": "bus",
          "x": 236,
          "y": 99,
          "dir": "W",
          "couleur": "jaune",
          "clignotant": "gauche"
        }
      ]
    }
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
    "e": "Comme pour un cycliste, vous ne devez pas couper la route d’un usager qui continue tout droit sur sa voie : attendez qu’il soit passé.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "droite",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "trottinette",
          "x": 192,
          "y": 226,
          "dir": "N"
        }
      ]
    }
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
    "e": "Même au vert, on ne s’engage pas dans un carrefour si l’on risque d’y rester bloqué et de gêner la circulation transversale.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "vert"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "couleur": "rouge",
          "x": 175,
          "y": 52,
          "dir": "N",
          "freins": true
        },
        {
          "type": "voiture",
          "couleur": "gris",
          "x": 175,
          "y": 10,
          "dir": "N",
          "freins": true
        }
      ]
    }
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
    "e": "Ce panneau impose de céder le passage à la circulation venant en sens inverse. La flèche rouge, vers le haut, représente votre sens, qui doit attendre.",
    "img": {
      "panneau": "B15"
    }
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
    "e": "Ce panneau carré bleu vous donne la priorité sur la circulation venant en sens inverse. La flèche blanche représente votre sens, la flèche rouge celui qui doit vous céder le passage.",
    "img": {
      "panneau": "C18"
    }
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
    "e": "Le feu orange clignotant n’impose pas l’arrêt : il demande une prudence particulière, et ce sont les panneaux ou la priorité à droite qui s’appliquent.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "orange_clignotant",
        "E": "orange_clignotant",
        "W": "orange_clignotant",
        "N": "orange_clignotant"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      }
    }
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
    "q": "À l’entrée d’une intersection sans feu, une large ligne blanche transversale discontinue est tracée au sol. Que vous indique-t-elle ?",
    "o": [
      "Vous devez céder le passage",
      "Vous devez marquer l’arrêt complet",
      "Vous êtes prioritaire",
      "Vous devez stationner derrière la ligne"
    ],
    "e": "Cette large ligne transversale discontinue complète le « cédez le passage ». Le STOP est complété par une ligne transversale continue. Aux feux, la ligne d’arrêt est aussi discontinue, mais plus fine.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "cedez"
      },
      "moi": {
        "bras": "S",
        "recul": 6
      }
    }
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
    "e": "C’est le panneau de sens interdit : vous ne pouvez pas entrer dans cette voie.",
    "img": {
      "panneau": "B1"
    }
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
    "e": "Ce panneau interdit la circulation de tous les véhicules dans les deux sens.",
    "img": {
      "panneau": "B0"
    }
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
    "e": "Le panneau rond bleu impose une obligation : les cyclistes doivent emprunter cet aménagement, qui n’est pas destiné aux voitures.",
    "img": {
      "panneau": "B22a"
    }
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
    "e": "La croix rouge interdit à la fois l’arrêt et le stationnement. Un seul trait rouge n’interdit que le stationnement.",
    "img": {
      "panneau": "B6d"
    }
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
    "e": "Ce panneau de danger signale la sortie d’une école ou un lieu où des enfants peuvent traverser : ralentissez et redoublez d’attention.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "A13a"
      ]
    }
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
    "e": "Ce panneau marque l’entrée d’une agglomération, où la vitesse est limitée à 50 km/h sauf autre signalisation.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "EB10:VILLENEUVE"
      ]
    }
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
    "e": "La vitesse est limitée à 30 km/h dans toute la zone, jusqu’au panneau de sortie de zone 30.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "B30"
      ]
    }
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
    "e": "Ce panneau d’indication signale une rue à sens unique : les véhicules n’y circulent que dans le sens de la flèche.",
    "img": {
      "panneau": "C12"
    }
  },
  "113": {
    "t": "Vitesse et distances",
    "q": "Vous êtes jeune conducteur en permis probatoire. Quelle est votre vitesse maximale sur autoroute ?",
    "o": [
      "110 km/h",
      "130 km/h",
      "120 km/h",
      "90 km/h"
    ],
    "e": "Pendant la période probatoire, la vitesse est limitée à 110 km/h sur autoroute, même par temps sec (100 km/h sur les sections d’autoroute limitées à moins de 130 km/h)."
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
    "e": "La pluie abaisse les limites de 130, 110 et 90 km/h, mais une route déjà limitée à 80 km/h reste à 80 km/h. Il faut tout de même adapter sa vitesse.",
    "img": {
      "scene": "vue",
      "meteo": "pluie",
      "ligne": "discontinue"
    }
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
    "e": "À 90 km/h, on parcourt environ 25 mètres par seconde : 2 secondes représentent donc environ 50 mètres.",
    "img": {
      "scene": "vue",
      "vehicule_devant": "loin"
    }
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
    "e": "On adapte sa vitesse avant le virage, en ligne droite. Freiner fort dans la courbe risque de déséquilibrer le véhicule.",
    "img": {
      "scene": "vue",
      "virage": "droite",
      "panneau": [
        "A1a"
      ]
    }
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
    "e": "Ce panneau indique une vitesse conseillée. Les vitesses maximales obligatoires sont indiquées par des panneaux ronds à bordure rouge.",
    "img": {
      "scene": "vue",
      "virage": "gauche",
      "panneau": [
        "C4a:70"
      ]
    }
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
    "e": "La nuit, vous voyez moins loin : votre distance d’arrêt doit rester dans la portée de vos feux.",
    "img": {
      "scene": "vue",
      "meteo": "nuit"
    }
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
    "e": "Le vent peut déporter brusquement le véhicule, surtout en sortie de tunnel, sur un pont ou en dépassant un camion.",
    "img": {
      "scene": "vue",
      "panneau": [
        "A24"
      ]
    }
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
    "e": "Pour croiser, chaque conducteur serre à droite autant que le permet la présence des autres usagers, et ralentit si besoin.",
    "img": {
      "scene": "vue",
      "ligne": "aucune",
      "vehicule_face": true
    }
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
    "e": "Pour tourner à gauche sur une route à double sens, on se rapproche de l’axe central, sans le franchir, après avoir mis son clignotant.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "clignotant": "gauche"
      }
    }
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
    "e": "Les feux de route éblouiraient le conducteur devant vous à travers ses rétroviseurs. On passe en feux de croisement quand on suit ou que l’on croise un véhicule.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "vehicule_devant": "proche"
    }
  },
  "153": {
    "t": "Circulation et stationnement",
    "q": "Pouvez-vous stationner sur un emplacement réservé à l’arrêt des bus ?",
    "o": [
      "Non, c’est interdit",
      "Oui, si vous allumez vos feux de détresse",
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
    "q": "Le jour de l’examen du code, que devez-vous présenter avant de commencer l’épreuve ?",
    "o": [
      "Votre convocation et un justificatif d’identité",
      "Votre livret d’apprentissage seulement",
      "La carte grise d’une voiture",
      "Rien, votre nom suffit"
    ],
    "e": "Avant de commencer l’épreuve, vous présentez votre convocation et un justificatif d’identité. Vous répondez ensuite à 40 questions : il faut au moins 35 bonnes réponses."
  },
  "198": {
    "t": "Permis et examen",
    "q": "À l’épreuve pratique du permis B, quel score minimal faut-il obtenir ?",
    "o": [
      "Au moins 20 points, sans erreur éliminatoire",
      "Au moins 15 points, même avec une erreur éliminatoire",
      "Un sans-faute, sans aucun point perdu",
      "35 bonnes réponses sur 40"
    ],
    "e": "Pour être reçu à l’épreuve pratique, il faut obtenir au moins 20 points et ne commettre aucune erreur éliminatoire."
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
      "Suivre une formation d’au moins 7 heures en école de conduite",
      "Repasser entièrement l’examen pratique",
      "Attendre la fin de la période probatoire, sans formation",
      "Rien, le permis B autorise directement la boîte manuelle"
    ],
    "e": "Le permis obtenu sur boîte automatique porte la mention 78. Depuis le 1er mars 2024, une formation d’au moins 7 heures, possible dès l’obtention du permis, permet de lever cette restriction."
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
    "e": "Par mauvaise visibilité, même de jour, on allume les feux de croisement. Les antibrouillard arrière sont interdits par simple pluie.",
    "img": {
      "scene": "vue",
      "meteo": "pluie",
      "vehicule_face": true
    }
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
    "e": "Les feux de route éblouissent. On passe en feux de croisement quand on croise ou qu’on suit un autre usager.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "vehicule_face": true,
      "feux_route": true
    }
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
    "e": "Les feux de route doivent éclairer au moins 100 mètres. Les feux de croisement, eux, doivent éclairer au moins 30 mètres, sans éblouir."
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
    "e": "Regarder le bord droit de la chaussée limite l’éblouissement. On ralentit, car on voit moins bien.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "vehicule_face": true
    }
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
    "q": "Avec le permis B, quel PTAC maximal peut avoir une remorque pour être attelée sans autre condition ?",
    "o": [
      "750 kg",
      "500 kg",
      "1 000 kg",
      "3 500 kg"
    ],
    "e": "Avec le permis B, une remorque de 750 kg de PTAC au plus peut être attelée. Au-delà, la somme des PTAC de la voiture et de la remorque ne doit pas dépasser 3 500 kg."
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
    "e": "La PLS évite qu’une victime inconsciente ne s’étouffe avec sa langue ou ses vomissements. Après un accident, si un traumatisme est possible, alertez d’abord les secours et suivez leurs consignes."
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
  },
  "252": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Un virage à droite",
      "Un virage à gauche",
      "Une obligation de tourner à droite",
      "Une succession de virages"
    ],
    "e": "Ce panneau de danger annonce un seul virage, vers la droite. Il est placé avant le virage pour vous laisser le temps de ralentir.",
    "img": {
      "panneau": "A1a"
    }
  },
  "253": {
    "t": "Panneaux et feux",
    "q": "Que vous annonce ce panneau ?",
    "o": [
      "Plusieurs virages, dont le premier est à droite",
      "Plusieurs virages, dont le premier est à gauche",
      "Un seul virage, à droite",
      "Une route sinueuse interdite aux camions"
    ],
    "e": "La flèche en zigzag annonce une succession de virages. Son premier coude indique le sens du premier virage : ici, à droite.",
    "img": {
      "panneau": "A1c"
    }
  },
  "254": {
    "t": "Panneaux et feux",
    "q": "Vous voyez ce panneau. Que faites-vous ?",
    "o": [
      "Vous adaptez votre vitesse avant le virage à gauche qu’il annonce",
      "Vous accélérez pour sortir plus vite du virage",
      "Vous vous préparez à tourner à gauche à la prochaine intersection",
      "Vous gardez votre vitesse, car ce panneau ne vise que les camions"
    ],
    "e": "Ce panneau de danger annonce un virage à gauche. Il vous prévient à l’avance : ralentissez avant d’entrer dans le virage.",
    "img": {
      "scene": "vue",
      "virage": "gauche",
      "ligne": "continue",
      "panneau": [
        "A1b"
      ]
    }
  },
  "255": {
    "t": "Panneaux et feux",
    "q": "Ces deux panneaux sont placés sur le même poteau. Que vous annoncent-ils ?",
    "o": [
      "Un ralentisseur, avec une vitesse limitée à 30 km/h",
      "Une chaussée déformée, avec une vitesse conseillée de 30 km/h",
      "Le début d’une zone 30 après la bosse",
      "Un ralentisseur, à franchir à 30 km/h au minimum"
    ],
    "e": "Le triangle annonce un ralentisseur de type dos-d’âne. Le panneau rond à bordure rouge qui l’accompagne limite la vitesse à 30 km/h : c’est une obligation.",
    "img": {
      "panneaux": [
        "A2b",
        "B14:30"
      ]
    }
  },
  "256": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "La chaussée se rétrécit",
      "La chaussée s’élargit",
      "Une route à double sens commence",
      "Un pont mobile"
    ],
    "e": "Ce panneau de danger annonce un rétrécissement de la chaussée. Ralentissez et serrez à droite, surtout si un véhicule arrive en face.",
    "img": {
      "panneau": "A3"
    }
  },
  "257": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "La chaussée peut être particulièrement glissante",
      "La route est en mauvais état, avec des trous",
      "Une piste de dérapage contrôlé",
      "Un virage dangereux"
    ],
    "e": "Ce panneau annonce une section de chaussée particulièrement glissante. Réduisez votre vitesse et évitez les freinages brusques.",
    "img": {
      "panneau": "A4"
    }
  },
  "258": {
    "t": "Panneaux et feux",
    "q": "Que vous annonce ce panneau ?",
    "o": [
      "Un passage à niveau muni de barrières",
      "Un passage à niveau sans barrière",
      "Une barrière de péage",
      "Une route fermée par des travaux"
    ],
    "e": "Le dessin de barrière annonce un passage à niveau équipé de barrières ou de demi-barrières.",
    "img": {
      "panneau": "A7"
    }
  },
  "259": {
    "t": "Panneaux et feux",
    "q": "Que vous annonce ce panneau ?",
    "o": [
      "Un passage à niveau sans barrière",
      "Un passage à niveau muni de barrières",
      "Une gare",
      "Une traversée de voies de tramway"
    ],
    "e": "La locomotive annonce un passage à niveau sans barrières ni demi-barrières. Redoublez de prudence : rien ne vous bloquera le passage.",
    "img": {
      "panneau": "A8"
    }
  },
  "260": {
    "t": "Panneaux et feux",
    "q": "Ces deux panneaux concernent le même passage pour piétons. Où sont-ils placés ?",
    "o": [
      "Le triangle l’annonce à l’avance ; le carré bleu est placé au niveau du passage",
      "Tous les deux sont placés au niveau du passage",
      "Le carré bleu l’annonce à l’avance ; le triangle est placé au niveau du passage",
      "Tous les deux sont placés 150 m avant le passage"
    ],
    "e": "Le panneau de danger triangulaire annonce le passage pour piétons à l’avance. Le panneau carré bleu est placé à l’endroit même du passage.",
    "img": {
      "panneaux": [
        "A13b",
        "C20a"
      ]
    }
  },
  "261": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Un danger d’un autre type, souvent précisé par un panonceau",
      "Un danger sans gravité",
      "Une interdiction générale",
      "La fin de tous les dangers"
    ],
    "e": "Ce panneau signale un danger qui n’a pas de symbole propre (sortie d’usine, risque d’inondation…). Un panonceau en précise souvent la nature. Il n’indique pas que le danger est faible.",
    "img": {
      "panneau": "A14"
    }
  },
  "262": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Des animaux domestiques peuvent traverser la route",
      "Une ferme vend ses produits plus loin",
      "La route est interdite aux animaux",
      "Un marché aux bestiaux"
    ],
    "e": "Ce panneau annonce une zone où des animaux domestiques, comme des vaches, peuvent traverser la chaussée. Ralentissez.",
    "img": {
      "panneau": "A15a1"
    }
  },
  "263": {
    "t": "Panneaux et feux",
    "q": "Que vous annonce ce panneau ?",
    "o": [
      "Des feux tricolores, plus loin",
      "Un feu tricolore en panne",
      "Un passage à niveau",
      "Un carrefour à sens giratoire"
    ],
    "e": "Ce panneau annonce des feux tricolores, pour qu’ils ne vous surprennent pas. Préparez-vous à vous arrêter.",
    "img": {
      "panneau": "A17"
    }
  },
  "264": {
    "t": "Panneaux et feux",
    "q": "Vous circuliez sur une chaussée à sens unique et vous voyez ce panneau. Que signifie-t-il ?",
    "o": [
      "La circulation se fait désormais dans les deux sens",
      "Vous devez céder le passage aux véhicules venant en face",
      "Vous êtes prioritaire sur les véhicules venant en face",
      "La route passe à deux voies dans votre sens"
    ],
    "e": "Ce panneau de danger signale la fin du sens unique : des véhicules peuvent maintenant arriver en face.",
    "img": {
      "panneau": "A18"
    }
  },
  "265": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Des cyclistes peuvent déboucher de la droite ou de la gauche",
      "Une piste cyclable obligatoire pour les cyclistes",
      "La route est interdite aux cycles",
      "Une course cycliste a lieu aujourd’hui"
    ],
    "e": "Ce panneau de danger annonce l’endroit où des cyclistes venant d’une piste ou d’une bande cyclable peuvent couper ou rejoindre la route.",
    "img": {
      "panneau": "A21"
    }
  },
  "266": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Du vent latéral",
      "Des avions qui passent à basse altitude",
      "Un poste de douane",
      "Une zone de travaux"
    ],
    "e": "La manche à air annonce un endroit exposé au vent de côté. Tenez fermement le volant, surtout en dépassant ou en sortant d’un abri.",
    "img": {
      "panneau": "A24"
    }
  },
  "267": {
    "t": "Panneaux et feux",
    "q": "En agglomération, à quelle distance environ du danger un panneau de danger est-il placé en général ?",
    "o": [
      "50 mètres",
      "150 mètres",
      "300 mètres",
      "500 mètres"
    ],
    "e": "En agglomération, un panneau de danger est placé en général à 50 m environ du danger. Hors agglomération, c’est environ 150 m.",
    "img": {
      "scene": "vue",
      "ville": true,
      "ligne": "discontinue",
      "panneau": [
        "A13a"
      ]
    }
  },
  "268": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue et vous allez tout droit. Ce panneau annonçait l’intersection. Une voiture rouge arrive par la droite. Qui passe en premier ?",
    "o": [
      "La voiture rouge",
      "Vous, car vous allez tout droit",
      "Vous, si vous êtes arrivé le premier",
      "Celui qui roule le plus vite"
    ],
    "e": "Le panneau triangulaire avec une croix annonce une intersection où vous devez céder le passage aux véhicules venant de votre droite.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axe": "discontinue",
      "panneaux": [
        {
          "code": "AB1",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
  },
  "269": {
    "t": "Priorités",
    "q": "Vous venez de passer ce panneau. À l’intersection qu’il annonce, une voiture arrive d’une route à votre droite. Qui passe en premier ?",
    "o": [
      "Vous, car les usagers de cette route doivent vous céder le passage",
      "La voiture, car elle vient de votre droite",
      "Celui qui arrive le premier",
      "La voiture, si elle a mis son clignotant"
    ],
    "e": "Ce panneau annonce une intersection où vous êtes prioritaire : les usagers des routes rencontrées doivent vous céder le passage. Cela ne vaut que pour cette intersection.",
    "img": {
      "panneau": "AB2"
    }
  },
  "270": {
    "t": "Priorités",
    "q": "Vous arrivez à ce panneau. Personne ne circule sur la route que vous allez emprunter. Que faites-vous ?",
    "o": [
      "Vous pouvez passer sans vous arrêter, après avoir bien regardé",
      "Vous devez marquer un arrêt complet",
      "Vous attendez qu’un véhicule passe sur l’autre route",
      "Vous klaxonnez avant de passer"
    ],
    "e": "Le « cédez le passage » vous oblige à laisser passer les usagers de l’autre route, mais pas à vous arrêter si personne ne vient.",
    "img": {
      "panneau": "AB3a"
    }
  },
  "271": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue, arrivée au STOP. Une voiture rouge arrive par la gauche. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez à la ligne et vous la laissez passer",
      "Vous passez, car elle vient de votre gauche",
      "Vous ralentissez et vous passez avant elle",
      "Vous vous arrêtez seulement si elle klaxonne"
    ],
    "e": "Au STOP, vous marquez l’arrêt et vous cédez le passage à tous les usagers de la route rencontrée, qu’ils viennent de gauche ou de droite.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axe": "discontinue",
      "marquages": {
        "S": [
          "stop"
        ]
      },
      "panneaux": [
        {
          "code": "AB4",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "recul": 20
        }
      ]
    }
  },
  "272": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue, sur une route signalée par le panneau jaune. Les rues de côté ont un « cédez le passage ». Une voiture rouge arrive par la droite. Qui passe en premier ?",
    "o": [
      "Vous, en restant attentif",
      "La voiture rouge, car elle vient de votre droite",
      "Celui qui arrive le premier",
      "La voiture rouge, car elle va tout droit"
    ],
    "e": "Le panneau jaune en losange indique une route prioritaire. Les rues qui la croisent ont un « cédez le passage » : leurs usagers doivent vous laisser passer.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axe": "discontinue",
      "marquages": {
        "E": [
          "cedez"
        ],
        "W": [
          "cedez"
        ]
      },
      "panneaux": [
        {
          "code": "AB6",
          "bras": "S"
        },
        {
          "code": "AB3a",
          "bras": "E"
        },
        {
          "code": "AB3a",
          "bras": "W"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
  },
  "273": {
    "t": "Priorités",
    "q": "Vous voyez ce panneau, sans panonceau de distance. À partir d’où perdez-vous la priorité ?",
    "o": [
      "Au prochain carrefour",
      "Dès le panneau, et sur 1 km seulement",
      "À la sortie de l’agglomération",
      "Vous ne la perdez pas : ce panneau annonce une route prioritaire"
    ],
    "e": "Le losange barré annonce la fin de la route prioritaire. Sans panonceau, la perte de priorité a lieu au prochain carrefour.",
    "img": {
      "panneau": "AB7"
    }
  },
  "274": {
    "t": "Priorités",
    "q": "Que vous annonce ce panneau ?",
    "o": [
      "Un carrefour à sens giratoire, où vous céderez le passage aux véhicules déjà sur l’anneau",
      "Un carrefour à sens giratoire, où vous serez prioritaire en entrant",
      "Un demi-tour obligatoire",
      "Une déviation due à des travaux"
    ],
    "e": "Ce panneau annonce un carrefour à sens giratoire. À l’entrée, vous cédez le passage aux usagers qui circulent déjà sur l’anneau.",
    "img": {
      "panneau": "AB25"
    }
  },
  "275": {
    "t": "Priorités",
    "q": "Lequel de ces deux panneaux vous oblige à céder le passage aux véhicules venant de votre droite ?",
    "o": [
      "Celui de gauche, avec la croix",
      "Celui de droite, avec le trait vertical",
      "Les deux",
      "Aucun des deux"
    ],
    "e": "La croix (à gauche) annonce une intersection à priorité à droite. Le trait vertical coupé (à droite) annonce au contraire une intersection où vous êtes prioritaire.",
    "img": {
      "panneaux": [
        "AB1",
        "AB2"
      ]
    }
  },
  "276": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Interdiction de tourner à gauche à la prochaine intersection",
      "Obligation de tourner à gauche",
      "Interdiction de faire demi-tour",
      "Virage à gauche dangereux"
    ],
    "e": "Ce panneau rond à bordure rouge, avec une flèche barrée, interdit de tourner à gauche à la prochaine intersection.",
    "img": {
      "panneau": "B2a"
    }
  },
  "277": {
    "t": "Panneaux et feux",
    "q": "Ce panneau vous interdit de tourner à droite. Où s’applique cette interdiction ?",
    "o": [
      "À la prochaine intersection",
      "Jusqu’à la sortie de l’agglomération",
      "Sur 1 km",
      "À toutes les intersections, jusqu’à un panneau de fin"
    ],
    "e": "L’interdiction de tourner ne vaut que pour la prochaine intersection.",
    "img": {
      "panneau": "B2b"
    }
  },
  "278": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Interdiction de faire demi-tour jusqu’à la prochaine intersection incluse",
      "Obligation de faire demi-tour",
      "Interdiction de tourner à gauche seulement",
      "Route sans issue"
    ],
    "e": "Ce panneau interdit le demi-tour sur la route suivie, jusqu’à la prochaine intersection comprise.",
    "img": {
      "panneau": "B2c"
    }
  },
  "279": {
    "t": "Panneaux et feux",
    "q": "Vous voyez ce panneau. Pouvez-vous dépasser une moto sans side-car ?",
    "o": [
      "Oui, en respectant les règles habituelles du dépassement",
      "Non, aucun dépassement n’est permis",
      "Oui, mais seulement à moins de 50 km/h",
      "Non, sauf si elle roule à moins de 30 km/h"
    ],
    "e": "Ce panneau interdit de dépasser les véhicules à moteur, sauf les deux-roues sans side-car. Le dépassement d’une moto reste possible s’il se fait en sécurité.",
    "img": {
      "panneau": "B3"
    }
  },
  "280": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Fin de l’interdiction de dépasser",
      "Interdiction de dépasser pour les camions",
      "Fin de toutes les interdictions",
      "Dépassement interdit sur une longue distance"
    ],
    "e": "Ce panneau barré marque la fin de l’interdiction de dépasser. Les règles générales du dépassement continuent de s’appliquer.",
    "img": {
      "panneau": "B34"
    }
  },
  "281": {
    "t": "Circulation et stationnement",
    "q": "Ce panneau, sans panonceau, est placé sur le trottoir de droite. Où le stationnement est-il interdit ?",
    "o": [
      "De ce côté de la rue, depuis le panneau jusqu’à la prochaine intersection",
      "Des deux côtés de la rue, sur toute sa longueur",
      "Seulement sur 10 mètres autour du panneau",
      "De ce côté, jusqu’à la sortie de l’agglomération"
    ],
    "e": "L’interdiction ne vaut que du côté où le panneau est placé, à partir du panneau et jusqu’à la prochaine intersection.",
    "img": {
      "panneau": "B6a1"
    }
  },
  "282": {
    "t": "Circulation et stationnement",
    "q": "Vous voulez vous arrêter un instant pour déposer un passager, en restant au volant. Lequel de ces deux panneaux le permet ?",
    "o": [
      "Celui de gauche, qui interdit seulement le stationnement",
      "Celui de droite, qui interdit seulement le stationnement",
      "Les deux",
      "Aucun des deux"
    ],
    "e": "Le panneau barré d’un trait (à gauche) interdit le stationnement mais pas l’arrêt. Le panneau barré d’une croix (à droite) interdit l’arrêt et le stationnement.",
    "img": {
      "panneaux": [
        "B6a1",
        "B6d"
      ]
    }
  },
  "283": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Accès interdit aux piétons",
      "Chemin obligatoire pour les piétons",
      "Passage pour piétons",
      "Aire piétonne"
    ],
    "e": "Rond à bordure rouge : c’est une interdiction. Ici, les piétons n’ont pas le droit d’emprunter cette voie.",
    "img": {
      "panneau": "B9a"
    }
  },
  "284": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Accès interdit aux cycles",
      "Piste cyclable obligatoire",
      "Débouché de cyclistes",
      "Parking à vélos"
    ],
    "e": "Rond à bordure rouge avec un vélo : la voie est interdite aux cycles.",
    "img": {
      "panneau": "B9b"
    }
  },
  "285": {
    "t": "Panneaux et feux",
    "q": "Hors agglomération, ces deux panneaux sont placés sur le même poteau. Que vous indiquent-ils ?",
    "o": [
      "Des feux tricolores plus loin, avec une vitesse limitée à 70 km/h",
      "Un feu en panne, avec une vitesse conseillée de 70 km/h",
      "Des feux tricolores dans 70 m",
      "Des feux tricolores, à aborder à 70 km/h au minimum"
    ],
    "e": "Hors agglomération, les feux tricolores sont annoncés par ce triangle, accompagné d’un panneau de limitation de vitesse placé dessous.",
    "img": {
      "panneaux": [
        "A17",
        "B14:70"
      ]
    }
  },
  "286": {
    "t": "Vitesse et distances",
    "q": "Que vous impose ce panneau ?",
    "o": [
      "De ne pas dépasser 90 km/h",
      "De rouler au moins à 90 km/h",
      "De rouler à 90 km/h si possible, sans obligation",
      "De garder 90 mètres avec le véhicule qui vous précède"
    ],
    "e": "Le panneau rond à bordure rouge avec un nombre fixe une vitesse maximale : vous ne devez pas la dépasser. Vous pouvez rouler moins vite si les conditions l’exigent.",
    "img": {
      "panneau": "B14:90"
    }
  },
  "287": {
    "t": "Vitesse et distances",
    "q": "Lequel de ces deux panneaux vous interdit de dépasser 70 km/h ?",
    "o": [
      "Le rond à bordure rouge",
      "Le carré bleu",
      "Les deux",
      "Aucun des deux"
    ],
    "e": "Le rond à bordure rouge est une limitation de vitesse obligatoire. Le carré bleu n’indique qu’une vitesse conseillée.",
    "img": {
      "panneaux": [
        "B14:70",
        "C4a:70"
      ]
    }
  },
  "288": {
    "t": "Vitesse et distances",
    "q": "Vous passez ce panneau. Quelle vitesse maximale s’applique ensuite ?",
    "o": [
      "Celle prévue par la règle générale pour cette route",
      "Aucune : la vitesse devient libre",
      "Toujours 70 km/h",
      "Toujours 130 km/h"
    ],
    "e": "Ce panneau met fin à la limitation de 70 km/h. Vous revenez à la vitesse maximale prévue par la règle générale pour cette route (agglomération, route, autoroute…).",
    "img": {
      "panneau": "B33:70"
    }
  },
  "289": {
    "t": "Vitesse et distances",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Vous devez rouler au moins à 80 km/h",
      "Vous ne devez pas dépasser 80 km/h",
      "Il est conseillé de rouler à 80 km/h",
      "La limitation à 80 km/h prend fin"
    ],
    "e": "Le panneau rond à fond bleu avec un nombre est une obligation : c’est une vitesse minimale. On le trouve dans certains tunnels et sur autoroute.",
    "img": {
      "panneau": "B25:80"
    }
  },
  "290": {
    "t": "Panneaux et feux",
    "q": "En agglomération, vous passez ce panneau. Que deviennent les règles propres à l’agglomération, comme la limite de 50 km/h ?",
    "o": [
      "Elles continuent de s’appliquer",
      "Elles sont toutes levées",
      "Elles sont levées sur 1 km",
      "Elles ne s’appliquent plus qu’aux camions"
    ],
    "e": "Ce panneau met fin aux interdictions signalées auparavant par des panneaux, mais pas aux règles générales, comme celles de l’agglomération.",
    "img": {
      "panneau": "B31"
    }
  },
  "291": {
    "t": "Priorités",
    "q": "Vous voyez ce panneau avant un passage étroit. Une voiture venant d’en face est déjà engagée dans le passage. Que faites-vous ?",
    "o": [
      "Vous attendez qu’elle en soit sortie",
      "Vous vous engagez, car elle devra reculer",
      "Vous vous engagez en serrant à droite",
      "Vous faites un appel de phares et vous passez"
    ],
    "e": "Ce panneau vous oblige à céder le passage aux véhicules venant en face. Vous ne vous engagez que si vous pouvez traverser sans les obliger à s’arrêter.",
    "img": {
      "scene": "vue",
      "ligne": "aucune",
      "panneau": [
        "B15"
      ],
      "vehicule_face": true
    }
  },
  "292": {
    "t": "Priorités",
    "q": "Ces deux panneaux sont placés chacun à un bout du même passage étroit. Lequel donne la priorité sur les véhicules venant en face ?",
    "o": [
      "Le carré bleu",
      "Le rond à bordure rouge",
      "Les deux",
      "Aucun : le premier arrivé passe"
    ],
    "e": "Le rond à bordure rouge oblige à céder le passage. Le carré bleu, placé à l’autre bout, indique au contraire que vous êtes prioritaire.",
    "img": {
      "panneaux": [
        "B15",
        "C18"
      ]
    }
  },
  "293": {
    "t": "Panneaux et feux",
    "q": "Ces deux panneaux sont placés aux deux bouts de la même rue. Que pouvez-vous en déduire ?",
    "o": [
      "La rue est à sens unique",
      "La rue est fermée à toute circulation",
      "La rue est une impasse",
      "La rue est réservée aux bus"
    ],
    "e": "Le carré bleu à flèche blanche indique le sens unique du côté où l’on peut entrer. Le sens interdit est placé à l’autre bout de la rue.",
    "img": {
      "panneaux": [
        "C12",
        "B1"
      ]
    }
  },
  "294": {
    "t": "Panneaux et feux",
    "q": "Que signifient ces deux panneaux ?",
    "o": [
      "Gauche : tourner à droite avant le panneau ; droite : tourner à droite à la prochaine intersection",
      "Les deux imposent exactement la même chose",
      "Gauche : tourner à droite à la prochaine intersection ; droite : tourner à droite avant le panneau",
      "Ils indiquent seulement des directions conseillées"
    ],
    "e": "La flèche droite horizontale impose de tourner à droite tout de suite, avant le panneau. La flèche coudée impose de tourner à droite à la prochaine intersection.",
    "img": {
      "panneaux": [
        "B21-1",
        "B21c1"
      ]
    }
  },
  "295": {
    "t": "Panneaux et feux",
    "q": "Vous arrivez face à ce panneau, placé au bout de la rue. Que devez-vous faire ?",
    "o": [
      "Tourner à gauche, avant le panneau",
      "Tourner à gauche à l’intersection suivante, plus loin",
      "Tourner à droite",
      "Contourner un obstacle par la gauche"
    ],
    "e": "Ce panneau rond bleu à flèche horizontale vous oblige à tourner à gauche avant de l’atteindre.",
    "img": {
      "panneau": "B21-2"
    }
  },
  "296": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Direction obligatoire à gauche à la prochaine intersection",
      "Interdiction de tourner à gauche",
      "Virage à gauche",
      "Obligation de tourner à gauche avant le panneau"
    ],
    "e": "La flèche coudée sur fond bleu impose de tourner à gauche à la prochaine intersection.",
    "img": {
      "panneau": "B21c2"
    }
  },
  "297": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Contournement obligatoire par la droite",
      "Tourner à droite à la prochaine intersection",
      "Chaussée rétrécie par la droite",
      "Voie de droite réservée aux bus"
    ],
    "e": "La flèche oblique vers le bas à droite impose de passer à droite de l’obstacle ou de l’îlot.",
    "img": {
      "panneau": "B21a1"
    }
  },
  "298": {
    "t": "Panneaux et feux",
    "q": "Vous voyez ce panneau avant un carrefour. Que devez-vous faire ?",
    "o": [
      "Continuer tout droit à la prochaine intersection",
      "Rien de particulier : il indique une rue à sens unique",
      "Vous considérer comme prioritaire",
      "Vous placer sur la voie de gauche"
    ],
    "e": "Le rond bleu à flèche verticale impose d’aller tout droit à la prochaine intersection. Ne le confondez pas avec le carré bleu du sens unique.",
    "img": {
      "panneau": "B21b"
    }
  },
  "299": {
    "t": "Panneaux et feux",
    "q": "Vous conduisez une voiture. Ce panneau est placé à l’entrée d’une bande. Pouvez-vous vous y arrêter un instant ?",
    "o": [
      "Non, vous ne pouvez ni y circuler ni vous y arrêter",
      "Oui, moins de 2 minutes",
      "Oui, avec les feux de détresse allumés",
      "Oui, s’il n’y a pas de cycliste"
    ],
    "e": "Ce panneau réserve la piste ou la bande aux cycles. Les autres véhicules ne peuvent ni l’emprunter ni s’y arrêter.",
    "img": {
      "panneau": "B22a"
    }
  },
  "300": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Chemin obligatoire pour les piétons",
      "Accès interdit aux piétons",
      "Passage pour piétons",
      "Endroit fréquenté par les enfants"
    ],
    "e": "Ce panneau rond bleu oblige les piétons à emprunter ce chemin. Les autres usagers n’ont pas le droit de l’utiliser ni de s’y arrêter.",
    "img": {
      "panneau": "B22b"
    }
  },
  "301": {
    "t": "Panneaux et feux",
    "q": "Vous passez ce panneau. Que signifie-t-il ?",
    "o": [
      "Vous sortez d’une zone 30",
      "Vous entrez dans une zone 30",
      "La vitesse conseillée est de 30 km/h",
      "La vitesse minimale de 30 km/h prend fin"
    ],
    "e": "Ce panneau marque la sortie de la zone 30. La vitesse maximale redevient celle de la règle générale ou celle d’un autre panneau.",
    "img": {
      "panneau": "B51"
    }
  },
  "302": {
    "t": "Circulation et stationnement",
    "q": "Vous passez ce panneau. Quelle est la vitesse maximale des véhicules dans cette zone ?",
    "o": [
      "20 km/h",
      "30 km/h",
      "L’allure du pas",
      "50 km/h"
    ],
    "e": "Ce panneau annonce une zone de rencontre : les piétons peuvent marcher sur la chaussée, ils sont prioritaires, et les véhicules ne dépassent pas 20 km/h.",
    "img": {
      "panneau": "B52"
    }
  },
  "303": {
    "t": "Circulation et stationnement",
    "q": "Que signifie ce panneau ?",
    "o": [
      "L’entrée d’une aire piétonne",
      "Un chemin obligatoire pour les piétons",
      "L’entrée d’une zone de rencontre",
      "Un passage pour piétons"
    ],
    "e": "Ce panneau carré bleu annonce une aire piétonne. Les véhicules autorisés y roulent au pas et laissent la priorité aux piétons.",
    "img": {
      "panneau": "B54"
    }
  },
  "304": {
    "t": "Circulation et stationnement",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Un lieu aménagé pour le stationnement",
      "Un poste de police",
      "Une zone de stationnement interdit",
      "Une aire de péage"
    ],
    "e": "Le « P » blanc sur fond bleu indique un lieu aménagé pour stationner.",
    "img": {
      "panneau": "C1a"
    }
  },
  "305": {
    "t": "Panneaux et feux",
    "q": "Que signifie ce panneau ?",
    "o": [
      "Une impasse",
      "Une route prioritaire",
      "Un sens interdit",
      "Un arrêt de bus"
    ],
    "e": "Ce panneau indique une voie sans issue : vous devrez faire demi-tour au bout.",
    "img": {
      "panneau": "C13a"
    }
  },
  "306": {
    "t": "Panneaux et feux",
    "q": "Ce panneau carré bleu est placé à l’endroit d’un aménagement de la chaussée. Lequel ?",
    "o": [
      "Une surélévation de chaussée, comme un ralentisseur",
      "Un tunnel",
      "Une descente dangereuse",
      "Un passage à niveau"
    ],
    "e": "Ce panneau est placé au niveau d’un ralentisseur ou d’un plateau surélevé. Il est souvent annoncé avant par un panneau triangulaire.",
    "img": {
      "panneau": "C27"
    }
  },
  "307": {
    "t": "Vitesse et distances",
    "q": "À l’entrée de la ville, ces deux panneaux sont sur le même poteau. Que signifient-ils ?",
    "o": [
      "La vitesse est limitée à 30 km/h dans toute l’agglomération, sauf autre indication",
      "La vitesse est limitée à 30 km/h sur 300 m seulement",
      "Il est conseillé de rouler à 30 km/h",
      "La limite reste 50 km/h : le 30 ne concerne que les camions"
    ],
    "e": "Un panneau de limitation placé avec l’entrée d’agglomération s’applique à toutes les rues de l’agglomération, jusqu’à ce qu’un autre panneau indique une autre vitesse.",
    "img": {
      "panneaux": [
        "EB10:VILLENEUVE",
        "B14:30"
      ]
    }
  },
  "308": {
    "t": "Vitesse et distances",
    "q": "Que signifie ce panneau ?",
    "o": [
      "La sortie de l’agglomération : ses règles propres, comme les 50 km/h, cessent",
      "L’entrée de l’agglomération",
      "Une ville interdite aux camions",
      "La fin d’une zone 30 seulement"
    ],
    "e": "Le nom barré de rouge marque la sortie de l’agglomération. Les règles propres à l’agglomération ne s’appliquent plus après ce panneau.",
    "img": {
      "panneau": "EB20:VILLENEUVE"
    }
  },
  "309": {
    "t": "Panneaux et feux",
    "q": "Le feu est rouge. Un passage pour piétons se trouve avant le feu, et aucune ligne d’arrêt n’est tracée. Où vous arrêtez-vous ?",
    "o": [
      "Avant le passage pour piétons",
      "Sur le passage pour piétons, au plus près du feu",
      "Au pied du feu, après le passage",
      "Où vous voulez, si aucun piéton ne traverse"
    ],
    "e": "Quand aucune ligne n’est tracée et qu’un passage pour piétons précède le feu, vous devez vous arrêter avant ce passage, pour le laisser libre.",
    "img": {
      "feu": "rouge"
    }
  },
  "310": {
    "t": "Panneaux et feux",
    "q": "À un carrefour, ce feu clignote à l’orange et un panneau « cédez le passage » est fixé sous lui. Une voiture arrive par la gauche, sur l’autre route. Que faites-vous ?",
    "o": [
      "Vous la laissez passer, comme l’impose le panneau",
      "Vous passez, car elle vient de votre gauche",
      "Vous passez, car le feu orange clignotant vous rend prioritaire",
      "Vous attendez que le feu passe au vert, même quand la voie sera libre"
    ],
    "e": "Feu orange clignotant : vous passez avec prudence, en suivant le panneau placé avec le feu. Ici, le « cédez le passage » vous oblige à laisser passer la voiture, même venant de gauche.",
    "img": {
      "feu": "orange_clignotant"
    }
  },
  "311": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous allez tout droit. À cette intersection, il n’y a ni panneau, ni feu, ni marquage au sol. Qui passe en premier ?",
    "o": [
      "La voiture rouge, car elle arrive de votre droite",
      "Vous, car vous allez tout droit",
      "Vous, car la voiture rouge roule sur une route moins large",
      "Le plus rapide des deux"
    ],
    "e": "Sans signalisation, c’est la priorité à droite : vous laissez passer la voiture qui arrive de votre droite.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
  },
  "312": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous allez tout droit. Il n’y a ni panneau, ni feu, ni marquage au sol. La voiture rouge arrive de votre gauche. Qui passe en premier ?",
    "o": [
      "Vous, car vous arrivez à la droite de la voiture rouge",
      "La voiture rouge, car elle est déjà engagée",
      "La voiture rouge, car elle va tout droit",
      "Personne : vous attendez un signe de l’autre conducteur"
    ],
    "e": "La voiture rouge doit céder le passage aux véhicules qui arrivent de sa droite : c’est vous. Restez tout de même attentif.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 70
        }
      ]
    }
  },
  "313": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Les trois véhicules vont tout droit. Il n’y a ni panneau, ni feu, ni marquage au sol. Dans quel ordre passent-ils ?",
    "o": [
      "A, puis vous, puis B",
      "B, puis vous, puis A",
      "Vous, puis A, puis B",
      "A et B en même temps, puis vous"
    ],
    "e": "Priorité à droite : A n’a personne à sa droite, il passe d’abord. Ensuite vous, car B doit vous céder le passage. B passe en dernier.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "lettre": "A"
        },
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "vert",
          "lettre": "B"
        }
      ]
    }
  },
  "314": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous continuez tout droit. La voiture rouge sort de la route à votre gauche pour tourner à sa gauche. Il n’y a aucun panneau ni marquage. Qui passe en premier ?",
    "o": [
      "Vous, car vous arrivez à sa droite",
      "La voiture rouge, car elle est sortie la première",
      "La voiture rouge, car elle tourne",
      "Celui qui roule sur la route la plus large"
    ],
    "e": "Même dans un carrefour en T, la priorité à droite s’applique sans signalisation : la voiture rouge vous a sur sa droite, elle vous laisse passer.",
    "img": {
      "scene": "plan",
      "route": "T_gauche",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "gauche",
          "couleur": "rouge",
          "clignotant": "gauche"
        }
      ]
    }
  },
  "315": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous continuez tout droit sur cette route. La voiture rouge sort d’une petite route à votre droite. Il n’y a aucun panneau ni marquage. Qui passe en premier ?",
    "o": [
      "La voiture rouge, car elle arrive de votre droite",
      "Vous, car vous êtes sur la route principale",
      "Vous, car elle sort d’une petite route",
      "Vous, car vous allez tout droit"
    ],
    "e": "La taille de la route ne donne aucune priorité : sans panneau, vous laissez passer celui qui vient de droite.",
    "img": {
      "scene": "plan",
      "route": "T_droite",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "gauche",
          "couleur": "rouge",
          "clignotant": "gauche"
        }
      ]
    }
  },
  "316": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à droite. La voiture rouge arrive de votre gauche et va tout droit. Il n’y a ni panneau, ni feu, ni marquage. Qui passe en premier ?",
    "o": [
      "Vous, car vous arrivez à sa droite",
      "La voiture rouge, car elle va tout droit",
      "La voiture rouge, car vous tournez",
      "Personne n’est prioritaire"
    ],
    "e": "Vous allez tous les deux dans la même rue. Sans signalisation, la priorité à droite s’applique : la voiture rouge doit vous céder le passage.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "droite",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 70
        }
      ]
    }
  },
  "317": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous allez tout droit. Un cycliste arrive de votre droite. Il n’y a ni panneau, ni feu, ni marquage. Qui passe en premier ?",
    "o": [
      "Le cycliste, car il arrive de votre droite",
      "Vous, car une voiture est prioritaire sur un vélo",
      "Vous, car il roule moins vite",
      "Le cycliste doit toujours mettre pied à terre"
    ],
    "e": "Sur la chaussée, le cycliste suit les mêmes règles de priorité que les autres : il vient de droite, vous le laissez passer.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "velo",
          "bras": "E",
          "action": "tout_droit",
          "x": 250
        }
      ]
    }
  },
  "318": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à gauche (A arrive de votre droite, B arrive en face). A et B vont tout droit. Il n’y a ni panneau, ni feu, ni marquage. Dans quel ordre passe-t-on ?",
    "o": [
      "B, puis A, puis vous",
      "A, puis B, puis vous",
      "Vous, puis A, puis B",
      "A, puis vous, puis B"
    ],
    "e": "B n’a personne à sa droite : il passe en premier. A passe ensuite, car il est à votre droite. Vous tournez à gauche en dernier, après avoir laissé passer B qui venait en face.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "lettre": "A"
        },
        {
          "type": "voiture",
          "bras": "N",
          "action": "tout_droit",
          "couleur": "vert",
          "lettre": "B"
        }
      ]
    }
  },
  "319": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous êtes au stop et vous voulez aller tout droit. La voiture rouge arrive de votre gauche sur la route que vous croisez. Que faites-vous ?",
    "o": [
      "Vous vous arrêtez à la ligne et vous la laissez passer",
      "Vous passez avant elle, car vous êtes à sa droite",
      "Vous passez sans vous arrêter si elle est encore loin",
      "Vous vous arrêtez, puis vous passez en même temps qu’elle"
    ],
    "e": "Au stop, l’arrêt est obligatoire et vous cédez le passage à tous les usagers de la route que vous croisez, qu’ils viennent de gauche ou de droite.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "stop"
      },
      "panneaux": [
        {
          "code": "AB4",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit",
        "recul": 14
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 70
        }
      ]
    }
  },
  "320": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous êtes au stop. A arrive de votre gauche et B de votre droite, tous deux sur la route que vous croisez, et vont tout droit. Dans quel ordre passe-t-on ?",
    "o": [
      "A et B passent, puis vous",
      "Vous, puis A et B",
      "A, puis vous, puis B",
      "B, puis vous, puis A"
    ],
    "e": "Au stop, vous cédez le passage aux usagers venant des deux côtés. A et B ne se gênent pas : ils passent, puis vous.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "stop"
      },
      "panneaux": [
        {
          "code": "AB4",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit",
        "recul": 14
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 70,
          "lettre": "A"
        },
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "vert",
          "x": 250,
          "lettre": "B"
        }
      ]
    }
  },
  "321": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous arrivez à ce stop. Où devez-vous arrêter votre voiture ?",
    "o": [
      "Juste avant la large ligne blanche continue",
      "Au niveau du panneau, même s’il est loin de la ligne",
      "Après la ligne, l’avant de la voiture sur la route croisée",
      "Nulle part si personne n’arrive"
    ],
    "e": "La ligne continue tracée au sol avec le stop marque l’endroit où vous marquez l’arrêt, avec la meilleure vue sur la route croisée.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "stop"
      },
      "panneaux": [
        {
          "code": "AB4",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "recul": 18
      }
    }
  },
  "322": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous allez tout droit sur une route où ce panneau annonce l’intersection. La voiture rouge, à droite, est arrêtée à un stop. Qui passe en premier ?",
    "o": [
      "Vous, car l’autre route doit vous céder le passage",
      "La voiture rouge, car elle vient de votre droite",
      "La voiture rouge, car elle était là avant vous",
      "Le premier qui démarre"
    ],
    "e": "Le panneau triangulaire à flèche noire indique que vous êtes prioritaire à cette intersection : la voiture au stop doit vous laisser passer.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "E": "continue"
      },
      "marquages": {
        "E": "stop"
      },
      "panneaux": [
        {
          "code": "AB2",
          "bras": "S"
        },
        {
          "code": "AB4",
          "bras": "E"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250,
          "freins": true
        }
      ]
    }
  },
  "323": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous êtes au cédez-le-passage et vous voulez aller tout droit. La voiture rouge arrive de votre droite sur la route que vous croisez. Que faites-vous ?",
    "o": [
      "Vous la laissez passer",
      "Vous passez, car le cédez-le-passage ne concerne que la gauche",
      "Vous passez, car elle est sur la voie la plus éloignée",
      "Vous klaxonnez pour la prévenir et vous passez"
    ],
    "e": "Le cédez-le-passage vous oblige à laisser passer les usagers de la route croisée, des deux côtés.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit",
        "recul": 6
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250
        }
      ]
    }
  },
  "324": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous arrivez à ce cédez-le-passage. Personne n’arrive et vous voyez bien des deux côtés. Devez-vous vous arrêter ?",
    "o": [
      "Non : vous ralentissez, regardez, et vous pouvez passer sans arrêt",
      "Oui, l’arrêt est obligatoire comme au stop",
      "Oui, pendant au moins trois secondes",
      "Non, et vous pouvez passer sans ralentir"
    ],
    "e": "Au cédez-le-passage, l’arrêt n’est obligatoire que si quelqu’un arrive. Il faut quand même ralentir assez pour bien regarder.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue"
      },
      "marquages": {
        "S": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit",
        "recul": 6
      }
    }
  },
  "325": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous roulez sur cette route prioritaire et vous allez tout droit. La voiture rouge arrive de votre gauche, où un cédez-le-passage est tracé. Qui passe en premier ?",
    "o": [
      "Vous, car la voiture rouge doit vous céder le passage",
      "La voiture rouge, car elle est déjà arrêtée",
      "La voiture rouge, car elle tourne",
      "Vous devez toujours vous arrêter à une intersection"
    ],
    "e": "Sur une route prioritaire, les routes qui la croisent ont un cédez-le-passage ou un stop : vous passez, en restant attentif.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "W": "continue",
        "E": "continue"
      },
      "marquages": {
        "W": "cedez",
        "E": "cedez"
      },
      "panneaux": [
        {
          "code": "AB6",
          "bras": "S"
        },
        {
          "code": "AB3a",
          "bras": "W"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 80
        }
      ]
    }
  },
  "326": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous roulez sur une route prioritaire et vous tournez à gauche. La voiture rouge arrive en face et va tout droit. Qui passe en premier ?",
    "o": [
      "La voiture rouge, car vous tournez à gauche et elle vient en face",
      "Vous, car vous êtes sur une route prioritaire",
      "Vous, car vous avez mis votre clignotant",
      "Celui qui est arrivé le premier au carrefour"
    ],
    "e": "La route prioritaire vous protège des routes qui la croisent, pas de la voiture d’en face. Pour tourner à gauche, vous laissez passer ceux qui viennent en sens inverse.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "W": "continue",
        "E": "continue"
      },
      "marquages": {
        "W": "cedez",
        "E": "cedez"
      },
      "panneaux": [
        {
          "code": "AB6",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "N",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
  },
  "327": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Juste avant cette intersection, vous avez passé ce panneau de fin de route prioritaire. Il n’y a aucun autre panneau ni marquage. Qui passe en premier ?",
    "o": [
      "La voiture rouge, car elle arrive de votre droite",
      "Vous, car vous étiez sur une route prioritaire",
      "Vous, car vous allez tout droit",
      "La voiture rouge, seulement si elle a mis son clignotant"
    ],
    "e": "Le panneau barré annonce que vous n’êtes plus prioritaire au carrefour suivant. Sans autre signalisation, la priorité à droite s’applique.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "panneaux": [
        {
          "code": "AB7",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250
        }
      ]
    }
  },
  "328": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous arrivez à ce carrefour à sens giratoire, signalé par un cédez-le-passage. La voiture rouge circule déjà sur l’anneau. Que faites-vous ?",
    "o": [
      "Vous la laissez passer avant d’entrer",
      "Vous entrez, car elle arrive de votre gauche",
      "Vous entrez, car vous êtes à sa droite",
      "Vous entrez en klaxonnant"
    ],
    "e": "À l’entrée d’un carrefour à sens giratoire, vous cédez le passage aux usagers qui circulent déjà sur l’anneau.",
    "img": {
      "scene": "plan",
      "route": "giratoire",
      "marquages": {
        "S": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "recul": 22
      },
      "autres": [
        {
          "type": "voiture",
          "couleur": "rouge",
          "x": 112,
          "y": 140,
          "dir": "S"
        }
      ]
    }
  },
  "329": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous circulez sur l’anneau de ce carrefour à sens giratoire. La voiture rouge attend à l’entrée de droite, au cédez-le-passage. Qui passe en premier ?",
    "o": [
      "Vous, car vous êtes déjà sur l’anneau",
      "La voiture rouge, car elle arrive de votre droite",
      "La voiture rouge, car elle attend depuis longtemps",
      "Vous devez vous arrêter sur l’anneau"
    ],
    "e": "Ceux qui entrent dans un carrefour à sens giratoire doivent céder le passage aux usagers déjà sur l’anneau : vous passez.",
    "img": {
      "scene": "plan",
      "route": "giratoire",
      "marquages": {
        "E": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "E"
        }
      ],
      "moi": {
        "x": 208,
        "y": 150,
        "dir": "N"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "couleur": "rouge",
          "recul": 22
        }
      ]
    }
  },
  "330": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous arrivez à ce carrefour à sens giratoire, signalé par un cédez-le-passage. Un cycliste circule déjà sur l’anneau. Que faites-vous ?",
    "o": [
      "Vous le laissez passer avant d’entrer",
      "Vous entrez, car un vélo doit laisser passer les voitures",
      "Vous entrez, car il roule lentement",
      "Vous entrez en le dépassant sur l’anneau"
    ],
    "e": "Le cycliste sur l’anneau est prioritaire comme tout autre usager : vous le laissez passer avant d’entrer.",
    "img": {
      "scene": "plan",
      "route": "giratoire",
      "marquages": {
        "S": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "recul": 22
      },
      "autres": [
        {
          "type": "velo",
          "x": 112,
          "y": 145,
          "dir": "S"
        }
      ]
    }
  },
  "331": {
    "t": "Circulation et stationnement",
    "q": "Vous êtes la voiture bleue. Vous entrez dans ce carrefour à sens giratoire. Dans quel sens faites-vous le tour de l’îlot central ?",
    "o": [
      "En gardant l’îlot sur votre gauche (sens inverse des aiguilles d’une montre)",
      "En gardant l’îlot sur votre droite",
      "Par le côté le plus court vers votre sortie",
      "Dans un sens ou dans l’autre, selon la circulation"
    ],
    "e": "L’anneau est à sens unique : vous tournez autour de l’îlot en le gardant à votre gauche.",
    "img": {
      "scene": "plan",
      "route": "giratoire",
      "marquages": {
        "S": "cedez"
      },
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "recul": 22
      }
    }
  },
  "332": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous quittez le carrefour à sens giratoire par la sortie de droite. Un piéton traverse sur le passage piéton de cette sortie. Que faites-vous ?",
    "o": [
      "Vous le laissez traverser avant de passer",
      "Vous passez, car vous êtes prioritaire en sortant de l’anneau",
      "Vous passez devant lui en klaxonnant",
      "Vous vous arrêtez sur l’anneau sans regarder derrière"
    ],
    "e": "Un piéton engagé sur la traversée est prioritaire : vous le laissez finir de traverser, même en sortant du giratoire.",
    "img": {
      "scene": "plan",
      "route": "giratoire",
      "marquages": {
        "E": "pieton"
      },
      "moi": {
        "x": 208,
        "y": 140,
        "dir": "N",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "pieton",
          "x": 249,
          "y": 95,
          "traverse": {
            "x": 249,
            "y": 140
          }
        }
      ]
    }
  },
  "333": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Votre feu est vert et vous allez tout droit. La voiture rouge, à votre droite, a le feu rouge. Qui passe en premier ?",
    "o": [
      "Vous, car votre feu est vert",
      "La voiture rouge, car elle vient de votre droite",
      "La voiture rouge, si elle était là avant vous",
      "Personne : vous attendez qu’elle vous fasse signe"
    ],
    "e": "Quand les feux fonctionnent, ils passent avant les règles de priorité : la voiture qui a le feu rouge doit attendre.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "marquages": {
        "S": "feu",
        "E": "feu"
      },
      "feux": {
        "S": "vert",
        "E": "rouge"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "freins": true
        }
      ]
    }
  },
  "334": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Votre feu est rouge. À quel endroit devez-vous vous arrêter ?",
    "o": [
      "Avant la ligne blanche discontinue, donc avant le passage piéton",
      "Sur le passage piéton, pour mieux voir",
      "Au niveau du feu, même après la ligne",
      "Juste avant l’intersection, après le passage piéton"
    ],
    "e": "Au feu rouge, on s’arrête avant la ligne d’effet du feu. Quand il y a un passage piéton, elle est tracée avant lui pour le laisser libre.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "marquages": {
        "S": [
          "feu",
          "pieton"
        ]
      },
      "feux": {
        "S": "rouge"
      },
      "moi": {
        "bras": "S",
        "recul": 25
      }
    }
  },
  "335": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Le feu est vert pour vous et pour la voiture rouge en face. Vous allez tout droit, elle tourne à sa gauche. Qui passe en premier ?",
    "o": [
      "Vous, car elle tourne à gauche et vous venez en face",
      "La voiture rouge, car elle a mis son clignotant",
      "La voiture rouge, car elle est arrivée la première",
      "Personne : les deux feux sont verts"
    ],
    "e": "Celui qui tourne à gauche laisse passer les véhicules qui arrivent en sens inverse : ici, c’est la voiture rouge qui vous attend.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "vert",
        "N": "vert"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "N",
          "action": "gauche",
          "couleur": "rouge",
          "clignotant": "gauche"
        }
      ]
    }
  },
  "336": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Le feu clignote à l’orange. Il n’y a aucun panneau ni marquage à cette intersection. La voiture rouge arrive de votre droite. Que faites-vous ?",
    "o": [
      "Vous la laissez passer, car la priorité à droite s’applique",
      "Vous passez, car le feu orange clignotant vous donne la priorité",
      "Vous vous arrêtez jusqu’à ce que le feu passe au vert",
      "Vous passez, car le feu orange clignotant veut dire « accélérez »"
    ],
    "e": "Feu orange clignotant : passez avec prudence en suivant les panneaux. Sans panneau, c’est la priorité à droite.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "orange_clignotant",
        "E": "orange_clignotant"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250
        }
      ]
    }
  },
  "337": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Le feu clignote à l’orange. Sur le même poteau que votre feu, il y a un panneau « cédez le passage ». La voiture rouge arrive de votre gauche. Que faites-vous ?",
    "o": [
      "Vous la laissez passer, car vous devez céder le passage",
      "Vous passez, car elle vient de votre gauche",
      "Vous passez, car le feu n’est pas rouge",
      "Vous attendez que le feu passe au vert"
    ],
    "e": "Quand le feu clignote à l’orange, ce sont les panneaux qui comptent. Avec un cédez-le-passage, vous laissez passer les deux côtés.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "orange_clignotant"
      },
      "marquages": {
        "S": "feu"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 70
        }
      ],
      "panneaux": [
        {
          "code": "AB3a",
          "bras": "S"
        }
      ]
    }
  },
  "338": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Le feu clignote à l’orange. Sur le même poteau que votre feu, il y a un panneau triangulaire à flèche noire (priorité ponctuelle). La voiture rouge arrive de votre droite. Qui passe en premier ?",
    "o": [
      "Vous, avec prudence, car le panneau vous donne la priorité",
      "La voiture rouge, car elle vient de votre droite",
      "Personne tant que le feu clignote",
      "La voiture rouge, car le feu clignotant interdit de passer"
    ],
    "e": "Au feu orange clignotant, on suit les panneaux : ce panneau vous rend prioritaire à cette intersection. Passez prudemment.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "feux": {
        "S": "orange_clignotant",
        "E": "orange_clignotant"
      },
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "x": 250
        }
      ],
      "panneaux": [
        {
          "code": "AB2",
          "bras": "S"
        }
      ]
    }
  },
  "339": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à gauche. La voiture rouge arrive en face et tourne à sa droite, dans la même rue que vous. Il n’y a ni panneau, ni feu. Qui passe en premier ?",
    "o": [
      "La voiture rouge, car vous tournez à gauche et elle vient en face",
      "Vous, car vous avez mis votre clignotant le premier",
      "Vous, car elle tourne à droite",
      "Le plus rapide des deux"
    ],
    "e": "Quand vous tournez à gauche, vous laissez passer les usagers qui arrivent en face, même s’ils tournent.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "N",
          "action": "droite",
          "couleur": "rouge",
          "clignotant": "droite"
        }
      ]
    }
  },
  "340": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à droite. La voiture rouge arrive en face et tourne à sa gauche, dans la même rue que vous. Il n’y a ni panneau, ni feu. Qui passe en premier ?",
    "o": [
      "Vous, car elle tourne à gauche et vous venez en face",
      "La voiture rouge, car elle est déjà dans le carrefour",
      "La voiture rouge, car elle vient de votre gauche",
      "Personne : la rue est trop étroite"
    ],
    "e": "La voiture qui tourne à gauche doit laisser passer celles qui arrivent en face : ici, c’est vous.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "droite",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "voiture",
          "bras": "N",
          "action": "gauche",
          "couleur": "rouge",
          "clignotant": "gauche"
        }
      ]
    }
  },
  "341": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à gauche. Un cycliste arrive en face et va tout droit. Il n’y a ni panneau, ni feu. Que faites-vous ?",
    "o": [
      "Vous le laissez passer avant de tourner",
      "Vous tournez devant lui, car c’est un vélo",
      "Vous tournez, car il doit ralentir pour vous",
      "Vous klaxonnez pour qu’il s’arrête"
    ],
    "e": "Pour tourner à gauche, vous laissez passer tous ceux qui arrivent en face : voitures, motos, vélos…",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "velo",
          "bras": "N",
          "action": "tout_droit"
        }
      ]
    }
  },
  "342": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous tournez à gauche. Un piéton traverse sur le passage piéton de la rue où vous allez entrer. Que faites-vous ?",
    "o": [
      "Vous le laissez finir de traverser avant de passer",
      "Vous passez derrière lui sans ralentir",
      "Vous passez, car vous avez mis votre clignotant",
      "Vous klaxonnez pour qu’il se presse"
    ],
    "e": "Un piéton engagé dans la traversée est prioritaire : vous attendez qu’il ait traversé.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "marquages": {
        "W": "pieton"
      },
      "moi": {
        "bras": "S",
        "action": "gauche",
        "clignotant": "gauche"
      },
      "autres": [
        {
          "type": "pieton",
          "x": 113,
          "y": 98,
          "traverse": {
            "x": 113,
            "y": 140
          }
        }
      ]
    }
  },
  "343": {
    "t": "Circulation et stationnement",
    "q": "Vous êtes la voiture bleue. Vous allez tourner à droite. Un cycliste roule juste derrière vous, sur votre droite. Que contrôlez-vous juste avant de tourner ?",
    "o": [
      "Le rétroviseur droit et l’angle mort à droite, en tournant la tête",
      "Seulement le rétroviseur intérieur",
      "Le rétroviseur gauche",
      "Rien : votre clignotant suffit à prévenir le cycliste"
    ],
    "e": "Un deux-roues peut se trouver dans l’angle mort à droite. Avant de tourner, regardez le rétroviseur droit et tournez la tête.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "droite",
        "clignotant": "droite"
      },
      "autres": [
        {
          "type": "velo",
          "x": 191,
          "y": 232,
          "dir": "N"
        }
      ]
    }
  },
  "344": {
    "t": "Circulation et stationnement",
    "q": "Vous êtes la voiture bleue. Vous roulez dans une rue à sens unique (panneau bleu à flèche blanche) et vous voulez tourner à gauche au carrefour. Où vous placez-vous ?",
    "o": [
      "Du côté gauche de la chaussée",
      "Du côté droit de la chaussée, comme d’habitude",
      "Au milieu de la chaussée",
      "Peu importe, la rue est à sens unique"
    ],
    "e": "Dans une rue à sens unique, vous vous placez à gauche pour tourner à gauche : la droite reste libre pour les autres.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "aucune",
        "N": "aucune"
      },
      "panneaux": [
        {
          "code": "C12",
          "bras": "S"
        }
      ],
      "moi": {
        "bras": "S",
        "x": 160,
        "clignotant": "gauche"
      }
    }
  },
  "345": {
    "t": "Circulation et stationnement",
    "q": "Vous êtes la voiture bleue. Vous suivez un camion lent. Une ligne continue sépare les deux sens de circulation. Pouvez-vous le dépasser ?",
    "o": [
      "Non, car il est interdit de franchir la ligne continue",
      "Oui, si personne n’arrive en face",
      "Oui, en roulant à cheval sur la ligne",
      "Oui, si le camion roule à moins de 50 km/h"
    ],
    "e": "Une ligne continue ne se franchit pas, même pour dépasser : vous restez derrière le camion.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "axes": {
        "S": "continue",
        "N": "continue"
      },
      "moi": {
        "bras": "S",
        "y": 222
      },
      "autres": [
        {
          "type": "camion",
          "x": 175,
          "y": 166,
          "dir": "N",
          "couleur": "gris"
        }
      ]
    }
  },
  "346": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Vous allez tout droit. Un véhicule de pompiers arrive de votre gauche, sirène deux tons et gyrophare bleu allumés. Il n’y a ni panneau, ni feu. Que faites-vous ?",
    "o": [
      "Vous le laissez passer",
      "Vous passez, car vous êtes à sa droite",
      "Vous passez vite avant qu’il n’arrive",
      "Vous vous arrêtez au milieu du carrefour"
    ],
    "e": "Un véhicule d’intervention qui utilise sa sirène et son gyrophare est prioritaire : vous lui cédez le passage, même s’il vient de gauche.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "secours",
          "bras": "W",
          "action": "tout_droit",
          "couleur": "rouge"
        }
      ]
    }
  },
  "347": {
    "t": "Priorités",
    "q": "Vous êtes la voiture bleue. Les trois véhicules vont tout droit. A est une ambulance avec sirène et gyrophare bleu allumés. Il n’y a ni panneau, ni feu, ni marquage. Dans quel ordre passe-t-on ?",
    "o": [
      "A, puis B, puis vous",
      "B, puis vous, puis A",
      "A, puis vous, puis B",
      "Vous, puis B, puis A"
    ],
    "e": "L’ambulance en intervention passe d’abord. Ensuite, la priorité à droite : B est à votre droite, il passe avant vous.",
    "img": {
      "scene": "plan",
      "route": "croix",
      "moi": {
        "bras": "S",
        "action": "tout_droit"
      },
      "autres": [
        {
          "type": "secours",
          "bras": "W",
          "action": "tout_droit",
          "lettre": "A"
        },
        {
          "type": "voiture",
          "bras": "E",
          "action": "tout_droit",
          "couleur": "rouge",
          "lettre": "B"
        }
      ]
    }
  },
  "348": {
    "t": "Vitesse et distances",
    "q": "Il pleut et vous suivez cette voiture. Que faites-vous ?",
    "o": [
      "Vous augmentez la distance qui vous sépare d’elle",
      "Vous gardez la même distance que par temps sec",
      "Vous vous rapprochez pour mieux voir ses feux",
      "Vous allumez vos feux de brouillard arrière"
    ],
    "e": "Sur route mouillée, on freine moins bien : il faut ralentir et laisser plus de distance avec le véhicule de devant.",
    "img": {
      "scene": "vue",
      "meteo": "pluie",
      "vehicule_devant": "proche"
    }
  },
  "349": {
    "t": "Vitesse et distances",
    "q": "Cette route est limitée à 90 km/h, mais le brouillard réduit la visibilité à moins de 50 mètres. Quelle est votre vitesse maximale ?",
    "o": [
      "50 km/h",
      "90 km/h",
      "80 km/h",
      "70 km/h"
    ],
    "e": "Quand la visibilité est inférieure à 50 m, la vitesse est limitée à 50 km/h sur toutes les routes, quel que soit le panneau.",
    "img": {
      "scene": "vue",
      "meteo": "brouillard",
      "panneau": [
        "B14:90"
      ]
    }
  },
  "350": {
    "t": "Véhicule et équipements",
    "q": "Vous roulez de jour dans ce brouillard. Quels feux devez-vous allumer au minimum ?",
    "o": [
      "Les feux de croisement",
      "Les feux de position seulement",
      "Les feux de route",
      "Aucun, car il fait jour"
    ],
    "e": "Dans le brouillard, il faut voir et être vu : les feux de croisement sont obligatoires, même de jour. Les feux de brouillard peuvent les compléter.",
    "img": {
      "scene": "vue",
      "meteo": "brouillard",
      "vehicule_devant": "loin"
    }
  },
  "351": {
    "t": "Circulation et stationnement",
    "q": "Sur cette route à double sens, le brouillard est épais. La voiture devant vous roule lentement. Pouvez-vous la dépasser ?",
    "o": [
      "Non, la visibilité est insuffisante pour dépasser",
      "Oui, si vous klaxonnez avant",
      "Oui, en allumant vos feux de route",
      "Oui, si la ligne est discontinue"
    ],
    "e": "Dépasser demande de voir loin devant. Dans le brouillard, sur une route à double sens, on reste derrière.",
    "img": {
      "scene": "vue",
      "meteo": "brouillard",
      "vehicule_devant": "proche"
    }
  },
  "352": {
    "t": "Vitesse et distances",
    "q": "Il neige et la route devient glissante. Comment conduisez-vous ?",
    "o": [
      "Plus lentement, avec des gestes doux et plus de distance avec le véhicule devant",
      "À la même vitesse, mais en freinant plus fort",
      "En restant tout près du véhicule devant pour suivre ses traces",
      "En accélérant franchement pour ne pas rester bloqué"
    ],
    "e": "Sur la neige, l’adhérence est faible : on ralentit, on anticipe, on freine en douceur et on laisse plus de distance.",
    "img": {
      "scene": "vue",
      "meteo": "neige",
      "vehicule_devant": "loin"
    }
  },
  "353": {
    "t": "Véhicule et équipements",
    "q": "La nuit, hors agglomération, cette route n’est pas éclairée. Personne ne vous précède et personne n’arrive en face. Quels feux utilisez-vous ?",
    "o": [
      "Les feux de route",
      "Les feux de position",
      "Les feux de brouillard arrière",
      "Les feux de détresse"
    ],
    "e": "Sur une route non éclairée, les feux de route permettent de voir loin. On repasse en feux de croisement dès qu’on croise ou suit quelqu’un.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "feux_route": true
    }
  },
  "354": {
    "t": "Véhicule et équipements",
    "q": "La nuit, vous roulez en agglomération dans une rue bien éclairée. Quels feux devez-vous allumer au minimum ?",
    "o": [
      "Les feux de position",
      "Les feux de route",
      "Aucun feu",
      "Les feux de brouillard arrière"
    ],
    "e": "En agglomération, si l’éclairage public suffit, les feux de position sont le minimum. Les feux de croisement restent conseillés.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "ville": true
    }
  },
  "355": {
    "t": "Véhicule et équipements",
    "q": "La nuit, hors agglomération, ce piéton marche sur le bord de la chaussée et ne semble pas vous avoir vu. Comment l’avertir ?",
    "o": [
      "Par des appels de phares",
      "Par un long coup de klaxon",
      "En allumant vos feux de détresse",
      "En allumant vos feux de brouillard arrière"
    ],
    "e": "La nuit, on avertit par des appels de phares. Le klaxon est réservé aux cas d’absolue nécessité.",
    "img": {
      "scene": "vue",
      "meteo": "nuit",
      "pieton": "droite"
    }
  },
  "356": {
    "t": "Vitesse et distances",
    "q": "Vous suivez cette voiture de beaucoup trop près. Combien de points risquez-vous de perdre pour non-respect des distances de sécurité ?",
    "o": [
      "3 points",
      "1 point",
      "6 points",
      "Aucun point"
    ],
    "e": "Ne pas respecter la distance de sécurité est une contravention de 4e classe : 135 € et 3 points.",
    "img": {
      "scene": "vue",
      "vehicule_devant": "proche"
    }
  },
  "357": {
    "t": "Panneaux et feux",
    "q": "Pour couper ce virage, vous chevauchez la ligne continue. Combien de points risquez-vous de perdre ?",
    "o": [
      "1 point",
      "3 points",
      "4 points",
      "Aucun point"
    ],
    "e": "Chevaucher une ligne continue coûte 1 point, la franchir complètement en coûte 3. Dans un virage, on reste dans sa voie.",
    "img": {
      "scene": "vue",
      "virage": "gauche",
      "ligne": "continue",
      "vehicule_face": true
    }
  },
  "358": {
    "t": "Circulation et stationnement",
    "q": "Dans ce virage, la voiture devant vous roule lentement. Pouvez-vous la dépasser ?",
    "o": [
      "Non : la ligne est continue et la visibilité insuffisante",
      "Oui, si elle roule à moins de 50 km/h",
      "Oui, en klaxonnant pour la prévenir",
      "Oui, si vous dépassez rapidement"
    ],
    "e": "Dans un virage, on ne voit pas ce qui arrive en face. Avec une ligne continue, on ne peut ni la franchir ni la chevaucher pour dépasser une voiture.",
    "img": {
      "scene": "vue",
      "virage": "gauche",
      "ligne": "continue",
      "panneau": [
        "A1b"
      ],
      "vehicule_devant": "proche"
    }
  },
  "359": {
    "t": "Circulation et stationnement",
    "q": "De jour, hors agglomération, vous abordez ce virage sans visibilité. Pouvez-vous utiliser l’avertisseur sonore pour signaler votre présence ?",
    "o": [
      "Oui, si c’est nécessaire pour avertir les autres usagers",
      "Non, il est interdit hors agglomération",
      "Oui, mais seulement la nuit",
      "Non, seuls les véhicules prioritaires peuvent l’utiliser"
    ],
    "e": "De jour et hors agglomération, le klaxon peut servir à donner un avertissement utile, par exemple avant un virage sans visibilité.",
    "img": {
      "scene": "vue",
      "virage": "droite",
      "ligne": "continue",
      "panneau": [
        "A1a"
      ]
    }
  },
  "360": {
    "t": "Circulation et stationnement",
    "q": "Vous venez de passer ce panneau. La voie de gauche est libre. Pouvez-vous dépasser ce cycliste ?",
    "o": [
      "Oui, ce panneau n’interdit pas de dépasser un cycliste",
      "Non, ce panneau interdit tout dépassement",
      "Non, sauf si le cycliste vous fait signe",
      "Oui, mais seulement en agglomération"
    ],
    "e": "Ce panneau interdit de dépasser les véhicules à moteur autres que les deux-roues. Un vélo n’est pas un véhicule à moteur : vous pouvez le dépasser, en laissant 1,5 m hors agglomération.",
    "img": {
      "scene": "vue",
      "ligne": "discontinue",
      "panneau": [
        "B3"
      ],
      "cycliste": "droite"
    }
  },
  "361": {
    "t": "Circulation et stationnement",
    "q": "La ligne au centre est continue. La visibilité est bonne et personne n’arrive en face. Pouvez-vous dépasser ce cycliste ?",
    "o": [
      "Oui, en chevauchant la ligne continue si nécessaire, sans la franchir",
      "Non, jamais tant que la ligne est continue",
      "Oui, en franchissant complètement la ligne",
      "Oui, en le serrant pour rester dans votre voie"
    ],
    "e": "Depuis 2015, on peut chevaucher une ligne continue pour dépasser un cycliste si la visibilité est suffisante. La franchir reste interdit.",
    "img": {
      "scene": "vue",
      "ligne": "continue",
      "cycliste": "droite"
    }
  },
  "362": {
    "t": "Circulation et stationnement",
    "q": "Hors agglomération, vous voulez dépasser ce cycliste, mais une voiture arrive en face. Que faites-vous ?",
    "o": [
      "Vous restez derrière le cycliste jusqu’à pouvoir le dépasser en laissant 1,5 m",
      "Vous le dépassez en le frôlant pour rester dans votre voie",
      "Vous klaxonnez pour qu’il se range sur le bas-côté",
      "Vous accélérez pour passer avant la voiture"
    ],
    "e": "Il faut pouvoir laisser au moins 1,5 m au cycliste hors agglomération. Si ce n’est pas possible, on attend derrière lui.",
    "img": {
      "scene": "vue",
      "ligne": "discontinue",
      "cycliste": "droite",
      "vehicule_face": true
    }
  },
  "363": {
    "t": "Vitesse et distances",
    "q": "En agglomération, vous allez dépasser ce cycliste en lui laissant au moins 1 mètre. Que devez-vous faire aussi ?",
    "o": [
      "Réduire votre vitesse",
      "Klaxonner pour le prévenir",
      "Allumer vos feux de détresse",
      "Accélérer pour rester peu de temps à côté de lui"
    ],
    "e": "Le code impose de réduire sa vitesse quand on croise ou dépasse un cycliste.",
    "img": {
      "scene": "vue",
      "ville": true,
      "ligne": "discontinue",
      "cycliste": "droite"
    }
  },
  "364": {
    "t": "Circulation et stationnement",
    "q": "Hors agglomération, vous allez dépasser ce piéton qui marche sur le bord de la chaussée. Quelle distance latérale minimale lui laissez-vous ?",
    "o": [
      "1,5 mètre",
      "50 centimètres",
      "1 mètre",
      "3 mètres"
    ],
    "e": "On laisse aux piétons le même écart qu’aux cyclistes : 1 m en agglomération, 1,5 m hors agglomération.",
    "img": {
      "scene": "vue",
      "ligne": "discontinue",
      "pieton": "droite"
    }
  },
  "365": {
    "t": "Panneaux et feux",
    "q": "Vous venez de passer ce panneau d’entrée d’agglomération. Quand pouvez-vous utiliser l’avertisseur sonore ?",
    "o": [
      "Seulement en cas de danger immédiat",
      "Pour saluer un piéton que vous connaissez",
      "Pour demander au véhicule devant d’avancer",
      "Jamais, même en cas de danger"
    ],
    "e": "En agglomération, le klaxon ne sert qu’en cas de danger immédiat, par exemple pour éviter une collision.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "EB10:VILLENEUVE"
      ]
    }
  },
  "366": {
    "t": "Vitesse et distances",
    "q": "Un panneau 30 est placé sous le panneau d’entrée de cette agglomération. Où s’applique cette limitation ?",
    "o": [
      "Sur toutes les voies de l’agglomération, sauf autre indication de vitesse",
      "Jusqu’à la prochaine intersection seulement",
      "Seulement près des écoles",
      "Sur les 500 premiers mètres"
    ],
    "e": "Une limitation placée avec le panneau d’entrée vaut pour toute l’agglomération, jusqu’à ce qu’un autre panneau indique une autre vitesse.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "EB10:VILLENEUVE",
        "B14:30"
      ]
    }
  },
  "367": {
    "t": "Vitesse et distances",
    "q": "Vous passez ce panneau de sortie d’agglomération. La route est à double sens, sans séparateur central. Sauf indication contraire, quelle est votre vitesse maximale ?",
    "o": [
      "80 km/h",
      "50 km/h",
      "70 km/h",
      "110 km/h"
    ],
    "e": "Après la sortie d’agglomération, on applique la limite de la route : 80 km/h sur une route à double sens sans séparateur, sauf panneau contraire.",
    "img": {
      "scene": "vue",
      "panneau": [
        "EB20:VILLENEUVE"
      ]
    }
  },
  "368": {
    "t": "Vitesse et distances",
    "q": "Vous entrez dans cette zone. Jusqu’où la limitation à 30 km/h s’applique-t-elle ?",
    "o": [
      "Dans toute la zone, jusqu’à un panneau de sortie de zone",
      "Jusqu’à la prochaine intersection",
      "Sur 200 mètres seulement",
      "Jusqu’au prochain feu tricolore"
    ],
    "e": "La zone 30 commence au panneau d’entrée et se termine à un panneau de sortie de zone (ou au changement d’agglomération).",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "B30"
      ]
    }
  },
  "369": {
    "t": "Vitesse et distances",
    "q": "Vous êtes en agglomération et vous passez ce panneau. Sauf autre indication, quelle est votre vitesse maximale ?",
    "o": [
      "50 km/h",
      "30 km/h",
      "20 km/h",
      "70 km/h"
    ],
    "e": "Ce panneau marque la sortie de la zone 30. On revient à la règle de l’agglomération : 50 km/h.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "B51"
      ]
    }
  },
  "370": {
    "t": "Vitesse et distances",
    "q": "Près de cette école, un ballon roule sur la chaussée devant vous. Que faites-vous ?",
    "o": [
      "Vous ralentissez fortement, prêt à vous arrêter : un enfant peut courir après",
      "Vous gardez votre vitesse, car aucun enfant n’est visible",
      "Vous klaxonnez et continuez",
      "Vous contournez le ballon en accélérant"
    ],
    "e": "Les enfants ont des réactions imprévisibles. Un ballon sur la route annonce souvent un enfant qui va surgir.",
    "img": {
      "scene": "vue",
      "ville": true,
      "panneau": [
        "A13a"
      ],
      "ballon": true
    }
  },
  "371": {
    "t": "Panneaux et feux",
    "q": "Vous ne vous arrêtez pas à ce feu rouge. Combien de points perdez-vous ?",
    "o": [
      "4 points",
      "1 point",
      "2 points",
      "6 points"
    ],
    "e": "Ne pas marquer l’arrêt au feu rouge est une contravention de 4e classe : 135 € et 4 points.",
    "img": {
      "scene": "vue",
      "ville": true,
      "feu": "rouge",
      "passage_pieton": true
    }
  },
  "372": {
    "t": "Priorités",
    "q": "Ce piéton est engagé sur le passage. Si vous ne lui cédez pas le passage, combien de points perdez-vous ?",
    "o": [
      "6 points",
      "2 points",
      "3 points",
      "Aucun point"
    ],
    "e": "Ne pas céder le passage à un piéton engagé ou qui veut clairement traverser coûte 6 points et 135 €.",
    "img": {
      "scene": "vue",
      "ville": true,
      "passage_pieton": true,
      "pieton": "route"
    }
  },
  "373": {
    "t": "Vitesse et distances",
    "q": "Il pleut et ce panneau est placé au bord de la route. Que faites-vous ?",
    "o": [
      "Vous ralentissez et évitez les freinages et les coups de volant brusques",
      "Vous gardez votre vitesse, car la route est droite",
      "Vous freinez fort pour tester l’adhérence",
      "Vous allumez vos feux de brouillard arrière"
    ],
    "e": "Ce panneau annonce une chaussée particulièrement glissante. Avec la pluie, l’adhérence baisse encore : douceur et vitesse réduite.",
    "img": {
      "scene": "vue",
      "meteo": "pluie",
      "panneau": [
        "A4"
      ]
    }
  },
  "374": {
    "t": "Permis et examen",
    "q": "Vous avez appris à conduire en conduite accompagnée (AAC) et ne suivez pas de formation complémentaire. Combien de temps dure votre période probatoire ?",
    "o": [
      "2 ans",
      "1 an",
      "3 ans",
      "5 ans"
    ],
    "e": "Après l’AAC, la période probatoire dure 2 ans, avec 3 points de plus à la fin de chaque année sans infraction."
  },
  "375": {
    "t": "Permis et examen",
    "q": "Après un apprentissage classique, combien de points gagne chaque année un jeune conducteur qui ne commet aucune infraction ?",
    "o": [
      "2 points",
      "1 point",
      "3 points",
      "6 points"
    ],
    "e": "En formule classique, le permis probatoire passe de 6 à 12 points en 3 ans : 2 points de plus par an."
  },
  "376": {
    "t": "Permis et examen",
    "q": "Quand peut-on suivre la formation complémentaire qui réduit la période probatoire ?",
    "o": [
      "Entre le 6e et le 12e mois après l’obtention du permis",
      "Avant l’examen du code",
      "Le jour de l’examen pratique",
      "Seulement après avoir perdu des points"
    ],
    "e": "Cette formation d’une journée (7 heures) a lieu entre 6 et 12 mois après le permis, dans une école labellisée."
  },
  "377": {
    "t": "Permis et examen",
    "q": "Vous avez perdu des points pour un feu rouge non respecté. Sans nouvelle infraction, au bout de combien de temps retrouvez-vous tous vos points ?",
    "o": [
      "3 ans",
      "6 mois",
      "1 an",
      "10 ans"
    ],
    "e": "Pour une infraction grave (4e ou 5e classe, ou délit), il faut 3 ans sans nouvelle infraction pour retrouver ses points."
  },
  "378": {
    "t": "Permis et examen",
    "q": "Les forces de l’ordre retiennent votre permis de conduire. Combien de temps la rétention dure-t-elle en général au maximum ?",
    "o": [
      "72 heures",
      "24 heures",
      "1 semaine",
      "1 mois"
    ],
    "e": "La rétention dure 72 heures au maximum (120 heures si des analyses en laboratoire sont nécessaires). Pendant ce temps, vous ne pouvez pas conduire."
  },
  "379": {
    "t": "Permis et examen",
    "q": "En formule classique (sans conduite accompagnée), à partir de quel âge pouvez-vous préparer l’examen du code ?",
    "o": [
      "16 ans",
      "14 ans",
      "17 ans",
      "18 ans"
    ],
    "e": "On peut préparer le code dès 15 ans en conduite accompagnée, et dès 16 ans en formule classique."
  },
  "380": {
    "t": "Accident et secours",
    "q": "Quel numéro appelez-vous pour joindre la police ou la gendarmerie en urgence ?",
    "o": [
      "17",
      "15",
      "18",
      "114"
    ],
    "e": "Le 17 joint Police-secours, par exemple pour un accident de la route. Le 112 fonctionne aussi."
  },
  "381": {
    "t": "Accident et secours",
    "q": "Votre voiture est immobilisée sur une route très fréquentée. Poser le triangle vous mettrait en grand danger. Que dit la règle ?",
    "o": [
      "Vous n’êtes pas obligé de le poser",
      "Vous devez le poser quoi qu’il arrive",
      "Vous devez le poser sur le toit de la voiture",
      "Vous devez le remplacer par une lampe de poche"
    ],
    "e": "Le triangle se place à 30 m au moins, mais on n’est pas obligé de le poser si cela met sa vie en danger. Les feux de détresse restent indispensables."
  },
  "382": {
    "t": "Accident et secours",
    "q": "Lors d’un accident, une personne est brûlée au bras. Quel est le premier geste ?",
    "o": [
      "Refroidir la brûlure sous l’eau tempérée pendant au moins 10 minutes",
      "Mettre de la glace directement sur la peau",
      "Appliquer de la crème grasse",
      "Percer les cloques"
    ],
    "e": "On refroidit tout de suite à l’eau tempérée (15 à 25 °C), au moins 10 minutes et si possible 20 minutes."
  },
  "383": {
    "t": "Accident et secours",
    "q": "Une victime est inconsciente. Avant de vérifier si elle respire, que faites-vous ?",
    "o": [
      "Vous basculez doucement sa tête en arrière et soulevez son menton",
      "Vous lui donnez de l’eau",
      "Vous la secouez fortement",
      "Vous l’asseyez contre un mur"
    ],
    "e": "Chez une personne inconsciente, la langue peut boucher la gorge. Basculer la tête en arrière et lever le menton libère les voies respiratoires."
  },
  "384": {
    "t": "Accident et secours",
    "q": "Après un accident, l’autre conducteur prend la fuite. Que faites-vous ?",
    "o": [
      "Vous notez sa plaque d’immatriculation et prévenez la police ou la gendarmerie",
      "Vous le poursuivez en voiture",
      "Vous partez aussi, car le constat est impossible",
      "Vous signez un constat à sa place"
    ],
    "e": "On relève la plaque, on prévient la police ou la gendarmerie et on peut porter plainte pour délit de fuite. Le constat indique la fuite dans « Observations »."
  },
  "385": {
    "t": "Accident et secours",
    "q": "Dans quel cas ne pouvez-vous pas utiliser l’application e-constat auto ?",
    "o": [
      "Quand une personne est blessée",
      "Quand l’accident a lieu en France",
      "Quand deux voitures sont impliquées",
      "Quand les deux conducteurs sont d’accord"
    ],
    "e": "L’e-constat ne s’utilise pas s’il y a un blessé, plus de 2 véhicules ou un accident à l’étranger : on remplit alors un constat papier."
  },
  "386": {
    "t": "Alcool, fatigue, santé",
    "q": "Un conducteur a conduit après avoir pris des stupéfiants et en étant aussi sous l’emprise de l’alcool. Combien de points perd-il ?",
    "o": [
      "9 points",
      "3 points",
      "6 points",
      "12 points"
    ],
    "e": "Stupéfiants seuls : 6 points. Stupéfiants et alcool ensemble : 9 points, et jusqu’à 5 ans de prison."
  },
  "387": {
    "t": "Alcool, fatigue, santé",
    "q": "Pouvez-vous conduire après avoir consommé une petite quantité de cannabis ?",
    "o": [
      "Non, l’interdiction s’applique quelle que soit la quantité",
      "Oui, si vous attendez 1 heure",
      "Oui, si vous ne ressentez aucun effet",
      "Oui, en dehors des autoroutes"
    ],
    "e": "Conduire après usage de stupéfiants est interdit, même en petite quantité."
  },
  "388": {
    "t": "Alcool, fatigue, santé",
    "q": "En conduite accompagnée, l’interdiction de conduire après usage de stupéfiants concerne-t-elle aussi l’accompagnateur ?",
    "o": [
      "Oui, elle le concerne aussi",
      "Non, seulement l’élève",
      "Non, seulement s’il est jeune conducteur",
      "Oui, mais seulement la nuit"
    ],
    "e": "L’accompagnateur est responsable de l’élève : il ne doit pas non plus avoir pris de stupéfiants."
  },
  "389": {
    "t": "Alcool, fatigue, santé",
    "q": "Un passager veut fumer dans la voiture alors qu’un enfant de 12 ans est à bord. Est-ce autorisé ?",
    "o": [
      "Non, fumer est interdit pour tous en présence d’un mineur",
      "Oui, si la fenêtre est ouverte",
      "Oui, si c’est un passager et non le conducteur",
      "Oui, si l’enfant est à l’arrière"
    ],
    "e": "En présence d’un mineur, il est interdit de fumer dans la voiture, pour tous les occupants (135 € d’amende en général)."
  },
  "390": {
    "t": "Alcool, fatigue, santé",
    "q": "Lors d’un contrôle, un conducteur refuse de se soumettre à la vérification de son taux d’alcool. Que risque-t-il ?",
    "o": [
      "C’est un délit, avec un retrait de 6 points",
      "Rien, ce contrôle est facultatif",
      "Une simple amende de 35 €, sans retrait de points",
      "Un retrait de 1 point"
    ],
    "e": "Refuser la vérification d’alcoolémie est un délit, sanctionné comme une alcoolémie élevée : 6 points en moins."
  },
  "391": {
    "t": "Alcool, fatigue, santé",
    "q": "Le code 01 est inscrit au verso de votre permis de conduire. Que signifie-t-il ?",
    "o": [
      "Vous devez porter des lunettes ou des lentilles pour conduire",
      "Vous ne pouvez pas conduire la nuit",
      "Vous ne pouvez pas conduire sur autoroute",
      "Vous devez conduire une voiture à boîte automatique"
    ],
    "e": "Les codes du verso indiquent des restrictions. Le code 01 impose une correction de la vue."
  },
  "392": {
    "t": "Véhicule et équipements",
    "q": "Vous installez un bébé à l’avant, dans un siège dos à la route. Que devez-vous faire ?",
    "o": [
      "Désactiver l’airbag passager",
      "Rien de plus",
      "Reculer le siège au maximum, airbag activé",
      "Le laisser sans ceinture"
    ],
    "e": "Un airbag qui se déclenche contre un siège dos à la route est très dangereux : il doit être désactivé."
  },
  "393": {
    "t": "Véhicule et équipements",
    "q": "Un enfant de 8 ans voyage dans votre voiture sans siège ni rehausseur adapté. Qui est sanctionné ?",
    "o": [
      "Le conducteur",
      "L’enfant",
      "Le propriétaire du siège",
      "Personne, s’il porte la ceinture"
    ],
    "e": "Le conducteur répond de l’installation des enfants : il risque en général 135 € d’amende."
  },
  "394": {
    "t": "Véhicule et équipements",
    "q": "Le conducteur n’a pas attaché sa ceinture de sécurité. Combien de points risque-t-il de perdre ?",
    "o": [
      "3 points",
      "1 point",
      "6 points",
      "Aucun point"
    ],
    "e": "Ne pas porter sa ceinture coûte en général 135 € et, pour le conducteur, 3 points."
  },
  "395": {
    "t": "Véhicule et équipements",
    "q": "Le contrôle technique de votre voiture est favorable. Pendant combien de temps est-il valable ?",
    "o": [
      "2 ans",
      "1 an",
      "4 ans",
      "5 ans"
    ],
    "e": "Pour une voiture, un contrôle technique favorable est valable 2 ans."
  },
  "396": {
    "t": "Véhicule et équipements",
    "q": "Le contrôle technique relève une défaillance critique. Jusqu’à quand pouvez-vous circuler avec la voiture ?",
    "o": [
      "Seulement le jour du contrôle",
      "Pendant 2 mois",
      "Pendant 1 an",
      "Jusqu’au prochain contrôle"
    ],
    "e": "Avec une défaillance critique, le contrôle n’est valable que le jour même : la voiture doit être réparée avant de reprendre la route."
  },
  "397": {
    "t": "Véhicule et équipements",
    "q": "Dans certaines communes de montagne, pendant quelle période devez-vous avoir des pneus hiver ou des chaînes à neige ?",
    "o": [
      "Du 1er novembre au 31 mars",
      "Du 1er décembre au 28 février",
      "Toute l’année",
      "Seulement les jours où il neige"
    ],
    "e": "Dans les communes concernées des massifs montagneux, cette obligation vaut du 1er novembre au 31 mars."
  },
  "398": {
    "t": "Véhicule et équipements",
    "q": "Le pare-brise et les vitres avant de votre voiture peuvent-ils être fortement teintés ?",
    "o": [
      "Non, ils doivent laisser passer au moins 70 % de la lumière",
      "Oui, sans limite",
      "Oui, si les vitres arrière sont claires",
      "Oui, seulement en été"
    ],
    "e": "Le pare-brise et les vitres latérales avant doivent rester assez transparents : 70 % de la lumière au moins. Sinon : 135 € et 3 points."
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
    "Autoroute : 130 km/h par temps sec, 110 km/h par temps de pluie. Un jeune conducteur est limité à 110 km/h sur autoroute, même par temps sec (100 km/h sur les sections limitées à moins de 130 km/h).",
    "Visibilité inférieure à 50 mètres (brouillard) : 50 km/h sur toutes les routes."
  ],
  "f5": [
    "Autoroute : voie la plus à droite, sauf pour dépasser. On revient à droite dès le dépassement terminé.",
    "Dépasser est interdit quand la visibilité est insuffisante (virage, sommet de côte).",
    "Dépasser un cycliste : au moins 1 mètre en agglomération, 1,5 mètre hors agglomération.",
    "Le stationnement est interdit sur un passage piéton et à moins de 5 mètres avant.",
    "Changer de file : clignotant, rétroviseurs, puis coup d’œil dans l’angle mort."
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
  ]
};
