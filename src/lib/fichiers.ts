/* Les factures scannées ou photographiées.

   Contrairement aux photos de Mahana, celles-ci doivent être visibles par les
   deux foyers : elles vont donc dans la réserve de fichiers de Supabase, pas
   dans le téléphone. Le fichier est privé — on n'y accède qu'avec une adresse
   signée, valable une heure, et seulement en étant connecté.

   Comme pour les données, il existe une deuxième version qui garde tout dans
   le navigateur. Elle sert au mode essai, et surtout à mettre les écrans à
   l'épreuve dans un vrai navigateur sans dépendre d'un serveur. */

import { client } from './base'
import { nouvelId } from './base'

export type Fichier = {
  chemin: string
  nom: string
  type: string
  taille: number
}

/** Au-delà, ce n'est plus une facture, c'est un malentendu. */
export const TAILLE_MAXIMUM = 10 * 1024 * 1024

export const estUneImage = (type: string) => type.startsWith('image/')

/** « 1,2 Mo », « 340 ko ». */
export function poids(octets: number): string {
  if (octets >= 1024 * 1024) return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`
  return `${Math.round(octets / 1024)} ko`
}

/**
 * Réduit une photo avant de l'envoyer.
 *
 * Un téléphone d'aujourd'hui sort des images de 4 Mo, dont on n'a aucun
 * besoin pour relire un montant. À 1400 pixels, une facture reste lisible et
 * pèse dix fois moins — ce qui compte quand on l'envoie en 4G depuis Mahina,
 * et quand la réserve gratuite fait un gigaoctet.
 *
 * Les PDF ne se réduisent pas : ils passent tels quels.
 */
export async function reduireImage(fichier: File, cote = 1400): Promise<Blob> {
  if (!estUneImage(fichier.type)) return fichier
  try {
    const image = await createImageBitmap(fichier)
    const facteur = Math.min(1, cote / Math.max(image.width, image.height))
    if (facteur === 1) {
      image.close()
      return fichier
    }
    const toile = document.createElement('canvas')
    toile.width = Math.round(image.width * facteur)
    toile.height = Math.round(image.height * facteur)
    const pinceau = toile.getContext('2d')
    if (!pinceau) return fichier
    pinceau.drawImage(image, 0, 0, toile.width, toile.height)
    image.close()
    return await new Promise((resoudre) => {
      toile.toBlob((resultat) => resoudre(resultat ?? fichier), 'image/jpeg', 0.82)
    })
  } catch {
    // Certains formats de photo ne se relisent pas : on envoie l'original
    // plutôt que de refuser la facture.
    return fichier
  }
}

/* ---------- le mode essai : tout dans le navigateur ---------- */

const BASE = 'fare-fichiers'
const MAGASIN = 'fichiers'

function ouvrirBase(): Promise<IDBDatabase> {
  return new Promise((resoudre, rejeter) => {
    const demande = indexedDB.open(BASE, 1)
    demande.onupgradeneeded = () => {
      if (!demande.result.objectStoreNames.contains(MAGASIN)) {
        demande.result.createObjectStore(MAGASIN)
      }
    }
    demande.onsuccess = () => resoudre(demande.result)
    demande.onerror = () => rejeter(demande.error)
  })
}

async function poserLocal(chemin: string, contenu: Blob): Promise<void> {
  const base = await ouvrirBase()
  await new Promise<void>((resoudre, rejeter) => {
    const transaction = base.transaction(MAGASIN, 'readwrite')
    transaction.objectStore(MAGASIN).put(contenu, chemin)
    transaction.oncomplete = () => resoudre()
    transaction.onerror = () => rejeter(transaction.error)
  })
  base.close()
}

async function lireLocal(chemin: string): Promise<Blob | null> {
  try {
    const base = await ouvrirBase()
    const contenu = await new Promise<Blob | null>((resoudre, rejeter) => {
      const demande = base.transaction(MAGASIN, 'readonly').objectStore(MAGASIN).get(chemin)
      demande.onsuccess = () => resoudre((demande.result as Blob) ?? null)
      demande.onerror = () => rejeter(demande.error)
    })
    base.close()
    return contenu
  } catch {
    return null
  }
}

async function retirerLocal(chemin: string): Promise<void> {
  try {
    const base = await ouvrirBase()
    await new Promise<void>((resoudre) => {
      const transaction = base.transaction(MAGASIN, 'readwrite')
      transaction.objectStore(MAGASIN).delete(chemin)
      transaction.oncomplete = () => resoudre()
      transaction.onerror = () => resoudre()
    })
    base.close()
  } catch {
    /* rien à retirer : tant mieux */
  }
}

/* ---------- ce que les écrans appellent ---------- */

const RESERVE = 'factures'

/** Envoie le fichier et rend de quoi le retrouver. */
export async function televerser(fichier: File, chargeId: string): Promise<Fichier> {
  const contenu = await reduireImage(fichier)
  const type = contenu instanceof File ? contenu.type : (estUneImage(fichier.type) ? 'image/jpeg' : fichier.type)
  // Le nom d'origine ne sert qu'à l'affichage : deux « facture.pdf » ne
  // doivent pas se recouvrir, d'où un chemin fabriqué.
  const extension = type === 'application/pdf' ? 'pdf' : type.split('/')[1] || 'bin'
  const chemin = `${chargeId}/${nouvelId()}.${extension}`

  if (client) {
    const { error } = await client.storage
      .from(RESERVE)
      .upload(chemin, contenu, { contentType: type, upsert: false })
    if (error) throw new Error(error.message)
  } else {
    await poserLocal(chemin, contenu)
  }

  return { chemin, nom: fichier.name, type, taille: contenu.size }
}

/** L'adresse pour ouvrir ou afficher le fichier. Valable une heure. */
export async function adresseDe(chemin: string): Promise<string | null> {
  if (client) {
    const { data, error } = await client.storage.from(RESERVE).createSignedUrl(chemin, 3600)
    if (error) return null
    return data.signedUrl
  }
  const contenu = await lireLocal(chemin)
  return contenu ? URL.createObjectURL(contenu) : null
}

export async function retirerFichier(chemin: string): Promise<void> {
  if (client) {
    await client.storage.from(RESERVE).remove([chemin])
  } else {
    await retirerLocal(chemin)
  }
}
