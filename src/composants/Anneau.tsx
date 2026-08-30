/* L'anneau de progression — la pièce qu'on retrouve sur presque tous les
   écrans : le jeûne, l'eau, les calories, la journée. */

import type { ReactNode } from 'react'
import { useId } from 'react'

type Props = {
  /** De 0 à 1. Au-delà de 1, l'anneau reste plein. */
  progression: number
  taille?: number
  epaisseur?: number
  /** Les deux couleurs du dégradé, du début à la fin de l'anneau. */
  couleurs?: [string, string]
  children?: ReactNode
}

export default function Anneau({
  progression,
  taille = 230,
  epaisseur = 17,
  couleurs = ['var(--argile-clair)', 'var(--argile-fonce)'],
  children,
}: Props) {
  const identifiant = useId().replace(/:/g, '')
  const rayon = (taille - epaisseur) / 2
  const tour = 2 * Math.PI * rayon
  const part = Math.min(1, Math.max(0, progression))

  return (
    <div style={{ position: 'relative', width: taille, height: taille, margin: '0 auto' }}>
      <svg width={taille} height={taille} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <defs>
          {/* L'anneau part de la droite du cercle (le haut, une fois tourné) :
              le dégradé suit ce sens pour que la couleur avance avec lui. */}
          <linearGradient id={identifiant} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={couleurs[0]} />
            <stop offset="100%" stopColor={couleurs[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke="var(--piste)"
          strokeWidth={epaisseur}
        />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke={`url(#${identifiant})`}
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={tour}
          strokeDashoffset={tour * (1 - part)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: epaisseur + 10,
        }}
      >
        {children}
      </div>
    </div>
  )
}
