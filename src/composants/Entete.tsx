/* Le haut de chaque écran. Avec, selon les cas, un bouton retour à gauche
   et le bouton des réglages à droite. */

import { IconeReglages, IconeRetour } from './Icones'

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
    <header className="entete">
      {retour && (
        <button type="button" className="rond-entete" aria-label="Retour" onClick={retour}>
          <IconeRetour />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bonjour">{kicker}</div>
        <h1>{titre}</h1>
      </div>
      {ouvrirReglages && (
        <button
          type="button"
          className="rond-entete"
          aria-label="Réglages"
          onClick={ouvrirReglages}
        >
          <IconeReglages />
        </button>
      )}
    </header>
  )
}
