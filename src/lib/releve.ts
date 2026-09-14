/* Lire le relevé de factures qu'on télécharge chez le fournisseur.

   EDT met à disposition, dans l'espace client, un fichier CSV qui contient
   toutes les factures de l'année avec leur date et leur montant. Le saisir à
   la main, c'est douze fois la même manipulation et une faute de frappe
   quelque part. Ce fichier-là le lit et en fait des factures.

   On ne suppose rien de la mise en forme exacte : le séparateur, l'ordre des
   colonnes et l'écriture des dates changent d'un fournisseur à l'autre, et
   parfois d'une année à l'autre chez le même. On cherche donc les colonnes
   par leur intitulé, pas par leur position. */

export type LigneRelevee = {
  /** Le numéro de facture chez le fournisseur. */
  reference: string
  /** Le jour de la facture, « 2026-09-07 ». */
  date: string
  /** Le mois concerné, « 2026-09 » — c'est lui qui classe la facture. */
  periode: string
  montant: number
}

export type Releve = {
  lignes: LigneRelevee[]
  /** Ce qui empêche de lire le fichier, en clair. Vide si tout va bien. */
  souci: string
}

/* ---------- découper le fichier ---------- */

/** Le séparateur le plus probable, deviné sur la ligne d'en-têtes. */
function separateurDe(entete: string): string {
  const candidats = [',', ';', '\t']
  return candidats.reduce((meilleur, c) =>
    entete.split(c).length > entete.split(meilleur).length ? c : meilleur,
  )
}

/** Découpe une ligne en respectant les guillemets (« Nom, Prénom »). */
function decouper(ligne: string, separateur: string): string[] {
  const cases: string[] = []
  let courant = ''
  let entreGuillemets = false
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i]
    if (c === '"') {
      if (entreGuillemets && ligne[i + 1] === '"') {
        courant += '"'
        i++
      } else {
        entreGuillemets = !entreGuillemets
      }
    } else if (c === separateur && !entreGuillemets) {
      cases.push(courant.trim())
      courant = ''
    } else {
      courant += c
    }
  }
  cases.push(courant.trim())
  return cases
}

/** Sans accents, sans ponctuation, en minuscules : pour comparer des titres. */
const simplifier = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/* ---------- reconnaître les valeurs ---------- */

/**
 * Une date, dans les deux écritures qu'on rencontre : « 2026-09-07 » et
 * « 07/09/2026 ». Rend une date au format de la base, ou rien.
 */
export function lireDate(brut: string): string | null {
  const texte = brut.trim()
  const iso = texte.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`
  const chezNous = texte.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (chezNous) return `${chezNous[3]}-${chezNous[2].padStart(2, '0')}-${chezNous[1].padStart(2, '0')}`
  return null
}

/**
 * Un montant. On accepte les espaces de milliers (y compris l'espace
 * insécable que produit Excel), le franc collé au nombre, et la virgule —
 * même si le F CFP n'a pas de centimes, un fournisseur peut en écrire.
 */
export function lireMontantReleve(brut: string): number | null {
  const texte = brut
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(/(xpf|fcfp|cfp|f)$/i, '')
    .replace(/,(\d{1,2})$/, '.$1')
    .replace(/\.(?=\d{3}\b)/g, '')
  if (!/^-?\d+(\.\d+)?$/.test(texte)) return null
  return Math.round(Number(texte))
}

/* ---------- le relevé entier ---------- */

export function lireReleve(contenu: string): Releve {
  const rien = (souci: string): Releve => ({ lignes: [], souci })

  const lignes = contenu
    .replace(/^\ufeff/, '')
    .split(/\r?\n/)
    // Excel écrit parfois « sep=; » en première ligne pour s'annoncer.
    .filter((l) => l.trim() !== '' && !/^sep=/i.test(l.trim()))

  if (lignes.length < 2) return rien("Ce fichier ne contient pas de factures.")

  const separateur = separateurDe(lignes[0])
  const entetes = decouper(lignes[0], separateur).map(simplifier)

  const colonne = (...mots: string[]) =>
    entetes.findIndex((e) => mots.some((m) => e.includes(m)))

  const iDate = colonne('datedefacturation', 'datefacture', 'date')
  const iMontant = colonne('montant', 'total', 'ttc', 'somme')
  const iReference = colonne('numerodefacture', 'numfacture', 'numero', 'reference', 'facture')

  if (iDate < 0 || iMontant < 0) {
    return rien(
      "Ce fichier n'a pas de colonne « date » et « montant » reconnaissable. " +
        'Vérifiez que c’est bien le relevé téléchargé chez le fournisseur.',
    )
  }

  const retenues: LigneRelevee[] = []
  for (const brut of lignes.slice(1)) {
    const cases = decouper(brut, separateur)
    const date = lireDate(cases[iDate] ?? '')
    const montant = lireMontantReleve(cases[iMontant] ?? '')
    // Une ligne sans date lisible est un pied de page ou un total : on passe.
    if (!date || montant === null || montant === 0) continue
    retenues.push({
      reference: (iReference >= 0 ? cases[iReference] : '') ?? '',
      date,
      periode: date.slice(0, 7),
      montant,
    })
  }

  if (retenues.length === 0) return rien("Aucune facture lisible dans ce fichier.")

  // La plus récente d'abord : c'est l'ordre dans lequel on les regarde.
  retenues.sort((a, b) => b.date.localeCompare(a.date))
  return { lignes: retenues, souci: '' }
}
