/* Le journal des repas : ce qui est mangé, ce qu'il reste pour la journée,
   et la répartition entre glucides, protéines et lipides. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { ajouterJours, clefJour, deClefJour, jourRelatif } from '../lib/dates'
import { totauxDuJour, useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { objectifCalories, objectifMacros } from '../lib/profil'
import type { MomentRepas } from '../lib/stockage'

const MOMENTS: Array<{ id: MomentRepas; nom: string; emoji: string }> = [
  { id: 'petit-dejeuner', nom: 'Petit-déjeuner', emoji: '🌅' },
  { id: 'dejeuner', nom: 'Déjeuner', emoji: '🍽️' },
  { id: 'diner', nom: 'Dîner', emoji: '🌙' },
  { id: 'encas', nom: 'En-cas', emoji: '🍎' },
]

export default function Repas({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat, supprimerRepas } = useApp()
  const [jour, setJour] = useState(clefJour())
  const totaux = totauxDuJour(etat, jour)
  const but = objectifCalories(etat)
  const macros = but ? objectifMacros(but) : null
  const lignes = etat.repas.filter((r) => r.jour === jour)
  const restantes = but ? but - totaux.kcalMangees + totaux.kcalBrulees : null

  const changerJour = (pas: number) => {
    const nouveau = clefJour(ajouterJours(deClefJour(jour), pas))
    if (nouveau <= clefJour()) setJour(nouveau)
  }

  return (
    <div className="page">
      <Entete kicker="Manger" titre="Mes repas" ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      <div className="rangee" style={{ marginBottom: 12 }}>
        <button type="button" className="bouton-fin" onClick={() => changerJour(-1)}>
          ‹
        </button>
        <span style={{ fontWeight: 700 }}>{jourRelatif(deClefJour(jour))}</span>
        <button
          type="button"
          className="bouton-fin"
          disabled={jour >= clefJour()}
          onClick={() => changerJour(1)}
        >
          ›
        </button>
      </div>

      <div className="carte">
        {but === null ? (
          <p className="doux" style={{ margin: 0 }}>
            Notez votre poids et votre taille dans les réglages : l'objectif de calories se
            calculera tout seul.
          </p>
        ) : (
          <>
            <div className="rangee" style={{ alignItems: 'flex-end' }}>
              <div>
                <div className="kicker">Mangé</div>
                <div>
                  <span className="chiffre" style={{ fontSize: 34 }}>
                    {totaux.kcalMangees}
                  </span>
                  <span className="doux" style={{ fontWeight: 700 }}> / {but} kcal</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="chiffre" style={{ fontSize: 20, color: 'var(--menthe-fonce)' }}>
                  {Math.max(0, restantes ?? 0)}
                </div>
                <div className="doux mini">encore possible</div>
              </div>
            </div>
            <div className="barre" style={{ margin: '12px 0 4px' }}>
              <i
                style={{
                  width: `${Math.min(100, (totaux.kcalMangees / but) * 100)}%`,
                  background:
                    totaux.kcalMangees > but ? 'var(--degrade-corail)' : 'var(--degrade-menthe)',
                }}
              />
            </div>
            {totaux.kcalBrulees > 0 && (
              <div className="doux mini">
                + {totaux.kcalBrulees} kcal brûlées au sport, ajoutées à la journée.
              </div>
            )}

            {macros && (
              <div className="grille3" style={{ marginTop: 16 }}>
                <Macro
                  nom="Glucides"
                  valeur={totaux.glucides}
                  but={macros.glucides}
                  couleur="var(--ambre)"
                />
                <Macro
                  nom="Protéines"
                  valeur={totaux.proteines}
                  but={macros.proteines}
                  couleur="var(--menthe)"
                />
                <Macro
                  nom="Lipides"
                  valeur={totaux.lipides}
                  but={macros.lipides}
                  couleur="var(--corail)"
                />
              </div>
            )}
          </>
        )}
      </div>

      {MOMENTS.map((moment) => {
        const duMoment = lignes.filter((l) => l.moment === moment.id)
        const total = duMoment.reduce((t, l) => t + l.kcal, 0)
        return (
          <div className="carte" key={moment.id}>
            <div className="rangee">
              <div style={{ fontWeight: 700 }}>
                {moment.emoji} {moment.nom}
              </div>
              <span className="doux mini chiffre">{total} kcal</span>
            </div>

            {duMoment.length > 0 && (
              <div style={{ marginTop: 6 }}>
                {duMoment.map((ligne) => (
                  <div key={ligne.id} className="ligne-liste">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ligne.nom}</div>
                      <div className="doux mini">
                        {ligne.quantite.toLocaleString('fr-FR')}{' '}
                        {ligne.unite === 'portion' ? '' : ligne.unite} ·{' '}
                        {ligne.glucides.toLocaleString('fr-FR')} g de glucides ·{' '}
                        {ligne.proteines.toLocaleString('fr-FR')} g de protéines
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="chiffre mini">{ligne.kcal}</span>
                      <button
                        type="button"
                        className="bouton-fin"
                        style={{ padding: '4px 10px' }}
                        aria-label="Retirer"
                        onClick={() => supprimerRepas(ligne.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="bouton-fin"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => ouvrir({ nom: 'ajout', moment: moment.id })}
            >
              + Ajouter
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Macro({
  nom,
  valeur,
  but,
  couleur,
}: {
  nom: string
  valeur: number
  but: number
  couleur: string
}) {
  return (
    <div>
      <div className="doux mini" style={{ fontWeight: 700 }}>
        {nom}
      </div>
      <div className="chiffre" style={{ fontSize: 17 }}>
        {valeur}
        <span className="doux" style={{ fontSize: 12, fontWeight: 600 }}> / {but} g</span>
      </div>
      <div className="barre" style={{ height: 6, marginTop: 5 }}>
        <i style={{ width: `${Math.min(100, (valeur / but) * 100)}%`, background: couleur }} />
      </div>
    </div>
  )
}
