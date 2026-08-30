/* L'onglet Repas : ce qui a été mangé, jour par jour, avec l'objectif de
   calories réparti entre les quatre repas — c'est cette répartition qui
   évite de tout dépenser au petit-déjeuner. */

import { useState } from 'react'
import BandeauSemaine from '../composants/BandeauSemaine'
import Entete from '../composants/Entete'
import JaugeDemi from '../composants/JaugeDemi'
import { IconeFleche } from '../composants/Icones'
import { clefJour, deClefJour, jourCourt } from '../lib/dates'
import { totauxDuJour, useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { objectifCalories, objectifMacros } from '../lib/profil'
import type { MomentRepas } from '../lib/stockage'

const MOMENTS: Array<{ id: MomentRepas; nom: string; emoji: string; fond: string; part: keyof Repartition }> = [
  { id: 'petit-dejeuner', nom: 'Petit-déjeuner', emoji: '🌅', fond: 'var(--menthe-pale)', part: 'petitDejeuner' },
  { id: 'dejeuner', nom: 'Déjeuner', emoji: '🍽️', fond: 'var(--ambre-pale)', part: 'dejeuner' },
  { id: 'diner', nom: 'Dîner', emoji: '🌙', fond: 'var(--lavande-pale)', part: 'diner' },
  { id: 'encas', nom: 'En-cas', emoji: '🍎', fond: 'var(--corail-pale)', part: 'encas' },
]

type Repartition = { petitDejeuner: number; dejeuner: number; diner: number; encas: number }

export default function Repas({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat, supprimerRepas } = useApp()
  const [jour, setJour] = useState(clefJour())
  const totaux = totauxDuJour(etat, jour)
  const but = objectifCalories(etat)
  const macros = but ? objectifMacros(but) : null
  const lignes = etat.repas.filter((r) => r.jour === jour)
  const bonus = etat.profil.ajouterKcalBrulees ? totaux.kcalBrulees : 0
  const restantes = but ? but - totaux.kcalMangees + bonus : null

  return (
    <div className="page">
      <Entete kicker="Manger" titre="Mes repas" ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span className="pilule" style={{ background: 'var(--encre)', color: '#fff' }}>
          Repas
        </span>
        <button type="button" className="pilule" onClick={() => ouvrir({ nom: 'recettes' })}>
          Recettes
        </button>
      </div>

      <BandeauSemaine
        jour={jour}
        choisir={setJour}
        rempli={(clef) => etat.repas.some((r) => r.jour === clef)}
      />

      <div className="carte">
        {but === null ? (
          <p className="doux" style={{ margin: 0 }}>
            Notez votre poids et votre taille dans les réglages : l'objectif de calories se
            calculera tout seul.
          </p>
        ) : (
          <>
            <JaugeDemi
              part={totaux.kcalMangees / but}
              centre={String(Math.max(0, restantes ?? 0))}
              legendeCentre="kcal restantes"
              gauche={String(totaux.kcalMangees)}
              legendeGauche="Consommé"
              droite={String(totaux.kcalBrulees)}
              legendeDroite="Brûlé"
            />
            {macros && (
              <div className="grille3" style={{ marginTop: 12 }}>
                <Macro nom="Glucides" valeur={totaux.glucides} but={macros.glucides} couleur="var(--ambre)" />
                <Macro nom="Protéines" valeur={totaux.proteines} but={macros.proteines} couleur="var(--menthe)" />
                <Macro nom="Lipides" valeur={totaux.lipides} but={macros.lipides} couleur="var(--corail)" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="rangee" style={{ margin: '18px 4px 10px' }}>
        <span style={{ fontWeight: 700 }}>Repas</span>
        <span className="doux mini">{jourCourt(deClefJour(jour))}</span>
      </div>

      {MOMENTS.map((moment) => {
        const duMoment = lignes.filter((l) => l.moment === moment.id)
        const total = duMoment.reduce((t, l) => t + l.kcal, 0)
        const cible = but ? Math.round(but * etat.profil.repartition[moment.part]) : null
        return (
          <div className="carte" key={moment.id}>
            <div className="rangee">
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  background: moment.fond,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 21,
                  flex: '0 0 auto',
                }}
              >
                {moment.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{moment.nom}</div>
                <div className="doux mini chiffre">
                  {total}
                  {cible !== null ? ` / ${cible}` : ''} kcal
                </div>
              </div>
              <button
                type="button"
                className="bouton"
                style={{ width: 'auto', padding: '10px 16px', flex: '0 0 auto' }}
                aria-label={`Ajouter au ${moment.nom.toLowerCase()}`}
                onClick={() => ouvrir({ nom: 'ajout', moment: moment.id })}
              >
                +
              </button>
            </div>

            {duMoment.length > 0 && (
              <div style={{ marginTop: 8 }}>
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
          </div>
        )
      })}

      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left' }}
        onClick={() => ouvrir({ nom: 'recettes' })}
      >
        <div className="rangee">
          <div>
            <div className="kicker">Idées</div>
            <div style={{ fontWeight: 700 }}>👩‍🍳 Voir les recettes</div>
            <div className="doux mini">Rapides, légères, riches en protéines</div>
          </div>
          <IconeFleche />
        </div>
      </button>
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
      <div className="chiffre" style={{ fontSize: 16 }}>
        {valeur}
        <span className="doux" style={{ fontSize: 11, fontWeight: 600 }}> / {but} g</span>
      </div>
      <div className="barre" style={{ height: 5, marginTop: 4 }}>
        <i style={{ width: `${Math.min(100, (valeur / but) * 100)}%`, background: couleur }} />
      </div>
    </div>
  )
}
