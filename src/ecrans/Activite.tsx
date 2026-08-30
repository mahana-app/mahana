/* Les pas et le sommeil.

   Aucun site web n'a le droit de compter les pas en arrière-plan : c'est
   réservé aux applications installées depuis un magasin. On note donc le
   chiffre relevé sur Santé (iPhone) ou Google Fit (Android) — et l'app s'en
   sert pour le reste : anneaux, défis, moyennes. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import {
  clefJour,
  deClefJour,
  heuresMinutes,
  initialeJour,
  jourCourt,
  minutesEntre,
  septDerniersJours,
} from '../lib/dates'
import { useApp } from '../lib/etat'

export default function Activite({ fermer }: { fermer: () => void }) {
  const { etat, noterPas, noterNuit, supprimerNuit } = useApp()
  const aujourdhui = clefJour()
  const [pas, setPas] = useState('')
  const [coucher, setCoucher] = useState('22:00')
  const [lever, setLever] = useState('06:00')

  const semaine = septDerniersJours().map(({ date, clef }) => ({
    date,
    clef,
    pas: etat.pas[clef] ?? 0,
    nuit: etat.nuits.find((n) => n.jour === clef) ?? null,
  }))
  const maxPas = Math.max(etat.profil.butPas, ...semaine.map((j) => j.pas))
  const nuitsNotees = semaine.filter((j) => j.nuit)
  const moyenneSommeil = nuitsNotees.length
    ? nuitsNotees.reduce((t, j) => t + (j.nuit?.minutes ?? 0), 0) / nuitsNotees.length
    : 0

  return (
    <div className="page">
      <Entete kicker="Le reste de la journée" titre="Pas et sommeil" retour={fermer} />

      {/* ---------- les pas ---------- */}
      <div className="carte">
        <div className="rangee" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="kicker">Pas aujourd'hui</div>
            <div>
              <span className="chiffre" style={{ fontSize: 34 }}>
                {(etat.pas[aujourdhui] ?? 0).toLocaleString('fr-FR')}
              </span>
              <span className="doux" style={{ fontWeight: 700 }}>
                {' '}
                / {etat.profil.butPas.toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 30 }}>👟</div>
        </div>
        <div className="barre" style={{ marginTop: 12 }}>
          <i
            style={{
              width: `${Math.min(100, ((etat.pas[aujourdhui] ?? 0) / etat.profil.butPas) * 100)}%`,
              background: 'linear-gradient(120deg, #f6b45e, #f4886c)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <input
            className="champ"
            inputMode="numeric"
            placeholder="Nombre de pas"
            value={pas}
            onChange={(e) => setPas(e.target.value)}
          />
          <button
            type="button"
            className="bouton"
            style={{ width: 'auto', padding: '12px 20px' }}
            onClick={() => {
              const valeur = Number(pas)
              if (Number.isFinite(valeur) && valeur >= 0) {
                noterPas(valeur)
                setPas('')
              }
            }}
          >
            Noter
          </button>
        </div>
        <p className="doux mini" style={{ margin: '10px 0 0' }}>
          Le chiffre se relève dans <b>Santé</b> (iPhone) ou <b>Google Fit</b> (Android), qui
          comptent en permanence. Un site web n'y a pas droit — c'est une protection du téléphone,
          pas un oubli.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Les sept derniers jours</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 92, marginTop: 14 }}>
          {semaine.map(({ date, clef, pas: nombre }) => (
            <div key={clef} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: Math.max(5, (nombre / maxPas) * 60),
                  borderRadius: 8,
                  background:
                    nombre >= etat.profil.butPas
                      ? 'linear-gradient(180deg, #f6b45e, #f4886c)'
                      : 'var(--piste)',
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  fontWeight: 700,
                  color: clef === aujourdhui ? 'var(--menthe)' : 'var(--estompe)',
                }}
              >
                {initialeJour(date)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- le sommeil ---------- */}
      <div className="titre-section">Sommeil</div>

      <div className="carte">
        <div className="rangee">
          <div>
            <div className="kicker">Moyenne de la semaine</div>
            <div className="chiffre" style={{ fontSize: 30 }}>
              {moyenneSommeil ? heuresMinutes(moyenneSommeil) : '—'}
            </div>
            <div className="doux mini">
              Objectif : {heuresMinutes(etat.profil.butSommeilMin)}
            </div>
          </div>
          <div style={{ fontSize: 30 }}>🌙</div>
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Noter la nuit dernière</div>
        <div className="grille2" style={{ marginTop: 12 }}>
          <div>
            <label className="etiquette" htmlFor="coucher">
              Couchée à
            </label>
            <input
              id="coucher"
              type="time"
              className="champ"
              value={coucher}
              onChange={(e) => setCoucher(e.target.value)}
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="lever">
              Levée à
            </label>
            <input
              id="lever"
              type="time"
              className="champ"
              value={lever}
              onChange={(e) => setLever(e.target.value)}
            />
          </div>
        </div>
        <p className="doux mini" style={{ margin: '10px 0 12px' }}>
          Ça fait <b>{heuresMinutes(minutesEntre(coucher, lever))}</b> de sommeil.
        </p>
        <button type="button" className="bouton" onClick={() => noterNuit(coucher, lever)}>
          Enregistrer la nuit
        </button>
      </div>

      {etat.nuits.length > 0 && (
        <div className="carte">
          <div className="kicker">Les nuits notées</div>
          {[...etat.nuits].reverse().slice(0, 10).map((nuit) => (
            <div key={nuit.jour} className="ligne-liste">
              <div>
                <div style={{ fontWeight: 600 }}>{heuresMinutes(nuit.minutes)}</div>
                <div className="doux mini">
                  {jourCourt(deClefJour(nuit.jour))} · {nuit.coucher} → {nuit.lever}
                </div>
              </div>
              <button
                type="button"
                className="bouton-fin"
                style={{ padding: '4px 10px' }}
                aria-label="Supprimer cette nuit"
                onClick={() => supprimerNuit(nuit.jour)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
