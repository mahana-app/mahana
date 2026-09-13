/* La feuille qui monte quand on touche le +. Tout ce qu'on note dans une
   journée de maison, au même endroit, sans avoir à chercher le bon écran. */

import type { Vue } from '../lib/navigation'
import Symbole from './Symbole'
import type { NomSymbole } from './Symbole'

type Action = {
  icone: NomSymbole
  fond: string
  couleur: string
  nom: string
  detail: string
  vue: Vue
}

const ACTIONS: Action[] = [
  {
    icone: 'eclair',
    fond: 'var(--ocre-pale)',
    couleur: 'var(--ocre)',
    nom: 'Une facture',
    detail: 'Électricité, eau, internet, impôts, déchets',
    vue: { nom: 'nouvelle-charge' },
  },
  {
    icone: 'panier',
    fond: 'var(--lagon-pale)',
    couleur: 'var(--lagon)',
    nom: 'Une course en gros',
    detail: 'Payée avec la caisse commune',
    vue: { nom: 'nouvel-achat' },
  },
  {
    icone: 'roulotte',
    fond: 'var(--corail-pale)',
    couleur: 'var(--corail)',
    nom: 'Pris à la roulotte',
    detail: 'À rembourser en fin de mois',
    vue: { nom: 'nouvelle-ardoise' },
  },
  {
    icone: 'famille',
    fond: 'var(--feuille-pale)',
    couleur: 'var(--feuille)',
    nom: 'La maisonnée',
    detail: 'Les foyers, les parts, les cotisations',
    vue: { nom: 'maisonnee' },
  },
]

export default function FeuilleActions({
  fermer,
  ouvrir,
}: {
  fermer: () => void
  ouvrir: (vue: Vue) => void
}) {
  return (
    <>
      <div className="voile" onClick={fermer} role="presentation" />
      <div className="feuille" role="dialog" aria-label="Ajouter">
        <div className="poignee" />
        <div className="rangee" style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: 18 }}>Noter quelque chose</h2>
          <button type="button" className="rond-entete" aria-label="Fermer" onClick={fermer}>
            <Symbole nom="croix" taille={17} />
          </button>
        </div>
        {ACTIONS.map((action) => (
          <button
            key={action.nom}
            type="button"
            className="ligne-liste"
            style={{ width: '100%', border: 0, background: 'none', textAlign: 'left' }}
            onClick={() => {
              fermer()
              ouvrir(action.vue)
            }}
          >
            <span
              className="pastille"
              style={{ width: 42, height: 42, background: action.fond, color: action.couleur }}
            >
              <Symbole nom={action.icone} taille={21} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700 }}>{action.nom}</span>
              <span className="doux mini">{action.detail}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
