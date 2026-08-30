/* Le calcul des besoins : combien de calories le corps dépense au repos,
   combien avec la vie de tous les jours, et combien viser pour perdre du
   poids sans se mettre en danger.

   La formule utilisée est celle de Mifflin-St Jeor, la plus fiable des
   formules d'estimation. Ça reste une estimation : le vrai repère, c'est la
   courbe de poids sur trois semaines. */

import type { Etat, Niveau, Objectif, Profil } from './stockage'

export const NIVEAUX: Array<{ id: Niveau; nom: string; detail: string; facteur: number }> = [
  { id: 'sedentaire', nom: 'Assise', detail: 'Peu de marche dans la journée', facteur: 1.2 },
  { id: 'leger', nom: 'Légère', detail: 'Debout, un peu de marche', facteur: 1.375 },
  { id: 'modere', nom: 'Modérée', detail: 'Sur les jambes toute la journée', facteur: 1.55 },
  { id: 'actif', nom: 'Active', detail: 'Travail physique', facteur: 1.725 },
  { id: 'intense', nom: 'Très active', detail: 'Travail dur, sport quotidien', facteur: 1.9 },
]

export const OBJECTIFS: Array<{ id: Objectif; nom: string; detail: string; deficit: number }> = [
  { id: 'perte-douce', nom: 'En douceur', detail: '≈ 250 g par semaine', deficit: 300 },
  { id: 'perte', nom: 'Perdre', detail: '≈ 500 g par semaine', deficit: 500 },
  { id: 'maintien', nom: 'Me maintenir', detail: 'Garder mon poids', deficit: 0 },
]

/** Le poids de référence pour les calculs : la dernière pesée. */
export function poidsActuel(etat: Etat): number | null {
  return etat.pesees.at(-1)?.poids ?? null
}

/** Métabolisme de base : ce que le corps brûle sans rien faire, en 24 h. */
export function metabolismeBase(profil: Profil, poids: number): number | null {
  if (!profil.age || !profil.tailleCm) return null
  const base = 10 * poids + 6.25 * profil.tailleCm - 5 * profil.age
  return Math.round(base + (profil.sexe === 'F' ? -161 : 5))
}

/** Dépense d'une journée ordinaire, sport de l'app non compris. */
export function depenseJournaliere(profil: Profil, poids: number): number | null {
  const base = metabolismeBase(profil, poids)
  if (base === null) return null
  const facteur = NIVEAUX.find((n) => n.id === profil.niveau)?.facteur ?? 1.375
  return Math.round(base * facteur)
}

/**
 * L'objectif de calories du jour. Jamais en dessous d'un plancher : descendre
 * plus bas fait fondre le muscle avant la graisse, et ne tient pas une semaine.
 */
export function objectifCalories(etat: Etat): number | null {
  const profil = etat.profil
  if (profil.kcalManuel) return profil.kcalManuel
  const poids = poidsActuel(etat)
  if (poids === null) return null
  const depense = depenseJournaliere(profil, poids)
  if (depense === null) return null
  const deficit = OBJECTIFS.find((o) => o.id === profil.objectif)?.deficit ?? 500
  const plancher = profil.sexe === 'F' ? 1200 : 1500
  return Math.max(plancher, Math.round((depense - deficit) / 10) * 10)
}

/** La répartition visée : beaucoup de protéines, c'est ce qui préserve le muscle. */
export function objectifMacros(kcal: number) {
  return {
    glucides: Math.round((kcal * 0.4) / 4),
    proteines: Math.round((kcal * 0.3) / 4),
    lipides: Math.round((kcal * 0.3) / 9),
  }
}

export function imc(poids: number, tailleCm: number): number {
  return poids / (tailleCm / 100) ** 2
}

export function lectureImc(valeur: number): string {
  if (valeur < 18.5) return 'en dessous de la normale'
  if (valeur < 25) return 'dans la normale'
  if (valeur < 30) return 'au-dessus de la normale'
  return 'nettement au-dessus'
}
