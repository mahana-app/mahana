/* Les programmes de sport.

   Trois familles — cardio, pilates, musculation — et pour chacune quatre
   séances complètes, faisables à la maison sans matériel (une chaise et un
   tapis suffisent). Chaque exercice porte sa consigne : c'est elle qui évite
   de se faire mal, surtout au début.

   Le « MET » est le coût énergétique de l'effort : 1 MET, c'est le corps au
   repos. Il sert à estimer les calories brûlées, avec le poids de la
   personne — sans capteur, c'est la meilleure approximation possible. */

import type { CategorieSport } from './stockage'

export type Exercice = {
  nom: string
  /** Nombre de séries. Absent pour les exercices tenus une seule fois. */
  series?: number
  /** Répétitions par série, ou durée en secondes : l'un ou l'autre. */
  reps?: number
  secondes?: number
  /** Repos après l'exercice, en secondes. */
  repos: number
  consigne: string
}

export type Seance = {
  id: string
  categorie: Exclude<CategorieSport, 'exterieur'>
  nom: string
  sousTitre: string
  minutes: number
  niveau: 'Débutant' | 'Intermédiaire' | 'Confirmé'
  met: number
  emoji: string
  exercices: Exercice[]
}

export const FAMILLES: Array<{
  id: Exclude<CategorieSport, 'exterieur'>
  nom: string
  detail: string
  emoji: string
  couleur: string
}> = [
  {
    id: 'cardio',
    nom: 'Cardio',
    detail: 'Faire monter le cœur, brûler',
    emoji: '🔥',
    couleur: 'var(--corail)',
  },
  {
    id: 'pilates',
    nom: 'Pilates',
    detail: 'Gainage, posture, souplesse',
    emoji: '🧘‍♀️',
    couleur: 'var(--lavande)',
  },
  {
    id: 'muscu',
    nom: 'Musculation',
    detail: 'Garder le muscle en perdant',
    emoji: '💪',
    couleur: 'var(--menthe)',
  },
]

export const SEANCES: Seance[] = [
  /* ---------------- cardio ---------------- */
  {
    id: 'cardio-marche',
    categorie: 'cardio',
    nom: 'Marche active',
    sousTitre: 'La séance qui ne fait jamais mal',
    minutes: 30,
    niveau: 'Débutant',
    met: 4.3,
    emoji: '🚶‍♀️',
    exercices: [
      { nom: 'Échauffement', secondes: 300, repos: 0, consigne: 'Marche tranquille, on respire par le nez.' },
      { nom: 'Marche rapide', series: 4, secondes: 240, repos: 60, consigne: 'Assez vite pour être essoufflée mais pouvoir parler.' },
      { nom: 'Retour au calme', secondes: 300, repos: 0, consigne: 'On ralentit, on laisse le cœur redescendre.' },
    ],
  },
  {
    id: 'cardio-hiit',
    categorie: 'cardio',
    nom: 'HIIT brûle-tout',
    sousTitre: 'Court, intense, efficace',
    minutes: 20,
    niveau: 'Confirmé',
    met: 8,
    emoji: '⚡',
    exercices: [
      { nom: 'Échauffement en place', secondes: 120, repos: 20, consigne: 'Montées de genoux douces, épaules relâchées.' },
      { nom: 'Jumping jacks', series: 3, secondes: 40, repos: 20, consigne: 'Bras et jambes ensemble, réception souple.' },
      { nom: 'Squats sautés', series: 3, secondes: 40, repos: 20, consigne: 'Genoux dans l’axe des pieds, dos droit.' },
      { nom: 'Montées de genoux', series: 3, secondes: 40, repos: 20, consigne: 'Le plus vite possible, ventre serré.' },
      { nom: 'Grimpeur (mountain climber)', series: 3, secondes: 40, repos: 20, consigne: 'Bassin bas, on ne monte pas les fesses.' },
      { nom: 'Retour au calme', secondes: 120, repos: 0, consigne: 'Marche sur place, grandes respirations.' },
    ],
  },
  {
    id: 'cardio-maison',
    categorie: 'cardio',
    nom: 'Cardio doux maison',
    sousTitre: 'Sans sauter, sans déranger les voisins',
    minutes: 25,
    niveau: 'Débutant',
    met: 5,
    emoji: '🏠',
    exercices: [
      { nom: 'Marche sur place', secondes: 180, repos: 15, consigne: 'On lance la machine, bras qui balancent.' },
      { nom: 'Pas chassés', series: 3, secondes: 45, repos: 25, consigne: 'Un pas de côté, on reste bas sur les jambes.' },
      { nom: 'Talons-fesses', series: 3, secondes: 45, repos: 25, consigne: 'Rythme régulier, ventre gainé.' },
      { nom: 'Boxe dans le vide', series: 3, secondes: 45, repos: 25, consigne: 'On tourne le buste à chaque coup.' },
      { nom: 'Montées sur une marche', series: 3, secondes: 45, repos: 25, consigne: 'On alterne la jambe qui monte.' },
      { nom: 'Étirements', secondes: 180, repos: 0, consigne: 'Mollets, cuisses, dos. Sans forcer.' },
    ],
  },
  {
    id: 'cardio-corde',
    categorie: 'cardio',
    nom: 'Corde à sauter',
    sousTitre: 'Quinze minutes qui comptent double',
    minutes: 15,
    niveau: 'Intermédiaire',
    met: 11,
    emoji: '🪢',
    exercices: [
      { nom: 'Échauffement chevilles', secondes: 120, repos: 20, consigne: 'Petits sauts sans corde, sur la pointe.' },
      { nom: 'Saut simple', series: 5, secondes: 60, repos: 45, consigne: 'Coudes près du corps, ce sont les poignets qui tournent.' },
      { nom: 'Retour au calme', secondes: 180, repos: 0, consigne: 'Marche, puis mollets étirés contre un mur.' },
    ],
  },

  /* ---------------- pilates ---------------- */
  {
    id: 'pilates-centre',
    categorie: 'pilates',
    nom: 'Réveil du centre',
    sousTitre: 'La base, à faire en premier',
    minutes: 20,
    niveau: 'Débutant',
    met: 3,
    emoji: '🌸',
    exercices: [
      { nom: 'Respiration allongée', secondes: 120, repos: 15, consigne: 'Inspirer par le nez, souffler longuement en rentrant le nombril.' },
      { nom: 'Le cent (the hundred)', series: 1, secondes: 60, repos: 30, consigne: 'Jambes fléchies, on bat des bras en soufflant.' },
      { nom: 'Bascule du bassin', series: 2, reps: 12, repos: 30, consigne: 'On déroule le dos vertèbre par vertèbre.' },
      { nom: 'Pont fessier', series: 3, reps: 12, repos: 30, consigne: 'On pousse dans les talons, on serre les fesses en haut.' },
      { nom: 'Dead bug', series: 3, reps: 10, repos: 30, consigne: 'Le bas du dos reste collé au sol. C’est la règle.' },
      { nom: 'Étirement en boule', secondes: 60, repos: 0, consigne: 'Genoux à la poitrine, on relâche tout.' },
    ],
  },
  {
    id: 'pilates-dos',
    categorie: 'pilates',
    nom: 'Dos et posture',
    sousTitre: 'Pour celles qui restent debout ou assises',
    minutes: 25,
    niveau: 'Débutant',
    met: 3,
    emoji: '🪷',
    exercices: [
      { nom: 'Chat-vache', series: 2, reps: 12, repos: 20, consigne: 'À quatre pattes, on creuse puis on arrondit, lentement.' },
      { nom: 'Le cygne (swan)', series: 3, reps: 10, repos: 30, consigne: 'Sur le ventre, on décolle le buste sans forcer la nuque.' },
      { nom: 'Nage (swimming)', series: 3, secondes: 30, repos: 30, consigne: 'Bras et jambe opposés, petits battements.' },
      { nom: 'Planche latérale', series: 2, secondes: 30, repos: 30, consigne: 'Une jambe fléchie au sol si c’est trop dur.' },
      { nom: 'Rotation du buste assise', series: 2, reps: 10, repos: 20, consigne: 'Le bassin ne bouge pas, seul le haut tourne.' },
      { nom: 'Étirement de l’enfant', secondes: 90, repos: 0, consigne: 'Fesses sur les talons, bras loin devant.' },
    ],
  },
  {
    id: 'pilates-abdos',
    categorie: 'pilates',
    nom: 'Abdos profonds',
    sousTitre: 'Le ventre se resserre de l’intérieur',
    minutes: 20,
    niveau: 'Intermédiaire',
    met: 3.5,
    emoji: '✨',
    exercices: [
      { nom: 'Le cent', series: 1, secondes: 90, repos: 30, consigne: 'Jambes tendues en l’air si le dos reste plaqué.' },
      { nom: 'Ciseaux (single leg stretch)', series: 3, reps: 16, repos: 25, consigne: 'On alterne les jambes, épaules décollées.' },
      { nom: 'Criss-cross', series: 3, reps: 16, repos: 25, consigne: 'Coude vers le genou opposé, sans tirer sur la nuque.' },
      { nom: 'Teaser préparatoire', series: 3, reps: 8, repos: 30, consigne: 'On remonte doucement, bras vers les pieds.' },
      { nom: 'Planche', series: 3, secondes: 40, repos: 30, consigne: 'Le corps fait une ligne. Fesses ni hautes ni basses.' },
    ],
  },
  {
    id: 'pilates-souplesse',
    categorie: 'pilates',
    nom: 'Souplesse et détente',
    sousTitre: 'Le soir, avant de dormir',
    minutes: 15,
    niveau: 'Débutant',
    met: 2.5,
    emoji: '🌙',
    exercices: [
      { nom: 'Étirement de la chaîne arrière', secondes: 90, repos: 15, consigne: 'Assise, jambes tendues, on descend sans arrondir.' },
      { nom: 'Ouverture des hanches', secondes: 90, repos: 15, consigne: 'Papillon, coudes qui poussent doucement les genoux.' },
      { nom: 'Torsion allongée', series: 2, secondes: 60, repos: 15, consigne: 'Genoux d’un côté, regard de l’autre. On respire.' },
      { nom: 'Étirement des épaules', secondes: 60, repos: 15, consigne: 'Bras en travers de la poitrine, puis l’autre.' },
      { nom: 'Jambes au mur', secondes: 180, repos: 0, consigne: 'Excellent pour les jambes lourdes après le service.' },
    ],
  },

  /* ---------------- musculation ---------------- */
  {
    id: 'muscu-bas',
    categorie: 'muscu',
    nom: 'Bas du corps',
    sousTitre: 'Cuisses, fessiers, mollets',
    minutes: 30,
    niveau: 'Intermédiaire',
    met: 5,
    emoji: '🦵',
    exercices: [
      { nom: 'Échauffement articulaire', secondes: 180, repos: 20, consigne: 'Cercles de hanches, montées de genoux.' },
      { nom: 'Squats', series: 4, reps: 15, repos: 60, consigne: 'On s’assoit en arrière, talons au sol, dos droit.' },
      { nom: 'Fentes avant', series: 3, reps: 12, repos: 60, consigne: '12 par jambe. Le genou avant ne dépasse pas le pied.' },
      { nom: 'Pont fessier', series: 4, reps: 15, repos: 45, consigne: 'On serre fort une seconde en haut.' },
      { nom: 'Chaise contre le mur', series: 3, secondes: 40, repos: 45, consigne: 'Cuisses parallèles au sol, on tient.' },
      { nom: 'Mollets', series: 3, reps: 20, repos: 30, consigne: 'Sur la pointe des pieds, lentement à la descente.' },
    ],
  },
  {
    id: 'muscu-haut',
    categorie: 'muscu',
    nom: 'Haut du corps',
    sousTitre: 'Bras, dos, épaules',
    minutes: 30,
    niveau: 'Intermédiaire',
    met: 5,
    emoji: '💪',
    exercices: [
      { nom: 'Échauffement épaules', secondes: 150, repos: 20, consigne: 'Grands cercles de bras, avant puis arrière.' },
      { nom: 'Pompes (sur les genoux si besoin)', series: 4, reps: 10, repos: 60, consigne: 'Coudes vers l’arrière, pas écartés en croix.' },
      { nom: 'Rowing avec bouteilles d’eau', series: 4, reps: 12, repos: 60, consigne: 'Dos plat, on tire les coudes vers le plafond.' },
      { nom: 'Développé épaules', series: 3, reps: 12, repos: 45, consigne: 'On pousse au-dessus de la tête sans cambrer.' },
      { nom: 'Dips sur une chaise', series: 3, reps: 10, repos: 45, consigne: 'Chaise stable contre un mur. Descente contrôlée.' },
      { nom: 'Curl biceps', series: 3, reps: 15, repos: 30, consigne: 'Coudes collés au corps.' },
    ],
  },
  {
    id: 'muscu-fullbody',
    categorie: 'muscu',
    nom: 'Full body',
    sousTitre: 'Tout le corps en une séance',
    minutes: 35,
    niveau: 'Confirmé',
    met: 6,
    emoji: '🏋️‍♀️',
    exercices: [
      { nom: 'Échauffement complet', secondes: 240, repos: 30, consigne: 'Marche sur place, cercles, quelques squats à vide.' },
      { nom: 'Goblet squat', series: 4, reps: 12, repos: 60, consigne: 'Une charge contre la poitrine (sac, bouteille).' },
      { nom: 'Pompes', series: 4, reps: 10, repos: 60, consigne: 'Sur les genoux si la ligne du dos casse.' },
      { nom: 'Rowing penché', series: 4, reps: 12, repos: 60, consigne: 'Buste incliné, dos plat, ventre serré.' },
      { nom: 'Fentes arrière', series: 3, reps: 12, repos: 60, consigne: '12 par jambe, on pose loin derrière.' },
      { nom: 'Planche', series: 3, secondes: 45, repos: 45, consigne: 'On respire pendant, on ne bloque pas.' },
    ],
  },
  {
    id: 'muscu-gainage',
    categorie: 'muscu',
    nom: 'Gainage express',
    sousTitre: 'Quinze minutes, le ventre et le dos',
    minutes: 15,
    niveau: 'Débutant',
    met: 4,
    emoji: '🎯',
    exercices: [
      { nom: 'Planche', series: 3, secondes: 30, repos: 30, consigne: 'Coudes sous les épaules, fesses dans l’axe.' },
      { nom: 'Planche latérale', series: 2, secondes: 25, repos: 30, consigne: '25 secondes de chaque côté.' },
      { nom: 'Superman', series: 3, reps: 12, repos: 30, consigne: 'Sur le ventre, on décolle bras et jambes.' },
      { nom: 'Hollow body', series: 3, secondes: 25, repos: 30, consigne: 'Le bas du dos reste au sol, sinon on plie les genoux.' },
      { nom: 'Relevé de jambes', series: 3, reps: 12, repos: 30, consigne: 'Mains sous les fesses, descente lente.' },
    ],
  },
]

export const seanceParId = (id: string) => SEANCES.find((s) => s.id === id) ?? null

/** Durée totale d'un exercice (toutes séries + repos), en secondes. */
export function dureeExercice(exercice: Exercice): number {
  const series = exercice.series ?? 1
  // Une répétition prend environ trois secondes, montée et descente comprises.
  const travail = exercice.secondes ?? (exercice.reps ?? 10) * 3
  return series * travail + series * exercice.repos
}

/** Calories d'une séance : MET × poids × durée. Sans capteur, c'est l'estimation. */
export function caloriesSeance(met: number, minutes: number, poidsKg: number): number {
  return Math.round((met * poidsKg * minutes) / 60)
}

/* ---------- les sorties dehors, suivies au GPS ---------- */

export type TypeSortie = {
  id: string
  nom: string
  emoji: string
  /** Calories par kilo de poids et par kilomètre parcouru. */
  parKgParKm: number
}

export const SORTIES: TypeSortie[] = [
  { id: 'marche', nom: 'Marche', emoji: '🚶‍♀️', parKgParKm: 0.5 },
  { id: 'course', nom: 'Course', emoji: '🏃‍♀️', parKgParKm: 0.95 },
  { id: 'velo', nom: 'Vélo', emoji: '🚴‍♀️', parKgParKm: 0.28 },
  { id: 'rando', nom: 'Randonnée', emoji: '🥾', parKgParKm: 0.6 },
]

export function caloriesSortie(sortie: TypeSortie, distanceKm: number, poidsKg: number): number {
  return Math.round(sortie.parKgParKm * poidsKg * distanceKm)
}

/** L'allure, en minutes par kilomètre : « 6:30 /km ». */
export function allure(distanceKm: number, secondes: number): string {
  if (distanceKm < 0.05) return '—'
  const parKm = secondes / 60 / distanceKm
  const minutes = Math.floor(parKm)
  const reste = Math.round((parKm - minutes) * 60)
  return `${minutes}:${String(reste).padStart(2, '0')} /km`
}
