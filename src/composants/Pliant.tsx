/* Une carte qui se replie.

   Tout se consulte sur un téléphone : une liste de consignes qu'on relit deux
   fois par an ne doit pas repousser en bas de l'écran ce qu'on vient chercher
   tous les jours. Elle reste là, à un doigt, mais pliée. */

import { useState } from 'react'
import type { ReactNode } from 'react'
import Symbole from './Symbole'

export default function Pliant({
  titre,
  ouvertAuDepart = false,
  children,
}: {
  titre: string
  ouvertAuDepart?: boolean
  children: ReactNode
}) {
  const [ouvert, setOuvert] = useState(ouvertAuDepart)

  return (
    <div className="carte">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          width: '100%',
          background: 'none',
          border: 0,
          padding: 0,
          color: 'inherit',
          font: 'inherit',
          fontWeight: 700,
          textAlign: 'left',
          cursor: 'pointer',
        }}
        aria-expanded={ouvert}
      >
        {titre}
        <span
          style={{
            display: 'block',
            transform: `rotate(${ouvert ? 90 : 0}deg)`,
            transition: 'transform .15s',
          }}
        >
          <Symbole nom="fleche" taille={18} couleur="var(--estompe)" />
        </span>
      </button>
      {ouvert && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  )
}
