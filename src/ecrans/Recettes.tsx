/* La liste des recettes, avec les filtres rapides de la maquette. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import type { CategorieRecette } from '../lib/recettes'
import { CATEGORIES_RECETTES, ETIQUETTES, RECETTES } from '../lib/recettes'

export default function Recettes({
  fermer,
  ouvrir,
}: {
  fermer: () => void
  ouvrir: (vue: Vue) => void
}) {
  const { etat } = useApp()
  const [filtre, setFiltre] = useState<string | null>(null)
  const [gardees, setGardees] = useState(false)

  const visibles = RECETTES.filter((r) => {
    if (gardees && !etat.recettesGardees.includes(r.id)) return false
    if (filtre && !r.etiquettes.includes(filtre)) return false
    return true
  })

  return (
    <div className="page">
      <Entete kicker="Des idées" titre="Recettes" retour={fermer} />

      <div className="titre-section" style={{ marginTop: 0 }}>
        Filtres rapides
      </div>
      <div className="grille3">
        {ETIQUETTES.map((etiquette) => (
          <button
            key={etiquette}
            type="button"
            className={`choix${filtre === etiquette ? ' actif' : ''}`}
            style={{ textAlign: 'center', padding: '14px 8px', fontSize: 13, fontWeight: 700 }}
            onClick={() => setFiltre(filtre === etiquette ? null : etiquette)}
          >
            {etiquette}
          </button>
        ))}
      </div>

      {etat.recettesGardees.length > 0 && (
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', marginTop: 14 }}
          onClick={() => setGardees(!gardees)}
        >
          {gardees ? 'Voir toutes les recettes' : `⭐ Mes ${etat.recettesGardees.length} recettes gardées`}
        </button>
      )}

      {CATEGORIES_RECETTES.map((categorie) => {
        const dedans = visibles.filter((r) => r.categorie === (categorie.id as CategorieRecette))
        if (dedans.length === 0) return null
        return (
          <div key={categorie.id}>
            <div className="titre-section">{categorie.nom}</div>
            {dedans.map((recette) => (
              <button
                key={recette.id}
                type="button"
                className="carte serree"
                style={{ width: '100%', border: 0, textAlign: 'left' }}
                onClick={() => ouvrir({ nom: 'recette', id: recette.id })}
              >
                <div className="rangee">
                  <span
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: recette.couleur,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 25,
                      flex: '0 0 auto',
                    }}
                  >
                    {recette.emoji}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{recette.nom}</div>
                    <div className="doux mini">
                      {recette.kcal} kcal · {recette.minutes} min · {recette.portions} portion
                      {recette.portions > 1 ? 's' : ''}
                    </div>
                  </div>
                  {etat.recettesGardees.includes(recette.id) && <span>⭐</span>}
                </div>
              </button>
            ))}
          </div>
        )
      })}

      {visibles.length === 0 && (
        <p className="vide">Aucune recette avec ce filtre.</p>
      )}
    </div>
  )
}
