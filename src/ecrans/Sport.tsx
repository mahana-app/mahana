/* Le sport : trois familles de séances, plus les sorties dehors suivies au GPS. */

import { useMemo, useState } from 'react'
import Entete from '../composants/Entete'
import { IconeFleche, IconeGps } from '../composants/Icones'
import { ajouterJours, clefJour, jourRelatif } from '../lib/dates'
import { useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { poidsActuel } from '../lib/profil'
import { FAMILLES, SEANCES, caloriesSeance } from '../lib/sport'
import { nombreFr } from '../lib/formats'

export default function Sport({ ouvrir, fermer }: { ouvrir: (vue: Vue) => void; fermer: () => void }) {
  const { etat, supprimerSeance } = useApp()
  const [famille, setFamille] = useState<string>('toutes')
  const poids = poidsActuel(etat) ?? 70

  const liste = SEANCES.filter((s) => famille === 'toutes' || s.categorie === famille)
  const faites = [...etat.seances].reverse().slice(0, 12)
  // Le premier jour de la fenêtre glissante, calculé une fois pour toutes.
  const [ilYASeptJours] = useState(() => clefJour(ajouterJours(new Date(), -6)))
  const semaine = useMemo(
    () => etat.seances.filter((s) => s.jour >= ilYASeptJours),
    [etat.seances, ilYASeptJours],
  )

  return (
    <div className="page">
      <Entete kicker="Bouger" titre="Séances" retour={fermer} ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      <div className="carte" style={{ background: 'var(--menthe-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Cette semaine</div>
            <div className="chiffre" style={{ fontSize: 26 }}>
              {semaine.reduce((t, s) => t + s.minutes, 0)} min
            </div>
            <div className="doux mini">
              {semaine.length} séance{semaine.length > 1 ? 's' : ''} ·{' '}
              {semaine.reduce((t, s) => t + s.kcal, 0)} kcal brûlées
            </div>
          </div>
          <div style={{ fontSize: 34 }}>🏅</div>
        </div>
      </div>

      {/* Sortir dehors : le chrono et le GPS */}
      <button
        type="button"
        className="carte"
        style={{
          width: '100%',
          border: 0,
          textAlign: 'left',
          background: 'linear-gradient(120deg, #34b795, #2f8fd0)',
          color: '#fff',
        }}
        onClick={() => ouvrir({ nom: 'sortie' })}
      >
        <div className="rangee">
          <div>
            <div className="kicker" style={{ color: 'rgba(255,255,255,.75)' }}>
              Dehors
            </div>
            <h2 style={{ fontSize: 19 }}>Marche, course, vélo</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
              Chrono et GPS : distance, allure et calories calculées toutes seules.
            </p>
          </div>
          <IconeGps taille={30} />
        </div>
      </button>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0 12px' }}>
        {[{ id: 'toutes', nom: 'Toutes' }, ...FAMILLES].map((f) => (
          <button
            key={f.id}
            type="button"
            className="pilule"
            style={
              famille === f.id
                ? { background: 'var(--encre)', color: '#fff', flex: '0 0 auto' }
                : { flex: '0 0 auto' }
            }
            onClick={() => setFamille(f.id)}
          >
            {f.nom}
          </button>
        ))}
      </div>

      {FAMILLES.filter((f) => famille === 'toutes' || famille === f.id).map((f) => (
        <div key={f.id}>
          <div className="titre-section" style={{ marginTop: 6 }}>
            {f.emoji} {f.nom} — <span style={{ color: 'var(--doux)', fontWeight: 500 }}>{f.detail}</span>
          </div>
          {liste
            .filter((s) => s.categorie === f.id)
            .map((seance) => (
              <button
                key={seance.id}
                type="button"
                className="carte serree"
                style={{ width: '100%', border: 0, textAlign: 'left' }}
                onClick={() => ouvrir({ nom: 'seance', id: seance.id })}
              >
                <div className="rangee">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 22,
                      background: 'var(--piste)',
                      flex: '0 0 auto',
                    }}
                  >
                    {seance.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{seance.nom}</div>
                    <div className="doux mini">{seance.sousTitre}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className="pilule">{seance.minutes} min</span>
                      <span className="pilule">
                        ≈ {caloriesSeance(seance.met, seance.minutes, poids)} kcal
                      </span>
                      <span className="pilule">{seance.niveau}</span>
                    </div>
                  </div>
                  <IconeFleche />
                </div>
              </button>
            ))}
        </div>
      ))}

      {faites.length > 0 && (
        <>
          <div className="titre-section">Ce que vous avez fait</div>
          <div className="carte">
            {faites.map((seance) => (
              <div key={seance.id} className="ligne-liste">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{seance.nom}</div>
                  <div className="doux mini">
                    {jourRelatif(new Date(seance.jour + 'T12:00'))} · {seance.minutes} min ·{' '}
                    {seance.kcal} kcal
                    {seance.distanceKm ? ` · ${nombreFr(seance.distanceKm, 2)} km` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label="Supprimer cette séance"
                  onClick={() => supprimerSeance(seance.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
