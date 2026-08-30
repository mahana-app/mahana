/* La barre du bas : quatre écrans, et le gros bouton + au milieu pour tout
   noter sans avoir à chercher où. */

import { IconeAccueil, IconeChrono, IconePlus, IconeProgres, IconeRepas } from './Icones'

export type Onglet = 'accueil' | 'repas' | 'jeune' | 'progres'

const GAUCHE: Array<{ id: Onglet; nom: string; Icone: typeof IconeAccueil }> = [
  { id: 'accueil', nom: 'Accueil', Icone: IconeAccueil },
  { id: 'repas', nom: 'Repas', Icone: IconeRepas },
]

const DROITE: Array<{ id: Onglet; nom: string; Icone: typeof IconeAccueil }> = [
  { id: 'jeune', nom: 'Jeûne', Icone: IconeChrono },
  { id: 'progres', nom: 'Progrès', Icone: IconeProgres },
]

export default function BarreOnglets({
  actif,
  changer,
  ouvrirAjout,
}: {
  actif: string
  changer: (onglet: Onglet) => void
  ouvrirAjout: () => void
}) {
  const bouton = ({ id, nom, Icone }: { id: Onglet; nom: string; Icone: typeof IconeAccueil }) => (
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
  )

  return (
    <nav className="onglets">
      {GAUCHE.map(bouton)}
      <button type="button" className="bouton-plus" aria-label="Ajouter" onClick={ouvrirAjout}>
        <IconePlus taille={26} />
      </button>
      {DROITE.map(bouton)}
    </nav>
  )
}
