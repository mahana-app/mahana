/* Les défis : une seule règle, sept jours. Un à la fois — c'est justement
   parce qu'il n'y en a qu'un qu'on le tient. */

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
import type { Vue } from '../lib/navigation'

export default function Defis({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { etat, lancerDefi, cocherJour, arreterDefi } = useApp()
  const encours = etat.defiEnCours
  const defi = encours ? defiParId(encours.defiId) : null
  const aujourdhui = clefJour()

  return (
    <div className="page">
      <Entete kicker="Une semaine" titre="Mes défis" ouvrirReglages={() => ouvrir({ nom: 'reglages' })} />

      {encours && defi ? (
        <>
          <div className="carte" style={{ borderTop: `4px solid ${defi.couleur}` }}>
            <div className="rangee">
              <div style={{ minWidth: 0 }}>
                <div className="kicker">Jour {jourNumero(encours.debut)} sur 7</div>
                <h2 style={{ fontSize: 20, marginTop: 2 }}>
                  {defi.emoji} {defi.nom}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="chiffre" style={{ fontSize: 28, color: defi.couleur }}>
                  {joursTenus(etat)}
                </div>
                <div className="doux mini">tenus</div>
              </div>
            </div>

            <p className="doux" style={{ margin: '10px 0 0' }}>
              {defi.promesse}
            </p>

            {/* Les sept journées : une pastille par jour. */}
            <div style={{ display: 'flex', gap: 7, marginTop: 16 }}>
              {joursDuDefi(encours.debut).map((jour) => {
                const tenu = jourValide(etat, jour)
                const passe = jour < aujourdhui
                const futur = jour > aujourdhui
                const auto = valideToutSeul(encours.defiId, etat, jour) !== null
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
                      background: tenu ? defi.couleur : passe ? 'var(--corail-pale)' : 'var(--piste)',
                      color: tenu ? '#fff' : 'var(--estompe)',
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

            {valideToutSeul(encours.defiId, etat, aujourdhui) !== null ? (
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
                {jourValide(etat, aujourdhui)
                  ? '✅  Journée tenue — annuler'
                  : "Je l'ai tenu aujourd'hui"}
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
            style={{ width: '100%', color: 'var(--corail)' }}
            onClick={() => {
              if (confirm('Abandonner ce défi ? Il ne comptera pas dans le palmarès.')) arreterDefi()
            }}
          >
            Abandonner le défi
          </button>
        </>
      ) : (
        <>
          <div className="carte" style={{ background: 'var(--menthe-pale)' }}>
            <h2 style={{ fontSize: 18 }}>Un défi, sept jours</h2>
            <p className="doux" style={{ margin: '6px 0 0' }}>
              On n'en tient qu'un à la fois. Sept jours, c'est assez court pour ne pas craquer, et
              assez long pour que l'habitude prenne. Choisissez celui de cette semaine.
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
                <div
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
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{d.nom}</div>
                  <div className="doux mini">{d.promesse}</div>
                </div>
              </div>
            </button>
          ))}
        </>
      )}

      {etat.defisFinis.length > 0 && (
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
                    <div className="doux mini">
                      Semaine du {jourCourt(deClefJour(fini.debut))}
                    </div>
                  </div>
                  <span className={`pilule ${fini.reussis === 7 ? 'menthe' : 'ambre'}`}>
                    {fini.reussis === 7 ? '🏆 7/7' : `${fini.reussis}/7`}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
