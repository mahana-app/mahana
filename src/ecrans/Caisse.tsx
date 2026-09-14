/* La caisse commune des courses.

   Chacun fait ses courses de son côté, mais certaines choses s'achètent en
   gros pour toute la maison : le poulet, la viande, les légumes, le riz, le
   lait, le pain de mie. Chaque foyer verse une somme au début du mois, et
   c'est avec cet argent-là qu'on achète.

   Deux chiffres suffisent à savoir où on en est : ce qui a été versé, et ce
   qui a été dépensé. La différence, c'est ce qu'il reste dans la caisse — et
   si elle passe en négatif, quelqu'un a payé de sa poche sans le dire. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import { achatsDuMois, etatCaisse, fcfp, jourCourt, jourDe, moisDe } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Vue } from '../lib/navigation'
import { categorieDe, foyersFamille, membreDe } from '../lib/types'

export default function Caisse({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { maison, ajouterCotisation, modifierCotisation, supprimerAchat } = useMaison()
  const [periode, setPeriode] = useState(moisDe())
  const caisse = etatCaisse(maison)
  const achats = achatsDuMois(maison, periode)
  const depenseDuMois = achats.reduce((somme, a) => somme + a.montant, 0)

  return (
    <div className="page">
      <Entete
        kicker="Les courses"
        titre="La caisse commune"
        ouvrirReglages={() => ouvrir({ nom: 'maisonnee' })}
      />

      <div
        className="carte"
        style={{ background: caisse.solde < 0 ? 'var(--corail-pale)' : 'var(--lagon-pale)' }}
      >
        <div className="rangee">
          <div>
            <div className="kicker">Il reste dans la caisse</div>
            <div className="chiffre" style={{ fontSize: 34 }}>
              {fcfp(caisse.solde)}
            </div>
          </div>
          <Symbole nom="panier" taille={30} couleur="var(--lagon)" />
        </div>
        <div className="doux mini" style={{ marginTop: 8, lineHeight: 1.7 }}>
          {fcfp(caisse.verse)} versés depuis le début · {fcfp(caisse.depense)} de courses
          {caisse.attendu > 0 ? ` · ${fcfp(caisse.attendu)} promis mais pas encore versés` : ''}
        </div>
        {caisse.solde < 0 && (
          <p className="doux mini" style={{ margin: '10px 0 0', color: 'var(--corail-fonce)' }}>
            La caisse est à découvert : quelqu'un a avancé de sa poche. Notez les cotisations
            manquantes pour remettre les comptes d'aplomb.
          </p>
        )}
      </div>

      <ChoixMois periode={periode} changer={setPeriode} />

      {/* ---------- les cotisations du mois ---------- */}
      <div className="carte">
        <div className="kicker">Les cotisations du mois</div>
        {foyersFamille(maison).map((foyer) => {
          const cotisation = maison.cotisations.find(
            (c) => c.foyerId === foyer.id && c.periode === periode,
          )
          const attendu = maison.reglages.cotisationMensuelle[foyer.id] ?? 0

          return (
            <div key={foyer.id} className="ligne-liste">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: foyer.couleur }}>{foyer.nom}</div>
                <div className="doux mini">
                  {cotisation
                    ? cotisation.verseeLe
                      ? `Versée le ${jourCourt(cotisation.verseeLe)}`
                      : 'Notée, pas encore versée'
                    : attendu > 0
                      ? `${fcfp(attendu)} attendus`
                      : 'Aucun montant réglé pour ce foyer'}
                </div>
              </div>
              {cotisation ? (
                cotisation.verseeLe ? (
                  <span className="pilule vert">{fcfp(cotisation.montant)}</span>
                ) : (
                  <button
                    type="button"
                    className="bouton"
                    style={{ width: 'auto', padding: '10px 14px', fontSize: 13.5 }}
                    onClick={() => void modifierCotisation(cotisation.id, { verseeLe: jourDe() })}
                  >
                    Versée
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="bouton-fin"
                  disabled={attendu <= 0}
                  onClick={() =>
                    void ajouterCotisation({
                      foyerId: foyer.id,
                      periode,
                      montant: attendu,
                      verseeLe: jourDe(),
                      note: '',
                    })
                  }
                >
                  Noter {fcfp(attendu)}
                </button>
              )}
            </div>
          )
        })}
        {foyersFamille(maison).every((f) => !maison.reglages.cotisationMensuelle[f.id]) && (
          <p className="doux mini" style={{ margin: '10px 0 0' }}>
            Réglez d'abord combien chaque foyer verse par mois, dans les réglages de la maison.
          </p>
        )}
      </div>

      {/* ---------- les courses du mois ---------- */}
      <div className="titre-section">
        Les courses · {fcfp(depenseDuMois)}
      </div>

      {achats.length === 0 && (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Aucune course notée ce mois-ci.
          </p>
        </div>
      )}

      {achats.length > 0 && (
        <div className="carte">
          {achats.map((achat) => {
            const categorie = categorieDe(achat.categorie)
            const qui = membreDe(maison, achat.parMembreId)
            return (
              <div key={achat.id} className="ligne-liste">
                <span
                  className="pastille"
                  style={{ width: 40, height: 40, background: 'var(--piste)', fontSize: 18 }}
                >
                  {categorie.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{achat.libelle}</div>
                  <div className="doux mini">
                    {jourCourt(achat.le)}
                    {qui ? ` · ${qui.prenom}` : ''}
                  </div>
                </div>
                <span className="chiffre mini">{fcfp(achat.montant)}</span>
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label={`Retirer ${achat.libelle}`}
                  onClick={() => {
                    if (confirm(`Retirer « ${achat.libelle} » des courses ?`)) {
                      void supprimerAchat(achat.id)
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

      <button type="button" className="bouton" onClick={() => ouvrir({ nom: 'nouvel-achat' })}>
        + Noter une course
      </button>
    </div>
  )
}
