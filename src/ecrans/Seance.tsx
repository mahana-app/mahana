/* Le lecteur de séance : un exercice à la fois, avec son minuteur et sa
   consigne. On avance quand on a fini — jamais avant. */

import { useEffect, useMemo, useState } from 'react'
import Anneau from '../composants/Anneau'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { chrono } from '../lib/dates'
import { useApp } from '../lib/etat'
import { poidsActuel } from '../lib/profil'
import type { Exercice } from '../lib/sport'
import { caloriesSeance, seanceParId } from '../lib/sport'

type Etape =
  | { type: 'travail'; exercice: Exercice; serie: number; total: number }
  | { type: 'repos'; secondes: number; suivant: string }

export default function EcranSeance({ id, fermer }: { id: string; fermer: () => void }) {
  const { etat, noterSeance } = useApp()
  const seance = seanceParId(id)
  const poids = poidsActuel(etat) ?? 70

  const etapes = useMemo<Etape[]>(() => {
    if (!seance) return []
    const liste: Etape[] = []
    seance.exercices.forEach((exercice, indexExercice) => {
      const series = exercice.series ?? 1
      for (let serie = 1; serie <= series; serie++) {
        liste.push({ type: 'travail', exercice, serie, total: series })
        const dernier = indexExercice === seance.exercices.length - 1 && serie === series
        if (exercice.repos > 0 && !dernier) {
          const suivant =
            serie < series ? exercice.nom : (seance.exercices[indexExercice + 1]?.nom ?? '')
          liste.push({ type: 'repos', secondes: exercice.repos, suivant })
        }
      }
    })
    return liste
  }, [seance])

  const [index, setIndex] = useState(0)
  const [restant, setRestant] = useState(0)
  const [enMarche, setEnMarche] = useState(false)
  const [debut] = useState(() => Date.now())
  const [fini, setFini] = useState(false)

  const etape = etapes[index]

  // Le minuteur de l'étape en cours : durée imposée pour un exercice tenu,
  // ou pour un repos. Les exercices comptés en répétitions n'en ont pas.
  useEffect(() => {
    if (!etape) return
    const secondes = etape.type === 'repos' ? etape.secondes : (etape.exercice.secondes ?? 0)
    setRestant(secondes)
    setEnMarche(secondes > 0)
  }, [etape])

  useEffect(() => {
    if (!enMarche || restant <= 0) return
    const battement = setInterval(() => setRestant((v) => v - 1), 1000)
    return () => clearInterval(battement)
  }, [enMarche, restant])

  useEffect(() => {
    if (enMarche && restant === 0) avancer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restant, enMarche])

  function avancer() {
    setEnMarche(false)
    if (index + 1 >= etapes.length) setFini(true)
    else setIndex(index + 1)
  }

  if (!seance) {
    return (
      <div className="page">
        <Entete kicker="Séance" titre="Introuvable" retour={fermer} />
        <p className="vide">Cette séance n'existe plus.</p>
      </div>
    )
  }

  /* ---------- l'écran de fin ---------- */
  if (fini) {
    const minutes = Math.max(1, Math.round((Date.now() - debut) / 60000))
    const kcal = caloriesSeance(seance.met, minutes, poids)
    return (
      <div className="page">
        <Entete kicker="Terminé" titre="Bravo 🎉" retour={fermer} />
        <div className="carte" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--argile)' }}>
            <Symbole
              nom={
                seance.categorie === 'cardio' ? 'coeur' : seance.categorie === 'pilates' ? 'lotus' : 'sport'
              }
              taille={54}
              epaisseur={1.3}
            />
          </div>
          <h2 style={{ fontSize: 21, marginTop: 6 }}>{seance.nom}</h2>
          <div className="rangee" style={{ marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <div className="chiffre" style={{ fontSize: 26 }}>
                {minutes}
              </div>
              <div className="doux mini">minutes</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="chiffre" style={{ fontSize: 26 }}>
                {kcal}
              </div>
              <div className="doux mini">kcal brûlées</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="chiffre" style={{ fontSize: 26 }}>
                {seance.exercices.length}
              </div>
              <div className="doux mini">exercices</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="bouton"
          onClick={() => {
            noterSeance({
              categorie: seance.categorie,
              nom: seance.nom,
              minutes,
              kcal,
            })
            fermer()
          }}
        >
          Enregistrer la séance
        </button>
        <div style={{ height: 10 }} />
        <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={fermer}>
          Ne pas enregistrer
        </button>
      </div>
    )
  }

  /* ---------- la séance en cours ---------- */
  const progression = index / etapes.length
  const dureeEtape = etape.type === 'repos' ? etape.secondes : (etape.exercice.secondes ?? 0)

  return (
    <div className="page">
      <Entete
        kicker={`${index + 1} sur ${etapes.length}`}
        titre={seance.nom}
        retour={() => {
          if (confirm('Quitter la séance ? Elle ne sera pas enregistrée.')) fermer()
        }}
      />

      <div className="barre" style={{ marginBottom: 18 }}>
        <i style={{ width: `${progression * 100}%` }} />
      </div>

      {etape.type === 'repos' ? (
        <>
          <Anneau
            progression={dureeEtape ? 1 - restant / dureeEtape : 0}
            couleurs={['#386874', '#274c57']}
          >
            <div className="kicker">Repos</div>
            <div className="chiffre" style={{ fontSize: 44 }}>
              {restant}
            </div>
            <div className="doux mini">secondes</div>
          </Anneau>
          <div className="carte" style={{ marginTop: 18, textAlign: 'center' }}>
            <div className="kicker">Ensuite</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4 }}>{etape.suivant}</div>
          </div>
          <button type="button" className="bouton" onClick={avancer}>
            Passer le repos
          </button>
        </>
      ) : (
        <>
          <Anneau
            progression={dureeEtape ? 1 - restant / dureeEtape : 0}
            couleurs={['#c96a43', '#a54f2e']}
          >
            {dureeEtape ? (
              <>
                <div className="kicker">Il reste</div>
                <div className="chiffre" style={{ fontSize: 40 }}>
                  {chrono(restant * 1000).slice(3)}
                </div>
              </>
            ) : (
              <>
                <div className="kicker">À faire</div>
                <div className="chiffre" style={{ fontSize: 40 }}>
                  {etape.exercice.reps}
                </div>
                <div className="doux mini">répétitions</div>
              </>
            )}
          </Anneau>

          <div className="carte" style={{ marginTop: 18 }}>
            <div className="rangee">
              <h2 style={{ fontSize: 19 }}>{etape.exercice.nom}</h2>
              {etape.total > 1 && (
                <span className="pilule menthe">
                  Série {etape.serie}/{etape.total}
                </span>
              )}
            </div>
            <p className="doux" style={{ margin: '8px 0 0' }}>
              {etape.exercice.consigne}
            </p>
          </div>

          {dureeEtape ? (
            <>
              <button type="button" className="bouton" onClick={() => setEnMarche(!enMarche)}>
                {enMarche ? '⏸  Mettre en pause' : '▶  Reprendre'}
              </button>
              <div style={{ height: 10 }} />
              <button
                type="button"
                className="bouton-fin"
                style={{ width: '100%' }}
                onClick={avancer}
              >
                Passer cet exercice
              </button>
            </>
          ) : (
            <button type="button" className="bouton" onClick={avancer}>
              C'est fait ✓
            </button>
          )}
        </>
      )}
    </div>
  )
}
