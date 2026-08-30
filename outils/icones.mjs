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

const ARGILE = [192, 96, 58]
const ARGILE_FONCE = [165, 79, 46]
const CREME = [252, 249, 243]

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

/** Distance d'un point à un segment. */
function distanceSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const longueur = dx * dx + dy * dy
  const t = longueur === 0 ? 0 : borne(((px - ax) * dx + (py - ay) * dy) / longueur, 0, 1)
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Distance d'un point à une ligne brisée : c'est ainsi qu'on épaissit un tracé. */
function distanceTrace(px, py, points) {
  let mini = Infinity
  for (let i = 1; i < points.length; i++) {
    const d = distanceSegment(px, py, points[i - 1][0], points[i - 1][1], points[i][0], points[i][1])
    if (d < mini) mini = d
  }
  return mini
}

/** Une courbe de Bézier quadratique, découpée en petits segments. */
function courbe(a, controle, b, morceaux = 48) {
  const points = []
  for (let i = 0; i <= morceaux; i++) {
    const t = i / morceaux
    const u = 1 - t
    points.push([
      u * u * a[0] + 2 * u * t * controle[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * controle[1] + t * t * b[1],
    ])
  }
  return points
}

/**
 * Le logo : le soleil au-dessus de l'horizon, et la vague en dessous.
 * « Mahana », c'est le soleil et le jour ; la vague, c'est ici.
 * `arrondi` = 0 pour une icône pleine page (Android la découpe lui-même).
 */
function dessiner(taille, { arrondi = 0.22, echelle = 1 } = {}) {
  const pixels = Buffer.alloc(taille * taille * 4)
  const centre = taille / 2
  const e = echelle
  const trait = taille * 0.052 * e

  const soleil = { x: centre, y: centre - taille * 0.1 * e, r: taille * 0.135 * e }
  const horizon = courbe(
    [centre - taille * 0.31 * e, centre + taille * 0.135 * e],
    [centre, centre],
    [centre + taille * 0.31 * e, centre + taille * 0.135 * e],
  )
  // La vague : trois petites bosses, dessinées par une sinusoïde.
  const vague = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    vague.push([
      centre + (t - 0.5) * taille * 0.56 * e,
      centre + taille * 0.29 * e + Math.sin(t * Math.PI * 6) * taille * 0.032 * e,
    ])
  }

  for (let y = 0; y < taille; y++) {
    for (let x = 0; x < taille; x++) {
      const px = x + 0.5
      const py = y + 0.5

      // le fond : terre cuite, légèrement dégradé, dans un carré arrondi
      const dFond = arrondi
        ? distanceCarreArrondi(px - centre, py - centre, centre, taille * arrondi)
        : -1
      const alphaFond = arrondi ? bordDoux(dFond) : 1
      const t = borne((px + py) / (taille * 2), 0, 1)
      let couleur = melange(ARGILE, ARGILE_FONCE, t)
      let alpha = alphaFond

      // le tracé du logo, en crème
      const dSoleil = Math.abs(Math.hypot(px - soleil.x, py - soleil.y) - soleil.r)
      const d = Math.min(dSoleil, distanceTrace(px, py, horizon), distanceTrace(px, py, vague))
      const alphaTrait = bordDoux(d - trait / 2) * alphaFond

      if (alphaTrait > 0) {
        couleur = melange(couleur, CREME, alphaTrait)
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
