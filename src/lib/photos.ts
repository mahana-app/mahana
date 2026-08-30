/* Les photos des repas.

   Elles ne tiennent pas dans le même rangement que le reste : une seule photo
   pèse plus que tout le suivi d'une année. On les met donc dans la réserve
   d'images du navigateur (IndexedDB), réduites à 900 pixels et compressées.
   Une photo fait alors ~60 ko : on peut en garder des centaines.

   Elles restent dans le téléphone, comme le reste. Aucune ne part sur
   internet — et l'export en JSON ne les contient pas, il serait énorme. */

import { useEffect, useState } from 'react'

const BASE = 'mahana-photos'
const MAGASIN = 'photos'

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

export async function enregistrerPhoto(id: string, image: Blob): Promise<void> {
  const base = await ouvrirBase()
  await new Promise<void>((resoudre, rejeter) => {
    const transaction = base.transaction(MAGASIN, 'readwrite')
    transaction.objectStore(MAGASIN).put(image, id)
    transaction.oncomplete = () => resoudre()
    transaction.onerror = () => rejeter(transaction.error)
  })
  base.close()
}

export async function lirePhoto(id: string): Promise<Blob | null> {
  try {
    const base = await ouvrirBase()
    const image = await new Promise<Blob | null>((resoudre, rejeter) => {
      const demande = base.transaction(MAGASIN, 'readonly').objectStore(MAGASIN).get(id)
      demande.onsuccess = () => resoudre((demande.result as Blob) ?? null)
      demande.onerror = () => rejeter(demande.error)
    })
    base.close()
    return image
  } catch {
    return null
  }
}

export async function supprimerPhoto(id: string): Promise<void> {
  try {
    const base = await ouvrirBase()
    await new Promise<void>((resoudre) => {
      const transaction = base.transaction(MAGASIN, 'readwrite')
      transaction.objectStore(MAGASIN).delete(id)
      transaction.oncomplete = () => resoudre()
      transaction.onerror = () => resoudre()
    })
    base.close()
  } catch {
    /* rien à supprimer : tant mieux */
  }
}

/**
 * Réduit une photo avant de la garder : un téléphone d'aujourd'hui sort des
 * images de 4 Mo, dont on n'a aucun besoin pour se souvenir d'une assiette.
 */
export async function reduireImage(fichier: File, cote = 900): Promise<Blob> {
  const image = await createImageBitmap(fichier)
  const facteur = Math.min(1, cote / Math.max(image.width, image.height))
  const largeur = Math.round(image.width * facteur)
  const hauteur = Math.round(image.height * facteur)

  const toile = document.createElement('canvas')
  toile.width = largeur
  toile.height = hauteur
  const pinceau = toile.getContext('2d')
  if (!pinceau) return fichier
  pinceau.drawImage(image, 0, 0, largeur, hauteur)
  image.close()

  return new Promise((resoudre) => {
    toile.toBlob((resultat) => resoudre(resultat ?? fichier), 'image/jpeg', 0.72)
  })
}

/** Donne l'adresse d'affichage d'une photo gardée, et la libère à la sortie. */
export function usePhoto(id: string | undefined): string | null {
  // On garde l'identifiant avec l'adresse : tant que la photo suivante n'est
  // pas lue, on ne veut surtout pas afficher celle d'avant.
  const [chargee, setChargee] = useState<{ id: string; adresse: string } | null>(null)

  useEffect(() => {
    if (!id) return
    let vivant = true
    let creee: string | null = null
    void lirePhoto(id).then((image) => {
      if (!vivant || !image) return
      creee = URL.createObjectURL(image)
      setChargee({ id, adresse: creee })
    })
    return () => {
      vivant = false
      if (creee) URL.revokeObjectURL(creee)
    }
  }, [id])

  return chargee && chargee.id === id ? chargee.adresse : null
}
