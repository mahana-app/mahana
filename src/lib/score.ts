/* Le score de la journée, sur 100.

   Six ingrédients : le jeûne, ce qu'on a mangé, l'eau, les pas, le sommeil et
   le sport. Chacun rapporte ses points, et l'app dit toujours ce qu'il reste
   à faire pour aller les chercher — un chiffre qui ne dit pas quoi faire ne
   sert à rien. */

import { clefJour } from './dates'
import { objectifAtteint } from './jeune'
import { objectifCalories } from './profil'
import type { Etat } from './stockage'

export type Partie = {
  id: string
  nom: string
  emoji: string
  couleur: string
  points: number
  max: number
  /** Ce qu'il reste à faire. Vide quand c'est gagné. */
  restant: string
}

const borne = (valeur: number, max: number) => Math.max(0, Math.min(max, Math.round(valeur)))

export function scoreDuJour(etat: Etat, jour: string = clefJour()) {
  const profil = etat.profil
  const repas = etat.repas.filter((r) => r.jour === jour)
  const seances = etat.seances.filter((s) => s.jour === jour)
  const kcalMangees = repas.reduce((t, r) => t + r.kcal, 0)
  const butKcal = objectifCalories(etat)
  const verres = etat.eau[jour] ?? 0
  const pas = etat.pas[jour] ?? 0
  const nuit = etat.nuits.find((n) => n.jour === jour)
  const minutesSport = seances.reduce((t, s) => t + s.minutes, 0)
  const jeuneReussi = etat.jeunes.some(
    (j) => j.fin !== null && clefJour(new Date(j.fin)) === jour && objectifAtteint(j),
  )

  /* L'alimentation : on vise l'objectif sans le dépasser. Rester très en
     dessous n'est pas mieux — c'est même le meilleur moyen de craquer le soir. */
  let pointsRepas = 0
  let restantRepas = 'Noter ce que vous mangez'
  if (butKcal && kcalMangees > 0) {
    const part = kcalMangees / butKcal
    if (part >= 0.85 && part <= 1.05) {
      pointsRepas = 20
      restantRepas = ''
    } else if (part < 0.85) {
      pointsRepas = borne(part * 20, 18)
      restantRepas = `Encore ${Math.round(butKcal * 0.85 - kcalMangees)} kcal pour être dans la cible`
    } else {
      pointsRepas = borne(20 - (part - 1.05) * 40, 20)
      restantRepas = `${Math.round(kcalMangees - butKcal)} kcal au-dessus de l'objectif`
    }
  }

  const parties: Partie[] = [
    {
      id: 'jeune',
      nom: 'Jeûne',
      emoji: '⏳',
      couleur: 'var(--menthe)',
      points: jeuneReussi ? 20 : 0,
      max: 20,
      restant: jeuneReussi ? '' : `Tenir un jeûne de ${profil.objectifJeuneHeures} h`,
    },
    {
      id: 'repas',
      nom: 'Alimentation',
      emoji: '🥗',
      couleur: '#8bc34a',
      points: pointsRepas,
      max: 20,
      restant: restantRepas,
    },
    {
      id: 'eau',
      nom: 'Eau',
      emoji: '💧',
      couleur: 'var(--bleu)',
      points: borne((verres / profil.butEau) * 15, 15),
      max: 15,
      restant:
        verres >= profil.butEau
          ? ''
          : `Boire encore ${profil.butEau - verres} verre${profil.butEau - verres > 1 ? 's' : ''}`,
    },
    {
      id: 'pas',
      nom: 'Pas',
      emoji: '👟',
      couleur: 'var(--ambre)',
      points: borne((pas / profil.butPas) * 15, 15),
      max: 15,
      restant:
        pas >= profil.butPas
          ? ''
          : `Atteindre ${profil.butPas.toLocaleString('fr-FR')} pas`,
    },
    {
      id: 'sommeil',
      nom: 'Sommeil',
      emoji: '🌙',
      couleur: 'var(--lavande)',
      points: nuit ? borne((nuit.minutes / profil.butSommeilMin) * 15, 15) : 0,
      max: 15,
      restant: nuit
        ? nuit.minutes >= profil.butSommeilMin
          ? ''
          : 'Dormir un peu plus cette nuit'
        : 'Noter la nuit dernière',
    },
    {
      id: 'sport',
      nom: 'Entraînement',
      emoji: '💪',
      couleur: 'var(--corail)',
      points: borne((minutesSport / 30) * 15, 15),
      max: 15,
      restant:
        minutesSport >= 30 ? '' : `Encore ${30 - minutesSport} minutes de mouvement`,
    },
  ]

  return {
    total: parties.reduce((t, p) => t + p.points, 0),
    parties,
  }
}

/** Une phrase d'encouragement, adaptée à la note. */
export function motDuScore(total: number): string {
  if (total >= 90) return 'Journée parfaite. Rien à ajouter.'
  if (total >= 70) return 'Belle journée. Il ne manquait pas grand-chose.'
  if (total >= 45) return 'Journée correcte. Un ou deux points à aller chercher.'
  if (total > 0) return 'La journée a commencé. Chaque geste compte.'
  return 'Rien de noté pour l’instant.'
}
