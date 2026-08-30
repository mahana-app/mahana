/* Les programmes de sport.

   Quatre familles — cardio, pilates, musculation, jiu-jitsu — et pour chacune
   quatre séances complètes, faisables à la maison sans matériel (une chaise et
   un tapis suffisent). Chaque exercice porte sa consigne : c'est elle qui évite
   de se faire mal, surtout au début.

   Le jiu-jitsu se pratique au club, à deux : ce que l'app propose ici, ce sont
   les séances qu'on fait seule entre deux entraînements — les déplacements au
   sol, les hanches, le cardio du tapis. Et bien sûr on note son cours du soir
   comme n'importe quelle autre séance.

   Le « MET » est le coût énergétique de l'effort : 1 MET, c'est le corps au
   repos. Il sert à estimer les calories brûlées, avec le poids de la
   personne — sans capteur, c'est la meilleure approximation possible. */

import type { NomSymbole } from '../composants/Symbole'
import type { CategorieSport, SeanceFaite } from './stockage'

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
  icone: NomSymbole
  couleur: string
}> = [
  {
    id: 'cardio',
    nom: 'Cardio',
    detail: 'Faire monter le cœur, brûler',
    emoji: '🔥',
    icone: 'coeur',
    couleur: 'var(--argile)',
  },
  {
    id: 'pilates',
    nom: 'Pilates',
    detail: 'Gainage, posture, souplesse',
    emoji: '🧘‍♀️',
    icone: 'lotus',
    couleur: 'var(--canard)',
  },
  {
    id: 'muscu',
    nom: 'Musculation',
    detail: 'Garder le muscle en perdant',
    emoji: '💪',
    icone: 'sport',
    couleur: 'var(--olive)',
  },
  {
    id: 'jiujitsu',
    nom: 'Jiu-jitsu',
    detail: 'Déplacements, hanches, cardio du tapis',
    emoji: '🥋',
    icone: 'ceinture',
    couleur: 'var(--miel)',
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

  /* ---------------- jiu-jitsu ---------------- */
  {
    id: 'jjb-deplacements',
    categorie: 'jiujitsu',
    nom: 'Déplacements au sol',
    sousTitre: 'La base : bouger sans forcer sur les bras',
    minutes: 20,
    niveau: 'Débutant',
    met: 5,
    emoji: '🥋',
    exercices: [
      { nom: 'Échauffement cou et hanches', secondes: 180, repos: 20, consigne: 'Rotations lentes. Le cou travaille beaucoup au sol, on le prépare.' },
      { nom: 'Crevette (shrimp)', series: 3, reps: 10, repos: 40, consigne: 'On pousse sur le pied posé pour dégager la hanche — jamais sur les épaules.' },
      { nom: 'Pont (upa)', series: 3, reps: 12, repos: 40, consigne: 'On pousse dans les talons, une épaule reste au sol, le bassin monte haut.' },
      { nom: 'Relevé technique', series: 3, reps: 10, repos: 40, consigne: 'La main au sol reste derrière soi, jamais devant : devant, on la donne.' },
      { nom: 'Roulade sur l’épaule', series: 3, reps: 8, repos: 45, consigne: 'On roule d’une épaule à la hanche opposée. Jamais sur la nuque.' },
      { nom: 'Sprawl', series: 3, reps: 10, repos: 45, consigne: 'Les hanches tombent d’un coup, les jambes partent loin derrière.' },
      { nom: 'Étirement des hanches', secondes: 120, repos: 0, consigne: 'Papillon puis pigeon, sans forcer.' },
    ],
  },
  {
    id: 'jjb-hanches',
    categorie: 'jiujitsu',
    nom: 'Hanches et garde',
    sousTitre: 'La souplesse qui fait tenir la garde',
    minutes: 15,
    niveau: 'Débutant',
    met: 2.5,
    emoji: '🪷',
    exercices: [
      { nom: 'Papillon', secondes: 90, repos: 15, consigne: 'Assise, plantes de pieds jointes, les coudes poussent doucement les genoux.' },
      { nom: 'Pigeon', series: 2, secondes: 60, repos: 15, consigne: '60 secondes de chaque côté. C’est là que la garde se gagne.' },
      { nom: 'Grenouille', secondes: 90, repos: 20, consigne: 'À quatre pattes, genoux écartés, on recule le bassin très lentement.' },
      { nom: 'Fente basse avec rotation', series: 2, secondes: 45, repos: 20, consigne: 'Chaque côté. Le bras s’ouvre vers le plafond, le regard suit.' },
      { nom: 'Cobra', secondes: 60, repos: 15, consigne: 'Sur le ventre, on ouvre la poitrine. Contrepoids de tout ce qui se passe en boule.' },
      { nom: 'Cou en douceur', secondes: 90, repos: 0, consigne: 'Oreille vers l’épaule, puis l’autre. Jamais de cercle complet.' },
    ],
  },
  {
    id: 'jjb-prepa',
    categorie: 'jiujitsu',
    nom: 'Préparation physique du tapis',
    sousTitre: 'La poigne, le gainage, les jambes',
    minutes: 25,
    niveau: 'Intermédiaire',
    met: 6.5,
    emoji: '💪',
    exercices: [
      { nom: 'Échauffement complet', secondes: 180, repos: 30, consigne: 'Cercles de bras, quelques squats à vide, deux ponts.' },
      { nom: 'Tirage à la serviette', series: 4, reps: 8, repos: 60, consigne: 'Une serviette passée sur une barre : c’est la prise du kimono qu’on travaille.' },
      { nom: 'Suspension ou serrage', series: 3, secondes: 25, repos: 45, consigne: 'Tenir le plus longtemps possible. Au jiu-jitsu, les mains lâchent avant le reste.' },
      { nom: 'Pont fessier une jambe', series: 3, reps: 12, repos: 45, consigne: '12 par jambe. C’est le pont du tapis, en plus fort.' },
      { nom: 'Squat gobelet', series: 4, reps: 12, repos: 60, consigne: 'Une charge contre la poitrine, dos droit, on descend bas.' },
      { nom: 'Gainage avec rotation', series: 3, secondes: 40, repos: 40, consigne: 'En planche, on tourne le bassin d’un côté puis de l’autre.' },
      { nom: 'Étirements', secondes: 120, repos: 0, consigne: 'Hanches, dos, avant-bras.' },
    ],
  },
  {
    id: 'jjb-rounds',
    categorie: 'jiujitsu',
    nom: 'Rounds à vide',
    sousTitre: 'Le cardio qui manque en premier',
    minutes: 20,
    niveau: 'Confirmé',
    met: 8.5,
    emoji: '⏱️',
    exercices: [
      { nom: 'Échauffement', secondes: 180, repos: 30, consigne: 'Déplacements lents : crevettes, ponts, relevés.' },
      { nom: 'Round enchaîné', series: 4, secondes: 180, repos: 60, consigne: 'Crevette, pont, relevé, sprawl, sans jamais s’arrêter. Comme un combat : trois minutes, une minute de repos.' },
      { nom: 'Retour au calme', secondes: 120, repos: 0, consigne: 'On marche, on respire, on étire les hanches.' },
    ],
  },
]

/* Le symbole d'un sport, celui de sa famille. « Dehors » n'en a pas : une
   sortie reste un entraînement, on lui laisse l'icône générique. */
export function symboleFamille(categorie: CategorieSport): NomSymbole {
  return FAMILLES.find((f) => f.id === categorie)?.icone ?? 'sport'
}

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
  icone: NomSymbole
  /** Calories par kilo de poids et par kilomètre parcouru. */
  parKgParKm: number
}

export const SORTIES: TypeSortie[] = [
  { id: 'marche', nom: 'Marche', emoji: '🚶‍♀️', icone: 'marche', parKgParKm: 0.5 },
  { id: 'course', nom: 'Course', emoji: '🏃‍♀️', icone: 'course', parKgParKm: 0.95 },
  { id: 'velo', nom: 'Vélo', emoji: '🚴‍♀️', icone: 'velo', parKgParKm: 0.28 },
  { id: 'rando', nom: 'Randonnée', emoji: '🥾', icone: 'montagne', parKgParKm: 0.6 },
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

/* ---------- noter une séance à la main ---------- */

/** Ce qui a travaillé pendant la séance. */
export const PARTIES_CORPS = [
  'Corps entier',
  'Haut du corps',
  'Bas du corps',
  'Abdos et gainage',
  'Fessiers',
  'Hanches',
  'Dos',
  'Bras',
  'Jambes',
  'Cardio',
  'Souplesse',
]

export type Intensite = 'douce' | 'moderee' | 'intense'

export const INTENSITES: Array<{ id: Intensite; nom: string; detail: string }> = [
  { id: 'douce', nom: 'Douce', detail: 'On peut parler sans effort' },
  { id: 'moderee', nom: 'Modérée', detail: 'On souffle, on peut encore parler' },
  { id: 'intense', nom: 'Intense', detail: 'On ne peut plus parler' },
]

/* Le coût énergétique dépend du sport et de l'effort réellement fourni :
   un pilates doux et un HIIT n'ont rien à voir. */
const MET: Record<string, Record<Intensite, number>> = {
  cardio: { douce: 4.5, moderee: 7, intense: 9.5 },
  pilates: { douce: 2.5, moderee: 3.5, intense: 4.5 },
  muscu: { douce: 3.5, moderee: 5, intense: 6.5 },
  /* Le jiu-jitsu est l'un des sports les plus coûteux qui soient : un round
     de combat monte aussi haut qu'une course rapide. */
  jiujitsu: { douce: 5, moderee: 7.5, intense: 10.3 },
  exterieur: { douce: 3.5, moderee: 5.5, intense: 8 },
}

/** L'estimation de calories proposée quand on note une séance à la main. */
export function caloriesEstimees(
  categorie: CategorieSport,
  intensite: Intensite,
  minutes: number,
  poidsKg: number,
): number {
  const met = (MET[categorie] ?? MET.muscu)[intensite]
  return Math.round((met * poidsKg * minutes) / 60)
}

/* ---------- les programmes suivis ---------- */

/** Le prochain jour à faire : le plus grand numéro déjà noté, plus un. */
export function prochainJour(programmeId: string, seances: SeanceFaite[]): number {
  const faits = seances
    .filter((s) => s.programmeId === programmeId && s.numeroJour)
    .map((s) => s.numeroJour as number)
  return faits.length === 0 ? 1 : Math.max(...faits) + 1
}

/** Les numéros de jour déjà faits, pour cocher la grille. */
export function joursFaits(programmeId: string, seances: SeanceFaite[]): Set<number> {
  return new Set(
    seances
      .filter((s) => s.programmeId === programmeId && s.numeroJour)
      .map((s) => s.numeroJour as number),
  )
}
