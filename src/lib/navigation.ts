/* Les écrans qui s'ouvrent par-dessus les onglets. Pas de routeur : l'app
   tient dans une poignée d'écrans, et un simple aiguillage suffit. */

import type { MomentRepas } from './stockage'

export type Vue =
  | { nom: 'jeune' }
  | { nom: 'seance'; id: string }
  | { nom: 'sortie' }
  | { nom: 'ajout'; moment: MomentRepas }
  | { nom: 'corps' }
  | { nom: 'eau' }
  | { nom: 'activite' }
  | { nom: 'reglages' }
