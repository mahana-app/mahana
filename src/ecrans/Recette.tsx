/* Une recette : ce qu'il faut, comment on fait, et le bouton pour l'ajouter
   directement au repas — sans avoir à ressaisir les calories. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { useApp, momentProbable } from '../lib/etat'
import { recetteParId } from '../lib/recettes'
import type { MomentRepas } from '../lib/stockage'

const NOMS: Record<MomentRepas, string> = {
  'petit-dejeuner': 'au petit-déjeuner',
  dejeuner: 'au déjeuner',
  diner: 'au dîner',
  encas: 'aux en-cas',
}

export default function EcranRecette({ id, fermer }: { id: string; fermer: () => void }) {
  const { etat, ajouterRepas, basculerRecette } = useApp()
  const recette = recetteParId(id)
  const [moment, setMoment] = useState<MomentRepas>(momentProbable())
  const [ajoutee, setAjoutee] = useState(false)

  if (!recette) {
    return (
      <div className="page">
        <Entete kicker="Recette" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  const gardee = etat.recettesGardees.includes(recette.id)

  return (
    <div className="page">
      <Entete kicker="Recette" titre={recette.nom} retour={fermer} />

      <div
        className="carte"
        style={{ background: recette.couleur, textAlign: 'center', padding: '26px 18px' }}
      >
        <div style={{ fontSize: 54 }}>{recette.emoji}</div>
        <div className="rangee" style={{ marginTop: 16 }}>
          <Bloc valeur={String(recette.kcal)} legende="kcal / portion" />
          <Bloc valeur={`${recette.minutes} min`} legende="préparation" />
          <Bloc valeur={String(recette.portions)} legende="portions" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {recette.etiquettes.map((e) => (
          <span key={e} className="pilule menthe">
            {e}
          </span>
        ))}
      </div>

      <div className="carte">
        <div className="kicker">Par portion</div>
        <div className="rangee" style={{ marginTop: 8 }}>
          <Bloc valeur={`${recette.proteines} g`} legende="protéines" />
          <Bloc valeur={`${recette.glucides} g`} legende="glucides" />
          <Bloc valeur={`${recette.lipides} g`} legende="lipides" />
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Il vous faut</div>
        <ul className="doux" style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.9 }}>
          {recette.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div className="carte">
        <div className="kicker">La marche à suivre</div>
        <ol className="doux" style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.7 }}>
          {recette.etapes.map((etape) => (
            <li key={etape} style={{ marginBottom: 8 }}>
              {etape}
            </li>
          ))}
        </ol>
      </div>

      <div className="carte">
        <div className="kicker">L'ajouter à ma journée</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {(Object.keys(NOMS) as MomentRepas[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`choix${moment === valeur ? ' actif' : ''}`}
              style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700 }}
              onClick={() => setMoment(valeur)}
            >
              {NOMS[valeur].replace(/^au[x]? /, '')}
            </button>
          ))}
        </div>
        <div style={{ height: 12 }} />
        <button
          type="button"
          className="bouton"
          disabled={ajoutee}
          onClick={() => {
            ajouterRepas({
              moment,
              nom: recette.nom,
              quantite: 1,
              unite: 'portion',
              kcal: recette.kcal,
              glucides: recette.glucides,
              proteines: recette.proteines,
              lipides: recette.lipides,
            })
            setAjoutee(true)
          }}
        >
          {ajoutee ? 'Ajouté ✓' : `Ajouter ${NOMS[moment]}`}
        </button>
      </div>

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%' }}
        onClick={() => basculerRecette(recette.id)}
      >
        {gardee ? '⭐ Retirer de mes recettes' : '☆ Garder cette recette'}
      </button>
    </div>
  )
}

function Bloc({ valeur, legende }: { valeur: string; legende: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="chiffre" style={{ fontSize: 18 }}>
        {valeur}
      </div>
      <div className="doux mini">{legende}</div>
    </div>
  )
}
