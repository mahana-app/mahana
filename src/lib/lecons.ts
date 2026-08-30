/* Les leçons.

   Sept textes courts, à lire en cinq minutes, qui expliquent pourquoi les
   choses marchent — pas des ordres. Une personne qui comprend tient ; une
   personne qui obéit abandonne à la première contrariété. */

export type Lecon = {
  id: string
  titre: string
  chapo: string
  minutes: number
  emoji: string
  paragraphes: string[]
}

export const LECONS: Lecon[] = [
  {
    id: 'bases',
    titre: 'Ce qu’est vraiment le jeûne intermittent',
    chapo: 'Ce n’est pas un régime. C’est un horaire.',
    minutes: 4,
    emoji: '⏳',
    paragraphes: [
      'Le jeûne intermittent ne dit pas quoi manger. Il dit quand. On regroupe ses repas sur une partie de la journée, et on laisse le reste au repos. En 16 : 8, on mange sur huit heures et on jeûne sur seize — dont la nuit, qui compte.',
      'Pourquoi ça fait maigrir ? Pour une raison simple : la plupart des gens mangent moins quand la fenêtre est plus courte. Pas par magie, par arithmétique. Supprimer le grignotage du soir, c’est souvent trois à cinq cents calories en moins par jour, sans rien changer aux repas.',
      'Il se passe aussi autre chose. Quand on ne mange pas, l’insuline redescend. Tant qu’elle est haute, le corps stocke ; quand elle baisse, il peut aller puiser. C’est ce qui explique la sensation de légèreté après quelques jours.',
      'Ce n’est pas une méthode pour tout le monde. En cas de grossesse, d’allaitement, de diabète traité, de troubles alimentaires ou de traitement en cours, il faut en parler à un médecin avant de commencer. Le jeûne n’est pas anodin sous prétexte qu’il est gratuit.',
    ],
  },
  {
    id: 'heures',
    titre: 'Ce qui se passe, heure par heure',
    chapo: 'Digestion, réserves, graisses, cétose, ménage.',
    minutes: 5,
    emoji: '🔥',
    paragraphes: [
      'Pendant les quatre premières heures, le corps digère. Le sucre du repas passe dans le sang, l’insuline monte, et tout ce qui n’est pas utilisé part en réserve. Rien à faire d’autre qu’attendre.',
      'De quatre à douze heures, le corps vit sur son sucre de réserve — le glycogène, stocké dans le foie et les muscles. C’est là que la faim se fait entendre, souvent aux heures habituelles des repas. Elle passe : la faim vient par vagues, elle ne monte pas en ligne droite.',
      'À partir de douze heures, les réserves de sucre s’épuisent et le corps commence à taper dans les graisses. C’est le moment où le jeûne devient intéressant pour la perte de poids.',
      'Vers seize heures, la cétose s’installe : les graisses deviennent le carburant principal. Beaucoup de gens décrivent une tête plus claire à ce stade, et une faim qui s’estompe.',
      'Au-delà de vingt-quatre heures commence l’autophagie, le grand ménage cellulaire. C’est réel, mais ce n’est pas le sujet quand on cherche à perdre du poids — et un jeûne de plus de deux jours ne s’improvise pas sans avis médical.',
      'Ces heures sont des repères moyens. Un corps habitué au jeûne bascule plus vite ; un gros repas riche en sucre retarde tout. La seule vraie mesure, c’est ce que vous ressentez.',
    ],
  },
  {
    id: 'casser',
    titre: 'Ce qui casse un jeûne — et ce qui ne le casse pas',
    chapo: 'La règle : est-ce que ça fait monter l’insuline ?',
    minutes: 3,
    emoji: '☕',
    paragraphes: [
      'Ne cassent pas le jeûne : l’eau, plate ou gazeuse, le café noir sans sucre, le thé nature. Ils n’apportent pas de calories et ne déclenchent pas d’insuline.',
      'Cassent le jeûne : tout ce qui contient du sucre ou des calories. Un jus de fruit, un lait dans le café, une cuillère de sucre, un bonbon « juste un ». Même petit, le sucre relance l’insuline et remet les compteurs à zéro.',
      'Le cas discuté : les édulcorants et les sodas light. Zéro calorie, mais chez certaines personnes le goût sucré suffit à déclencher une réponse. Si le jeûne stagne, c’est la première chose à supprimer pour voir.',
      'Et le plus important : boire beaucoup. La plupart des « faims » de fin de jeûne sont des soifs. Un grand verre d’eau règle le problème neuf fois sur dix.',
    ],
  },
  {
    id: 'rompre',
    titre: 'Bien rompre son jeûne',
    chapo: 'Le repas de rupture décide de toute la journée.',
    minutes: 3,
    emoji: '🥣',
    paragraphes: [
      'Après seize heures sans manger, l’estomac est au repos et l’envie est grande. C’est le moment où l’on peut tout gâcher en dix minutes.',
      'La bonne façon : commencer petit et protéiné. Un yaourt, deux œufs, un bouillon. Puis attendre vingt minutes avant le vrai repas. Le signal de satiété met ce temps-là à arriver — manger vite après un jeûne, c’est manger beaucoup trop.',
      'La mauvaise façon : le sucre rapide à jeun. Un jus, une viennoiserie, un plat très sucré. L’insuline explose, et deux heures plus tard la faim revient plus forte qu’avant.',
      'Un bon repas de rupture contient des protéines, des légumes et un peu de gras. Les féculents peuvent venir, mais pas seuls et pas en premier.',
    ],
  },
  {
    id: 'proteines',
    titre: 'Pourquoi les protéines comptent tant',
    chapo: 'Perdre de la graisse, pas du muscle.',
    minutes: 4,
    emoji: '🥚',
    paragraphes: [
      'Quand on mange moins, le corps ne choisit pas gentiment de puiser uniquement dans la graisse. Il prend aussi du muscle — sauf si on lui donne assez de protéines et qu’on lui demande de s’en servir.',
      'C’est pour ça que l’application vise environ 30 % des calories en protéines, et que les séances de musculation comptent autant que le cardio. Le muscle est ce qui brûle au repos : en perdre, c’est se condamner à reprendre.',
      'Concrètement : un aliment protéiné à chaque repas. Œufs, poisson, poulet, thon, fromage blanc, crevettes. Ce sont aussi les aliments qui calent le plus longtemps.',
      'Autre effet, souvent ignoré : digérer les protéines coûte de l’énergie au corps — plus que les glucides ou les lipides. À calories égales, un repas protéiné fait moins grossir qu’un repas sucré.',
    ],
  },
  {
    id: 'sommeil',
    titre: 'Le sommeil, le levier qu’on oublie',
    chapo: 'Mal dormir dérègle la faim du lendemain.',
    minutes: 3,
    emoji: '🌙',
    paragraphes: [
      'Une nuit trop courte, et deux hormones se dérèglent : celle qui déclenche la faim monte, celle qui annonce la satiété descend. Résultat, on a plus faim et on est rassasiée plus tard.',
      'Ce n’est pas une question de volonté. Après quatre heures de sommeil, la même personne mangera spontanément plusieurs centaines de calories de plus, sans s’en rendre compte.',
      'Et le sucre est particulièrement visé : c’est vers lui que le corps fatigué se tourne, parce qu’il cherche de l’énergie rapide.',
      'Se coucher tôt fait donc autant pour la perte de poids qu’une séance de sport. C’est le levier le moins fatigant de tous — et celui qu’on néglige le plus.',
    ],
  },
  {
    id: 'plateau',
    titre: 'Quand la balance ne bouge plus',
    chapo: 'Le plateau n’est pas un échec, c’est une étape.',
    minutes: 4,
    emoji: '⚖️',
    paragraphes: [
      'Après quelques semaines, la perte s’arrête. C’est normal et ça arrive à tout le monde : un corps plus léger dépense moins, et l’écart avec ce qu’on mange se referme.',
      'Première chose à faire : ne pas manger moins. Descendre encore les calories affame et fait perdre du muscle. C’est le réflexe le plus courant, et le plus contre-productif.',
      'Ce qui marche : bouger davantage dans la journée — la marche, pas forcément le sport —, augmenter les protéines, et vérifier que ce qui est noté correspond vraiment à ce qui est mangé. L’huile de cuisson et les boissons sont les deux oublis classiques.',
      'Et surtout : regarder la courbe sur trois semaines, pas la balance du matin. Le poids varie de un à deux kilos dans une même journée selon l’eau, le sel et le transit. Une seule pesée ne veut rien dire.',
    ],
  },
]

export const leconParId = (id: string) => LECONS.find((l) => l.id === id) ?? null

/** La prochaine leçon à lire : la première qui n'a pas encore été ouverte. */
export function prochaineLecon(lues: string[]): Lecon | null {
  return LECONS.find((l) => !lues.includes(l.id)) ?? null
}
