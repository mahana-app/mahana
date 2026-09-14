/* Le ramassage des déchets verts et des encombrants, secteur Pointe-Vénus.

   La commune de Mahina publie un calendrier par semestre : une semaine de
   ramassage par mois, et dans cette semaine un jour par tournée. Le papier
   finit sur le frigo puis à la poubelle, et on rate le passage — qui ne
   revient que le mois suivant.

   Deux choses à savoir pour lire ce fichier :

   * Le calendrier est une DONNÉE, pas du code. Il est rangé dans les réglages
     de la maison, avec celui du 2ᵉ semestre 2026 comme point de départ. Quand
     la commune publiera celui de 2027, Maru ajoutera les semaines depuis
     l'app, sans attendre que quelqu'un touche au code.

   * La commune décale ses tournées les semaines de jours fériés, et l'annonce
     sur sa page Facebook. L'app doit le dire plutôt que de laisser croire à
     une date sûre. */

export type Tournee = 'P1' | 'P2' | 'P3' | 'P4'

export type ReglagesDechets = {
  /** La tournée de la maison. Vide tant que personne ne l'a choisie. */
  tournee: Tournee | null
  /** Les lundis des semaines de ramassage, « 2026-08-03 ». */
  semaines: string[]
}

export const DECHETS_PAR_DEFAUT: ReglagesDechets = {
  tournee: null,
  // Calendrier prévisionnel du 2ᵉ semestre 2026, secteur Pointe-Vénus.
  semaines: [
    '2026-08-03',
    '2026-09-07',
    '2026-10-12',
    '2026-11-16',
    '2026-12-21',
    '2027-01-25',
  ],
}

/** L'ordre de ramassage dans la semaine : P1 le lundi, P4 le jeudi. */
export const TOURNEES: Array<{ id: Tournee; jour: string; quartiers: string }> = [
  {
    id: 'P1',
    jour: 'lundi',
    quartiers:
      'Fond de la Pointe Vénus jusqu’au cimetière catholique, Taputuarai 1 & 2, Bontan, Auguste, Coulon, Helme',
  },
  { id: 'P2', jour: 'mardi', quartiers: 'Titine, Paofai, Aumeran' },
  { id: 'P3', jour: 'mercredi', quartiers: 'Raveino, quartier Tafai jusqu’à la Socredo' },
  { id: 'P4', jour: 'jeudi', quartiers: 'Route du stade et bords de route' },
]

export const tourneeDe = (id: Tournee | null) => TOURNEES.find((t) => t.id === id)

/** Le jour de passage : le lundi de la semaine, décalé selon la tournée. */
export function jourDeRamassage(lundi: string, tournee: Tournee): string {
  const decalage = TOURNEES.findIndex((t) => t.id === tournee)
  const [annee, mois, jour] = lundi.split('-').map(Number)
  const date = new Date(annee, mois - 1, jour + Math.max(0, decalage))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

/** Tous les passages à venir, le plus proche d'abord. */
export function passagesAVenir(reglages: ReglagesDechets, aujourdhui: string): string[] {
  if (!reglages.tournee) return []
  const tournee = reglages.tournee
  return reglages.semaines
    .map((lundi) => jourDeRamassage(lundi, tournee))
    .filter((jour) => jour >= aujourdhui)
    .sort()
}

/** Combien de nuits avant ce jour-là. 0 = c'est aujourd'hui. */
export function joursAvant(jour: string, aujourdhui: string): number {
  const [a1, m1, j1] = aujourdhui.split('-').map(Number)
  const [a2, m2, j2] = jour.split('-').map(Number)
  const depart = new Date(a1, m1 - 1, j1).getTime()
  const arrivee = new Date(a2, m2 - 1, j2).getTime()
  return Math.round((arrivee - depart) / 86400000)
}

/**
 * « 14 octobre », et « 25 janvier 2027 » quand ce n'est pas cette année.
 * Un calendrier à cheval sur deux années sans l'année écrite, c'est un
 * rendez-vous manqué.
 */
export function jourEnMots(jour: string): string {
  const [annee, mois, date] = jour.split('-').map(Number)
  return new Date(annee, mois - 1, date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    ...(annee === new Date().getFullYear() ? {} : { year: 'numeric' }),
  })
}

/** « aujourd'hui », « demain », « dans 3 jours ». */
export function dansCombien(jours: number): string {
  if (jours <= 0) return "aujourd'hui"
  if (jours === 1) return 'demain'
  if (jours < 7) return `dans ${jours} jours`
  if (jours < 14) return 'la semaine prochaine'
  return `dans ${Math.round(jours / 7)} semaines`
}

/**
 * Le week-end où sortir les déchets.
 *
 * La commune l'écrit sur son calendrier : « les déchets verts et encombrants
 * peuvent être déposés le week-end précédent la date de collecte ». C'est le
 * seul moment où toute la maison est là pour porter un canapé.
 */
export const sortirCeWeekEnd = (jours: number) => jours >= 0 && jours <= 5

/* ---------- ce qui se ramasse et ce qui ne se ramasse pas ---------- */

export const ENCOMBRANTS = [
  'Le mobilier : tables, chaises, sommiers, canapés…',
  'Les gros appareils électroménagers : cuisinière, réfrigérateur, aspirateur, machine à laver…',
  'Les objets divers : vélos, poussettes, tables à repasser, jouets, articles de cuisine et de sport',
]

export const PAS_RAMASSES = [
  'Le verre — aux bacs prévus, au parking de l’entrée du RSMA',
  'Batteries de voiture, pots de peinture et solvants, huiles de moteur',
  'Ampoules et néons, piles, petit électroménager, bouteilles d’hélium',
]

export const PAS_PAR_LA_COMMUNE = [
  'Les déchets de chantier (gravats…) — à faire enlever par une entreprise, à votre charge',
]

export const CENTRE_TECHNIQUE = { telephone: '40.48.14.28', courriel: 'environnement@mahina.pf' }
