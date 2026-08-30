/* Les écrans qui s'ouvrent par-dessus les onglets. Pas de routeur : l'app
   tient dans une poignée d'écrans, et un simple aiguillage suffit. */

import type { MomentRepas } from './stockage'

export type Vue =
  | { nom: 'sport' }
  | { nom: 'noter-seance'; programmeId?: string; numeroJour?: number }
  | { nom: 'programme'; id: string }
  | { nom: 'nouveau-programme' }
  | { nom: 'defis' }
  | { nom: 'moi' }
  | { nom: 'recettes' }
  | { nom: 'recette'; id: string }
  | { nom: 'lecons' }
  | { nom: 'lecon'; id: string }
  | { nom: 'seance'; id: string }
  | { nom: 'sortie' }
  | { nom: 'ajout'; moment: MomentRepas }
  | { nom: 'composer'; moment: MomentRepas }
  | { nom: 'corps' }
  | { nom: 'eau' }
  | { nom: 'activite' }
  | { nom: 'reglages' }
