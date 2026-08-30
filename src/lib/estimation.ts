/* L'estimation d'un repas d'après sa photo.

   Aucune application ne peut deviner des calories en regardant une image sans
   passer par un serveur d'intelligence artificielle — et rien ne sort de ce
   téléphone. Alors on fait autrement, et honnêtement : trois questions
   auxquelles on répond en regardant sa propre assiette, et une fourchette.

   Ce n'est pas de la magie, c'est une estimation guidée. Elle vaut ce que
   valent les réponses — mais sur une semaine, elle situe très correctement. */

export type TypePlat = {
  id: string
  nom: string
  detail: string
  /** Calories d'une portion normale, préparation normale. */
  base: number
}

export const TYPES_PLAT: TypePlat[] = [
  { id: 'assiette', nom: 'Assiette complète', detail: 'Féculent, protéine et légumes', base: 550 },
  { id: 'plat-sauce', nom: 'Plat en sauce ou frit', detail: 'Curry, wok gras, friture', base: 700 },
  { id: 'bol', nom: 'Bol ou poke', detail: 'Riz, poisson, légumes', base: 450 },
  { id: 'sandwich', nom: 'Sandwich ou burger', detail: 'Pain garni, wrap, casse-croûte', base: 500 },
  { id: 'salade', nom: 'Salade', detail: 'Crudités, un peu de protéine', base: 250 },
  { id: 'soupe', nom: 'Soupe ou bouillon', detail: 'Légumes, peu de gras', base: 180 },
  { id: 'petit-dej', nom: 'Petit-déjeuner', detail: 'Pain, œufs, fruits, café', base: 350 },
  { id: 'encas', nom: 'En-cas ou dessert', detail: 'Gâteau, fruit, biscuits', base: 250 },
  { id: 'boisson', nom: 'Boisson', detail: 'Jus, soda, smoothie', base: 130 },
]

export const TAILLES = [
  { id: 'petite', nom: 'Petite', detail: 'Moins que d’habitude', facteur: 0.65 },
  { id: 'normale', nom: 'Normale', detail: 'Ma portion habituelle', facteur: 1 },
  { id: 'grande', nom: 'Grande', detail: 'Bien servie, ou resservie', facteur: 1.45 },
]

export const RICHESSES = [
  { id: 'legere', nom: 'Légère', detail: 'Grillé, vapeur, peu de sauce', facteur: 0.75 },
  { id: 'normale', nom: 'Normale', detail: 'Un peu d’huile, une sauce', facteur: 1 },
  { id: 'riche', nom: 'Riche', detail: 'Frit, crémeux, fromage, lait de coco', facteur: 1.35 },
]

/** L'estimation, avec sa fourchette : donner un chiffre seul serait mentir. */
export function estimer(typeId: string, tailleId: string, richesseId: string) {
  const type = TYPES_PLAT.find((t) => t.id === typeId) ?? TYPES_PLAT[0]
  const taille = TAILLES.find((t) => t.id === tailleId) ?? TAILLES[1]
  const richesse = RICHESSES.find((r) => r.id === richesseId) ?? RICHESSES[1]
  const milieu = Math.round((type.base * taille.facteur * richesse.facteur) / 10) * 10
  return {
    milieu,
    bas: Math.round((milieu * 0.8) / 10) * 10,
    haut: Math.round((milieu * 1.2) / 10) * 10,
    /* La répartition moyenne d'un repas mixte : de quoi remplir les macros
       sans prétendre les connaître. */
    glucides: Math.round((milieu * 0.45) / 4),
    proteines: Math.round((milieu * 0.2) / 4),
    lipides: Math.round((milieu * 0.35) / 9),
  }
}
