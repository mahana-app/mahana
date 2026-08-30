/* La feuille qui monte quand on touche le +. Tout ce qu'on note dans une
   journée, au même endroit, sans avoir à chercher le bon écran. */

import { clefJour } from '../lib/dates'
import { useApp, momentProbable } from '../lib/etat'
import { jeuneEnCours } from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { IconeCroix } from './Icones'

type Action = { emoji: string; fond: string; nom: string; detail?: string; faire: () => void }

export default function FeuilleActions({
  fermer,
  ouvrir,
}: {
  fermer: () => void
  ouvrir: (vue: Vue) => void
}) {
  const { etat, ajouterVerres, commencer, terminer } = useApp()
  const enCours = jeuneEnCours(etat)
  const verres = etat.eau[clefJour()] ?? 0

  const aller = (vue: Vue) => () => {
    fermer()
    ouvrir(vue)
  }

  const actions: Action[] = [
    {
      emoji: '🍽️',
      fond: 'var(--corail-pale)',
      nom: 'Noter un repas',
      detail: 'Chercher un aliment et l’ajouter',
      faire: aller({ nom: 'ajout', moment: momentProbable() }),
    },
    {
      emoji: '💧',
      fond: '#e4f0fd',
      nom: 'Un verre d’eau',
      detail: `${verres} sur ${etat.profil.butEau} aujourd’hui`,
      faire: () => {
        ajouterVerres(1)
        fermer()
      },
    },
    enCours
      ? {
          emoji: '🏁',
          fond: 'var(--menthe-pale)',
          nom: 'Terminer le jeûne',
          detail: 'Le minuteur s’arrête maintenant',
          faire: () => {
            terminer()
            fermer()
          },
        }
      : {
          emoji: '⏳',
          fond: 'var(--menthe-pale)',
          nom: 'Commencer le jeûne',
          detail: 'Le minuteur part de maintenant',
          faire: () => {
            commencer()
            fermer()
          },
        },
    {
      emoji: '💪',
      fond: 'var(--lavande-pale)',
      nom: 'Une séance de sport',
      detail: 'Cardio, pilates ou musculation',
      faire: aller({ nom: 'sport' }),
    },
    {
      emoji: '📍',
      fond: 'var(--menthe-pale)',
      nom: 'Sortir marcher ou courir',
      detail: 'Chrono et GPS',
      faire: aller({ nom: 'sortie' }),
    },
    {
      emoji: '⚖️',
      fond: 'var(--ambre-pale)',
      nom: 'Noter mon poids',
      faire: aller({ nom: 'corps' }),
    },
    {
      emoji: '👟',
      fond: 'var(--ambre-pale)',
      nom: 'Mes pas et ma nuit',
      faire: aller({ nom: 'activite' }),
    },
  ]

  return (
    <>
      <div className="voile" onClick={fermer} role="presentation" />
      <div className="feuille" role="dialog" aria-label="Ajouter">
        <div className="poignee" />
        <div className="rangee" style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: 18 }}>Ajouter à ma journée</h2>
          <button type="button" className="rond-entete" aria-label="Fermer" onClick={fermer}>
            <IconeCroix />
          </button>
        </div>
        {actions.map((action) => (
          <button
            key={action.nom}
            type="button"
            className="ligne-liste"
            style={{ width: '100%', border: 0, background: 'none', textAlign: 'left' }}
            onClick={action.faire}
          >
            <span
              className="rond"
              style={{
                background: action.fond,
                width: 40,
                height: 40,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                fontSize: 19,
                flex: '0 0 auto',
              }}
            >
              {action.emoji}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700 }}>{action.nom}</span>
              {action.detail && <span className="doux mini">{action.detail}</span>}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
