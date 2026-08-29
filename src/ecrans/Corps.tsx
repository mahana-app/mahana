/* Le poids : une pesée par jour au maximum, le matin de préférence, toujours
   dans les mêmes conditions — sinon la courbe raconte n'importe quoi. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { clefJour, deClefJour, jourCourt } from '../lib/dates'
import { useApp } from '../lib/etat'

export default function EcranCorps({ ouvrirReglages }: { ouvrirReglages: () => void }) {
  const { etat, noterPoids, supprimerPesee } = useApp()
  const pesees = etat.pesees
  const derniere = pesees.at(-1) ?? null
  const premiere = pesees[0] ?? null
  const [saisie, setSaisie] = useState('')

  const but = etat.reglages.poidsBut
  const taille = etat.reglages.tailleCm
  const imc = derniere && taille ? derniere.poids / (taille / 100) ** 2 : null
  const ecartDepart = derniere && premiere ? derniere.poids - premiere.poids : 0
  const resteAFaire = derniere && but !== null ? derniere.poids - but : null

  function enregistrer() {
    const valeur = Number(saisie.replace(',', '.'))
    if (!Number.isFinite(valeur) || valeur <= 0) return
    noterPoids(Math.round(valeur * 10) / 10)
    setSaisie('')
  }

  return (
    <div className="page">
      <Entete kicker="Suivi" titre="Mon corps" ouvrirReglages={ouvrirReglages} />

      <div className="carte">
        <div className="kicker">Dernière pesée</div>
        {derniere ? (
          <>
            <div className="rangee" style={{ alignItems: 'flex-end' }}>
              <div>
                <span className="chiffre" style={{ fontSize: 42 }}>
                  {derniere.poids.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
                </span>
                <span className="doux" style={{ fontSize: 18, fontWeight: 800 }}> kg</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="doux" style={{ fontSize: 12 }}>
                  {jourCourt(deClefJour(derniere.jour))}
                </div>
                {pesees.length > 1 && (
                  <div
                    className="chiffre"
                    style={{ color: ecartDepart <= 0 ? 'var(--menthe)' : 'var(--corail)' }}
                  >
                    {ecartDepart > 0 ? '+' : ''}
                    {ecartDepart.toFixed(1)} kg depuis le début
                  </div>
                )}
              </div>
            </div>
            {(resteAFaire !== null || imc !== null) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {resteAFaire !== null && (
                  <span className="pilule">
                    🎯 {Math.abs(resteAFaire).toFixed(1)} kg
                    {resteAFaire > 0 ? ' avant l’objectif' : ' sous l’objectif'}
                  </span>
                )}
                {imc !== null && <span className="pilule">IMC {imc.toFixed(1)}</span>}
              </div>
            )}
          </>
        ) : (
          <p className="doux" style={{ marginBottom: 0 }}>
            Aucune pesée pour l'instant. La première sert de point de départ.
          </p>
        )}
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="poids">
          Noter le poids d'aujourd'hui
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            id="poids"
            className="champ"
            inputMode="decimal"
            placeholder={derniere ? String(derniere.poids) : 'ex. 68,4'}
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') enregistrer()
            }}
          />
          <button
            type="button"
            className="bouton"
            style={{ width: 'auto', padding: '12px 22px' }}
            onClick={enregistrer}
          >
            Noter
          </button>
        </div>
        {!pesees.some((p) => p.jour === clefJour()) && (
          <p className="doux" style={{ margin: '10px 0 0' }}>
            Le plus juste : se peser le matin, à jeun, avant de boire.
          </p>
        )}
      </div>

      {pesees.length >= 2 && <Courbe />}

      {pesees.length > 0 && (
        <div className="carte">
          <div className="kicker">Toutes les pesées</div>
          <div style={{ marginTop: 6 }}>
            {[...pesees].reverse().map((pesee, index, liste) => {
              const precedente = liste[index + 1]
              const ecart = precedente ? pesee.poids - precedente.poids : null
              return (
                <div key={pesee.jour} className="ligne-liste">
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {pesee.poids.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} kg
                    </div>
                    <div className="doux" style={{ fontSize: 12 }}>
                      {jourCourt(deClefJour(pesee.jour))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {ecart !== null && (
                      <span
                        className="chiffre"
                        style={{
                          fontSize: 13,
                          color: ecart <= 0 ? 'var(--menthe)' : 'var(--corail)',
                        }}
                      >
                        {ecart > 0 ? '+' : ''}
                        {ecart.toFixed(1)}
                      </span>
                    )}
                    <button
                      type="button"
                      className="bouton-fin"
                      style={{ padding: '4px 10px' }}
                      aria-label="Supprimer cette pesée"
                      onClick={() => supprimerPesee(pesee.jour)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** La courbe du poids, dessinée à la main : trente dernières pesées. */
function Courbe() {
  const { etat } = useApp()
  const pesees = etat.pesees.slice(-30)
  const but = etat.reglages.poidsBut

  const largeur = 320
  const hauteur = 140
  const marge = 10
  const valeurs = pesees.map((p) => p.poids)
  const bas = Math.min(...valeurs, but ?? Infinity)
  const haut = Math.max(...valeurs, but ?? -Infinity)
  const amplitude = haut - bas || 1
  const x = (i: number) => marge + (i / (pesees.length - 1)) * (largeur - marge * 2)
  const y = (valeur: number) =>
    hauteur - marge - ((valeur - bas) / amplitude) * (hauteur - marge * 2)

  const trace = pesees.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.poids)}`).join(' ')
  const surface = `${trace} L ${x(pesees.length - 1)} ${hauteur} L ${x(0)} ${hauteur} Z`

  return (
    <div className="carte">
      <div className="kicker">La courbe</div>
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        width="100%"
        height={hauteur}
        style={{ marginTop: 8, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="degradePoids" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17c3a2" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#17c3a2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {but !== null && (
          <line
            x1={marge}
            x2={largeur - marge}
            y1={y(but)}
            y2={y(but)}
            stroke="var(--or)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
        )}
        <path d={surface} fill="url(#degradePoids)" />
        <path d={trace} fill="none" stroke="#17c3a2" strokeWidth="2.5" strokeLinecap="round" />
        {pesees.map((p, i) => (
          <circle key={p.jour} cx={x(i)} cy={y(p.poids)} r="3" fill="#17c3a2" />
        ))}
      </svg>
      <div className="rangee doux" style={{ fontSize: 12, marginTop: 4 }}>
        <span>{jourCourt(deClefJour(pesees[0].jour))}</span>
        {but !== null && <span style={{ color: 'var(--or)' }}>objectif {but} kg</span>}
        <span>{jourCourt(deClefJour(pesees[pesees.length - 1].jour))}</span>
      </div>
    </div>
  )
}
