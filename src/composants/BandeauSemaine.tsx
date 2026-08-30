/* Le bandeau des sept jours de la semaine en cours : on touche un jour pour
   voir ce qu'il contenait. Un point sous les journées déjà remplies. */

import { ajouterJours, clefJour, deClefJour, initialeJour } from '../lib/dates'

export default function BandeauSemaine({
  jour,
  choisir,
  rempli,
}: {
  jour: string
  choisir: (jour: string) => void
  /** Dit si une journée contient déjà quelque chose. */
  rempli: (jour: string) => boolean
}) {
  const aujourdhui = clefJour()
  // La semaine du jour affiché, de lundi à dimanche.
  const date = deClefJour(jour)
  const decalage = (date.getDay() + 6) % 7
  const lundi = ajouterJours(date, -decalage)
  const jours = Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i))

  return (
    <div className="semaine">
      {jours.map((date) => {
        const clef = clefJour(date)
        const futur = clef > aujourdhui
        return (
          <button
            key={clef}
            type="button"
            disabled={futur}
            className={`${clef === jour ? 'actif' : ''} ${futur ? 'futur' : ''}`.trim()}
            onClick={() => choisir(clef)}
          >
            {initialeJour(date)}
            <span className="numero chiffre">{date.getDate()}</span>
            <span className="point" style={{ opacity: rempli(clef) ? 1 : 0 }} />
          </button>
        )
      })}
    </div>
  )
}
