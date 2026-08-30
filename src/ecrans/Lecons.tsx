/* Les leçons : sept textes courts pour comprendre ce qu'on fait. */

import Entete from '../composants/Entete'
import { IconeFleche } from '../composants/Icones'
import { useApp } from '../lib/etat'
import { LECONS, leconParId } from '../lib/lecons'
import type { Vue } from '../lib/navigation'

export function ListeLecons({
  fermer,
  ouvrir,
}: {
  fermer: () => void
  ouvrir: (vue: Vue) => void
}) {
  const { etat } = useApp()
  const lues = etat.leconsLues.length

  return (
    <div className="page">
      <Entete kicker="Comprendre" titre="Les leçons" retour={fermer} />

      <div className="carte" style={{ background: 'var(--olive-pale)' }}>
        <div className="rangee">
          <div>
            <h2 style={{ fontSize: 17 }}>Sept leçons de cinq minutes</h2>
            <p className="doux mini" style={{ margin: '4px 0 0' }}>
              Comprendre pourquoi ça marche fait tenir plus longtemps que suivre des consignes.
            </p>
          </div>
          <span className="pilule menthe">
            {lues} / {LECONS.length}
          </span>
        </div>
      </div>

      {LECONS.map((lecon, index) => {
        const lue = etat.leconsLues.includes(lecon.id)
        return (
          <button
            key={lecon.id}
            type="button"
            className="carte serree"
            style={{ width: '100%', border: 0, textAlign: 'left' }}
            onClick={() => ouvrir({ nom: 'lecon', id: lecon.id })}
          >
            <div className="rangee">
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: lue ? 'var(--olive-pale)' : 'var(--piste)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  flex: '0 0 auto',
                }}
              >
                {lecon.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="kicker">
                  Leçon {index + 1} · {lecon.minutes} min {lue ? '· lue ✓' : ''}
                </div>
                <div style={{ fontWeight: 700 }}>{lecon.titre}</div>
                <div className="doux mini">{lecon.chapo}</div>
              </div>
              <IconeFleche />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function UneLecon({ id, fermer }: { id: string; fermer: () => void }) {
  const { etat, marquerLeconLue } = useApp()
  const lecon = leconParId(id)
  const index = LECONS.findIndex((l) => l.id === id)
  const suivante = LECONS[index + 1] ?? null

  if (!lecon) {
    return (
      <div className="page">
        <Entete kicker="Leçon" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  return (
    <div className="page">
      <Entete kicker={`Leçon ${index + 1} · ${lecon.minutes} min`} titre={lecon.titre} retour={fermer} />

      <div className="carte" style={{ background: 'var(--olive-pale)', textAlign: 'center' }}>
        <div style={{ fontSize: 42 }}>{lecon.emoji}</div>
        <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 15 }}>{lecon.chapo}</p>
      </div>

      <div className="carte">
        {lecon.paragraphes.map((paragraphe, i) => (
          <p
            key={i}
            style={{
              margin: i === 0 ? '0 0 14px' : '0 0 14px',
              lineHeight: 1.65,
              fontSize: 15.5,
            }}
          >
            {paragraphe}
          </p>
        ))}
      </div>

      {!etat.leconsLues.includes(lecon.id) && (
        <button type="button" className="bouton" onClick={() => marquerLeconLue(lecon.id)}>
          J'ai lu cette leçon
        </button>
      )}

      {suivante && (
        <>
          <div style={{ height: 10 }} />
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%' }}
            onClick={() => {
              marquerLeconLue(lecon.id)
              fermer()
            }}
          >
            Terminer
          </button>
        </>
      )}
    </div>
  )
}
