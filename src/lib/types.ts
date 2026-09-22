/* Le modèle de la maison.

   Deux foyers vivent ici : les LAI AH CHE et les LENOIR. Presque tout dans
   cette application se rattache à l'un ou à l'autre — une charge se partage
   entre les deux, une cotisation vient de l'un, une ardoise se rembourse par
   l'un. C'est la seule notion qu'il faut avoir en tête pour lire le reste.

   Tous les montants sont des entiers en francs Pacifique. Pas de centimes :
   le franc CFP n'en a pas, et un arrondi à la virgule finirait par créer des
   écarts que personne ne saurait expliquer. */

import { DECHETS_PAR_DEFAUT } from './dechets'
import type { ReglagesDechets } from './dechets'

export type Identifiant = string

/** Un foyer : une famille de la maison. */
export type Foyer = {
  id: Identifiant
  nom: string
  /** La couleur qui le représente partout dans l'app. */
  couleur: string
  /** Sa part des charges communes, de 0 à 1. Les parts font 1 au total. */
  part: number
  ordre: number
  /**
   * La roulotte n'est pas un foyer : c'est l'entreprise, installée à la même
   * adresse, qui paie la moitié des charges de la maison. Elle partage donc
   * les factures — mais elle ne fait pas les courses en commun et ne prend
   * rien à sa propre ardoise. Ce drapeau la tient hors de ces écrans-là.
   */
  estUneEntreprise: boolean
}

export type RoleMembre = 'adulte' | 'enfant'

/**
 * Une personne de la maison.
 *
 * `role` et `aUnTelephone` disent deux choses différentes, et il ne faut pas
 * les confondre : Mia et Manahiti sont des enfants qui notent eux-mêmes ce
 * qu'ils prennent à la roulotte, Eva a quatre ans et ne notera rien. C'est
 * `aUnTelephone` qui décide de qui apparaît dans « qui es-tu ? » et dans les
 * listes « qui y est allé » ; `role` servira aux écoles et aux activités.
 */
export type Membre = {
  id: Identifiant
  foyerId: Identifiant
  prenom: string
  role: RoleMembre
  /** Se sert de l'app sur son propre téléphone. */
  aUnTelephone: boolean
  /** Réservé : un code personnel, si un jour on en veut un par personne. */
  code: string
  actif: boolean
}

/* ---------- les charges de la maison ---------- */

export type NatureCharge = 'electricite' | 'eau' | 'internet' | 'impots' | 'dechets' | 'autre'

export const NATURES: Array<{ id: NatureCharge; nom: string; emoji: string }> = [
  { id: 'electricite', nom: 'Électricité', emoji: '⚡' },
  { id: 'eau', nom: 'Eau', emoji: '💧' },
  { id: 'internet', nom: 'Internet', emoji: '📶' },
  { id: 'impots', nom: 'Impôts', emoji: '🏛️' },
  { id: 'dechets', nom: 'Déchets', emoji: '🗑️' },
  { id: 'autre', nom: 'Autre', emoji: '🏠' },
]

/**
 * Une facture de la maison.
 *
 * Qui a payé et comment ça se répartit sont deux choses différentes : c'est
 * souvent un seul foyer qui avance la totalité au fournisseur, et l'autre lui
 * rend sa part ensuite. D'où `avanceePar` d'un côté, et les parts de l'autre.
 */
export type Charge = {
  id: Identifiant
  nature: NatureCharge
  libelle: string
  /** Le mois concerné, au format « 2026-09 ». */
  periode: string
  montant: number
  /** Le foyer qui a réglé le fournisseur. Vide tant que personne n'a payé. */
  avanceePar: Identifiant | null
  /** Le jour où le fournisseur a été payé. */
  payeeLe: string | null
  note: string
  /**
   * Le numéro de la facture chez le fournisseur — « F202609010958 » chez EDT.
   * Vide pour une facture saisie à la main. Il sert à ne pas importer deux
   * fois le même relevé : on le compare avant d'ajouter quoi que ce soit.
   */
  reference: string
  creeeLe: string
}

/**
 * La part d'un foyer dans une charge, figée au moment où la facture est
 * saisie. Elle n'est pas recalculée après coup : si on change la répartition
 * de la maison en janvier, les factures de décembre gardent l'ancienne — sinon
 * des comptes déjà soldés se remettraient à bouger tout seuls.
 */
export type PartCharge = {
  id: Identifiant
  chargeId: Identifiant
  foyerId: Identifiant
  montant: number
}

/**
 * La facture elle-même : le PDF du fournisseur, ou la photo du papier.
 *
 * Une facture peut avoir plusieurs pièces — un relevé tient souvent sur deux
 * pages, et on photographie parfois le recto puis le verso. D'où une table à
 * part plutôt qu'une colonne sur la charge.
 *
 * Le fichier ne vit pas ici : seul son chemin dans la réserve est gardé.
 */
export type PieceCharge = {
  id: Identifiant
  chargeId: Identifiant
  /** Le chemin du fichier dans la réserve. */
  chemin: string
  /** Le nom d'origine, pour que la personne s'y retrouve. */
  nom: string
  /** « image/jpeg », « application/pdf »… */
  type: string
  /** En octets, pour l'afficher et pour surveiller la place occupée. */
  taille: number
  ajouteeLe: string
}

/** Un remboursement entre foyers, pour solder une part de charge. */
export type Reglement = {
  id: Identifiant
  chargeId: Identifiant
  foyerId: Identifiant
  montant: number
  le: string
  note: string
}

/* ---------- la caisse commune pour les courses ---------- */

/** Ce qu'un foyer verse dans la caisse pour un mois donné. */
export type Cotisation = {
  id: Identifiant
  foyerId: Identifiant
  /** « 2026-09 ». */
  periode: string
  montant: number
  /** Vide tant que l'argent n'est pas dans la caisse. */
  verseeLe: string | null
  note: string
}

export type CategorieAchat = 'viande' | 'legumes' | 'epicerie' | 'frais' | 'boisson' | 'autre'

export const CATEGORIES_ACHAT: Array<{ id: CategorieAchat; nom: string; emoji: string }> = [
  { id: 'viande', nom: 'Viande et poisson', emoji: '🍖' },
  { id: 'legumes', nom: 'Fruits et légumes', emoji: '🥬' },
  { id: 'epicerie', nom: 'Épicerie sèche', emoji: '🍚' },
  { id: 'frais', nom: 'Frais et laitages', emoji: '🥛' },
  { id: 'boisson', nom: 'Boissons', emoji: '🧃' },
  { id: 'autre', nom: 'Autre', emoji: '🧺' },
]

/** Une course payée avec l'argent de la caisse commune. */
export type Achat = {
  id: Identifiant
  le: string
  libelle: string
  montant: number
  categorie: CategorieAchat
  /** Qui est allé faire la course. */
  parMembreId: Identifiant | null
  note: string
}

/* ---------- les dépenses de chaque famille ---------- */

export type CategorieDepense =
  | 'courses'
  | 'telephone'
  | 'sorties'
  | 'essence'
  | 'ecole'
  | 'sante'
  | 'vetements'
  | 'credit'
  | 'loyer'
  | 'electricite'
  | 'eau'
  | 'assurances'
  | 'sport'
  | 'voyages'
  | 'abonnements'
  | 'virements'
  | 'compte-euros'
  | 'roulotte'
  | 'especes'
  | 'cheques'
  | 'banque'
  | 'dons'
  | 'veto'
  | 'autre'

/* Les postes du relevé de banque, tels qu'ils sont ressortis du premier
   rapport de Maru. « essentiel » sépare ce qu'on ne choisit pas (le crédit,
   les factures, les courses) de ce qu'on choisit — c'est la seule ligne de
   partage qui ait un sens dans un budget. */
export const CATEGORIES_DEPENSE: Array<{
  id: CategorieDepense
  nom: string
  emoji: string
  essentiel: boolean
}> = [
  { id: 'courses', nom: 'Courses', emoji: '🛒', essentiel: true },
  { id: 'telephone', nom: 'Téléphone & internet', emoji: '📱', essentiel: true },
  { id: 'sorties', nom: 'Restaurants & sorties', emoji: '🍽️', essentiel: false },
  { id: 'essence', nom: 'Essence', emoji: '⛽', essentiel: true },
  { id: 'ecole', nom: 'École & église', emoji: '🎒', essentiel: true },
  { id: 'sante', nom: 'Santé', emoji: '💊', essentiel: true },
  { id: 'vetements', nom: 'Vêtements', emoji: '👕', essentiel: false },
  { id: 'credit', nom: 'Crédit', emoji: '🏦', essentiel: true },
  { id: 'loyer', nom: 'Loyer', emoji: '🏠', essentiel: true },
  { id: 'electricite', nom: 'Électricité', emoji: '⚡', essentiel: true },
  { id: 'eau', nom: 'Eau', emoji: '💧', essentiel: true },
  { id: 'assurances', nom: 'Assurances', emoji: '🛡️', essentiel: true },
  { id: 'sport', nom: 'Sport & loisirs', emoji: '🏋️', essentiel: false },
  { id: 'voyages', nom: 'Voyages', emoji: '✈️', essentiel: false },
  { id: 'abonnements', nom: 'Abonnements & numérique', emoji: '📺', essentiel: false },
  { id: 'virements', nom: 'Virements sortants', emoji: '💸', essentiel: false },
  { id: 'compte-euros', nom: 'Vers le compte en euros', emoji: '💶', essentiel: false },
  { id: 'roulotte', nom: 'Frais de la roulotte', emoji: '🚚', essentiel: false },
  { id: 'especes', nom: 'Retraits en espèces', emoji: '💵', essentiel: false },
  { id: 'cheques', nom: 'Chèques', emoji: '🧾', essentiel: false },
  { id: 'banque', nom: 'Frais bancaires', emoji: '🏧', essentiel: true },
  { id: 'dons', nom: 'Dons', emoji: '🎁', essentiel: false },
  { id: 'veto', nom: 'Vétérinaire', emoji: '🐾', essentiel: true },
  { id: 'autre', nom: 'Autre', emoji: '📦', essentiel: false },
]

/**
 * Une dépense propre à une famille — celle-là, l'autre famille ne la voit
 * pas. Ce n'est pas l'écran qui la cache : c'est la base, qui ne rend à
 * chaque compte que les lignes de son foyer. Sans ça, ce serait une porte
 * peinte sur un mur.
 */
export type DepensePerso = {
  id: Identifiant
  foyerId: Identifiant
  le: string
  libelle: string
  montant: number
  categorie: CategorieDepense
  parMembreId: Identifiant | null
  note: string
  /** Une rentrée d'argent plutôt qu'une sortie : le relevé de banque a les
      deux, et le rapport a besoin des deux. */
  sens: 'depense' | 'revenu'
  /** L'empreinte de la ligne de banque dont elle vient — pour ne jamais
      importer deux fois le même relevé. Vide pour une saisie à la main. */
  reference: string
}

/**
 * Une ligne de la fiche budget d'une famille, pour un mois. Même serrure que
 * les dépenses : la base ne la rend qu'au compte de son foyer.
 *
 *  - revenu  : « Salaire Will » — montant
 *  - fixe    : une dépense fixe, « Loyer », « Assurance » — montant
 *  - prevu   : le budget d'une catégorie de dépense variable — cle = la
 *              catégorie, montant = le prévu ; le dépensé vient tout seul de
 *              « nos dépenses »
 *  - epargne : un objectif — montant = visé, realise = mis de côté
 *  - note    : un texte — cle = 'objectif' | 'fiere' | 'ameliorer' | 'notes',
 *              libelle = le texte
 */
export type GenreBudget = 'revenu' | 'fixe' | 'prevu' | 'epargne' | 'note'

export type LigneBudget = {
  id: Identifiant
  foyerId: Identifiant
  periode: string
  genre: GenreBudget
  /** Ce qui distingue la ligne dans son genre : la catégorie, ou le nom de la note. */
  cle: string
  libelle: string
  montant: number
  realise: number
}

/**
 * Un compte en banque de la famille — courant, crédit, livret, compte pro.
 * Privé comme les dépenses. Le solde se met à jour à la main, ou tout seul
 * quand on importe le relevé de ce compte-là.
 */
export type GenreCompte = 'courant' | 'credit' | 'epargne' | 'entreprise'

export const GENRES_COMPTE: Array<{ id: GenreCompte; nom: string; emoji: string }> = [
  { id: 'courant', nom: 'Compte courant', emoji: '🏦' },
  { id: 'credit', nom: 'Crédit', emoji: '📉' },
  { id: 'epargne', nom: 'Épargne', emoji: '🐷' },
  { id: 'entreprise', nom: 'Compte pro', emoji: '🚚' },
]

export type ComptePerso = {
  id: Identifiant
  foyerId: Identifiant
  genre: GenreCompte
  /** Le numéro chez la banque — c'est lui que l'import reconnaît. */
  numero: string
  nom: string
  titulaire: string
  /** Le solde pour un compte ; pour un crédit, ce qu'il reste à rembourser
      si on le connaît, sinon 0. */
  solde: number
  /** Pour un crédit : la part déjà remboursée, en pour cent. */
  rembourse: number
  /** Pour un crédit : la prochaine échéance. */
  echeance: string | null
  majLe: string
}

/* ---------- l'ardoise de la roulotte ---------- */

/**
 * Ce qu'un foyer a pris à manger à la roulotte. Ce n'est pas un cadeau : le
 * total du mois est remboursé à la roulotte, sinon la caisse de l'entreprise
 * ne tombe jamais juste.
 */
export type LigneArdoise = {
  id: Identifiant
  le: string
  foyerId: Identifiant
  /** Qui est venu chercher. Facultatif. */
  parMembreId: Identifiant | null
  libelle: string
  montant: number
  /** Le jour où le mois a été remboursé. Vide = encore dû. */
  rembourseeLe: string | null
}

/* ---------- les réglages ---------- */

export type Reglages = {
  /** Ce que chaque foyer doit verser dans la caisse chaque mois. */
  cotisationMensuelle: Record<Identifiant, number>
  /**
   * Le partage propre à une charge, quand il n'est pas celui de la maison.
   *
   * L'électricité ne se partage pas comme les impôts : ce sont les frigos et
   * les congélateurs de la roulotte qui tournent jour et nuit. Une nature
   * absente d'ici suit le partage habituel ; une nature présente l'ignore
   * complètement — un participant qui n'y figure pas ne paie rien pour
   * celle-là.
   */
  partsParNature: Partial<Record<NatureCharge, Record<Identifiant, number>>>
  /** La tournée de la maison et les semaines de ramassage de la commune. */
  dechets: ReglagesDechets
}

/* Deux tiers pour la roulotte, le tiers restant partagé en deux. Ce sont des
   fractions et non des pourcentages : 66,67 % trois fois ne font pas un
   tiers chacun, et sur une facture de 92 046 F l'écart se voit. */
export const PARTS_PAR_NATURE_DE_DEPART: Reglages['partsParNature'] = {
  electricite: { roulotte: 2 / 3, 'lai-ah-che': 1 / 6, lenoir: 1 / 6 },
}

export const REGLAGES_PAR_DEFAUT: Reglages = {
  cotisationMensuelle: {},
  partsParNature: PARTS_PAR_NATURE_DE_DEPART,
  dechets: DECHETS_PAR_DEFAUT,
}

/** Tout ce que l'app garde. Une seule maison, donc un seul objet. */
export type Maison = {
  foyers: Foyer[]
  membres: Membre[]
  charges: Charge[]
  partsCharge: PartCharge[]
  piecesCharge: PieceCharge[]
  reglements: Reglement[]
  cotisations: Cotisation[]
  achats: Achat[]
  ardoise: LigneArdoise[]
  depensesPerso: DepensePerso[]
  budgetPerso: LigneBudget[]
  comptesPerso: ComptePerso[]
  reglages: Reglages
}

export const MAISON_VIDE: Maison = {
  foyers: [],
  membres: [],
  charges: [],
  partsCharge: [],
  piecesCharge: [],
  reglements: [],
  cotisations: [],
  achats: [],
  ardoise: [],
  depensesPerso: [],
  budgetPerso: [],
  comptesPerso: [],
  reglages: REGLAGES_PAR_DEFAUT,
}

/** Les deux foyers de départ, pour que l'app ne s'ouvre pas sur du vide. */
export const FOYERS_DE_DEPART: Foyer[] = [
  { id: 'lai-ah-che', nom: 'LAI AH CHE', couleur: 'var(--lagon)', part: 0.25, ordre: 1, estUneEntreprise: false },
  { id: 'lenoir', nom: 'LENOIR', couleur: 'var(--corail)', part: 0.25, ordre: 2, estUneEntreprise: false },
  { id: 'roulotte', nom: 'LA ROULOTTE', couleur: 'var(--ocre)', part: 0.5, ordre: 3, estUneEntreprise: true },
]

/* ---------- quelques lectures, à côté des listes qu'elles interrogent ---------- */

export const natureDe = (id: string) => NATURES.find((n) => n.id === id) ?? NATURES[5]

export const categorieDepenseDe = (id: string) =>
  CATEGORIES_DEPENSE.find((c) => c.id === id) ?? CATEGORIES_DEPENSE[CATEGORIES_DEPENSE.length - 1]

export const categorieDe = (id: string) =>
  CATEGORIES_ACHAT.find((c) => c.id === id) ?? CATEGORIES_ACHAT[5]

/**
 * Les deux familles, sans la roulotte.
 *
 * À utiliser partout où il est question de vivre ici : la caisse des courses,
 * l'ardoise de la roulotte, les personnes. Les charges, elles, se partagent
 * entre TOUS les participants, roulotte comprise.
 */
export const foyersFamille = (maison: Maison): Foyer[] =>
  maison.foyers.filter((f) => !f.estUneEntreprise)

export const foyerDe = (maison: Maison, id: Identifiant | null): Foyer | undefined =>
  maison.foyers.find((f) => f.id === id)

export const membreDe = (maison: Maison, id: Identifiant | null): Membre | undefined =>
  maison.membres.find((m) => m.id === id)
