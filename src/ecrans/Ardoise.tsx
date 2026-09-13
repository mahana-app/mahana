/* L'ardoise de la roulotte.

   Quand quelqu'un de la maison prend à manger à la roulotte, ce n'est pas un
   cadeau : c'est du stock et de la caisse en moins pour l'entreprise. On le
   note ici au moment où ça arrive, et à la fin du mois chaque foyer rembourse
   son total. Sans ça la caisse de la roulotte ne tombe jamais juste, et
   personne ne sait dire pourquoi. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import { ardoiseDuMois, duALaRoulotte, fcfp, jourCourt, moisDe, moisEnMots } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Vue } from '../lib/navigation'
import { membreDe } from '../lib/types'

export default function Ardoise({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { maison, supprimerArdoise, rembourserArdoise } = useMaison()
  const [periode, setPeriode] = useState(moisDe())
  const lignes = ardoiseDuMois(maison, periode)
  const du = duALaRoulotte(maison)
  const totalDu = Object.values(du).reduce((somme, v) => somme + v, 0)

  return (
    <div className="page">
      <Entete
        kicker="La roulotte"
        titre="Ce qu'on lui doit"
        ouvrirReglages={() => ouvrir({ nom: 'maisonnee' })}
      />

      <div
        className="carte"
        style={{ background: totalDu > 0 ? 'var(--corail-pale)' : 'var(--feuille-pale)' }}
      >
        <div className="rangee">
          <div>
            <div className="kicker">À rembourser à la roulotte</div>
            <div className="chiffre" style={{ fontSize: 34 }}>
              {fcfp(totalDu)}
            </div>
          </div>
          <Symbole
            nom="roulotte"
            taille={30}
            couleur={totalDu > 0 ? 'var(--corail)' : 'var(--feuille)'}
          />
        </div>
        {totalDu === 0 && (
          <div className="doux mini" style={{ marginTop: 6 }}>
            Rien en attente : la roulotte est remboursée.
          </div>
        )}
      </div>

      {/* le dû par foyer, tous mois confondus */}
      {totalDu > 0 && (
        <div className="carte">
          <div className="kicker">Par foyer</div>
          {maison.foyers.map((foyer) => (
            <div key={foyer.id} className="ligne-liste">
              <div style={{ fontWeight: 700, color: foyer.couleur }}>{foyer.nom}</div>
              <span className="chiffre">{fcfp(du[foyer.id] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}

      <ChoixMois periode={periode} changer={setPeriode} />

      {/* le solde du mois affiché, foyer par foyer */}
      {maison.foyers.map((foyer) => {
        const duFoyer = lignes.filter((l) => l.foyerId === foyer.id)
        const reste = duFoyer.filter((l) => !l.rembourseeLe).reduce((s, l) => s + l.montant, 0)
        const total = duFoyer.reduce((s, l) => s + l.montant, 0)
        if (duFoyer.length === 0) return null

        return (
          <div className="carte" key={foyer.id}>
            <div className="rangee">
              <div>
                <div style={{ fontWeight: 700, color: foyer.couleur }}>{foyer.nom}</div>
                <div className="doux mini">
                  {fcfp(total)} pris en {moisEnMots(periode)}
                  {reste === 0 ? ' · remboursé' : ''}
                </div>
              </div>
              {reste > 0 && (
                <button
                  type="button"
                  className="bouton"
                  style={{ width: 'auto', padding: '10px 15px', fontSize: 13.5 }}
                  onClick={() => {
                    if (!confirm(`Marquer ${fcfp(reste)} comme remboursés à la roulotte ?`)) return
                    void rembourserArdoise(foyer.id, periode)
                  }}
                >
                  Remboursé
                </button>
              )}
            </div>

            <div style={{ marginTop: 6 }}>
              {duFoyer.map((ligne) => {
                const qui = membreDe(maison, ligne.parMembreId)
                return (
                  <div key={ligne.id} className="ligne-liste">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ligne.libelle}</div>
                      <div className="doux mini">
                        {jourCourt(ligne.le)}
                        {qui ? ` · ${qui.prenom}` : ''}
                        {ligne.rembourseeLe ? ' · remboursé' : ''}
                      </div>
                    </div>
                    <span
                      className="chiffre mini"
                      style={{ opacity: ligne.rembourseeLe ? 0.5 : 1 }}
                    >
                      {fcfp(ligne.montant)}
                    </span>
                    <button
                      type="button"
                      className="bouton-fin"
                      style={{ padding: '4px 10px' }}
                      aria-label={`Retirer ${ligne.libelle}`}
                      onClick={() => {
                        if (confirm(`Retirer « ${ligne.libelle} » de l’ardoise ?`)) {
                          void supprimerArdoise(ligne.id)
                        }
                      }}
                    >
                      <Symbole nom="croix" taille={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {lignes.length === 0 && (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Personne n'a rien pris à la roulotte ce mois-ci.
          </p>
        </div>
      )}

      <button type="button" className="bouton" onClick={() => ouvrir({ nom: 'nouvelle-ardoise' })}>
        + Noter ce qu'on a pris
      </button>
    </div>
  )
}
