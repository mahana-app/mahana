/* La base d'aliments.

   Les valeurs sont données pour 100 g (ou 100 ml pour ce qui se boit) et
   viennent des tables de composition usuelles. Ce sont des ordres de
   grandeur : deux poissons crus au lait de coco ne se ressemblent jamais.
   Ce qui compte, c'est la régularité de la mesure, pas sa précision au gramme.

   La « portion » est la quantité proposée par défaut quand on ajoute
   l'aliment : de quoi noter un repas en deux touches. */

export type Aliment = {
  nom: string
  categorie: string
  kcal: number
  glucides: number
  proteines: number
  lipides: number
  portion: number
  unite: 'g' | 'ml'
}

type Ligne = [string, number, number, number, number, number, ('g' | 'ml')?]

const TABLE: Record<string, Ligne[]> = {
  'Féculents': [
    ['Riz blanc cuit', 130, 28, 2.7, 0.3, 150],
    ['Riz complet cuit', 112, 23, 2.6, 0.9, 150],
    ['Pâtes cuites', 131, 25, 5, 1.1, 150],
    ['Nouilles chinoises cuites', 138, 25, 4.5, 2, 200],
    ['Pain blanc', 265, 49, 9, 3.2, 50],
    ['Baguette', 270, 55, 9, 1, 60],
    ['Pomme de terre cuite', 87, 20, 2, 0.1, 200],
    ['Patate douce cuite', 90, 21, 2, 0.1, 200],
    ['Uru (fruit à pain) cuit', 103, 27, 1.1, 0.2, 200],
    ['Taro cuit', 112, 26, 1.5, 0.1, 200],
    ['Manioc cuit', 160, 38, 1.4, 0.3, 150],
    ['Banane plantain cuite', 122, 32, 1.3, 0.4, 150],
    ['Quinoa cuit', 120, 21, 4.4, 1.9, 150],
    ['Semoule cuite', 112, 23, 3.8, 0.2, 150],
    ['Frites', 312, 41, 3.4, 15, 120],
    ['Flocons d’avoine', 370, 60, 13, 7, 40],
    ['Céréales du petit-déjeuner', 380, 75, 8, 5, 40],
    ['Biscotte', 400, 75, 11, 6, 20],
    ['Pain de mie', 265, 49, 8, 3.5, 50],
    ['Pain de mie complet', 250, 41, 9, 4, 50],
  ],
  'Légumes': [
    ['Salade verte', 15, 3, 1.4, 0.2, 80],
    ['Tomate', 18, 3.9, 0.9, 0.2, 120],
    ['Concombre', 15, 3.6, 0.7, 0.1, 100],
    ['Carotte', 41, 10, 0.9, 0.2, 100],
    ['Carotte râpée', 41, 10, 0.9, 0.2, 80],
    ['Courgette', 17, 3.1, 1.2, 0.3, 150],
    ['Haricots verts', 31, 7, 1.8, 0.1, 150],
    ['Brocoli', 34, 7, 2.8, 0.4, 150],
    ['Chou', 25, 6, 1.3, 0.1, 150],
    ['Épinards', 23, 3.6, 2.9, 0.4, 150],
    ['Fafa (feuilles de taro)', 42, 6, 3, 0.7, 150],
    ['Aubergine', 25, 6, 1, 0.2, 150],
    ['Poivron', 31, 6, 1, 0.3, 100],
    ['Oignon', 40, 9, 1.1, 0.1, 50],
    ['Champignons', 22, 3.3, 3.1, 0.3, 100],
    ['Maïs', 96, 21, 3.4, 1.5, 100],
    ['Petits pois', 81, 14, 5.4, 0.4, 100],
    ['Potiron', 26, 6.5, 1, 0.1, 200],
  ],
  'Fruits': [
    ['Banane', 89, 23, 1.1, 0.3, 120],
    ['Pomme', 52, 14, 0.3, 0.2, 150],
    ['Orange', 47, 12, 0.9, 0.1, 150],
    ['Mangue', 60, 15, 0.8, 0.4, 150],
    ['Papaye', 43, 11, 0.5, 0.3, 150],
    ['Ananas', 50, 13, 0.5, 0.1, 150],
    ['Pastèque', 30, 8, 0.6, 0.2, 200],
    ['Melon', 34, 8, 0.8, 0.2, 200],
    ['Fraises', 32, 8, 0.7, 0.3, 150],
    ['Raisin', 69, 18, 0.7, 0.2, 150],
    ['Pamplemousse', 42, 11, 0.8, 0.1, 200],
    ['Fruit de la passion', 97, 23, 2.2, 0.7, 50],
    ['Litchi', 66, 17, 0.8, 0.4, 100],
    ['Avocat', 160, 9, 2, 15, 100],
    ['Noix de coco fraîche', 354, 15, 3.3, 33, 50],
  ],
  'Viandes, poissons, œufs': [
    ['Poulet (blanc, sans peau)', 165, 0, 31, 3.6, 150],
    ['Poulet avec la peau', 220, 0, 27, 12, 150],
    ['Bœuf (steak)', 250, 0, 26, 15, 150],
    ['Bœuf haché 5 %', 137, 0, 21, 5, 150],
    ['Porc', 242, 0, 27, 14, 150],
    ['Agneau', 294, 0, 25, 21, 150],
    ['Jambon blanc', 107, 1, 18, 3, 50],
    ['Saucisse', 300, 2, 13, 27, 100],
    ['Corned beef', 250, 1, 16, 20, 100],
    ['Thon frais', 132, 0, 28, 1, 150],
    ['Thon en boîte au naturel', 116, 0, 26, 1, 100],
    ['Saumon', 208, 0, 20, 13, 150],
    ['Mahi mahi', 85, 0, 18.5, 0.7, 150],
    ['Bonite', 165, 0, 24, 7, 150],
    ['Crevettes', 99, 0.2, 24, 0.3, 120],
    ['Poulpe', 82, 2, 15, 1, 120],
    ['Poisson pané', 220, 16, 13, 11, 120],
    ['Poulet pané', 240, 14, 18, 12, 120],
    ['Œuf', 143, 0.7, 13, 9.5, 110],
  ],
  'Produits laitiers': [
    ['Lait entier', 61, 4.8, 3.2, 3.3, 200, 'ml'],
    ['Lait demi-écrémé', 46, 4.8, 3.3, 1.6, 200, 'ml'],
    ['Yaourt nature', 61, 4.7, 3.5, 3.3, 125],
    ['Yaourt 0 %', 45, 4, 4.5, 0.2, 125],
    ['Yaourt aux fruits', 95, 15, 3.5, 2.5, 125],
    ['Fromage blanc 20 %', 80, 3.5, 7.5, 3.5, 100],
    ['Fromage (emmental)', 380, 1, 28, 29, 30],
    ['Camembert', 300, 0.5, 20, 24, 30],
    ['Beurre', 745, 0.6, 0.8, 82, 10],
    ['Crème fraîche 30 %', 290, 3, 2.4, 30, 30],
    ['Lait de coco', 197, 3, 2, 20, 100, 'ml'],
    ['Crème glacée', 207, 24, 3.5, 11, 100],
  ],
  'Plats': [
    ['Poisson cru au lait de coco', 180, 6, 14, 11, 250],
    ['Chao men', 160, 20, 8, 5, 300],
    ['Poulet fafa', 150, 7, 12, 8, 300],
    ['Maa tinito', 145, 18, 8, 5, 300],
    ['Casse-croûte thon', 250, 28, 12, 10, 250],
    ['Riz cantonais', 160, 22, 6, 5, 300],
    ['Salade composée', 120, 8, 6, 7, 250],
    ['Pizza', 266, 33, 11, 10, 200],
    ['Hamburger', 250, 30, 13, 9, 220],
    ['Sandwich jambon-beurre', 250, 30, 10, 10, 200],
    ['Quiche', 270, 20, 9, 17, 150],
    ['Sushi', 150, 30, 6, 1, 150],
  ],
  'En-cas et sucreries': [
    ['Chocolat au lait', 535, 59, 7.5, 30, 30],
    ['Chocolat noir', 546, 46, 7.8, 31, 30],
    ['Biscuits secs', 460, 70, 6, 17, 30],
    ['Croissant', 406, 45, 8, 21, 60],
    ['Pain au chocolat', 414, 45, 7, 22, 70],
    ['Firi firi', 350, 45, 5, 17, 80],
    ['Poe banane', 180, 38, 1.5, 2.5, 150],
    ['Gâteau au chocolat', 370, 50, 5, 17, 100],
    ['Barre chocolatée', 480, 60, 5, 22, 45],
    ['Bonbons', 380, 95, 0, 0, 30],
    ['Chips', 536, 53, 6, 34, 30],
    ['Popcorn', 387, 78, 12, 4.5, 30],
    ['Cacahuètes', 567, 16, 26, 49, 30],
    ['Amandes', 579, 22, 21, 50, 30],
  ],
  'Boissons': [
    ['Eau', 0, 0, 0, 0, 250, 'ml'],
    ['Café noir', 2, 0, 0.2, 0, 100, 'ml'],
    ['Thé', 1, 0.2, 0, 0, 250, 'ml'],
    ['Jus d’orange', 45, 10, 0.7, 0.1, 250, 'ml'],
    ['Soda', 42, 10.6, 0, 0, 330, 'ml'],
    ['Soda light', 0.3, 0, 0, 0, 330, 'ml'],
    ['Bière', 43, 3.6, 0.5, 0, 330, 'ml'],
    ['Vin', 85, 2.6, 0.1, 0, 125, 'ml'],
    ['Sirop dilué', 40, 10, 0, 0, 250, 'ml'],
  ],
  'Sauces et matières grasses': [
    ['Huile', 900, 0, 0, 100, 10, 'ml'],
    ['Mayonnaise', 680, 1.5, 1, 75, 15],
    ['Vinaigrette', 450, 3, 0.5, 48, 15],
    ['Ketchup', 100, 24, 1.2, 0.1, 15],
    ['Sauce soja', 60, 5, 6, 0, 10, 'ml'],
    ['Chimichurri', 300, 3, 1, 31, 20],
    ['Beurre d’olive', 620, 0.5, 0.4, 68, 10],
    ['Moutarde', 150, 6, 7, 10, 10],
    ['Sucre', 400, 100, 0, 0, 5],
    ['Miel', 304, 82, 0.3, 0, 20],
    ['Confiture', 270, 65, 0.4, 0.1, 20],
    ['Pâte à tartiner', 539, 57, 6, 31, 20],
  ],
}

export const ALIMENTS: Aliment[] = Object.entries(TABLE).flatMap(([categorie, lignes]) =>
  lignes.map(([nom, kcal, glucides, proteines, lipides, portion, unite]) => ({
    nom,
    categorie,
    kcal,
    glucides,
    proteines,
    lipides,
    portion,
    unite: unite ?? ('g' as const),
  })),
)

export const CATEGORIES = Object.keys(TABLE)

/**
 * Le poids d'une unité, pour les aliments qui se comptent plutôt qu'ils ne se
 * pèsent : « 2 pains de mie », « un œuf », « une banane ».
 */
export const PAR_UNITE: Record<string, number> = {
  'Pain de mie': 25,
  'Pain de mie complet': 25,
  'Pain blanc': 30,
  Baguette: 60,
  Biscotte: 10,
  Œuf: 55,
  Banane: 120,
  Pomme: 150,
  Orange: 150,
  Mangue: 200,
  'Yaourt nature': 125,
  'Yaourt 0 %': 125,
  'Yaourt aux fruits': 125,
  Croissant: 60,
  'Pain au chocolat': 70,
  'Firi firi': 80,
  Tomate: 120,
  'Barre chocolatée': 45,
  'Fruit de la passion': 50,
  Litchi: 10,
}

/** Le poids d'une unité, ou la portion si l'aliment ne se compte pas. */
export const poidsUnitaire = (aliment: Aliment): number =>
  PAR_UNITE[aliment.nom] ?? aliment.portion

/** Enlève les accents et la casse : « pates » doit trouver « Pâtes ». */
const simplifier = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, ' ')
    .toLowerCase()
    .trim()

export function chercherAliment(recherche: string): Aliment[] {
  const cherche = simplifier(recherche)
  if (!cherche) return []
  const mots = cherche.split(/\s+/)
  return ALIMENTS.filter((aliment) => {
    const cible = simplifier(`${aliment.nom} ${aliment.categorie}`)
    return mots.every((mot) => cible.includes(mot))
  }).slice(0, 40)
}

/** Les valeurs d'un aliment pour la quantité réellement mangée. */
export function pour(aliment: Aliment, quantite: number) {
  const part = quantite / 100
  return {
    kcal: Math.round(aliment.kcal * part),
    glucides: Math.round(aliment.glucides * part * 10) / 10,
    proteines: Math.round(aliment.proteines * part * 10) / 10,
    lipides: Math.round(aliment.lipides * part * 10) / 10,
  }
}
