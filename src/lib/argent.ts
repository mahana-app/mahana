/* Les calculs de la maison : les francs, les mois, et qui doit quoi.

   Tout est ici plutôt que dans la base : une règle de partage écrite à un
   seul endroit ne peut pas se contredire elle-même, et elle se relit. */

import type { Achat, Charge, Foyer, Identifiant, LigneArdoise, Maison } from './types'

/* ---------- les francs ---------- */

/** « 12 400 F ». Le franc Pacifique n'a pas de centimes : jamais de virgule. */
export function fcfp(montant: number): string {
  return `${Math.round(montant).toLocaleString('fr-FR').replace(/ | /g, ' ')} F`
}

/** Le même, sans l'unité, pour les grands chiffres qui portent leur légende. */
export function nombre(montant: number): string {
  return Math.round(montant).toLocaleString('fr-FR').replace(/ | /g, ' ')
}

/** Lit un montant tapé à la main, en acceptant les espaces et les points. */
export function lireMontant(saisie: string): number {
  const propre = saisie.replace(/[^\d-]/g, '')
  const valeur = Number(propre)
  return Number.isFinite(valeur) ? Math.round(valeur) : 0
}

/* ---------- les mois ---------- */

/** Le mois d'une date, « 2026-09 ». */
export const moisDe = (date: Date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

/** Le jour d'aujourd'hui, « 2026-09-13 ». */
export const jourDe = (date: Date = new Date()) =>
  `${moisDe(date)}-${String(date.getDate()).padStart(2, '0')}`

/** « septembre 2026 » */
export function moisEnMots(periode: string): string {
  const [annee, mois] = periode.split('-').map(Number)
  return new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

/** « 13 sept. » */
export function jourCourt(jour: string): string {
  const [annee, mois, date] = jour.split('-').map(Number)
  return new Date(annee, mois - 1, date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

export function moisDecale(periode: string, pas: number): string {
  const [annee, mois] = periode.split('-').map(Number)
  const date = new Date(annee, mois - 1 + pas, 1)
  return moisDe(date)
}

/* ---------- le partage d'une facture ---------- */

/**
 * Répartit un montant entre les foyers selon leurs parts.
 *
 * Le dernier foyer reçoit le reste plutôt que sa part arrondie : sans ça,
 * 10 001 F partagés en deux font deux fois 5 000 F et un franc disparaît.
 * Un franc, ce n'est rien ; un compte qui ne tombe jamais juste, c'est ce qui
 * fait qu'on cesse de faire confiance à l'application.
 */
export function repartir(montant: number, foyers: Foyer[]): Record<Identifiant, number> {
  const parts: Record<Identifiant, number> = {}
  const total = foyers.reduce((somme, f) => somme + f.part, 0) || 1
  let distribue = 0
  foyers.forEach((foyer, index) => {
    const dernier = index === foyers.length - 1
    const valeur = dernier ? montant - distribue : Math.round((montant * foyer.part) / total)
    parts[foyer.id] = valeur
    distribue += valeur
  })
  return parts
}

/* ---------- qui doit quoi ---------- */

export type SoldeFoyer = {
  foyerId: Identifiant
  /** Ce que le foyer a avancé aux fournisseurs. */
  aAvance: number
  /** La somme de ses parts dans toutes les factures. */
  doit: number
  /** Ce qu'il a déjà rendu à l'autre foyer. */
  aRendu: number
  /** Ce que l'autre foyer lui a rendu. */
  luiAEteRendu: number
  /** Positif : la maison lui doit. Négatif : il doit à la maison. */
  solde: number
}

export function soldesCharges(maison: Maison): SoldeFoyer[] {
  return maison.foyers.map((foyer) => {
    const aAvance = maison.charges
      .filter((c) => c.avanceePar === foyer.id)
      .reduce((somme, c) => somme + c.montant, 0)
    const doit = maison.partsCharge
      .filter((p) => p.foyerId === foyer.id)
      .reduce((somme, p) => somme + p.montant, 0)
    const aRendu = maison.reglements
      .filter((r) => r.foyerId === foyer.id)
      .reduce((somme, r) => somme + r.montant, 0)
    // Un règlement va toujours au foyer qui a avancé la facture concernée.
    const luiAEteRendu = maison.reglements
      .filter((r) => maison.charges.find((c) => c.id === r.chargeId)?.avanceePar === foyer.id)
      .reduce((somme, r) => somme + r.montant, 0)
    return {
      foyerId: foyer.id,
      aAvance,
      doit,
      aRendu,
      luiAEteRendu,
      solde: aAvance - doit + aRendu - luiAEteRendu,
    }
  })
}

/** Ce qu'il reste à rendre à un foyer sur une facture donnée. */
export function resteSurCharge(maison: Maison, charge: Charge, foyerId: Identifiant): number {
  // Celui qui a payé le fournisseur a déjà réglé sa propre part.
  if (charge.avanceePar === foyerId) return 0
  const part =
    maison.partsCharge.find((p) => p.chargeId === charge.id && p.foyerId === foyerId)?.montant ?? 0
  const rendu = maison.reglements
    .filter((r) => r.chargeId === charge.id && r.foyerId === foyerId)
    .reduce((somme, r) => somme + r.montant, 0)
  return Math.max(0, part - rendu)
}

/** Une facture est soldée quand elle est payée et que chacun a rendu sa part. */
export function chargeSoldee(maison: Maison, charge: Charge): boolean {
  if (!charge.avanceePar) return false
  return maison.foyers.every((f) => resteSurCharge(maison, charge, f.id) === 0)
}

/* ---------- la caisse commune ---------- */

export type EtatCaisse = {
  /** Tout ce qui a été versé depuis le début. */
  verse: number
  /** Tout ce qui a été dépensé en courses. */
  depense: number
  /** Ce qui reste dans la caisse. */
  solde: number
  /** Les cotisations promises mais pas encore versées. */
  attendu: number
}

export function etatCaisse(maison: Maison): EtatCaisse {
  const verse = maison.cotisations
    .filter((c) => c.verseeLe)
    .reduce((somme, c) => somme + c.montant, 0)
  const attendu = maison.cotisations
    .filter((c) => !c.verseeLe)
    .reduce((somme, c) => somme + c.montant, 0)
  const depense = maison.achats.reduce((somme, a) => somme + a.montant, 0)
  return { verse, depense, solde: verse - depense, attendu }
}

export const achatsDuMois = (maison: Maison, periode: string): Achat[] =>
  maison.achats.filter((a) => a.le.startsWith(periode)).sort((a, b) => b.le.localeCompare(a.le))

/* ---------- l'ardoise de la roulotte ---------- */

export const ardoiseDuMois = (maison: Maison, periode: string): LigneArdoise[] =>
  maison.ardoise.filter((l) => l.le.startsWith(periode)).sort((a, b) => b.le.localeCompare(a.le))

/** Ce que chaque foyer doit encore à la roulotte, tous mois confondus. */
export function duALaRoulotte(maison: Maison): Record<Identifiant, number> {
  const total: Record<Identifiant, number> = {}
  for (const foyer of maison.foyers) total[foyer.id] = 0
  for (const ligne of maison.ardoise) {
    if (ligne.rembourseeLe) continue
    total[ligne.foyerId] = (total[ligne.foyerId] ?? 0) + ligne.montant
  }
  return total
}
