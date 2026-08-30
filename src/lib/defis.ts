/* Les défis de la semaine.

   Un défi dure sept jours et se coche une fois par jour. L'idée n'est pas la
   performance : c'est de tenir une seule règle simple, assez longtemps pour
   qu'elle devienne une habitude. On n'en fait qu'un à la fois — c'est ce qui
   fait qu'on le tient.

   Certains défis se cochent tout seuls quand l'app a déjà l'information
   (les pas, l'eau, le sport, le jeûne). Les autres se cochent à la main :
   personne ne peut vérifier à votre place que vous n'avez pas mangé de sucre. */

import { ajouterJours, clefJour, deClefJour } from './dates'
import type { Etat } from './stockage'
import { dureeHeures, objectifAtteint } from './jeune'

export type Defi = {
  id: string
  nom: string
  emoji: string
  /** L'engagement, tel qu'on se le répète dans la journée. */
  promesse: string
  /** Pourquoi ça marche — la raison, pas la morale. */
  pourquoi: string
  couleur: string
}

export const DEFIS: Defi[] = [
  {
    id: 'sans-sucre',
    nom: 'Une semaine sans sucre',
    emoji: '🍬',
    promesse: 'Aucun sucre ajouté : ni soda, ni bonbon, ni gâteau, ni sucre dans le café.',
    pourquoi: "Le sucre appelle le sucre. Une semaine suffit à casser l'envie, et l'eau part avec.",
    couleur: 'var(--corail)',
  },
  {
    id: 'sans-feculents-soir',
    nom: 'Pas de féculents le soir',
    emoji: '🍚',
    promesse: 'Le soir : protéines et légumes. Pas de riz, pain, pâtes, uru ni taro.',
    pourquoi: 'Le corps stocke moins la nuit, et la digestion plus légère fait mieux dormir.',
    couleur: 'var(--ambre)',
  },
  {
    id: 'sans-feculents',
    nom: 'Une semaine sans féculents',
    emoji: '🥗',
    promesse: 'Aucun féculent de la journée : ni riz, ni pain, ni pâtes, ni uru, ni taro.',
    pourquoi: "Le défi le plus dur de la liste. À ne tenter qu'après avoir réussi celui du soir.",
    couleur: 'var(--menthe)',
  },
  {
    id: 'dodo-21h',
    nom: 'Au lit avant 21 h',
    emoji: '🌙',
    promesse: 'Couchée avant 21 h, tous les soirs.',
    pourquoi: 'Mal dormir dérègle la faim du lendemain. C’est le levier le plus sous-estimé.',
    couleur: 'var(--lavande)',
  },
  {
    id: 'dix-mille-pas',
    nom: '10 000 pas par jour',
    emoji: '👟',
    promesse: 'Dix mille pas, sept jours de suite.',
    pourquoi: 'La marche brûle sans fatiguer et sans donner faim, contrairement au sport intense.',
    couleur: 'var(--menthe)',
  },
  {
    id: 'deux-litres',
    nom: '2 litres d’eau par jour',
    emoji: '💧',
    promesse: "Boire son objectif d'eau chaque jour de la semaine.",
    pourquoi: 'On confond souvent la soif et la faim. Boire d’abord, manger ensuite.',
    couleur: 'var(--bleu)',
  },
  {
    id: 'sans-grignotage',
    nom: 'Rien entre les repas',
    emoji: '🚫',
    promesse: 'Trois repas, rien entre les deux. Eau, thé et café noir autorisés.',
    pourquoi: 'Ce sont les grignotages, pas les repas, qui font déborder la journée.',
    couleur: 'var(--corail)',
  },
  {
    id: 'sport-30',
    nom: '30 minutes de sport',
    emoji: '🏃‍♀️',
    promesse: 'Une demi-heure de mouvement par jour, marche comprise.',
    pourquoi: 'Sept jours d’affilée, c’est ce qui transforme le sport en réflexe.',
    couleur: 'var(--ambre)',
  },
  {
    id: 'legumes',
    nom: 'Des légumes à chaque repas',
    emoji: '🥦',
    promesse: 'Une vraie part de légumes au déjeuner et au dîner.',
    pourquoi: 'On mange moins du reste sans avoir à se priver : le volume remplit.',
    couleur: 'var(--menthe)',
  },
  {
    id: 'sans-alcool',
    nom: 'Zéro alcool',
    emoji: '🍹',
    promesse: 'Pas une goutte pendant sept jours.',
    pourquoi: "L'alcool est du sucre liquide, et il coupe le sommeil profond.",
    couleur: 'var(--lavande)',
  },
  {
    id: 'sans-ecran',
    nom: 'Pas d’écran après 21 h',
    emoji: '📵',
    promesse: 'Téléphone et télé éteints après 21 h.',
    pourquoi: 'La lumière des écrans retarde l’endormissement d’une bonne heure.',
    couleur: 'var(--bleu)',
  },
  {
    id: 'jeune-quotidien',
    nom: 'Le jeûne, tous les jours',
    emoji: '⏳',
    promesse: 'Atteindre son objectif de jeûne chaque jour de la semaine.',
    pourquoi: 'C’est la régularité qui fait le résultat, pas la durée d’un seul jeûne.',
    couleur: 'var(--corail)',
  },
]

export const defiParId = (id: string) => DEFIS.find((d) => d.id === id) ?? null

/** Les sept journées d'un défi, du premier au dernier jour. */
export function joursDuDefi(debut: string): string[] {
  const premier = deClefJour(debut)
  return Array.from({ length: 7 }, (_, i) => clefJour(ajouterJours(premier, i)))
}

/** Le défi est-il arrivé à son terme ? */
export function defiTermine(debut: string): boolean {
  return clefJour() > joursDuDefi(debut)[6]
}

/** Combien de jours se sont écoulés, de 1 à 7. */
export function jourNumero(debut: string): number {
  const jours = joursDuDefi(debut)
  const aujourdhui = clefJour()
  const index = jours.indexOf(aujourdhui)
  if (index >= 0) return index + 1
  return aujourdhui > jours[6] ? 7 : 1
}

/**
 * Les défis que l'app sait vérifier elle-même : inutile de cocher à la main
 * ce qui est déjà noté ailleurs. Renvoie `null` quand seule la personne sait.
 */
export function valideToutSeul(defiId: string, etat: Etat, jour: string): boolean | null {
  switch (defiId) {
    case 'dix-mille-pas':
      return (etat.pas[jour] ?? 0) >= 10000
    case 'deux-litres':
      return (etat.eau[jour] ?? 0) >= etat.profil.butEau
    case 'sport-30':
      return (
        etat.seances.filter((s) => s.jour === jour).reduce((total, s) => total + s.minutes, 0) >= 30
      )
    case 'jeune-quotidien':
      return etat.jeunes.some(
        (j) => j.fin !== null && clefJour(new Date(j.fin)) === jour && objectifAtteint(j),
      )
    case 'dodo-21h': {
      const nuit = etat.nuits.find((n) => n.jour === jour)
      if (!nuit) return false
      const [heure] = nuit.coucher.split(':').map(Number)
      // Couché à 22 h = trop tard ; couché à 0 h 30 compte aussi comme trop tard.
      return heure < 21 || (heure >= 12 && heure < 21)
    }
    default:
      return null
  }
}

/** Un jour est validé s'il a été coché à la main, ou si l'app l'a constaté. */
export function jourValide(etat: Etat, jour: string): boolean {
  const encours = etat.defiEnCours
  if (!encours) return false
  if (encours.coches.includes(jour)) return true
  return valideToutSeul(encours.defiId, etat, jour) === true
}

/** Le nombre de journées tenues depuis le début du défi en cours. */
export function joursTenus(etat: Etat): number {
  const encours = etat.defiEnCours
  if (!encours) return 0
  return joursDuDefi(encours.debut).filter((jour) => jourValide(etat, jour)).length
}

/** Le dernier jour du jeûne le plus long de la journée — pour l'affichage. */
export function meilleurJeuneDuJour(etat: Etat, jour: string): number {
  return etat.jeunes
    .filter((j) => j.fin !== null && clefJour(new Date(j.fin)) === jour)
    .reduce((max, j) => Math.max(max, dureeHeures(j)), 0)
}
