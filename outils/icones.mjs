/* Fabrique les icônes de l'app, sans aucune dépendance.

   Le logo : le toit du fare, et la ligne du lagon dessous. Dessiné ici en
   pixels plutôt qu'exporté d'un outil de dessin, pour qu'il se refasse d'une
   commande le jour où la couleur change :  npm run icones
*/

import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const octet of buf) c = TABLE[(c ^ octet) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function morceau(type, donnees) {
  const entete = Buffer.alloc(4)
  entete.writeUInt32BE(donnees.length)
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), donnees])
  const somme = Buffer.alloc(4)
  somme.writeUInt32BE(crc32(corps))
  return Buffer.concat([entete, corps, somme])
}

function png(largeur, hauteur, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(largeur, 0)
  ihdr.writeUInt32BE(hauteur, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RVBA
  const lignes = []
  for (let y = 0; y < hauteur; y++) {
    lignes.push(Buffer.from([0]), pixels.subarray(y * largeur * 4, (y + 1) * largeur * 4))
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau('IHDR', ihdr),
    morceau('IDAT', deflateSync(Buffer.concat(lignes), { level: 9 })),
    morceau('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- le dessin ---------- */

const LAGON = [0x1a, 0x82, 0x7c]
const LAGON_FONCE = [0x0e, 0x53, 0x50]
const CREME = [0xfd, 0xfb, 0xf6]

const melange = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

/** Distance d'un point à un segment : sert à épaissir un trait proprement. */
function distanceSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const longueur = dx * dx + dy * dy
  const t = longueur === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / longueur))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function dessiner(cote) {
  const pixels = Buffer.alloc(cote * cote * 4)
  const u = cote / 100
  const trait = 7 * u
  // Le toit, puis les deux murs, puis la vague du lagon sous la maison.
  const traits = [
    [22, 46, 50, 22],
    [50, 22, 78, 46],
    [30, 44, 30, 68],
    [70, 44, 70, 68],
  ]

  for (let y = 0; y < cote; y++) {
    for (let x = 0; x < cote; x++) {
      const i = (y * cote + x) * 4
      // Le fond : un dégradé lagon en diagonale.
      const fond = melange(LAGON, LAGON_FONCE, (x / cote) * 0.5 + (y / cote) * 0.5)
      let couleur = fond

      const cx = x / u
      const cy = y / u
      let dessus = traits.some(
        ([ax, ay, bx, by]) => distanceSegment(cx, cy, ax, ay, bx, by) * u < trait / 2,
      )
      // La vague : deux arcs de sinus, comme le lagon devant la maison.
      if (!dessus) {
        const vague = 78 + Math.sin((cx - 20) / 7) * 3.4
        if (cx > 20 && cx < 80 && Math.abs(cy - vague) * u < trait / 2) dessus = true
      }
      if (dessus) couleur = CREME

      pixels[i] = couleur[0]
      pixels[i + 1] = couleur[1]
      pixels[i + 2] = couleur[2]
      pixels[i + 3] = 255
    }
  }
  return png(cote, cote, pixels)
}

for (const [nom, cote] of [
  ['public/favicon-32.png', 32],
  ['public/favicon.png', 48],
  ['public/apple-touch-icon.png', 180],
  ['public/icone-192.png', 192],
  ['public/icone-512.png', 512],
]) {
  writeFileSync(nom, dessiner(cote))
  console.log('écrit', nom)
}
