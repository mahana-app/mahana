/* Dans combien de temps l'objectif de poids sera-t-il atteint ?

   Deux réponses, et elles ne disent pas la même chose :

   — **le rythme prévu**, celui du déficit de calories choisi. Il est
     disponible dès le premier jour, mais c'est une promesse sur le papier ;
   — **le rythme réel**, la pente des pesées. Il ne veut rien dire avant
     trois semaines, et ensuite c'est le seul qui compte.

   L'app donne le second dès qu'elle peut, et le premier en attendant. Elle
   dit toujours lequel des deux elle utilise : une date sans son hypothèse
   n'est pas une information, c'est une promesse.

   Et elle le répète : c'est une ligne droite tracée à travers la vraie vie.
   Le poids descend par paliers, remonte la semaine des règles, bouge de deux
   kilos avec le sel d'un repas. La date est un ordre de grandeur. */

import { ajouterJours, deClefJour } from './dates'
import { depenseJournaliere, imc, objectifCalories, poidsActuel } from './profil'
import type { Etat, Pesee } from './stockage'

/** Un kilo de graisse vaut environ 7 700 kcal. C'est le chiffre de référence. */
const KCAL_PAR_KILO = 7700

/** La fenêtre de pesées qui sert à mesurer le rythme réel. */
const FENETRE_JOURS = 28

/** En dessous, la pente ne veut rien dire : le poids varie d'un jour à l'autre. */
const JOURS_MINIMUM = 10

/** Au-delà, une date perd tout sens : on dit « plus de trois ans ». */
const HORIZON_JOURS = 1095

export type Situation =
  | 'sans-but' /* aucun poids visé n'est renseigné */
  | 'sans-pesee' /* personne ne s'est encore pesée */
  | 'atteint' /* c'est fait */
  | 'stagne' /* au rythme mesuré, le poids ne descend pas */
  | 'en-route'

export type Projection = {
  situation: Situation
  poids: number | null
  but: number | null
  /** Les kilos qui restent à perdre. */
  reste: number
  /** La part du chemin déjà faite depuis la toute première pesée, de 0 à 1. */
  part: number | null
  /** Le rythme retenu, en kilos par semaine (négatif quand on descend). */
  rythme: number | null
  /** D'où vient ce rythme : mesuré sur les pesées, ou promis par le déficit. */
  source: 'reel' | 'prevu' | null
  /** Ce qui a servi à mesurer le rythme réel. */
  mesure: { pesees: number; jours: number } | null
  /** Le rythme du déficit choisi, gardé pour comparer. */
  rythmePrevu: number | null
  jours: number | null
  date: Date | null
  /** Vrai quand la date dépasse l'horizon : inutile de l'afficher. */
  tropLoin: boolean
  /** Plus d'un kilo par semaine : une partie de ce qui part est du muscle. */
  tropVite: boolean
  /** L'objectif de poids passerait sous un IMC de 18,5. */
  butTropBas: boolean
}

/** La pente des pesées, en kilos par semaine. Null tant qu'elle ne vaut rien. */
function rythmeMesure(
  pesees: Pesee[],
): { kgParSemaine: number; pesees: number; jours: number } | null {
  if (pesees.length < 3) return null

  const jourDe = (p: Pesee) => deClefJour(p.jour).getTime() / 86400000
  const fin = jourDe(pesees[pesees.length - 1])

  // On regarde le dernier mois. Trop peu de pesées dedans ? On élargit aux
  // trois dernières, quitte à remonter plus loin.
  let retenues = pesees.filter((p) => fin - jourDe(p) <= FENETRE_JOURS)
  if (retenues.length < 3) retenues = pesees.slice(-3)

  const depart = jourDe(retenues[0])
  const points = retenues.map((p) => ({ x: jourDe(p) - depart, y: p.poids }))
  const etendue = points[points.length - 1].x
  if (etendue < JOURS_MINIMUM) return null

  // Une droite des moindres carrés : une seule pesée bizarre ne fait pas
  // basculer le résultat, contrairement à un simple « dernière moins première ».
  const n = points.length
  const moyenneX = points.reduce((t, p) => t + p.x, 0) / n
  const moyenneY = points.reduce((t, p) => t + p.y, 0) / n
  const haut = points.reduce((t, p) => t + (p.x - moyenneX) * (p.y - moyenneY), 0)
  const bas = points.reduce((t, p) => t + (p.x - moyenneX) ** 2, 0)
  if (bas === 0) return null

  return { kgParSemaine: (haut / bas) * 7, pesees: n, jours: Math.round(etendue) }
}

/** Le rythme promis par le déficit de calories, en kilos par semaine. */
function rythmePromis(etat: Etat, poids: number): number | null {
  const depense = depenseJournaliere(etat.profil, poids)
  const objectif = objectifCalories(etat)
  if (depense === null || objectif === null) return null
  const deficit = depense - objectif
  if (deficit <= 0) return 0
  return -((deficit * 7) / KCAL_PAR_KILO)
}

export function projection(etat: Etat): Projection {
  const vide: Projection = {
    situation: 'sans-but',
    poids: null,
    but: null,
    reste: 0,
    part: null,
    rythme: null,
    source: null,
    mesure: null,
    rythmePrevu: null,
    jours: null,
    date: null,
    tropLoin: false,
    tropVite: false,
    butTropBas: false,
  }

  const but = etat.profil.poidsBut
  const poids = poidsActuel(etat)
  if (but === null) return { ...vide, poids }
  if (poids === null) return { ...vide, situation: 'sans-pesee', but }

  const taille = etat.profil.tailleCm
  const butTropBas = taille !== null && imc(but, taille) < 18.5
  const reste = Math.round((poids - but) * 10) / 10
  const depart = etat.pesees[0].poids
  const chemin = depart - but
  const part = chemin > 0 ? Math.max(0, Math.min(1, (depart - poids) / chemin)) : null

  const base = { ...vide, poids, but, reste, part, butTropBas }
  if (reste <= 0) return { ...base, situation: 'atteint' }

  const prevu = rythmePromis(etat, poids)
  const mesure = rythmeMesure(etat.pesees)
  const rythme = mesure ? mesure.kgParSemaine : prevu
  const source: Projection['source'] = mesure ? 'reel' : prevu !== null ? 'prevu' : null

  const commun = {
    ...base,
    rythme,
    source,
    mesure: mesure ? { pesees: mesure.pesees, jours: mesure.jours } : null,
    rythmePrevu: prevu,
    tropVite: rythme !== null && rythme < -1,
  }

  // Un rythme nul ou qui monte ne mène à aucune date : le dire, plutôt que
  // d'afficher un nombre de jours fantaisiste.
  if (rythme === null || rythme >= -0.01) return { ...commun, situation: 'stagne' }

  const jours = Math.ceil((reste / -rythme) * 7)
  return {
    ...commun,
    situation: 'en-route',
    jours,
    date: jours <= HORIZON_JOURS ? ajouterJours(new Date(), jours) : null,
    tropLoin: jours > HORIZON_JOURS,
  }
}

/** « dans 5 mois », « dans 3 semaines », « dans 4 jours ». */
export function delaiEnMots(jours: number): string {
  if (jours <= 1) return "d'ici demain"
  if (jours < 14) return `dans ${jours} jours`
  if (jours < 70) return `dans ${Math.round(jours / 7)} semaines`
  if (jours < 730) return `dans ${Math.round(jours / 30.4)} mois`
  return `dans ${Math.round((jours / 365) * 10) / 10} ans`.replace('.', ',')
}
