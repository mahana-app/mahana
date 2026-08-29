/* Fabrique les icônes de l'app (PNG) sans aucune dépendance : on dessine
   les pixels à la main puis on les emballe au format PNG.
   À relancer seulement si le logo change :  npm run icones            */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const dossierPublic = join(ici, '..', 'public')

/* ---- emballage PNG ---- */

const tableCrc = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (const octet of buffer) c = tableCrc[(c ^ octet) & 0xff] ^ (c >>> 8)
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

function encoderPng(largeur, hauteur, pixels /* RGBA */) {
  const lignes = Buffer.alloc((largeur * 4 + 1) * hauteur)
  for (let y = 0; y < hauteur; y++) {
    lignes[y * (largeur * 4 + 1)] = 0 // filtre « aucun »
    pixels.copy(lignes, y * (largeur * 4 + 1) + 1, y * largeur * 4, (y + 1) * largeur * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(largeur, 0)
  ihdr.writeUInt32BE(hauteur, 4)
  ihdr[8] = 8 // 8 bits par canal
  ihdr[9] = 6 // RVB + transparence
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau('IHDR', ihdr),
    morceau('IDAT', deflateSync(lignes, { level: 9 })),
    morceau('IEND', Buffer.alloc(0)),
  ])
}

/* ---- dessin ---- */

const MENTHE = [23, 195, 162]
const BLEU = [74, 125, 255]
const BLANC = [255, 255, 255]

const borne = (v, min, max) => (v < min ? min : v > max ? max : v)
const melange = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

/** Couverture douce d'un bord : 1 dedans, 0 dehors, dégradé sur ~1 pixel. */
const bordDoux = (distance) => borne(0.5 - distance, 0, 1)

/** Distance signée à un carré aux coins arrondis (négatif = dedans). */
function distanceCarreArrondi(x, y, demi, rayon) {
  const dx = Math.abs(x) - (demi - rayon)
  const dy = Math.abs(y) - (demi - rayon)
  const dehors = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  return dehors + Math.min(Math.max(dx, dy), 0) - rayon
}

/**
 * Le logo : un anneau blanc ouvert (le jeûne en cours) sur un fond dégradé,
 * avec la pastille du départ. `arrondi` = 0 pour une icône pleine page
 * (Android la découpe lui-même), sinon la part du carré qui est arrondie.
 */
function dessiner(taille, { arrondi = 0.22, echelle = 1 } = {}) {
  const pixels = Buffer.alloc(taille * taille * 4)
  const centre = taille / 2
  const rayonAnneau = taille * 0.3 * echelle
  const epaisseur = taille * 0.115 * echelle
  const depart = -Math.PI / 2
  const fin = depart + Math.PI * 1.62 // anneau ouvert : le jeûne n'est pas fini
  const bout = (angle) => [centre + Math.cos(angle) * rayonAnneau, centre + Math.sin(angle) * rayonAnneau]
  const [xa, ya] = bout(depart)
  const [xb, yb] = bout(fin)
  const pastille = taille * 0.075 * echelle

  for (let y = 0; y < taille; y++) {
    for (let x = 0; x < taille; x++) {
      const px = x + 0.5
      const py = y + 0.5

      // fond : dégradé en diagonale, dans un carré arrondi
      const dFond = arrondi
        ? distanceCarreArrondi(px - centre, py - centre, centre, taille * arrondi)
        : -1
      const alphaFond = arrondi ? bordDoux(dFond) : 1
      const t = borne((px + py) / (taille * 2), 0, 1)
      let couleur = melange(MENTHE, BLEU, t)
      let alpha = alphaFond

      // l'anneau
      const dCentre = Math.hypot(px - centre, py - centre)
      const angle = Math.atan2(py - centre, px - centre)
      let angleNormalise = angle
      while (angleNormalise < depart) angleNormalise += Math.PI * 2
      const surLArc = angleNormalise <= fin
      const dAnneau = surLArc
        ? Math.abs(dCentre - rayonAnneau) - epaisseur / 2
        : Math.min(Math.hypot(px - xa, py - ya), Math.hypot(px - xb, py - yb)) - epaisseur / 2
      const dTrait = Math.min(dAnneau, Math.hypot(px - xb, py - yb) - pastille)
      const alphaTrait = bordDoux(dTrait) * alphaFond

      if (alphaTrait > 0) {
        couleur = melange(couleur, BLANC, alphaTrait)
        alpha = Math.max(alpha, alphaTrait)
      }

      const i = (y * taille + x) * 4
      pixels[i] = Math.round(couleur[0])
      pixels[i + 1] = Math.round(couleur[1])
      pixels[i + 2] = Math.round(couleur[2])
      pixels[i + 3] = Math.round(alpha * 255)
    }
  }
  return encoderPng(taille, taille, pixels)
}

mkdirSync(dossierPublic, { recursive: true })
const aFabriquer = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  // découpée par Android : le dessin reste dans la zone sûre du centre
  ['icon-maskable-512.png', 512, { arrondi: 0, echelle: 0.78 }],
  ['apple-touch-icon.png', 180, { arrondi: 0 }],
  ['favicon.png', 48, {}],
  ['favicon-32.png', 32, {}],
]
for (const [nom, taille, options] of aFabriquer) {
  writeFileSync(join(dossierPublic, nom), dessiner(taille, options))
  console.log('écrit', nom, taille + 'px')
}
