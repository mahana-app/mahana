/* La barre du bas : quatre écrans, toujours à portée de pouce. */

import { IconeCorps, IconeEau, IconeJeune, IconeJournal } from './Icones'

export type Onglet = 'jeune' | 'eau' | 'corps' | 'journal'

const ONGLETS: Array<{ id: Onglet; nom: string; Icone: typeof IconeJeune }> = [
  { id: 'jeune', nom: 'Jeûne', Icone: IconeJeune },
  { id: 'eau', nom: 'Eau', Icone: IconeEau },
  { id: 'corps', nom: 'Corps', Icone: IconeCorps },
  { id: 'journal', nom: 'Journal', Icone: IconeJournal },
]

export default function BarreOnglets({
  actif,
  changer,
}: {
  actif: string
  changer: (onglet: Onglet) => void
}) {
  return (
    <nav className="onglets">
      {ONGLETS.map(({ id, nom, Icone }) => (
        <button
          key={id}
          type="button"
          className={`onglet${actif === id ? ' actif' : ''}`}
          aria-current={actif === id ? 'page' : undefined}
          onClick={() => changer(id)}
        >
          <Icone />
          {nom}
        </button>
      ))}
    </nav>
  )
}
