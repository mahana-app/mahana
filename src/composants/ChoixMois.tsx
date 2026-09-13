/* Le sélecteur de mois : une flèche, le mois en toutes lettres, une flèche.
   Rien d'autre — un calendrier complet pour choisir un mois est une punition
   sur un téléphone. */

import { moisDe, moisDecale, moisEnMots } from '../lib/argent'
import Symbole from './Symbole'

export default function ChoixMois({
  periode,
  changer,
}: {
  periode: string
  changer: (periode: string) => void
}) {
  const courant = moisDe()
  return (
    <div className="carte serree">
      <div className="rangee">
        <button
          type="button"
          className="rond-entete"
          aria-label="Mois précédent"
          onClick={() => changer(moisDecale(periode, -1))}
        >
          <span style={{ transform: 'rotate(180deg)' }}>
            <Symbole nom="fleche" taille={16} />
          </span>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 17, textTransform: 'capitalize' }}>
            {moisEnMots(periode)}
          </div>
          {periode !== courant && (
            <button
              type="button"
              className="doux mini"
              style={{ border: 0, background: 'none', padding: 0, textDecoration: 'underline' }}
              onClick={() => changer(courant)}
            >
              revenir à ce mois-ci
            </button>
          )}
        </div>
        <button
          type="button"
          className="rond-entete"
          aria-label="Mois suivant"
          onClick={() => changer(moisDecale(periode, 1))}
        >
          <Symbole nom="fleche" taille={16} />
        </button>
      </div>
    </div>
  )
}
