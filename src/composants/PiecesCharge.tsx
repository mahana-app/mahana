/* Les pièces d'une facture : la photo prise au moment où elle arrive dans la
   boîte aux lettres, ou le PDF reçu par courriel.

   Pourquoi ça compte ici : une facture d'électricité se règle entre les deux
   foyers des semaines après son arrivée, et le papier, lui, s'égare. Quand
   Mana demande « c'est quoi ce montant ? », la réponse doit être dans l'app,
   pas dans un tiroir. C'est aussi ce qu'on ressort en cas de contestation
   auprès du fournisseur.

   Le fichier n'est jamais public : on demande à chaque ouverture une adresse
   signée, valable une heure. */

import { useCallback, useEffect, useRef, useState } from 'react'
import Symbole from './Symbole'
import { useMaison } from '../lib/maison'
import { TAILLE_MAXIMUM, adresseDe, estUneImage, poids, televerser } from '../lib/fichiers'
import { jourCourt } from '../lib/argent'

export default function PiecesCharge({ chargeId }: { chargeId: string }) {
  const { maison, ajouterPiece, supprimerPiece } = useMaison()
  const pieces = maison.piecesCharge.filter((p) => p.chargeId === chargeId)

  const champ = useRef<HTMLInputElement>(null)
  const [envoi, setEnvoi] = useState(false)
  const [souci, setSouci] = useState('')
  // Les aperçus des photos, une adresse signée par pièce. On ne les demande
  // qu'une fois : chaque appel coûte un aller-retour au serveur.
  const [apercus, setApercus] = useState<Record<string, string>>({})

  // Une chaîne plutôt qu'un tableau : le tableau serait neuf à chaque rendu,
  // et l'effet tournerait sans fin.
  const cheminsImages = pieces
    .filter((p) => estUneImage(p.type))
    .map((p) => p.chemin)
    .join('|')

  useEffect(() => {
    let vivant = true
    void (async () => {
      for (const chemin of cheminsImages ? cheminsImages.split('|') : []) {
        const adresse = await adresseDe(chemin)
        if (!vivant || !adresse) continue
        setApercus((avant) => ({ ...avant, [chemin]: adresse }))
      }
    })()
    return () => {
      vivant = false
    }
  }, [cheminsImages])

  const recevoir = useCallback(
    async (fichiers: FileList | null) => {
      if (!fichiers || fichiers.length === 0) return
      setSouci('')
      setEnvoi(true)
      try {
        for (const fichier of Array.from(fichiers)) {
          if (fichier.size > TAILLE_MAXIMUM) {
            setSouci(`« ${fichier.name} » est trop lourd (${poids(fichier.size)}). 10 Mo au maximum.`)
            continue
          }
          const depose = await televerser(fichier, chargeId)
          await ajouterPiece(chargeId, depose)
        }
      } catch (erreur) {
        setSouci(erreur instanceof Error ? erreur.message : "L'envoi n'a pas abouti.")
      } finally {
        setEnvoi(false)
        if (champ.current) champ.current.value = ''
      }
    },
    [chargeId, ajouterPiece],
  )

  const ouvrir = useCallback(async (chemin: string) => {
    const adresse = await adresseDe(chemin)
    if (adresse) window.open(adresse, '_blank', 'noopener')
  }, [])

  return (
    <div className="carte">
      <div className="kicker">La facture en image</div>

      {pieces.length === 0 && !envoi && (
        <p className="doux mini" style={{ margin: '6px 0 10px' }}>
          Photographiez la facture ou ajoutez le PDF : le papier se perd, pas ceci.
        </p>
      )}

      {pieces.map((piece) => (
        <div key={piece.id} className="ligne-liste" style={{ gap: 10 }}>
          <button
            type="button"
            onClick={() => void ouvrir(piece.chemin)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              minWidth: 0,
              background: 'none',
              border: 0,
              padding: 0,
              textAlign: 'left',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 46,
                height: 46,
                flex: '0 0 auto',
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--lagon-pale)',
                color: 'var(--lagon)',
              }}
            >
              {apercus[piece.chemin] ? (
                <img
                  src={apercus[piece.chemin]}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Symbole nom="papier" taille={22} />
              )}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: 15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {piece.nom || (estUneImage(piece.type) ? 'Photo' : 'Document')}
              </span>
              <span className="doux mini" style={{ display: 'block' }}>
                {estUneImage(piece.type) ? 'Photo' : 'PDF'} · {poids(piece.taille)} ·{' '}
                {jourCourt(piece.ajouteeLe)}
              </span>
            </span>
          </button>
          <button
            type="button"
            className="bouton-fin"
            style={{ flex: '0 0 auto', padding: '8px 10px' }}
            aria-label={`Retirer ${piece.nom}`}
            onClick={() => {
              if (!confirm('Retirer cette pièce ?')) return
              void supprimerPiece(piece.id)
            }}
          >
            <Symbole nom="croix" taille={16} couleur="var(--corail-fonce)" />
          </button>
        </div>
      ))}

      {souci && (
        <p className="doux mini" style={{ color: 'var(--corail-fonce)', margin: '10px 0 0' }}>
          {souci}
        </p>
      )}

      {/* Le champ est caché derrière le bouton : « accept » ouvre directement
          l'appareil photo ou les documents du téléphone selon ce qu'on choisit. */}
      <input
        ref={champ}
        type="file"
        accept="image/*,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => void recevoir(e.target.files)}
      />
      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', marginTop: 10 }}
        disabled={envoi}
        onClick={() => champ.current?.click()}
      >
        {envoi ? 'Envoi…' : pieces.length === 0 ? 'Ajouter la facture' : 'Ajouter une autre pièce'}
      </button>
    </div>
  )
}
