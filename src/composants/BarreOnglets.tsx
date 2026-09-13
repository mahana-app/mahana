/* Les quatre onglets du bas, et le + au milieu. Tout se fait à une main,
   pouce en bas de l'écran : c'est là qu'on tient son téléphone. */

import Symbole from './Symbole'
import type { NomSymbole } from './Symbole'

export type Onglet = 'accueil' | 'charges' | 'caisse' | 'ardoise'

const ONGLETS: Array<{ id: Onglet; nom: string; icone: NomSymbole }> = [
  { id: 'accueil', nom: 'Maison', icone: 'maison' },
  { id: 'charges', nom: 'Charges', icone: 'eclair' },
  { id: 'caisse', nom: 'Caisse', icone: 'panier' },
  { id: 'ardoise', nom: 'Roulotte', icone: 'roulotte' },
]

export default function BarreOnglets({
  actif,
  changer,
  ouvrirAjout,
}: {
  actif: Onglet
  changer: (onglet: Onglet) => void
  ouvrirAjout: () => void
}) {
  const gauche = ONGLETS.slice(0, 2)
  const droite = ONGLETS.slice(2)

  return (
    <nav className="onglets">
      {gauche.map((o) => (
        <Bouton key={o.id} onglet={o} actif={actif} changer={changer} />
      ))}
      <button
        type="button"
        aria-label="Ajouter"
        onClick={ouvrirAjout}
        style={{
          width: 54,
          height: 54,
          marginTop: -18,
          border: 0,
          borderRadius: 999,
          background: 'var(--degrade-lagon)',
          color: 'var(--sur-accent)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'var(--ombre-plus)',
          flex: '0 0 auto',
        }}
      >
        <Symbole nom="plus" taille={24} epaisseur={2} />
      </button>
      {droite.map((o) => (
        <Bouton key={o.id} onglet={o} actif={actif} changer={changer} />
      ))}
    </nav>
  )
}

function Bouton({
  onglet,
  actif,
  changer,
}: {
  onglet: { id: Onglet; nom: string; icone: NomSymbole }
  actif: Onglet
  changer: (onglet: Onglet) => void
}) {
  return (
    <button
      type="button"
      className={`onglet${actif === onglet.id ? ' actif' : ''}`}
      onClick={() => changer(onglet.id)}
    >
      <Symbole nom={onglet.icone} taille={21} />
      {onglet.nom}
    </button>
  )
}
