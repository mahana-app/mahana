/* La sortie dehors : le chrono tourne, le GPS mesure la distance, et les
   calories se calculent avec le poids. À garder ouvert pendant l'effort —
   un site web ne peut pas suivre la position écran éteint. */

import { useEffect, useRef, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { chrono } from '../lib/dates'
import { useApp } from '../lib/etat'
import { useSuiviGps } from '../lib/gps'
import { poidsActuel } from '../lib/profil'
import { SORTIES, allure, caloriesSortie } from '../lib/sport'
import { nombreFr } from '../lib/formats'

export default function Sortie({ fermer }: { fermer: () => void }) {
  const { etat, noterSeance } = useApp()
  const poids = poidsActuel(etat) ?? 70
  const gps = useSuiviGps()

  const [type, setType] = useState(SORTIES[0])
  const [secondes, setSecondes] = useState(0)
  const [enMarche, setEnMarche] = useState(false)
  const [fini, setFini] = useState(false)
  const veilleEcran = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enMarche) return
    const battement = setInterval(() => setSecondes((v) => v + 1), 1000)
    return () => clearInterval(battement)
  }, [enMarche])

  // Empêcher l'écran de s'éteindre pendant l'effort, quand le navigateur
  // le permet : sinon le suivi s'arrête au bout d'une minute.
  useEffect(() => {
    if (!enMarche || !('wakeLock' in navigator)) return
    let annule = false
    navigator.wakeLock
      .request('screen')
      .then((verrou) => {
        if (annule) verrou.release()
        else veilleEcran.current = verrou
      })
      .catch(() => {
        /* refusé : tant pis, l'écran s'éteindra */
      })
    return () => {
      annule = true
      veilleEcran.current?.release().catch(() => {})
      veilleEcran.current = null
    }
  }, [enMarche])

  const kcal = caloriesSortie(type, gps.distanceKm, poids)

  function demarrer() {
    gps.demarrer()
    setEnMarche(true)
  }

  function mettreEnPause() {
    gps.arreter()
    setEnMarche(false)
  }

  function arreter() {
    gps.arreter()
    setEnMarche(false)
    setFini(true)
  }

  if (fini) {
    const minutes = Math.max(1, Math.round(secondes / 60))
    return (
      <div className="page">
        <Entete kicker="Sortie terminée" titre="Bien joué 🎉" retour={fermer} />
        <div className="carte" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--argile)' }}>
            <Symbole nom={type.icone} taille={50} epaisseur={1.3} />
          </div>
          <h2 style={{ fontSize: 21, marginTop: 4 }}>{type.nom}</h2>
          <div className="rangee" style={{ marginTop: 18 }}>
            <Bloc valeur={nombreFr(gps.distanceKm, 2)} legende="km" />
            <Bloc valeur={chrono(secondes * 1000)} legende="durée" />
            <Bloc valeur={String(kcal)} legende="kcal" />
          </div>
          <div className="doux mini" style={{ marginTop: 12 }}>
            Allure moyenne : {allure(gps.distanceKm, secondes)}
          </div>
        </div>
        <button
          type="button"
          className="bouton"
          onClick={() => {
            noterSeance({
              categorie: 'exterieur',
              nom: type.nom,
              minutes,
              kcal,
              distanceKm: Math.round(gps.distanceKm * 100) / 100,
            })
            fermer()
          }}
        >
          Enregistrer la sortie
        </button>
        <div style={{ height: 10 }} />
        <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={fermer}>
          Ne pas enregistrer
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <Entete kicker="Dehors" titre="Sortie" retour={fermer} />

      {!enMarche && secondes === 0 && (
        <div className="grille2" style={{ marginBottom: 16 }}>
          {SORTIES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`choix${type.id === s.id ? ' actif' : ''}`}
              onClick={() => setType(s)}
            >
              <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Symbole nom={s.icone} taille={20} couleur="var(--argile)" /> {s.nom}
              </b>
            </button>
          ))}
        </div>
      )}

      <div className="carte" style={{ textAlign: 'center', padding: '26px 18px' }}>
        <div className="kicker">Distance</div>
        <div className="chiffre" style={{ fontSize: 52, lineHeight: 1.1 }}>
          {nombreFr(gps.distanceKm, 2)}
          <span style={{ fontSize: 20, color: 'var(--doux)' }}> km</span>
        </div>
        <div className="rangee" style={{ marginTop: 20 }}>
          <Bloc valeur={chrono(secondes * 1000)} legende="durée" />
          <Bloc valeur={allure(gps.distanceKm, secondes)} legende="allure" />
          <Bloc valeur={String(kcal)} legende="kcal" />
        </div>
      </div>

      {gps.erreur && (
        <div className="carte" style={{ background: 'var(--miel-pale)' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--alerte)' }}>{gps.erreur}</p>
        </div>
      )}

      {enMarche ? (
        <>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="bouton-fin"
              style={{ flex: 1, padding: '15px' }}
              onClick={mettreEnPause}
            >
              ⏸ Pause
            </button>
            <button type="button" className="bouton corail" onClick={arreter}>
              Terminer
            </button>
          </div>
          <p className="doux mini" style={{ textAlign: 'center', marginTop: 14 }}>
            {gps.precision !== null
              ? `Signal GPS : ${gps.precision} m de précision`
              : 'Recherche du signal GPS…'}
            <br />
            Gardez l'écran allumé : un site web ne peut pas suivre la position en arrière-plan.
          </p>
        </>
      ) : (
        <>
          <button type="button" className="bouton" onClick={demarrer}>
            {secondes === 0 ? `Démarrer — ${type.nom.toLowerCase()}` : 'Reprendre'}
          </button>
          {secondes > 0 && (
            <>
              <div style={{ height: 10 }} />
              <button
                type="button"
                className="bouton-fin"
                style={{ width: '100%' }}
                onClick={arreter}
              >
                Terminer la sortie
              </button>
            </>
          )}
          {secondes === 0 && (
            <p className="doux mini" style={{ textAlign: 'center', marginTop: 14 }}>
              Le téléphone demandera l'autorisation d'utiliser votre position. Elle sert
              uniquement à mesurer la distance, et ne quitte pas l'appareil.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function Bloc({ valeur, legende }: { valeur: string; legende: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="chiffre" style={{ fontSize: 19 }}>
        {valeur}
      </div>
      <div className="doux mini">{legende}</div>
    </div>
  )
}
