/* La feuille qui monte quand on touche le +. Tout ce qu'on note dans une
   journée, au même endroit, sans avoir à chercher le bon écran. */

import { clefJour } from '../lib/dates'
import { useApp, momentProbable } from '../lib/etat'
import { jeuneEnCours } from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { IconeCroix } from './Icones'
import Symbole from './Symbole'
import type { NomSymbole } from './Symbole'

type Action = {
  icone: NomSymbole
  fond: string
  couleur: string
  nom: string
  detail?: string
  faire: () => void
}

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
      icone: 'photo',
      fond: 'var(--argile-pale)',
      couleur: 'var(--argile)',
      nom: 'Photographier mon repas',
      detail: 'Une photo, trois questions, les calories',
      faire: aller({ nom: 'photo-repas', moment: momentProbable() }),
    },
    {
      icone: 'dejeuner',
      fond: 'var(--olive-pale)',
      couleur: 'var(--olive)',
      nom: 'Décrire un repas',
      detail: 'Une phrase, et les calories se calculent',
      faire: aller({ nom: 'composer', moment: momentProbable() }),
    },
    {
      icone: 'encas',
      fond: 'var(--miel-pale)',
      couleur: 'var(--miel)',
      nom: 'Chercher un aliment',
      detail: 'Un par un, dans la base',
      faire: aller({ nom: 'ajout', moment: momentProbable() }),
    },
    {
      icone: 'eau',
      fond: 'var(--canard-pale)',
      couleur: 'var(--canard)',
      nom: 'Un verre d’eau',
      detail: `${verres} sur ${etat.profil.butEau} aujourd’hui`,
      faire: () => {
        ajouterVerres(1)
        fermer()
      },
    },
    enCours
      ? {
          icone: 'renouveau',
          fond: 'var(--argile-pale)',
          couleur: 'var(--argile)',
          nom: 'Terminer le jeûne',
          detail: 'Le minuteur s’arrête maintenant',
          faire: () => {
            terminer()
            fermer()
          },
        }
      : {
          icone: 'jeune',
          fond: 'var(--argile-pale)',
          couleur: 'var(--argile)',
          nom: 'Commencer le jeûne',
          detail: 'Le minuteur part de maintenant',
          faire: () => {
            commencer()
            fermer()
          },
        },
    {
      icone: 'sport',
      fond: 'var(--canard-pale)',
      couleur: 'var(--canard)',
      nom: 'Noter une séance faite',
      detail: 'Une vidéo, un cours, la salle',
      faire: aller({ nom: 'noter-seance' }),
    },
    {
      icone: 'lotus',
      fond: 'var(--olive-pale)',
      couleur: 'var(--olive)',
      nom: 'Suivre une séance guidée',
      detail: 'Cardio, pilates ou musculation',
      faire: aller({ nom: 'sport' }),
    },
    {
      icone: 'gps',
      fond: 'var(--olive-pale)',
      couleur: 'var(--olive)',
      nom: 'Sortir marcher ou courir',
      detail: 'Chrono et GPS',
      faire: aller({ nom: 'sortie' }),
    },
    {
      icone: 'poids',
      fond: 'var(--miel-pale)',
      couleur: 'var(--miel)',
      nom: 'Noter mon poids',
      faire: aller({ nom: 'corps' }),
    },
    {
      icone: 'pas',
      fond: 'var(--miel-pale)',
      couleur: 'var(--miel)',
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
                color: action.couleur,
                width: 42,
                height: 42,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
              }}
            >
              <Symbole nom={action.icone} taille={21} />
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
