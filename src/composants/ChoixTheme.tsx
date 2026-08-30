/* Le choix de l'habillage.

   Chaque vignette porte son propre « data-theme » : elle est donc peinte avec
   les vraies variables du thème qu'elle propose, sans qu'aucune couleur soit
   recopiée ici. Ce qu'on voit dans l'aperçu est exactement ce qu'on aura. */

import { useApp } from '../lib/etat'
import type { Theme } from '../lib/stockage'

const THEMES: Array<{ id: Theme; nom: string; detail: string }> = [
  { id: 'argile', nom: 'Argile', detail: 'Sable, terre cuite et olive. Doux, clair, apaisant.' },
  { id: 'neon', nom: 'Néon', detail: 'Fond noir et couleurs électriques. Franc, sportif.' },
]

export default function ChoixTheme() {
  const { etat, reglerLe } = useApp()
  const actuel = etat.profil.theme ?? 'argile'

  return (
    <div className="grille2" style={{ marginTop: 10 }}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`choix${actuel === t.id ? ' actif' : ''}`}
          style={{ padding: 10, textAlign: 'left' }}
          onClick={() => reglerLe({ theme: t.id })}
          aria-pressed={actuel === t.id}
        >
          <Apercu theme={t.id} />
          <b style={{ fontSize: 15, display: 'block', marginTop: 8 }}>{t.nom}</b>
          <span className="doux mini" style={{ display: 'block', lineHeight: 1.45 }}>
            {t.detail}
          </span>
        </button>
      ))}
    </div>
  )
}

/* Une mini-page : le fond, une carte, un chiffre, une barre, trois pastilles. */
function Apercu({ theme }: { theme: Theme }) {
  return (
    <div
      data-theme={theme}
      aria-hidden="true"
      style={{
        background: 'var(--fond-page)',
        border: '1px solid var(--bord)',
        borderRadius: 12,
        padding: 8,
        height: 96,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: 'var(--carte-fond)',
          borderRadius: 8,
          padding: '6px 8px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 5,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--encre)',
            lineHeight: 1,
          }}
        >
          1 460
        </div>
        <div style={{ height: 5, borderRadius: 999, background: 'var(--piste)' }}>
          <div
            style={{ height: '100%', width: '62%', borderRadius: 999, background: 'var(--argile)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['var(--argile)', 'var(--olive)', 'var(--canard)', 'var(--miel)'].map((couleur) => (
            <span
              key={couleur}
              style={{ width: 9, height: 9, borderRadius: 999, background: couleur }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          height: 16,
          borderRadius: 999,
          background: 'var(--degrade-argile)',
          boxShadow: 'var(--ombre-argile)',
        }}
      />
    </div>
  )
}
