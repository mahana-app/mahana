/* La demi-jauge des calories, comme sur la maquette : le chiffre qui compte
   au milieu, ce qui est entré à gauche, ce qui est sorti à droite. */

import { useId } from 'react'

export default function JaugeDemi({
  part,
  centre,
  legendeCentre,
  gauche,
  legendeGauche,
  droite,
  legendeDroite,
  couleurs = ['var(--argile)', 'var(--olive)'],
}: {
  /** De 0 à 1. */
  part: number
  centre: string
  legendeCentre: string
  gauche?: string
  legendeGauche?: string
  droite?: string
  legendeDroite?: string
  couleurs?: [string, string]
}) {
  const identifiant = useId().replace(/:/g, '')
  const largeur = 200
  const hauteur = 110
  const rayon = 82
  const epaisseur = 13
  const cx = largeur / 2
  const cy = hauteur - 12
  // Un demi-cercle : sa longueur est la moitié du tour complet.
  const demiTour = Math.PI * rayon
  const avance = Math.min(1, Math.max(0, part))

  const arc = `M ${cx - rayon} ${cy} A ${rayon} ${rayon} 0 0 1 ${cx + rayon} ${cy}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      {gauche !== undefined && (
        <div style={{ textAlign: 'center', minWidth: 58 }}>
          <div className="chiffre" style={{ fontSize: 17 }}>
            {gauche}
          </div>
          <div className="doux mini">{legendeGauche}</div>
        </div>
      )}

      <div style={{ position: 'relative', width: largeur, height: hauteur, flex: '0 0 auto' }}>
        <svg width={largeur} height={hauteur} aria-hidden>
          <defs>
            <linearGradient id={identifiant} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={couleurs[0]} />
              <stop offset="100%" stopColor={couleurs[1]} />
            </linearGradient>
          </defs>
          <path d={arc} fill="none" stroke="var(--piste)" strokeWidth={epaisseur} strokeLinecap="round" />
          <path
            d={arc}
            fill="none"
            stroke={`url(#${identifiant})`}
            strokeWidth={epaisseur}
            strokeLinecap="round"
            strokeDasharray={demiTour}
            strokeDashoffset={demiTour * (1 - avance)}
            style={{ transition: 'stroke-dashoffset .6s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 14,
            textAlign: 'center',
          }}
        >
          <div className="chiffre" style={{ fontSize: 30, lineHeight: 1.1 }}>
            {centre}
          </div>
          <div className="doux mini">{legendeCentre}</div>
        </div>
      </div>

      {droite !== undefined && (
        <div style={{ textAlign: 'center', minWidth: 58 }}>
          <div className="chiffre" style={{ fontSize: 17 }}>
            {droite}
          </div>
          <div className="doux mini">{legendeDroite}</div>
        </div>
      )}
    </div>
  )
}
