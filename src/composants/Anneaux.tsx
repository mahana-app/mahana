/* Trois anneaux emboîtés — manger, bouger, marcher — comme sur la maquette.
   Un coup d'œil suffit à voir ce qui manque à la journée. */

type Cercle = { part: number; couleur: string; nom: string }

export default function Anneaux({
  cercles,
  taille = 148,
  epaisseur = 13,
}: {
  cercles: [Cercle, Cercle, Cercle]
  taille?: number
  epaisseur?: number
}) {
  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} aria-hidden>
      <g transform={`rotate(-90 ${taille / 2} ${taille / 2})`}>
        {cercles.map((cercle, index) => {
          const rayon = taille / 2 - epaisseur / 2 - index * (epaisseur + 5)
          const tour = 2 * Math.PI * rayon
          const part = Math.min(1, Math.max(0, cercle.part))
          return (
            <g key={cercle.nom}>
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
                stroke={cercle.couleur}
                strokeWidth={epaisseur}
                strokeLinecap="round"
                strokeDasharray={tour}
                strokeDashoffset={tour * (1 - part)}
                style={{ transition: 'stroke-dashoffset .6s ease' }}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
