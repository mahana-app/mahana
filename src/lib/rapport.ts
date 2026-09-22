/* Le rapport d'une année : ce que la famille a gagné, dépensé, et où.

   Les mêmes tableaux que le premier rapport fait à la main sur le relevé de
   Maru — mois par mois, par poste, les virements et à qui, les enseignes qui
   reviennent — mais calculés depuis « nos dépenses », donc à jour à chaque
   import et privés comme elles. */

import type { CategorieDepense, DepensePerso, Maison } from './types'
import { CATEGORIES_DEPENSE, categorieDepenseDe } from './types'

export type Rapport = {
  annee: string
  nbLignes: number
  nbMois: number
  premiere: string
  derniere: string
  revenus: number
  depenses: number
  parMois: Array<{ mois: string; revenus: number; depenses: number }>
  parPoste: Array<{ categorie: CategorieDepense; nom: string; emoji: string; essentiel: boolean; total: number; nb: number }>
  essentiel: number
  plaisirs: number
  virements: number
  beneficiaires: Array<{ nom: string; nb: number; total: number }>
  enseignes: Array<{ nom: string; total: number }>
  /** Là où partent surtout les courses. */
  topCourses: string | null
}

const PLAISIRS: CategorieDepense[] = ['sorties', 'sport', 'voyages', 'abonnements', 'vetements']
const HORS_ENSEIGNES: CategorieDepense[] = ['credit', 'virements', 'compte-euros', 'especes', 'cheques', 'banque']

export const anneesDisponibles = (maison: Maison, foyerId: string): string[] =>
  [...new Set(maison.depensesPerso.filter((d) => d.foyerId === foyerId).map((d) => d.le.slice(0, 4)))].sort().reverse()

export function rapportDe(maison: Maison, foyerId: string, annee: string): Rapport {
  const lignes = maison.depensesPerso
    .filter((d) => d.foyerId === foyerId && d.le.startsWith(annee))
    .sort((a, b) => a.le.localeCompare(b.le))
  const depenses = lignes.filter((d) => d.sens !== 'revenu')
  const revenus = lignes.filter((d) => d.sens === 'revenu')
  const somme = (l: DepensePerso[]) => l.reduce((s, d) => s + d.montant, 0)

  const mois = [...new Set(lignes.map((d) => d.le.slice(0, 7)))].sort()
  const parMois = mois.map((m) => ({
    mois: m,
    revenus: somme(revenus.filter((d) => d.le.startsWith(m))),
    depenses: somme(depenses.filter((d) => d.le.startsWith(m))),
  }))

  const parPoste = CATEGORIES_DEPENSE.map((c) => {
    const siennes = depenses.filter((d) => d.categorie === c.id)
    return { categorie: c.id, nom: c.nom, emoji: c.emoji, essentiel: c.essentiel, total: somme(siennes), nb: siennes.length }
  })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)

  const benef = new Map<string, { nb: number; total: number }>()
  for (const d of depenses) {
    if (d.categorie !== 'virements' && d.categorie !== 'compte-euros') continue
    const b = benef.get(d.libelle) ?? { nb: 0, total: 0 }
    b.nb++
    b.total += d.montant
    benef.set(d.libelle, b)
  }

  const ens = new Map<string, number>()
  const courses = new Map<string, number>()
  for (const d of depenses) {
    if (HORS_ENSEIGNES.includes(d.categorie)) continue
    ens.set(d.libelle, (ens.get(d.libelle) ?? 0) + d.montant)
    if (d.categorie === 'courses') courses.set(d.libelle, (courses.get(d.libelle) ?? 0) + d.montant)
  }
  const topCourses = [...courses.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    annee,
    nbLignes: lignes.length,
    nbMois: Math.max(1, mois.length),
    premiere: lignes[0]?.le ?? '',
    derniere: lignes[lignes.length - 1]?.le ?? '',
    revenus: somme(revenus),
    depenses: somme(depenses),
    parMois,
    parPoste,
    essentiel: parPoste.filter((p) => p.essentiel).reduce((s, p) => s + p.total, 0),
    plaisirs: parPoste.filter((p) => PLAISIRS.includes(p.categorie)).reduce((s, p) => s + p.total, 0),
    virements: parPoste
      .filter((p) => p.categorie === 'virements' || p.categorie === 'compte-euros')
      .reduce((s, p) => s + p.total, 0),
    beneficiaires: [...benef.entries()].map(([nom, b]) => ({ nom, ...b })).sort((a, b) => b.total - a.total),
    enseignes: [...ens.entries()].map(([nom, total]) => ({ nom, total })).sort((a, b) => b.total - a.total).slice(0, 15),
    topCourses,
  }
}

/** Le total d'un poste, ou 0. */
export const posteDe = (r: Rapport, c: CategorieDepense) => r.parPoste.find((p) => p.categorie === c)?.total ?? 0

export const nomPoste = (c: CategorieDepense) => categorieDepenseDe(c).nom
