/* Tout ce que l'app retient est gardé dans le téléphone, nulle part ailleurs :
   aucun compte, aucun serveur, aucune donnée qui part sur internet.
   Effacer les données du navigateur efface le suivi — d'où l'export
   dans les réglages. */

export type Sexe = 'F' | 'H'

/** Ce que la personne fait de ses journées, hors sport noté dans l'app. */
export type Niveau = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'intense'

/** Le rythme visé : perdre, se maintenir, ou reprendre la forme sans régime. */
export type Objectif = 'perte-douce' | 'perte' | 'maintien'

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
}

export type Jeune = {
  id: string
  debut: string
  fin: string | null
  objectifHeures: number
}

export type Pesee = { jour: string; poids: number }

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
}

export type CategorieSport = 'cardio' | 'pilates' | 'muscu' | 'exterieur'

export type SeanceFaite = {
  id: string
  jour: string
  categorie: CategorieSport
  nom: string
  minutes: number
  kcal: number
  /** Renseignée seulement pour les sorties suivies au GPS. */
  distanceKm?: number
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

export type Etat = {
  version: 2
  demarre: boolean
  profil: Profil
  jeunes: Jeune[]
  pesees: Pesee[]
  repas: LigneRepas[]
  seances: SeanceFaite[]
  nuits: Nuit[]
  /** Verres d'eau bus, par journée. */
  eau: Record<string, number>
  /** Pas marchés, par journée. */
  pas: Record<string, number>
  defiEnCours: DefiEnCours | null
  defisFinis: DefiFini[]
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
  eau: {},
  pas: {},
  defiEnCours: null,
  defisFinis: [],
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
      eau: lu.eau ?? {},
      pas: lu.pas ?? {},
      defiEnCours: lu.defiEnCours ?? null,
      defisFinis: lu.defisFinis ?? [],
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
