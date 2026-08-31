/* Comprendre une phrase du genre :
   « un sandwich avec 2 pains de mie complets, 80 g de poulet pané,
     un peu de salade, carotte râpée, tomate, beurre d'olive et du chimichurri »

   Le principe : on découpe la phrase en morceaux, on cherche la quantité dans
   chacun, puis on reconnaît l'aliment dans ce qui reste. Rien n'est deviné
   dans le dos : chaque ligne s'affiche avec sa quantité, et tout se corrige.
   Une estimation qu'on ne peut pas corriger ne vaut rien. */

import type { Aliment } from './aliments'
import { ALIMENTS, poidsUnitaire } from './aliments'

export type LigneAnalysee = {
  /** Le morceau de phrase d'origine, pour que la personne s'y retrouve. */
  texte: string
  aliment: Aliment | null
  /** En grammes ou en millilitres. */
  quantite: number
  /** « sure » : la quantité était écrite. « devinee » : c'est une portion. */
  confiance: 'sure' | 'devinee' | 'inconnue'
}

/** Enlève les accents et la ponctuation : « pâné » doit trouver « pané ». */
export function simplifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[.,;:!?()]/g, ' ')
    .toLowerCase()
    // Les ligatures ne se décomposent pas comme les accents : sans cette
    // ligne, « bœuf » et « boeuf » restent deux mots différents.
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/\s+/g, ' ')
    .trim()
}

/* Les mots qui ne désignent rien : ils ne servent qu'à faire des phrases. */
const MOTS_VIDES = new Set([
  'de', 'du', 'des', 'd', 'le', 'la', 'les', 'un', 'une', 'et', 'avec', 'au',
  'aux', 'a', 'en', 'sur', 'dans', 'plus', 'ou', 'mon', 'ma', 'mes', 'ce',
  'cette', 'petit', 'petite', 'grand', 'grande', 'bon', 'bonne', 'peu', 'tres',
])

/* Les mots qui désignent le contenant, pas le contenu : « un bol de riz »,
   « un sandwich avec… ». Ils servent à la quantité, jamais à reconnaître
   l'aliment — sinon « un sandwich » compte un sandwich entier en plus de sa
   garniture. */
const CONTENANTS = new Set([
  'sandwich', 'wrap', 'burger', 'tartine', 'croque', 'panini', 'poke',
  'assiette', 'bol', 'plat', 'saladier', 'barquette', 'portion', 'portions',
  'part', 'parts', 'morceau', 'morceaux', 'tranche', 'tranches', 'verre',
  'verres', 'poignee', 'cuillere', 'cuilleres', 'cuilleree', 'bouchee',
])

const CHIFFRES: Record<string, number> = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7,
  huit: 8, neuf: 9, dix: 10, demi: 0.5, demie: 0.5, moitie: 0.5,
}

const mots = (texte: string) => simplifier(texte).split(' ').filter(Boolean)

/** Distance d'édition, bornée à 1 : « chimichuri » doit trouver « chimichurri ». */
function presquePareil(a: string, b: string): boolean {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length < 5 || b.length < 5) return false
  const [court, long] = a.length <= b.length ? [a, b] : [b, a]
  let i = 0
  let j = 0
  let ecarts = 0
  while (i < court.length && j < long.length) {
    if (court[i] === long[j]) {
      i++
      j++
    } else {
      ecarts++
      if (ecarts > 1) return false
      if (court.length === long.length) i++
      j++
    }
  }
  return ecarts + (long.length - j) <= 1
}

/* Le pluriel français se joue sur une lettre : « 3 œufs » doit trouver
   « Œuf ». La distance d'édition ne suffit pas — elle refuse les mots de
   moins de cinq lettres, sans quoi « pain » trouverait « pané ». */
function racine(mot: string): string {
  return mot.length > 3 ? mot.replace(/[sx]$/, '') : mot
}

/* Quand un seul mot est écrit, c'est presque toujours celui-là qu'on veut. */
const RACCOURCIS: Record<string, string> = {
  salade: 'Salade verte',
  pain: 'Pain de mie',
  poulet: 'Poulet (blanc, sans peau)',
  beurre: 'Beurre',
  huile: 'Huile',
  oeuf: 'Œuf',
  oeufs: 'Œuf',
  riz: 'Riz blanc cuit',
  pates: 'Pâtes cuites',
  fromage: 'Fromage (emmental)',
  lait: 'Lait demi-écrémé',
  yaourt: 'Yaourt nature',
  cafe: 'Café noir',
  the: 'Thé',
  eau: 'Eau',
  thon: 'Thon frais',
  boeuf: 'Bœuf (steak)',
  jambon: 'Jambon blanc',
  poisson: 'Thon frais',
  chocolat: 'Chocolat au lait',
  soda: 'Soda',
  biere: 'Bière',
  vin: 'Vin',
  uru: 'Uru (fruit à pain) cuit',
  taro: 'Taro cuit',
  fafa: 'Fafa (feuilles de taro)',
}

const INDEX = ALIMENTS.map((aliment) => ({
  aliment,
  mots: mots(aliment.nom).filter((m) => m.length > 2 && !MOTS_VIDES.has(m)),
}))

/** Trouve l'aliment le plus proche d'un morceau de phrase. */
function reconnaitre(fragment: string): Aliment | null {
  const motsFragment = mots(fragment).filter(
    (m) => !MOTS_VIDES.has(m) && !CONTENANTS.has(m) && !/^\d/.test(m),
  )
  if (motsFragment.length === 0) return null

  // Un seul mot connu : le raccourci l'emporte sur le calcul de score.
  if (motsFragment.length === 1) {
    const raccourci = RACCOURCIS[motsFragment[0]]
    if (raccourci) return ALIMENTS.find((a) => a.nom === raccourci) ?? null
  }

  let meilleur: { aliment: Aliment; note: number; trouves: number } | null = null
  for (const entree of INDEX) {
    if (entree.mots.length === 0) continue
    const trouves = entree.mots.filter((m) =>
      motsFragment.some((f) => f === m || racine(f) === racine(m) || presquePareil(f, m)),
    ).length
    if (trouves === 0) continue

    // Deux exigences, et il faut les deux. Le nom de l'aliment doit être
    // bien recouvert par le fragment — sinon « Salade de fruits » sortirait
    // pour « salade ». Et le fragment doit être bien recouvert par le nom :
    // sans ça « 3 pommes de terre » trouve « Pomme », qui fait un score
    // parfait sur son seul mot et laisse « terre » de côté.
    const precision = trouves / entree.mots.length
    if (precision < 0.5) continue
    const couverture = trouves / motsFragment.length
    const note = precision * couverture

    const mieux =
      !meilleur || note > meilleur.note || (note === meilleur.note && trouves > meilleur.trouves)
    if (mieux) meilleur = { aliment: entree.aliment, note, trouves }
  }
  return meilleur?.aliment ?? null
}

/** Cherche une quantité dans un morceau de phrase. */
function quantiteDe(fragment: string, aliment: Aliment | null): { valeur: number | null; facteur: number } {
  const texte = simplifier(fragment)
  const nombre = (v: string) => Number(v.replace(',', '.'))

  const grammes = texte.match(/(\d+[.,]?\d*)\s*(kg|kilos?|g|gr|grammes?)\b/)
  if (grammes) {
    const valeur = nombre(grammes[1])
    return { valeur: /^k/.test(grammes[2]) ? valeur * 1000 : valeur, facteur: 1 }
  }

  const liquide = texte.match(/(\d+[.,]?\d*)\s*(ml|cl|l|litres?)\b/)
  if (liquide) {
    const valeur = nombre(liquide[1])
    const unite = liquide[2]
    return { valeur: unite === 'cl' ? valeur * 10 : unite.startsWith('l') ? valeur * 1000 : valeur, facteur: 1 }
  }

  const soupe = texte.match(/(\d+[.,]?\d*)?\s*(c\s*a\s*s|cuilleres?\s*a\s*soupe|cas)\b/)
  if (soupe) return { valeur: (soupe[1] ? nombre(soupe[1]) : 1) * 15, facteur: 1 }

  const cafe = texte.match(/(\d+[.,]?\d*)?\s*(c\s*a\s*c|cuilleres?\s*a\s*cafe|cac)\b/)
  if (cafe) return { valeur: (cafe[1] ? nombre(cafe[1]) : 1) * 5, facteur: 1 }

  if (/\bpoignee/.test(texte)) return { valeur: 30, facteur: 1 }
  if (/\bbol\b/.test(texte)) return { valeur: 250, facteur: 1 }
  if (/\bverre\b/.test(texte)) return { valeur: 250, facteur: 1 }
  if (/\bassiette\b/.test(texte)) return { valeur: 300, facteur: 1 }

  const unite = aliment ? poidsUnitaire(aliment) : 100

  const tranches = texte.match(/(\d+[.,]?\d*)?\s*(tranches?|parts?|portions?|morceaux?)\b/)
  if (tranches) return { valeur: (tranches[1] ? nombre(tranches[1]) : 1) * unite, facteur: 1 }

  // « 2 pains de mie » : un nombre en tête, sans unité.
  const compte = texte.match(/^(\d+[.,]?\d*)\s+\D/)
  if (compte) return { valeur: nombre(compte[1]) * unite, facteur: 1 }

  const enLettres = mots(texte).find((m) => m in CHIFFRES)
  if (enLettres && !/^un peu/.test(texte)) {
    return { valeur: CHIFFRES[enLettres] * unite, facteur: 1 }
  }

  // Pas de quantité : on part de la portion habituelle, ajustée par les mots.
  if (/\bun peu\b|\bune pointe\b|\bun filet\b/.test(texte)) return { valeur: null, facteur: 0.4 }
  if (/\bbeaucoup\b|\bpas mal\b|\bplein\b/.test(texte)) return { valeur: null, facteur: 1.5 }
  return { valeur: null, facteur: 1 }
}

/**
 * Découpe la phrase, reconnaît chaque morceau, propose une quantité.
 * Renvoie aussi le nom du plat quand la phrase commence par « un sandwich
 * avec… » : ce premier morceau nomme le plat, il ne se mange pas à part.
 */
export function analyser(texte: string): { nom: string | null; lignes: LigneAnalysee[] } {
  if (!texte.trim()) return { nom: null, lignes: [] }

  let reste = texte
  let nom: string | null = null

  /* « un sandwich avec … » : ce qui précède « avec » ne nomme qu'un contenant,
     c'est le nom du plat. Mais « une assiette de chao men avec du poulet »
     parle bien de chao men : là, ça reste un ingrédient. */
  const avec = texte.match(/^(.{2,40}?)\s+avec\s+(.+)$/is)
  const contenantSeul =
    avec &&
    mots(avec[1])
      .filter((m) => !MOTS_VIDES.has(m) && !/^\d/.test(m))
      .every((m) => CONTENANTS.has(m))
  if (avec && contenantSeul) {
    nom = avec[1]
      .replace(/^\s*(un|une|le|la|les|des|du|mon|ma)\s+/i, '')
      .trim()
    reste = avec[2]
  }

  const fragments = reste
    .split(/,|;|\bet\b|\bavec\b|\bplus\b|\n|\+/i)
    .map((f) => f.trim())
    .filter((f) => f.length > 1)

  const lignes = fragments.map((fragment) => {
    const aliment = reconnaitre(fragment)
    if (!aliment) {
      return { texte: fragment, aliment: null, quantite: 0, confiance: 'inconnue' as const }
    }
    const { valeur, facteur } = quantiteDe(fragment, aliment)
    const quantite = valeur ?? Math.round(aliment.portion * facteur)
    return {
      texte: fragment,
      aliment,
      quantite: Math.max(1, Math.round(quantite)),
      confiance: valeur !== null ? ('sure' as const) : ('devinee' as const),
    }
  })

  return { nom: nom && nom.length > 1 ? majuscule(nom) : null, lignes }
}

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)
