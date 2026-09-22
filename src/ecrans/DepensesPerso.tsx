/* Les dépenses de notre famille — et seulement les nôtres.

   Ce n'est pas l'écran qui les cache à l'autre famille : c'est la base, qui
   ne rend à chaque compte que les lignes de son foyer. L'écran ne fait que
   les montrer, mois par mois, avec le total et ce qui pèse le plus. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import { fcfp, jourCourt, moisDe } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Vue } from '../lib/navigation'
import { CATEGORIES_DEPENSE, categorieDepenseDe, foyerDe, membreDe } from '../lib/types'

export default function DepensesPerso({
  ouvrir,
  fermer,
}: {
  ouvrir: (vue: Vue) => void
  fermer: () => void
}) {
  const { maison, monFoyerId, partagee, supprimerDepensePerso } = useMaison()
  const [periode, setPeriode] = useState(moisDe())
  const foyer = foyerDe(maison, monFoyerId)

  const duMois = maison.depensesPerso
    .filter((d) => d.foyerId === monFoyerId && d.sens !== 'revenu' && d.le.startsWith(periode))
    .sort((a, b) => b.le.localeCompare(a.le))
  const total = duMois.reduce((somme, d) => somme + d.montant, 0)
  const parCategorie = CATEGORIES_DEPENSE.map((c) => ({
    ...c,
    total: duMois.filter((d) => d.categorie === c.id).reduce((s, d) => s + d.montant, 0),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  return (
    <div className="page">
      <Entete
        kicker={foyer ? foyer.nom : 'Nos dépenses'}
        titre="Nos dépenses"
        retour={fermer}
      />

      {!monFoyerId ? (
        <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
          <div style={{ fontWeight: 700 }}>
            {partagee ? "Ce compte n'est d'aucune famille" : 'Dites d’abord qui vous êtes'}
          </div>
          <p className="doux mini" style={{ margin: '6px 0 0', lineHeight: 1.7 }}>
            {partagee
              ? "Vous êtes entré avec l'ancien code commun. Les dépenses perso ne s'ouvrent " +
                "qu'avec le code de votre famille : sortez, puis rentrez avec lui."
              : 'Les dépenses perso sont celles de votre foyer. Choisissez votre prénom dans ' +
                'les réglages de la maison.'}
          </p>
        </div>
      ) : (
        <>
          <div className="carte" style={{ background: 'var(--lagon-pale)' }}>
            <div className="rangee">
              <div>
                <div className="kicker">Ce mois-ci</div>
                <div className="chiffre" style={{ fontSize: 32 }}>
                  {fcfp(total)}
                </div>
              </div>
              <Symbole nom="cadenas" taille={26} couleur="var(--lagon)" />
            </div>
            <div className="doux mini" style={{ marginTop: 6 }}>
              {duMois.length} dépense{duMois.length > 1 ? 's' : ''} · visibles par{' '}
              {foyer?.nom ?? 'nous'} seulement
            </div>
          </div>

          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginBottom: 14 }}
            onClick={() => ouvrir({ nom: 'budget' })}
          >
            Notre budget du mois — la fiche
          </button>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button type="button" className="bouton-fin" style={{ flex: 1 }} onClick={() => ouvrir({ nom: 'rapport' })}>
              Le rapport de l'année
            </button>
            <button type="button" className="bouton-fin" style={{ flex: 1 }} onClick={() => ouvrir({ nom: 'comptes' })}>
              Nos comptes
            </button>
          </div>

          <ChoixMois periode={periode} changer={setPeriode} />

          {parCategorie.length > 1 && (
            <div className="carte">
              <div className="kicker">Où ça part</div>
              {parCategorie.map((c) => (
                <div key={c.id} style={{ marginTop: 10 }}>
                  <div className="rangee">
                    <span className="doux">
                      {c.emoji} {c.nom}
                    </span>
                    <span className="chiffre mini">{fcfp(c.total)}</span>
                  </div>
                  <div className="barre" style={{ marginTop: 4 }}>
                    <i
                      style={{
                        width: `${Math.round((c.total / total) * 100)}%`,
                        background: 'var(--lagon)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="titre-section">Les dépenses</div>

          {duMois.length === 0 && (
            <div className="carte">
              <p className="vide" style={{ padding: '10px 6px' }}>
                Rien de noté ce mois-ci.
              </p>
            </div>
          )}

          {duMois.length > 0 && (
            <div className="carte">
              {duMois.map((depense) => {
                const categorie = categorieDepenseDe(depense.categorie)
                const qui = membreDe(maison, depense.parMembreId)
                return (
                  <div key={depense.id} className="ligne-liste">
                    <span
                      className="pastille"
                      style={{ width: 40, height: 40, background: 'var(--piste)', fontSize: 18 }}
                    >
                      {categorie.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{depense.libelle}</div>
                      <div className="doux mini">
                        {jourCourt(depense.le)}
                        {qui ? ` · ${qui.prenom}` : ''}
                      </div>
                    </div>
                    <span className="chiffre mini">{fcfp(depense.montant)}</span>
                    <button
                      type="button"
                      className="bouton-fin"
                      style={{ padding: '4px 10px' }}
                      aria-label={`Retirer ${depense.libelle}`}
                      onClick={() => {
                        if (confirm(`Retirer « ${depense.libelle} » ?`)) {
                          void supprimerDepensePerso(depense.id)
                        }
                      }}
                    >
                      <Symbole nom="croix" taille={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button
            type="button"
            className="bouton"
            onClick={() => ouvrir({ nom: 'nouvelle-depense-perso' })}
          >
            + Noter une dépense
          </button>
        </>
      )}
    </div>
  )
}
