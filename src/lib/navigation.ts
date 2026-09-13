/* Les écrans qui s'ouvrent par-dessus les onglets. Pas de routeur : l'app
   tient dans une poignée d'écrans, et un simple aiguillage suffit. */

export type Vue =
  | { nom: 'charge'; id: string }
  | { nom: 'nouvelle-charge' }
  | { nom: 'nouvel-achat' }
  | { nom: 'nouvelle-ardoise' }
  | { nom: 'maisonnee' }
