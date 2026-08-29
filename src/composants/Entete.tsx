/* Le haut de chaque écran : où l'on est, et le bouton des réglages. */

import { IconeReglages } from './Icones'

export default function Entete({
  kicker,
  titre,
  ouvrirReglages,
}: {
  kicker: string
  titre: string
  ouvrirReglages: () => void
}) {
  return (
    <header className="entete">
      <div>
        <div className="bonjour">{kicker}</div>
        <h1>{titre}</h1>
      </div>
      <button
        type="button"
        className="rond-entete"
        aria-label="Réglages"
        onClick={ouvrirReglages}
      >
        <IconeReglages />
      </button>
    </header>
  )
}
