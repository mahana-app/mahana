/* L'en-tête d'un écran : un mot de contexte, un titre, et le bouton retour
   ou celui des réglages. Toujours au même endroit d'un écran à l'autre. */

import Symbole from './Symbole'

export default function Entete({
  kicker,
  titre,
  retour,
  ouvrirReglages,
}: {
  kicker: string
  titre: string
  retour?: () => void
  ouvrirReglages?: () => void
}) {
  return (
    <div className="entete">
      {retour && (
        <button type="button" className="rond-entete" aria-label="Retour" onClick={retour}>
          <span style={{ transform: 'rotate(180deg)' }}>
            <Symbole nom="fleche" taille={18} />
          </span>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="kicker">{kicker}</div>
        <h1>{titre}</h1>
      </div>
      {ouvrirReglages && (
        <button
          type="button"
          className="rond-entete"
          aria-label="Réglages"
          onClick={ouvrirReglages}
        >
          <Symbole nom="reglages" taille={19} />
        </button>
      )}
    </div>
  )
}
