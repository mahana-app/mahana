/* Tout ce que l'app retient est gardé dans le téléphone, nulle part ailleurs :
   aucun compte, aucun serveur, aucune donnée qui part sur internet.
   Effacer les données du navigateur efface le suivi — d'où l'export
   dans les réglages. */

export type Reglages = {
  prenom: string
  /** Identifiant du rythme choisi (voir PLANS dans jeune.ts). */
  plan: string
  /** Heures de jeûne visées — recopié du plan, modifiable à la main. */
  objectifHeures: number
  /** Nombre de verres d'eau visés par jour. */
  butEau: number
  /** Contenance d'un verre, en millilitres. */
  verreMl: number
  /** Poids visé, en kilos. Vide tant qu'il n'est pas fixé. */
  poidsBut: number | null
  /** Taille en centimètres, pour l'IMC. Vide tant qu'elle n'est pas donnée. */
  tailleCm: number | null
}

export type Jeune = {
  id: string
  /** Début du jeûne, au format ISO. */
  debut: string
  /** Fin du jeûne. Vide tant qu'il est en cours. */
  fin: string | null
  /** L'objectif qui était visé ce jour-là, en heures. */
  objectifHeures: number
}

export type Pesee = {
  /** La clé du jour : une seule pesée retenue par journée. */
  jour: string
  poids: number
}

export type Etat = {
  version: 1
  demarre: boolean
  reglages: Reglages
  jeunes: Jeune[]
  /** Verres d'eau bus, par journée : { '2026-08-27': 5 }. */
  eau: Record<string, number>
  pesees: Pesee[]
}

export const REGLAGES_PAR_DEFAUT: Reglages = {
  prenom: '',
  plan: '16-8',
  objectifHeures: 16,
  butEau: 8,
  verreMl: 250,
  poidsBut: null,
  tailleCm: null,
}

export const ETAT_VIDE: Etat = {
  version: 1,
  demarre: false,
  reglages: REGLAGES_PAR_DEFAUT,
  jeunes: [],
  eau: {},
  pesees: [],
}

const CLE = 'mahana.v1'

export function lireEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return ETAT_VIDE
    const lu = JSON.parse(brut) as Partial<Etat>
    // On recolle sur l'état vide : une version plus ancienne, à qui il manque
    // un réglage ajouté depuis, ne doit pas faire planter l'écran.
    return {
      ...ETAT_VIDE,
      ...lu,
      reglages: { ...REGLAGES_PAR_DEFAUT, ...(lu.reglages ?? {}) },
      jeunes: lu.jeunes ?? [],
      eau: lu.eau ?? {},
      pesees: lu.pesees ?? [],
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

/** Un identifiant simple, sans dépendance. */
export function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
