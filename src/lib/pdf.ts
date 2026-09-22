/* Retrouver le numéro de facture écrit dans un PDF.

   Pourquoi : les factures d'EDT se téléchargent une par une, en PDF, et
   chacune porte son numéro — « F202608005989 ». C'est le même numéro que
   celui du relevé de l'année. On peut donc déposer les douze PDF d'un coup et
   les accrocher chacun à SA facture, sans jamais demander laquelle est
   laquelle. Ouvrir douze fois le bon écran, c'est douze occasions de se
   tromper.

   Aucune bibliothèque : un PDF, c'est des morceaux compressés à la zlib, et
   le navigateur sait les décompresser tout seul (DecompressionStream). On ne
   cherche pas à comprendre la page — juste à lire les suites de lettres
   qu'elle contient. */

const ESPACES = new Set([0x0d, 0x0a, 0x20, 0x09])

/** « F202608005989 », « R202512101185 » : une lettre puis douze chiffres. */
const NUMERO = /\b[A-Z]\d{12}\b/g

async function decompresser(morceau: Uint8Array, format: 'deflate' | 'deflate-raw') {
  // On lit le flux morceau par morceau plutôt que par « new Response(flux) » :
  // cette voie-là échoue silencieusement ici, et on croirait le PDF illisible.
  const flux = new Blob([morceau as BlobPart]).stream().pipeThrough(new DecompressionStream(format))
  const lecteur = flux.getReader()
  const bouts: Uint8Array[] = []
  let taille = 0
  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    bouts.push(value)
    taille += value.length
  }
  const tout = new Uint8Array(taille)
  let ou = 0
  for (const bout of bouts) {
    tout.set(bout, ou)
    ou += bout.length
  }
  return tout
}

/** Les octets d'un PDF, rendus lisibles morceau par morceau. */
async function texteDuPdf(octets: Uint8Array): Promise<string> {
  // latin-1 : chaque octet devient un caractère, sans rien réinterpréter.
  const brut = new TextDecoder('latin1').decode(octets)
  const morceaux: string[] = [brut]

  const debut = /stream\r?\n/g
  let trouve: RegExpExecArray | null
  while ((trouve = debut.exec(brut)) !== null) {
    const fin = brut.indexOf('endstream', trouve.index)
    if (fin < 0) continue
    // Le saut de ligne qui précède « endstream » ne fait pas partie des
    // données. Le laisser fait échouer la décompression sur « junk found
    // after end of compressed data » — et le PDF passerait pour illisible.
    let coupe = fin
    while (coupe > trouve.index && ESPACES.has(octets[coupe - 1])) coupe--
    const morceau = octets.subarray(trouve.index + trouve[0].length, coupe)
    for (const format of ['deflate', 'deflate-raw'] as const) {
      try {
        morceaux.push(new TextDecoder('latin1').decode(await decompresser(morceau, format)))
        break
      } catch {
        // Ce morceau n'est pas compressé ainsi — ou pas du texte. On passe.
      }
    }
  }

  // Le texte d'une page est découpé en petits bouts entre parenthèses, qu'il
  // faut recoller : le numéro peut être à cheval sur deux bouts.
  const recolle = morceaux.map((m) =>
    (m.match(/\((?:[^()\\]|\\.)*\)/g) ?? []).map((s) => s.slice(1, -1)).join(''),
  )
  return [...morceaux, ...recolle].join('\n')
}

/**
 * Les numéros de facture trouvés dans un PDF, sans doublon.
 *
 * Vide si le PDF est un scan (une image, sans texte) ou si le navigateur ne
 * sait pas le décompresser : dans ce cas l'écran le dit, plutôt que de faire
 * comme s'il n'y avait rien à trouver.
 */
export async function numerosDansPdf(fichier: File): Promise<string[]> {
  try {
    const octets = new Uint8Array(await fichier.arrayBuffer())
    const texte = await texteDuPdf(octets)
    return [...new Set(texte.match(NUMERO) ?? [])]
  } catch {
    return []
  }
}
