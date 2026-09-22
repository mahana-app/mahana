/* Lire le relevé de la banque et ranger chaque ligne dans son poste.

   Le fichier qu'on télécharge chez la Banque de Polynésie : une ligne par
   mouvement, « Date comptable ; Libellé ; Débit ; Crédit ; Solde », en
   latin-1 avec des virgules pour les décimales. Sept cents lignes qu'on ne
   va pas ranger une à une : on reconnaît l'enseigne dans le libellé, et on
   range. Une enseigne mal rangée se corrige ensuite d'un mot — mais la
   plupart tombent juste du premier coup.

   Ces règles sont sorties du premier relevé de Maru. Quand une nouvelle
   enseigne apparaît, elle va dans « Autre » : c'est là qu'il faut regarder
   pour enrichir la liste. */

import type { CategorieDepense } from './types'

export type LigneBanque = {
  /** « 2026-09-21 » */
  le: string
  /** Le libellé nettoyé, « Carrefour Arue » plutôt que le charabia bancaire. */
  libelle: string
  /** Le libellé brut, gardé en note pour pouvoir vérifier. */
  brut: string
  montant: number
  sens: 'depense' | 'revenu'
  categorie: CategorieDepense
  /** L'empreinte de la ligne : date + libellé + montant. */
  reference: string
  /** Le solde du compte après ce mouvement, si le relevé le donne. */
  solde: number | null
}

/** « Mouvement_compte_23858500051.csv » → « 23858500051 ». */
export function numeroDansNomDeFichier(nom: string): string | null {
  const m = nom.match(/(\d{8,})/)
  return m ? m[1] : null
}

/* ---------- ranger ---------- */

/* Du plus précis au plus général : la première règle qui reconnaît gagne. */
const REGLES: Array<[CategorieDepense, RegExp]> = [
  ['credit', /ECH PRET/],
  ['loyer', /SCI KIAORANA/],
  ['electricite', /ELECTRICITE DE TAHITI|FACT EDT/],
  ['eau', /SPEA/],
  ['assurances', /GAN OUTRE|GENERALI|pacific sud assurance/i],
  ['telephone', /ONATI|PACIFIC MOBILE|VINI VINI/],
  ['ecole', /COLLEGE DE|EGLISE|REGIE MUNICIPAL/],
  ['dons', /GREENPEACE/],
  ['banque', /COMMISSION|COTIS\/AN|CION |FRS TRANSF|COM REVUE|FARE RATA/],
  ['compte-euros', /FAV Wilfrid LAI|VIR SWF|WILFRID LAI AH/],
  ['roulotte', /AGENDRIX|LINKTREE|TRELLO|AMBIANCE DESIGN|VT FRET|avocat\.fr|DISFRUITS/],
  ['virements', /VIRT FAV|VIRT EUR/],
  ['especes', /RET DAB/],
  ['cheques', /CHQ N/],
  ['courses', /VENUSTAR|VENUS STAR|CARREFOUR|HYPER U|SUPER U|U EXP|CHAMPION|EASY MARKET|SUPER MAHINA|GLD MAXI|WING KHONG|WING CHONG|TAHITI FOOD MAR|CHARCUTERIE|FOURNIL|TKT PANDA|MAGASIN LEAA|LS PROXI|LIBRE SCE|FOU ?SAM|TOA FAAA|TAHITI MENAGER|TAH\.MENA|POLYNESIAN TRAD|CHEZ MEI|TITAURA|TPC6|FARE TONY|MAG FOU/],
  ['sorties', /MC ?DO|FISH N|GRILL|MAJESTIC|COUET|TAMANU|FOOD FACTORY|FOODIES|PAPI RENE|LE PASSIONNE|O TA AONE|VAIMOANA|TEATALK|TEAPRESS|TOP NEWS|ANOI R|BOWLING/],
  ['sport', /FITNESS PARK|DECATHLON|OLYMPIANS/],
  ['voyages', /AIR TAHITI/],
  ['abonnements', /Google|GOOGLE|Netflix|NETFLIX|AMAZON|MICROSOFT|APPLE|FORTNITE|ABONNEMENT WEB|Novelove|LANDMARK/],
  ['sante', /TPA |PHARMACIE|CHIROPR|POLYCLINIQUE|DR BARATOUX|POLYNESIA DRUGS/],
  ['veto', /VETO/],
  ['vetements', /GEMO|TAHITI CLOTH|REVES DE LUCIE|FENUA SHOPPING|ODYSSEY/],
  ['essence', /SHELL|MOBIL|TOTAL TAAONE|STATION SERVICE/],
]

export function rangerLigne(brut: string): CategorieDepense {
  for (const [categorie, motif] of REGLES) if (motif.test(brut)) return categorie
  return 'autre'
}

/** « FACT CARREFOUR ARUE DU 14/09 CBI XXX5394 » → « Carrefour Arue ». */
export function enseigneDe(brut: string): string {
  let texte = brut
    .replace(/VIRT? (EUR\s+[\d,.]+ )?FAV /, '')
    .replace(/VIR SWF [\d,.]+ EUR D\d+ F\/ ?/, '')
    .replace(/DU \d\d\/\d\d|CBI? ?XXX\d+|CB ?XXX\d+/g, ' ')
    .replace(/\b\d[\d,.]*\b/g, ' ')
    .replace(/\b(EUR|USD|FACT|PREL|C\/C|O\/|VIR RECU|VIRT RECU)\b/g, ' ')
    .replace(/[*:]/g, ' ')
  texte = texte.split(/\s+/).filter(Boolean).slice(0, 4).join(' ')
  // En minuscules avec une majuscule par mot : moins de charabia à l'écran.
  return texte
    .toLowerCase()
    .replace(/(^|[\s/'-])([a-zà-ÿ])/g, (_, avant: string, l: string) => avant + l.toUpperCase())
}

/* ---------- lire le fichier ---------- */

function decouper(ligne: string): string[] {
  return ligne.split(';').map((c) => c.trim())
}

function lireDate(brut: string): string | null {
  const m = brut.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

function lireMontantBanque(brut: string): number {
  if (!brut.trim()) return 0
  return Math.round(Math.abs(Number(brut.replace(/\s/g, '').replace(',', '.'))))
}

/** Une empreinte courte et stable, pour reconnaître la ligne au prochain import. */
function empreinte(texte: string): string {
  let h = 0
  for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) >>> 0
  return h.toString(36)
}

/**
 * Le relevé, ligne par ligne. Rend aussi ce qui empêche de le lire.
 *
 * Le fichier est en latin-1 : on le décode comme tel, et si on y trouve le
 * marqueur d'un fichier UTF-8, on recommence en UTF-8. Le lire à l'envers
 * donnerait des « Ã© » partout dans les libellés.
 */
export function lireReleveBanque(octets: ArrayBuffer): { lignes: LigneBanque[]; souci: string } {
  let texte = new TextDecoder('iso-8859-1').decode(octets)
  if (texte.startsWith('ï»¿')) texte = new TextDecoder('utf-8').decode(octets)

  const brutes = texte.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (brutes.length < 2) return { lignes: [], souci: 'Ce fichier ne contient aucun mouvement.' }
  const entete = decouper(brutes[0]).map((c) => c.toLowerCase())
  const iDate = entete.findIndex((c) => c.includes('date'))
  const iLib = entete.findIndex((c) => c.includes('libell'))
  const iDebit = entete.findIndex((c) => c.includes('bit'))
  const iCredit = entete.findIndex((c) => c.includes('dit') && !c.includes('bit'))
  const iSolde = entete.findIndex((c) => c.includes('solde'))
  if (iDate < 0 || iLib < 0 || iDebit < 0) {
    return {
      lignes: [],
      souci:
        "Ce fichier n'a pas les colonnes « Date », « Libellé » et « Débit » : ce n'est pas le relevé " +
        'de mouvements de la banque.',
    }
  }

  const lignes: LigneBanque[] = []
  // Deux virements identiques le même jour sont deux lignes, pas une : le
  // solde après mouvement les distingue, et sinon leur rang.
  const vues = new Map<string, number>()
  for (const brute of brutes.slice(1)) {
    const cases = decouper(brute)
    const le = lireDate(cases[iDate] ?? '')
    if (!le) continue
    const brut = (cases[iLib] ?? '').replace(/\s+/g, ' ').trim()
    const debit = lireMontantBanque(cases[iDebit] ?? '')
    const credit = iCredit >= 0 ? lireMontantBanque(cases[iCredit] ?? '') : 0
    if (debit === 0 && credit === 0) continue
    const sens = debit > 0 ? 'depense' : 'revenu'
    const soldeBrut = (cases[iSolde] ?? '').trim()
    const base = `${le}|${brut}|${debit}|${credit}|${soldeBrut}`
    const rang = (vues.get(base) ?? 0) + 1
    vues.set(base, rang)
    lignes.push({
      le,
      libelle: enseigneDe(brut),
      brut,
      montant: debit || credit,
      sens,
      categorie: sens === 'revenu' ? 'autre' : rangerLigne(brut),
      reference: `banque:${empreinte(base)}${rang > 1 ? `-${rang}` : ''}`,
      solde:
        iSolde >= 0 && (cases[iSolde] ?? '').trim()
          ? Math.round(Number((cases[iSolde] ?? '').replace(/\s/g, '').replace(',', '.')))
          : null,
    })
  }
  if (lignes.length === 0) return { lignes: [], souci: 'Aucun mouvement lisible dans ce fichier.' }
  return { lignes, souci: '' }
}
