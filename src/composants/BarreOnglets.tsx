/* La barre du bas : cinq écrans, toujours à portée de pouce. */

import {
  IconeAccueil,
  IconeDefi,
  IconeMoi,
  IconeRepas,
  IconeSport,
} from './Icones'

export type Onglet = 'accueil' | 'sport' | 'repas' | 'defis' | 'moi'

const ONGLETS: Array<{ id: Onglet; nom: string; Icone: typeof IconeAccueil }> = [
  { id: 'accueil', nom: 'Accueil', Icone: IconeAccueil },
  { id: 'sport', nom: 'Sport', Icone: IconeSport },
  { id: 'repas', nom: 'Repas', Icone: IconeRepas },
  { id: 'defis', nom: 'Défis', Icone: IconeDefi },
  { id: 'moi', nom: 'Moi', Icone: IconeMoi },
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
