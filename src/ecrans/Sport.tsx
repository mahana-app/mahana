/* Le sport : trois familles de séances, plus les sorties dehors suivies au GPS. */

import { useMemo, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { IconeFleche, IconeGps } from '../composants/Icones'
import { ajouterJours, clefJour, jourRelatif } from '../lib/dates'
import { useApp } from '../lib/etat'
import type { Vue } from '../lib/navigation'
import { poidsActuel } from '../lib/profil'
import { FAMILLES, SEANCES, caloriesSeance, joursFaits, prochainJour, symboleFamille } from '../lib/sport'
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

      <div className="carte" style={{ background: 'var(--olive-pale)' }}>
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
          <Symbole nom="medaille" taille={32} couleur="var(--argile)" />
        </div>
      </div>

      {/* Noter une séance faite ailleurs */}
      <button
        type="button"
        className="bouton"
        style={{ marginBottom: 14 }}
        onClick={() => ouvrir({ nom: 'noter-seance' })}
      >
        + Noter une séance que j'ai faite
      </button>

      {/* Les programmes suivis */}
      <div className="rangee" style={{ margin: '18px 4px 10px' }}>
        <span className="titre-section" style={{ margin: 0 }}>
          Mes programmes
        </span>
        <button type="button" className="pilule" onClick={() => ouvrir({ nom: 'nouveau-programme' })}>
          + Nouveau
        </button>
      </div>

      {etat.programmes.length === 0 ? (
        <button
          type="button"
          className="carte"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => ouvrir({ nom: 'nouveau-programme' })}
        >
          <div className="rangee">
            <div>
              <div style={{ fontWeight: 600 }}>Suivre un programme</div>
              <p className="doux mini" style={{ margin: '4px 0 0' }}>
                Un défi en vidéo, un plan de salle, un cours — l'app compte les jours faits et
                garde la trace de chaque séance.
              </p>
            </div>
            <IconeFleche />
          </div>
        </button>
      ) : (
        etat.programmes.map((programme) => {
          const faits = joursFaits(programme.id, etat.seances).size
          const famille = FAMILLES.find((f) => f.id === programme.categorie)
          return (
            <button
              key={programme.id}
              type="button"
              className="carte serree"
              style={{ width: '100%', border: 0, textAlign: 'left', opacity: programme.termine ? 0.6 : 1 }}
              onClick={() => ouvrir({ nom: 'programme', id: programme.id })}
            >
              <div className="rangee">
                <span
                  className="pastille"
                  style={{ width: 44, height: 44, background: 'var(--piste)', color: famille?.couleur }}
                >
                  <Symbole nom={symboleFamille(programme.categorie)} taille={21} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{programme.nom}</div>
                  <div className="doux mini">
                    {programme.termine
                      ? 'Terminé'
                      : `Jour ${Math.min(prochainJour(programme.id, etat.seances), programme.jours)} sur ${programme.jours}`}
                    {programme.avec ? ` · avec ${programme.avec}` : ''}
                  </div>
                  <div className="barre" style={{ marginTop: 8, height: 5 }}>
                    <i style={{ width: `${(faits / programme.jours) * 100}%` }} />
                  </div>
                </div>
                <IconeFleche />
              </div>
            </button>
          )
        })
      )}

      {/* Sortir dehors : le chrono et le GPS */}
      <button
        type="button"
        className="carte"
        style={{
          width: '100%',
          border: 0,
          textAlign: 'left',
          background: 'linear-gradient(120deg, var(--canard-clair), var(--canard-fonce))',
          color: 'var(--sur-accent)',
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
                ? { background: 'var(--actif-fond)', color: 'var(--actif-texte)', flex: '0 0 auto' }
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, verticalAlign: 'middle' }}>
              <Symbole nom={f.icone} taille={20} couleur={f.couleur} /> {f.nom}
            </span>
            <span style={{ color: 'var(--doux)', fontWeight: 400, fontSize: 15 }}> — {f.detail}</span>
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
                      background: 'var(--piste)',
                      flex: '0 0 auto',
                      color: 'var(--doux)',
                    }}
                  >
                    <Symbole nom={f.icone} taille={22} />
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
                    {seance.parties?.length ? ` · ${seance.parties.join(', ')}` : ''}
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
