/* La liste des recettes, avec les filtres rapides de la maquette. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { nombreFr } from '../lib/formats'
import type { CategorieRecette } from '../lib/recettes'
import { CATEGORIES_RECETTES, ETIQUETTES, RECETTES, couleurDuMoment } from '../lib/recettes'
import type { MomentRepas } from '../lib/stockage'

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
  // Ses propres recettes d'abord dès qu'il y en a : c'est celles-là qu'on
  // vient chercher, le carnet tout fait ne sert plus qu'à dépanner.
  const [vue, setVue] = useState<'miennes' | 'idees'>(
    etat.mesRecettes.length > 0 ? 'miennes' : 'idees',
  )

  const visibles = RECETTES.filter((r) => {
    if (gardees && !etat.recettesGardees.includes(r.id)) return false
    if (filtre && !r.etiquettes.includes(filtre)) return false
    return true
  })

  return (
    <div className="page">
      <Entete kicker="Des idées" titre="Recettes" retour={fermer} />

      <div className="onglets-plats">
        {(
          [
            ['miennes', `Mes recettes${etat.mesRecettes.length ? ` (${etat.mesRecettes.length})` : ''}`],
            ['idees', 'Idées toutes faites'],
          ] as Array<['miennes' | 'idees', string]>
        ).map(([id, nom]) => (
          <button
            key={id}
            type="button"
            className="pilule"
            style={
              vue === id
                ? { background: 'var(--actif-fond)', color: 'var(--actif-texte)', flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: 13.5, fontWeight: 700 }
                : { flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: 13.5, fontWeight: 700 }
            }
            onClick={() => setVue(id)}
          >
            {nom}
          </button>
        ))}
      </div>

      {vue === 'miennes' && <MesRecettes ouvrir={ouvrir} />}

      {vue === 'idees' && (
        <>
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
        </>
      )}
    </div>
  )
}

/* ---------- ce que je cuisine vraiment ---------- */

const NOMS_MOMENT: Record<MomentRepas, string> = {
  'petit-dejeuner': 'Petits-déjeuners',
  dejeuner: 'Déjeuners',
  diner: 'Dîners',
  encas: 'En-cas',
}

function MesRecettes({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat } = useApp()

  return (
    <>
      <button
        type="button"
        className="bouton"
        style={{ marginBottom: 14 }}
        onClick={() => ouvrir({ nom: 'ma-recette' })}
      >
        + Écrire une recette
      </button>

      {etat.mesRecettes.length === 0 && (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Rien encore. Notez ce que vous cuisinez — surtout les dîners : c'est là qu'on manque
            d'idées, et l'accueil ira piocher dedans.
          </p>
        </div>
      )}

      {(Object.keys(NOMS_MOMENT) as MomentRepas[]).map((moment) => {
        const dedans = etat.mesRecettes.filter((r) => r.moment === moment)
        if (dedans.length === 0) return null
        return (
          <div key={moment}>
            <div className="titre-section">{NOMS_MOMENT[moment]}</div>
            {dedans.map((recette) => (
              <button
                key={recette.id}
                type="button"
                className="carte serree"
                style={{ width: '100%', border: 0, textAlign: 'left' }}
                onClick={() => ouvrir({ nom: 'ma-recette', id: recette.id })}
              >
                <div className="rangee">
                  <span
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: couleurDuMoment(recette.moment),
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
                      {nombreFr(recette.kcal, 0)} kcal · {recette.minutes} min ·{' '}
                      {recette.portions} portion{recette.portions > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}
