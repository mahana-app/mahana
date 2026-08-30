/* Le cœur du sujet : les rythmes de jeûne, ce qui se passe dans le corps
   au fil des heures, la série de jours et les défis obtenus. */

import type { Etat, Jeune } from './stockage'
import { ajouterJours, clefJour } from './dates'

export type Plan = {
  id: string
  /** Heures de jeûne / heures pendant lesquelles on mange. */
  jeune: number
  nom: string
  pourQui: string
}

/** Les rythmes proposés. Le dernier, « libre », n'a pas d'objectif d'heures. */
export const PLANS: Plan[] = [
  { id: '12-12', jeune: 12, nom: '12 : 12', pourQui: 'Pour commencer en douceur' },
  { id: '14-10', jeune: 14, nom: '14 : 10', pourQui: 'Le premier vrai palier' },
  { id: '16-8', jeune: 16, nom: '16 : 8', pourQui: 'Le plus suivi' },
  { id: '18-6', jeune: 18, nom: '18 : 6', pourQui: 'Quand 16 h devient facile' },
  { id: '20-4', jeune: 20, nom: '20 : 4', pourQui: 'Un seul repas, ou presque' },
  { id: '23-1', jeune: 23, nom: '23 : 1', pourQui: 'Un repas par jour' },
]

export function planParId(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[2]
}

/* ---------- ce que fait le corps ---------- */

export type Phase = {
  /** Heure de jeûne à laquelle la phase commence. */
  debut: number
  nom: string
  texte: string
  emoji: string
}

/* Repères de vulgarisation, pas une promesse médicale : chaque corps a son
   rythme, et ces heures varient selon le dernier repas et l'activité. */
export const PHASES: Phase[] = [
  {
    debut: 0,
    nom: 'Digestion',
    emoji: '🍽️',
    texte: "Le dernier repas est en train d'être absorbé. Le corps travaille dessus.",
  },
  {
    debut: 4,
    nom: 'Réserves de sucre',
    emoji: '🔋',
    texte: "La digestion est finie. L'énergie vient maintenant du sucre mis en réserve.",
  },
  {
    debut: 12,
    nom: 'Combustion des graisses',
    emoji: '🔥',
    texte: 'Les réserves de sucre baissent : le corps commence à puiser dans les graisses.',
  },
  {
    debut: 16,
    nom: 'Cétose',
    emoji: '✨',
    texte: 'Les graisses deviennent le carburant principal. La faim se calme souvent ici.',
  },
  {
    debut: 24,
    nom: 'Autophagie',
    emoji: '🧹',
    texte: 'Le grand ménage : les cellules recyclent ce qui est usé.',
  },
  {
    debut: 48,
    nom: 'Jeûne long',
    emoji: '⛰️',
    texte: 'Au-delà de deux jours, ne rien faire sans avis médical.',
  },
]

export function phaseA(heures: number): Phase {
  let trouvee = PHASES[0]
  for (const phase of PHASES) if (heures >= phase.debut) trouvee = phase
  return trouvee
}

export function phaseSuivante(heures: number): Phase | null {
  return PHASES.find((phase) => phase.debut > heures) ?? null
}

/* ---------- lecture des jeûnes ---------- */

export const jeuneEnCours = (etat: Etat): Jeune | null =>
  etat.jeunes.find((j) => j.fin === null) ?? null

export const jeunesTermines = (etat: Etat): Jeune[] =>
  etat.jeunes.filter((j) => j.fin !== null)

export function dureeMs(jeune: Jeune, maintenant: number = Date.now()): number {
  const debut = new Date(jeune.debut).getTime()
  const fin = jeune.fin ? new Date(jeune.fin).getTime() : maintenant
  return Math.max(0, fin - debut)
}

export const dureeHeures = (jeune: Jeune, maintenant?: number): number =>
  dureeMs(jeune, maintenant) / 3_600_000

/** L'objectif est-il atteint ? C'est ce qui fait avancer la série. */
export const objectifAtteint = (jeune: Jeune): boolean =>
  jeune.fin !== null && dureeHeures(jeune) >= jeune.objectifHeures

/** Un jeûne compte pour le jour où il se termine : c'est ce jour-là qu'il est gagné. */
export const jourDuJeune = (jeune: Jeune): string =>
  clefJour(new Date(jeune.fin ?? jeune.debut))

/**
 * La série : le nombre de jours de suite avec un jeûne réussi, en remontant
 * depuis aujourd'hui. Un jeûne fini hier soir garde la série en vie tant
 * qu'aujourd'hui n'est pas terminé.
 */
export function serie(etat: Etat): number {
  const joursGagnes = new Set(etat.jeunes.filter(objectifAtteint).map(jourDuJeune))
  if (joursGagnes.size === 0) return 0

  let jour = new Date()
  // Rien aujourd'hui : la journée n'est pas finie, on repart d'hier.
  if (!joursGagnes.has(clefJour(jour))) jour = ajouterJours(jour, -1)

  let compte = 0
  while (joursGagnes.has(clefJour(jour))) {
    compte += 1
    jour = ajouterJours(jour, -1)
  }
  return compte
}

export type Bilan = {
  termines: number
  reussis: number
  totalHeures: number
  plusLong: number
  moyenneSeptJours: number
}

export function bilan(etat: Etat): Bilan {
  const finis = jeunesTermines(etat)
  const heures = finis.map((j) => dureeHeures(j))
  const depuis = ajouterJours(new Date(), -7)
  const recents = finis.filter((j) => new Date(j.fin as string) >= depuis).map((j) => dureeHeures(j))
  return {
    termines: finis.length,
    reussis: finis.filter(objectifAtteint).length,
    totalHeures: heures.reduce((somme, h) => somme + h, 0),
    plusLong: heures.length ? Math.max(...heures) : 0,
    moyenneSeptJours: recents.length ? recents.reduce((s, h) => s + h, 0) / recents.length : 0,
  }
}

/** La plus longue série jamais tenue. */
export function serieLaPlusLongue(etat: Etat): number {
  const jours = [...new Set(etat.jeunes.filter(objectifAtteint).map(jourDuJeune))].sort()
  let meilleure = 0
  let courante = 0
  let precedent: string | null = null
  for (const jour of jours) {
    const veille = precedent ? clefJour(ajouterJours(new Date(precedent + 'T12:00'), 1)) : null
    courante = veille === jour ? courante + 1 : 1
    meilleure = Math.max(meilleure, courante)
    precedent = jour
  }
  return meilleure
}
