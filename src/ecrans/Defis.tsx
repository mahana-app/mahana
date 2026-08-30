/* Les défis et les habitudes.

   Un défi dure sept jours : il casse une envie. Une habitude dure vingt et un
   jours : elle l'installe. On n'en tient qu'un de chaque à la fois — c'est
   justement pour ça qu'on les tient. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { clefJour, deClefJour, jourCourt } from '../lib/dates'
import {
  DEFIS,
  defiParId,
  jourNumero,
  jourValide,
  joursDuDefi,
  joursTenus,
  valideToutSeul,
} from '../lib/defis'
import { useApp } from '../lib/etat'
import {
  DUREE_HABITUDE,
  HABITUDES,
  habitudeParId,
  jourNumeroHabitude,
  joursDeLHabitude,
} from '../lib/habitudes'

export default function Defis({ fermer }: { fermer: () => void }) {
  const [vue, setVue] = useState<'defis' | 'habitudes'>('defis')

  return (
    <div className="page">
      <Entete kicker="Tenir" titre="Défis et habitudes" retour={fermer} />

      <div className="carte serree" style={{ padding: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(
            [
              ['defis', 'Défis · 7 jours'],
              ['habitudes', 'Habitudes · 21 jours'],
            ] as const
          ).map(([id, nom]) => (
            <button
              key={id}
              type="button"
              onClick={() => setVue(id)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 999,
                border: 0,
                fontWeight: 700,
                fontSize: 13.5,
                background: vue === id ? 'var(--degrade-argile)' : 'transparent',
                color: vue === id ? 'var(--sur-accent)' : 'var(--doux)',
              }}
            >
              {nom}
            </button>
          ))}
        </div>
      </div>

      {vue === 'defis' ? <PartieDefis /> : <PartieHabitudes />}
    </div>
  )
}

/* ---------- les défis de sept jours ---------- */

function PartieDefis() {
  const { etat, lancerDefi, cocherJour, arreterDefi } = useApp()
  const encours = etat.defiEnCours
  const defi = encours ? defiParId(encours.defiId) : null
  const aujourdhui = clefJour()

  if (encours && defi) {
    const auto = valideToutSeul(encours.defiId, etat, aujourdhui) !== null
    return (
      <>
        <div className="carte" style={{ borderTop: `4px solid ${defi.couleur}` }}>
          <div className="rangee">
            <div style={{ minWidth: 0 }}>
              <div className="kicker">Jour {jourNumero(encours.debut)} sur 7</div>
              <h2 style={{ fontSize: 19, marginTop: 2 }}>
                {defi.emoji} {defi.nom}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="chiffre" style={{ fontSize: 26, color: defi.couleur }}>
                {joursTenus(etat)}
              </div>
              <div className="doux mini">tenus</div>
            </div>
          </div>

          <p className="doux" style={{ margin: '10px 0 0' }}>
            {defi.promesse}
          </p>

          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {joursDuDefi(encours.debut).map((jour) => {
              const tenu = jourValide(etat, jour)
              const passe = jour < aujourdhui
              const futur = jour > aujourdhui
              return (
                <button
                  key={jour}
                  type="button"
                  disabled={futur || auto}
                  onClick={() => cocherJour(jour)}
                  title={jourCourt(deClefJour(jour))}
                  style={{
                    flex: 1,
                    aspectRatio: '1',
                    borderRadius: 14,
                    border: jour === aujourdhui ? `2px solid ${defi.couleur}` : '2px solid transparent',
                    background: tenu ? defi.couleur : passe ? 'var(--miel-pale)' : 'var(--piste)',
                    color: tenu ? 'var(--sur-accent)' : 'var(--estompe)',
                    fontWeight: 800,
                    fontSize: 13,
                    opacity: futur ? 0.55 : 1,
                  }}
                >
                  {tenu ? '✓' : passe ? '✕' : deClefJour(jour).getDate()}
                </button>
              )
            })}
          </div>

          {auto ? (
            <p className="doux mini" style={{ margin: '12px 0 0' }}>
              Ce défi se coche tout seul : l'app le vérifie avec ce que vous notez déjà.
            </p>
          ) : (
            <button
              type="button"
              className={jourValide(etat, aujourdhui) ? 'bouton-fin' : 'bouton'}
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => cocherJour(aujourdhui)}
            >
              {jourValide(etat, aujourdhui) ? '✅  Journée tenue — annuler' : "Je l'ai tenu aujourd'hui"}
            </button>
          )}
        </div>

        <div className="carte">
          <div className="kicker">Pourquoi ça marche</div>
          <p className="doux" style={{ margin: '6px 0 0' }}>
            {defi.pourquoi}
          </p>
        </div>

        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', color: 'var(--miel)' }}
          onClick={() => {
            if (confirm('Abandonner ce défi ? Il ne comptera pas dans le palmarès.')) arreterDefi()
          }}
        >
          Abandonner le défi
        </button>

        <Palmares />
      </>
    )
  }

  return (
    <>
      <div className="carte" style={{ background: 'var(--olive-pale)' }}>
        <h2 style={{ fontSize: 17 }}>Un défi, sept jours</h2>
        <p className="doux" style={{ margin: '6px 0 0' }}>
          Sept jours, c'est assez court pour ne pas craquer et assez long pour que l'envie passe.
          Choisissez celui de cette semaine.
        </p>
      </div>

      {DEFIS.map((d) => (
        <button
          key={d.id}
          type="button"
          className="carte serree"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => {
            if (confirm(`Lancer « ${d.nom} » pour les sept prochains jours ?`)) lancerDefi(d.id)
          }}
        >
          <div className="rangee">
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                fontSize: 21,
                background: 'var(--piste)',
                flex: '0 0 auto',
              }}
            >
              {d.emoji}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{d.nom}</div>
              <div className="doux mini">{d.promesse}</div>
            </div>
          </div>
        </button>
      ))}

      <Palmares />
    </>
  )
}

/* ---------- les habitudes de vingt et un jours ---------- */

function PartieHabitudes() {
  const { etat, lancerHabitude, cocherHabitude, arreterHabitude } = useApp()
  const encours = etat.habitudeEnCours
  const habitude = encours ? habitudeParId(encours.habitudeId) : null
  const aujourdhui = clefJour()

  if (encours && habitude) {
    const jours = joursDeLHabitude(encours.debut)
    return (
      <>
        <div className="carte" style={{ borderTop: `4px solid ${habitude.couleur}` }}>
          <div className="rangee">
            <div style={{ minWidth: 0 }}>
              <div className="kicker">
                Jour {jourNumeroHabitude(encours.debut)} sur {DUREE_HABITUDE}
              </div>
              <h2 style={{ fontSize: 19, marginTop: 2 }}>
                {habitude.emoji} {habitude.nom}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="chiffre" style={{ fontSize: 26, color: habitude.couleur }}>
                {encours.coches.length}
              </div>
              <div className="doux mini">tenus</div>
            </div>
          </div>

          <p className="doux" style={{ margin: '10px 0 0' }}>
            {habitude.promesse}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
              marginTop: 16,
            }}
          >
            {jours.map((jour) => {
              const tenu = encours.coches.includes(jour)
              const futur = jour > aujourdhui
              return (
                <button
                  key={jour}
                  type="button"
                  disabled={futur}
                  onClick={() => cocherHabitude(jour)}
                  title={jourCourt(deClefJour(jour))}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border:
                      jour === aujourdhui ? `2px solid ${habitude.couleur}` : '2px solid transparent',
                    background: tenu ? habitude.couleur : 'var(--piste)',
                    color: tenu ? 'var(--sur-accent)' : 'var(--estompe)',
                    fontWeight: 800,
                    fontSize: 11,
                    opacity: futur ? 0.45 : 1,
                  }}
                >
                  {tenu ? '✓' : deClefJour(jour).getDate()}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className={encours.coches.includes(aujourdhui) ? 'bouton-fin' : 'bouton'}
            style={{ width: '100%', marginTop: 16 }}
            onClick={() => cocherHabitude(aujourdhui)}
          >
            {encours.coches.includes(aujourdhui)
              ? '✅  Journée tenue — annuler'
              : "Je l'ai fait aujourd'hui"}
          </button>
        </div>

        <div className="carte">
          <div className="kicker">Pourquoi ça marche</div>
          <p className="doux" style={{ margin: '6px 0 0' }}>
            {habitude.pourquoi}
          </p>
        </div>

        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', color: 'var(--miel)' }}
          onClick={() => {
            if (confirm('Abandonner cette habitude ?')) arreterHabitude()
          }}
        >
          Abandonner l'habitude
        </button>
      </>
    )
  }

  return (
    <>
      <div className="carte" style={{ background: 'var(--canard-pale)' }}>
        <h2 style={{ fontSize: 17 }}>Une habitude, vingt et un jours</h2>
        <p className="doux" style={{ margin: '6px 0 0' }}>
          Trois semaines, c'est le temps qu'il faut pour qu'un geste devienne automatique. Une
          seule à la fois, la plus facile d'abord.
        </p>
      </div>

      {HABITUDES.map((h) => (
        <button
          key={h.id}
          type="button"
          className="carte serree"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => {
            if (confirm(`Commencer « ${h.nom} » pour vingt et un jours ?`)) lancerHabitude(h.id)
          }}
        >
          <div className="rangee">
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                fontSize: 21,
                background: 'var(--piste)',
                flex: '0 0 auto',
              }}
            >
              {h.emoji}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{h.nom}</div>
              <div className="doux mini">{h.promesse}</div>
            </div>
          </div>
        </button>
      ))}

      {etat.habitudesFinies.length > 0 && (
        <>
          <div className="titre-section">Habitudes installées</div>
          <div className="carte">
            {[...etat.habitudesFinies].reverse().map((finie, index) => {
              const h = habitudeParId(finie.habitudeId)
              return (
                <div key={`${finie.habitudeId}-${index}`} className="ligne-liste">
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {h?.emoji} {h?.nom ?? finie.habitudeId}
                    </div>
                    <div className="doux mini">Depuis le {jourCourt(deClefJour(finie.debut))}</div>
                  </div>
                  <span className={`pilule ${finie.reussis >= 18 ? 'menthe' : 'ambre'}`}>
                    {finie.reussis} / {DUREE_HABITUDE}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

function Palmares() {
  const { etat } = useApp()
  if (etat.defisFinis.length === 0) return null
  return (
    <>
      <div className="titre-section">Palmarès</div>
      <div className="carte">
        {[...etat.defisFinis].reverse().map((fini, index) => {
          const d = defiParId(fini.defiId)
          return (
            <div key={`${fini.defiId}-${index}`} className="ligne-liste">
              <div>
                <div style={{ fontWeight: 600 }}>
                  {d?.emoji} {d?.nom ?? fini.defiId}
                </div>
                <div className="doux mini">Semaine du {jourCourt(deClefJour(fini.debut))}</div>
              </div>
              <span className={`pilule ${fini.reussis === 7 ? 'menthe' : 'ambre'}`}>
                {fini.reussis === 7 ? '🏆 7/7' : `${fini.reussis}/7`}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}
