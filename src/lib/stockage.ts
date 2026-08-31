/* Tout ce que l'app retient est gardé dans le téléphone, nulle part ailleurs :
   aucun compte, aucun serveur, aucune donnée qui part sur internet.
   Effacer les données du navigateur efface le suivi — d'où l'export
   dans les réglages. */

export type Sexe = 'F' | 'H'

/** Ce que la personne fait de ses journées, hors sport noté dans l'app. */
export type Niveau = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'intense'

/** Le rythme visé : perdre, se maintenir, ou reprendre la forme sans régime. */
export type Objectif = 'perte-douce' | 'perte' | 'maintien'

/** L'habillage : « argile » (clair, terre cuite) ou « neon » (fond noir). */
export type Theme = 'argile' | 'neon'

export type Profil = {
  prenom: string
  sexe: Sexe
  age: number | null
  tailleCm: number | null
  poidsBut: number | null
  niveau: Niveau
  objectif: Objectif
  /** Objectif de calories fixé à la main. Vide = calculé depuis le profil. */
  kcalManuel: number | null
  butEau: number
  verreMl: number
  butPas: number
  /** Heures de sommeil visées, en minutes. */
  butSommeilMin: number
  /** Rythme de jeûne choisi et durée visée. */
  planJeune: string
  objectifJeuneHeures: number
  /** L'heure à laquelle le prochain jeûne est prévu, « 19:30 ». */
  heureJeune: string
  /** Ajouter les calories du sport à ce qu'on peut manger dans la journée. */
  ajouterKcalBrulees: boolean
  /**
   * Comment l'objectif de calories se répartit entre les repas, en parts de 1.
   * Par défaut : un quart le matin, un tiers à midi, un tiers le soir,
   * le reste pour les en-cas.
   */
  repartition: { petitDejeuner: number; dejeuner: number; diner: number; encas: number }
  /** Le jeûne mis en pause sans perdre la série — vacances, maladie, fête. */
  modeVacances: boolean
  /** L'habillage choisi. Les anciennes sauvegardes n'en ont pas : argile. */
  theme: Theme
}

export type Jeune = {
  id: string
  debut: string
  fin: string | null
  objectifHeures: number
}

export type Pesee = { jour: string; poids: number }

/** Un plat composé une fois, gardé pour ne pas tout ressaisir la prochaine. */
export type PlatGarde = {
  id: string
  nom: string
  kcal: number
  glucides: number
  proteines: number
  lipides: number
}

export type MomentRepas = 'petit-dejeuner' | 'dejeuner' | 'diner' | 'encas'

export type LigneRepas = {
  id: string
  jour: string
  moment: MomentRepas
  nom: string
  /** Quantité mangée, en grammes (ou en unités pour les aliments comptés). */
  quantite: number
  unite: 'g' | 'ml' | 'portion'
  kcal: number
  glucides: number
  proteines: number
  lipides: number
  /** La clé de la photo du repas, gardée à part dans la réserve d'images. */
  photoId?: string
  /** Vrai quand les calories viennent d'une estimation guidée, pas d'une pesée. */
  estime?: boolean
}

/* Une recette écrite par soi : ce qu'on cuisine vraiment. Le carnet des
   recettes toutes faites donne des idées ; celui-ci donne les siennes, et
   c'est lui qu'on regarde à 18 h quand on ne sait pas quoi préparer. */
export type RecettePerso = {
  id: string
  nom: string
  /** À quel repas on la sert : c'est ce qui fait remonter les dîners le soir. */
  moment: MomentRepas
  emoji: string
  /** Une ligne par ingrédient, telle qu'on l'a écrite. */
  ingredients: string[]
  /** La marche à suivre. Vide quand on n'a pas pris le temps de la noter. */
  etapes: string[]
  minutes: number
  portions: number
  /** Par portion. Estimé depuis les ingrédients, toujours corrigeable. */
  kcal: number
  glucides: number
  proteines: number
  lipides: number
  photoId?: string
  /** Le jour où elle a été écrite, pour montrer les dernières en premier. */
  creee: string
}

export type CategorieSport = 'cardio' | 'pilates' | 'muscu' | 'jiujitsu' | 'exterieur'

export type SeanceFaite = {
  id: string
  jour: string
  categorie: CategorieSport
  nom: string
  minutes: number
  kcal: number
  /** Renseignée seulement pour les sorties suivies au GPS. */
  distanceKm?: number
  /** Ce qui a travaillé : haut du corps, fessiers, abdos… */
  parties?: string[]
  /** Le programme suivi, quand la séance en fait partie. */
  programmeId?: string
  /** Le numéro du jour dans ce programme : « Jour 5 sur 28 ». */
  numeroJour?: number
}

/**
 * Un programme suivi : une série de séances numérotées, comme les défis
 * de vingt-huit jours qu'on suit en vidéo. L'avancement se compte en
 * séances faites, pas en jours de calendrier — sauter un jour ne fait pas
 * perdre sa place.
 */
/** L'effort d'une séance, qui décide des calories brûlées. */
export type IntensiteSeance = 'douce' | 'moderee' | 'intense'

/* Un exercice d'une séance écrite par soi. Les champs sont nullables plutôt
   qu'absents : un formulaire manipule mieux « vide » que « pas là ». */
export type ExercicePerso = {
  nom: string
  series: number
  /** Des répétitions, ou une durée en secondes : l'un OU l'autre. */
  reps: number | null
  secondes: number | null
  /** Repos après l'exercice, en secondes. */
  repos: number
  consigne: string
}

/** Une séance montée par soi, dans une des familles de sport. */
export type SeancePerso = {
  id: string
  categorie: CategorieSport
  nom: string
  sousTitre: string
  intensite: IntensiteSeance
  exercices: ExercicePerso[]
  creee: string
}

export type Programme = {
  id: string
  nom: string
  categorie: CategorieSport
  /** Nombre de jours du programme. */
  jours: number
  /** Le jour où il a été commencé. */
  debut: string
  /** L'adresse de la chaîne ou de la liste de lecture, si on en a une. */
  lien?: string
  /** Avec qui on le suit — une belle-sœur, une amie. */
  avec?: string
  termine: boolean
}

export type Nuit = {
  jour: string
  /** Heures au format « 21:30 ». Le coucher peut appartenir à la veille. */
  coucher: string
  lever: string
  minutes: number
}

export type DefiEnCours = {
  defiId: string
  /** Premier jour du défi. Il dure sept jours. */
  debut: string
  /** Les journées validées, par clé de jour. */
  coches: string[]
}

export type DefiFini = {
  defiId: string
  debut: string
  reussis: number
}

/** Une habitude s'installe sur vingt et un jours, pas sur sept. */
export type HabitudeEnCours = {
  habitudeId: string
  debut: string
  coches: string[]
}

export type HabitudeFinie = {
  habitudeId: string
  debut: string
  reussis: number
}

export type Etat = {
  version: 2
  demarre: boolean
  profil: Profil
  jeunes: Jeune[]
  pesees: Pesee[]
  repas: LigneRepas[]
  seances: SeanceFaite[]
  nuits: Nuit[]
  programmes: Programme[]
  platsGardes: PlatGarde[]
  /** Verres d'eau bus, par journée. */
  eau: Record<string, number>
  /** Pas marchés, par journée. */
  pas: Record<string, number>
  defiEnCours: DefiEnCours | null
  defisFinis: DefiFini[]
  habitudeEnCours: HabitudeEnCours | null
  habitudesFinies: HabitudeFinie[]
  /** Les leçons déjà lues, par identifiant. */
  leconsLues: string[]
  /** Les recettes mises de côté. */
  recettesGardees: string[]
  /** Les recettes écrites par soi, et les séances montées par soi. */
  mesRecettes: RecettePerso[]
  mesSeances: SeancePerso[]
}

export const PROFIL_PAR_DEFAUT: Profil = {
  prenom: '',
  sexe: 'F',
  age: null,
  tailleCm: null,
  poidsBut: null,
  niveau: 'leger',
  objectif: 'perte',
  kcalManuel: null,
  butEau: 8,
  verreMl: 250,
  butPas: 8000,
  butSommeilMin: 8 * 60,
  planJeune: '16-8',
  objectifJeuneHeures: 16,
  heureJeune: '20:00',
  ajouterKcalBrulees: true,
  repartition: { petitDejeuner: 0.25, dejeuner: 0.35, diner: 0.35, encas: 0.05 },
  modeVacances: false,
  theme: 'argile',
}

export const ETAT_VIDE: Etat = {
  version: 2,
  demarre: false,
  profil: PROFIL_PAR_DEFAUT,
  jeunes: [],
  pesees: [],
  repas: [],
  seances: [],
  nuits: [],
  programmes: [],
  platsGardes: [],
  eau: {},
  pas: {},
  defiEnCours: null,
  defisFinis: [],
  habitudeEnCours: null,
  habitudesFinies: [],
  leconsLues: [],
  recettesGardees: [],
  mesRecettes: [],
  mesSeances: [],
}

const CLE = 'mahana.v1'

/** L'ancienne version de l'app ne connaissait que le jeûne, l'eau et le poids. */
type EtatV1 = {
  version: 1
  demarre?: boolean
  reglages?: Partial<{
    prenom: string
    plan: string
    objectifHeures: number
    butEau: number
    verreMl: number
    poidsBut: number | null
    tailleCm: number | null
  }>
  jeunes?: Jeune[]
  eau?: Record<string, number>
  pesees?: Pesee[]
}

function reprendreV1(ancien: EtatV1): Etat {
  const r = ancien.reglages ?? {}
  return {
    ...ETAT_VIDE,
    demarre: ancien.demarre ?? false,
    profil: {
      ...PROFIL_PAR_DEFAUT,
      prenom: r.prenom ?? '',
      poidsBut: r.poidsBut ?? null,
      tailleCm: r.tailleCm ?? null,
      butEau: r.butEau ?? PROFIL_PAR_DEFAUT.butEau,
      verreMl: r.verreMl ?? PROFIL_PAR_DEFAUT.verreMl,
      planJeune: r.plan ?? PROFIL_PAR_DEFAUT.planJeune,
      objectifJeuneHeures: r.objectifHeures ?? PROFIL_PAR_DEFAUT.objectifJeuneHeures,
    },
    jeunes: ancien.jeunes ?? [],
    eau: ancien.eau ?? {},
    pesees: ancien.pesees ?? [],
  }
}

export function lireEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return ETAT_VIDE
    const lu = JSON.parse(brut) as Partial<Omit<Etat, 'version'>> & { version?: number }
    if (lu.version === 1) return reprendreV1(lu as unknown as EtatV1)
    // On recolle sur l'état vide : une sauvegarde plus ancienne, à qui il
    // manque une rubrique ajoutée depuis, ne doit pas faire planter l'écran.
    return {
      ...ETAT_VIDE,
      ...lu,
      version: 2,
      profil: { ...PROFIL_PAR_DEFAUT, ...(lu.profil ?? {}) },
      jeunes: lu.jeunes ?? [],
      pesees: lu.pesees ?? [],
      repas: lu.repas ?? [],
      seances: lu.seances ?? [],
      nuits: lu.nuits ?? [],
      programmes: lu.programmes ?? [],
      platsGardes: lu.platsGardes ?? [],
      eau: lu.eau ?? {},
      pas: lu.pas ?? {},
      defiEnCours: lu.defiEnCours ?? null,
      defisFinis: lu.defisFinis ?? [],
      habitudeEnCours: lu.habitudeEnCours ?? null,
      habitudesFinies: lu.habitudesFinies ?? [],
      leconsLues: lu.leconsLues ?? [],
      recettesGardees: lu.recettesGardees ?? [],
      mesRecettes: lu.mesRecettes ?? [],
      mesSeances: lu.mesSeances ?? [],
    }
  } catch {
    return ETAT_VIDE
  }
}

export function ecrireEtat(etat: Etat): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat))
  } catch {
    // Navigation privée, mémoire pleine : on continue sans rien retenir
    // plutôt que de bloquer l'écran.
  }
}

export function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
