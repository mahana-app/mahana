/* Les habitudes.

   Un défi dure sept jours et casse une envie. Une habitude dure vingt et un
   jours et l'installe pour de bon. Les deux se complètent : on tient d'abord,
   on garde ensuite. Une seule à la fois, comme pour les défis. */

import { ajouterJours, clefJour, deClefJour } from './dates'
import type { Etat } from './stockage'

export type Habitude = {
  id: string
  nom: string
  emoji: string
  promesse: string
  pourquoi: string
  couleur: string
}

export const HABITUDES: Habitude[] = [
  {
    id: 'eau-reveil',
    nom: 'Un grand verre d’eau au réveil',
    emoji: '🥛',
    promesse: 'Avant le café, avant le téléphone : un grand verre d’eau.',
    pourquoi: 'On se réveille déshydratée. C’est l’habitude la plus facile à tenir de la liste.',
    couleur: 'var(--bleu)',
  },
  {
    id: 'marche-30',
    nom: '30 minutes de marche',
    emoji: '🚶‍♀️',
    promesse: 'Une demi-heure de marche par jour, en une ou plusieurs fois.',
    pourquoi: 'La marche brûle sans donner faim — c’est ce qui la rend imbattable sur la durée.',
    couleur: 'var(--menthe)',
  },
  {
    id: 'legumes-midi-soir',
    nom: 'Des légumes midi et soir',
    emoji: '🥦',
    promesse: 'Une vraie part de légumes dans les deux repas principaux.',
    pourquoi: 'Le volume remplit l’estomac pour presque rien en calories.',
    couleur: '#8bc34a',
  },
  {
    id: 'proteines-matin',
    nom: 'Des protéines au petit-déjeuner',
    emoji: '🥚',
    promesse: 'Œuf, yaourt, poisson, fromage blanc — quelque chose de solide le matin.',
    pourquoi: 'Un petit-déjeuner sucré affame à 10 h. Un petit-déjeuner protéiné tient jusqu’à midi.',
    couleur: 'var(--ambre)',
  },
  {
    id: 'heure-coucher',
    nom: 'Se coucher à heure fixe',
    emoji: '🌙',
    promesse: 'Au lit à la même heure, tous les soirs, week-end compris.',
    pourquoi: 'Le corps règle la faim sur le sommeil. Des horaires stables, une faim stable.',
    couleur: 'var(--lavande)',
  },
  {
    id: 'sans-ecran-lit',
    nom: 'Pas de téléphone au lit',
    emoji: '📵',
    promesse: 'Le téléphone reste hors de la chambre, ou face contre la table.',
    pourquoi: 'La lumière et le défilement repoussent l’endormissement d’une heure sans qu’on s’en aperçoive.',
    couleur: '#7e8ea6',
  },
  {
    id: 'macher',
    nom: 'Manger lentement',
    emoji: '🍽️',
    promesse: 'Poser sa fourchette entre deux bouchées, à chaque repas.',
    pourquoi: 'Le signal de satiété met vingt minutes à arriver. Manger vite, c’est manger trop.',
    couleur: 'var(--corail)',
  },
  {
    id: 'etirements',
    nom: '10 minutes d’étirements',
    emoji: '🧘‍♀️',
    promesse: 'Dix minutes le soir, avant de dormir.',
    pourquoi: 'Le dos et les jambes récupèrent, et l’endormissement vient plus vite.',
    couleur: 'var(--menthe-fonce)',
  },
]

export const DUREE_HABITUDE = 21

export const habitudeParId = (id: string) => HABITUDES.find((h) => h.id === id) ?? null

/** Les vingt et un jours d'une habitude. */
export function joursDeLHabitude(debut: string): string[] {
  const premier = deClefJour(debut)
  return Array.from({ length: DUREE_HABITUDE }, (_, i) => clefJour(ajouterJours(premier, i)))
}

export function habitudeTerminee(debut: string): boolean {
  return clefJour() > joursDeLHabitude(debut)[DUREE_HABITUDE - 1]
}

export function jourNumeroHabitude(debut: string): number {
  const jours = joursDeLHabitude(debut)
  const index = jours.indexOf(clefJour())
  if (index >= 0) return index + 1
  return clefJour() > jours[DUREE_HABITUDE - 1] ? DUREE_HABITUDE : 1
}

export function joursTenusHabitude(etat: Etat): number {
  return etat.habitudeEnCours?.coches.length ?? 0
}
