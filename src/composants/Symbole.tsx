/* Les symboles de l'app, tous dessinés au trait, dans le même esprit que le
   logo : un cercle, une courbe, rien de plus. Aucune bibliothèque à charger,
   et surtout une famille cohérente — c'est ce qui fait qu'une app a l'air
   dessinée plutôt qu'assemblée. */

import type { JSX } from 'react'

export type NomSymbole =
  | 'soleil'
  | 'petit-dejeuner'
  | 'dejeuner'
  | 'diner'
  | 'encas'
  | 'eau'
  | 'pas'
  | 'jeune'
  | 'score'
  | 'sommeil'
  | 'sport'
  | 'flamme'
  | 'poids'
  | 'defi'
  | 'habitude'
  | 'recette'
  | 'lecon'
  | 'coeur'
  | 'lotus'
  | 'marche'
  | 'course'
  | 'velo'
  | 'montagne'
  | 'gps'
  | 'legume'
  | 'assiette'
  | 'batterie'
  | 'etincelle'
  | 'renouveau'
  | 'medaille'
  | 'photo'

const TRACES: Record<NomSymbole, JSX.Element> = {
  /* le logo : le soleil sur l'eau */
  soleil: (
    <>
      <circle cx="12" cy="8.6" r="3.4" />
      <path d="M4 15.2Q12 11.4 20 15.2" />
      <path d="M5.6 19.2q2.1-1.6 4.2 0t4.2 0 4.2 0" />
    </>
  ),
  'petit-dejeuner': (
    <>
      <path d="M6.4 16a5.6 5.6 0 0 1 11.2 0" />
      <path d="M3 16h18" />
      <path d="M12 4.5v2.2M6.9 7l1.4 1.5M17.1 7l-1.4 1.5" />
    </>
  ),
  dejeuner: (
    <>
      <path d="M7 3v6a1.7 1.7 0 0 0 3.4 0V3M8.7 9v12" />
      <path d="M16.6 3c-1.2 1.5-1.8 3-1.8 5 0 1.4.7 2.2 1.8 2.2s1.8-.8 1.8-2.2c0-2-.6-3.5-1.8-5z" />
      <path d="M16.6 10.2V21" />
    </>
  ),
  diner: <path d="M20 14.6A8.6 8.6 0 0 1 9.4 4 8.6 8.6 0 1 0 20 14.6z" />,
  encas: (
    <>
      <circle cx="12" cy="14.2" r="6.4" />
      <path d="M12 7.8V5.2" />
      <path d="M12 7.6c0-2 1.6-3.4 3.6-3.4 0 2-1.6 3.4-3.6 3.4z" />
    </>
  ),
  eau: <path d="M12 3.2s5.8 6.3 5.8 10A5.8 5.8 0 0 1 6.2 13.2c0-3.7 5.8-10 5.8-10z" />,
  pas: (
    <>
      <ellipse cx="8" cy="8" rx="3.2" ry="4.6" transform="rotate(-14 8 8)" />
      <ellipse cx="16" cy="15.4" rx="3.2" ry="4.6" transform="rotate(14 16 15.4)" />
    </>
  ),
  jeune: (
    <>
      <circle cx="12" cy="13.2" r="7.8" />
      <path d="M12 9.4v3.8l2.4 1.9" />
      <path d="M9.2 2.6h5.6" />
    </>
  ),
  score: (
    <path d="M12 3.6l2.5 5.4 5.9.8-4.3 4.1 1.1 5.8-5.2-2.8-5.2 2.8 1.1-5.8-4.3-4.1 5.9-.8z" />
  ),
  sommeil: (
    <>
      <path d="M20.5 15.4A8 8 0 0 1 10.6 5.5 8 8 0 1 0 20.5 15.4z" />
      <path d="M15.8 3.4h4.4l-4.4 5h4.4" />
    </>
  ),
  sport: (
    <>
      <path d="M2.8 9.2v5.6M21.2 9.2v5.6" />
      <path d="M6.6 6.6v10.8M17.4 6.6v10.8" />
      <path d="M6.6 12h10.8" />
    </>
  ),
  flamme: (
    <path d="M12 2.8c2.9 4 4.8 5.6 4.8 9a4.8 4.8 0 0 1-9.6 0c0-1.9.9-3 1.9-4.4.5 1.5 1.4 2 2.4 2 .5-2-1-4-1.5-6.6z" />
  ),
  poids: (
    <>
      <path d="M4.5 20.5h15l-1.4-13H5.9z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  defi: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="0.9" />
    </>
  ),
  habitude: (
    <>
      <path d="M12 21V8.4" />
      <path d="M12 14.4c-3.6 0-5.5-2.4-5.5-5.1 3.3 0 5.5 1.9 5.5 5.1z" />
      <path d="M12 11.2c3.6 0 5.5-2.4 5.5-5.1-3.3 0-5.5 1.9-5.5 5.1z" />
    </>
  ),
  recette: (
    <>
      <path d="M3.6 11.4h16.8a8.4 8.4 0 0 1-16.8 0z" />
      <path d="M2.4 20.2h19.2" />
      <path d="M9.4 7.6c0-1.2 1.2-1.6 1.2-2.8M14 7.6c0-1.2 1.2-1.6 1.2-2.8" />
    </>
  ),
  lecon: (
    <>
      <path d="M4 4.4h5.6a2.8 2.8 0 0 1 2.8 2.8v12.4a2.4 2.4 0 0 0-2.4-2.4H4z" />
      <path d="M20 4.4h-5.6a2.8 2.8 0 0 0-2.8 2.8v12.4a2.4 2.4 0 0 1 2.4-2.4H20z" />
    </>
  ),
  coeur: (
    <path d="M12 20.2s-7.2-4.6-7.2-9.6A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.2 3.2c0 5-7.2 9.6-7.2 9.6z" />
  ),
  lotus: (
    <>
      <path d="M12 19.6c-4.2 0-7.4-2.5-8.9-5.3 2.6-2.1 6.3-1 8.9 2.1 2.6-3.1 6.3-4.2 8.9-2.1-1.5 2.8-4.7 5.3-8.9 5.3z" />
      <path d="M12 16.4c-1.7-3.2-1.7-6.4 0-9.6 1.7 3.2 1.7 6.4 0 9.6z" />
    </>
  ),
  marche: (
    <>
      <circle cx="13.4" cy="4.4" r="1.9" />
      <path d="M11 21l1.8-5.6-2.4-2.4.9-4.6 3.1 2 2.6 1.2" />
      <path d="M12.8 15.4L16 21M10.4 9.2L7.6 12l-1 3.4" />
    </>
  ),
  course: (
    <>
      <circle cx="15.4" cy="4.4" r="1.9" />
      <path d="M8.4 21l3.4-5 -2.6-3 1.4-4.4 3.6 2.2 2.8 .8" />
      <path d="M11.8 13.4l3.4 3 .8 4.6M9.6 8.6L6 10.2l-1.4 3" />
    </>
  ),
  velo: (
    <>
      <circle cx="5.4" cy="16.6" r="3.6" />
      <circle cx="18.6" cy="16.6" r="3.6" />
      <path d="M5.4 16.6l4-8h5l4.2 8M9.4 8.6h5.6" />
      <circle cx="16.2" cy="4.6" r="1.4" />
    </>
  ),
  montagne: <path d="M2.6 19.4l6.2-9.4 3.8 4.8 3.2-4.2 5.6 8.8z" />,
  gps: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  legume: (
    <>
      <path d="M4.6 19.4c-.6-7.4 4.6-13.2 14.8-14.4.8 9.6-5 14.8-14.8 14.4z" />
      <path d="M4.6 19.4l8.6-8.6" />
    </>
  ),
  assiette: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  batterie: (
    <>
      <rect x="3.2" y="7.4" width="15" height="9.2" rx="2.4" />
      <path d="M20.8 10.6v2.8" />
      <path d="M11.4 9.6L9 12.4h3l-1.4 2.6" />
    </>
  ),
  etincelle: (
    <path d="M12 3.4l1.9 5.1 5.1 1.9-5.1 1.9L12 17.4l-1.9-5.1L5 10.4l5.1-1.9z" />
  ),
  renouveau: (
    <>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20.2 3.4v4.2h-4.2" />
    </>
  ),
  medaille: (
    <>
      <circle cx="12" cy="14.4" r="5.6" />
      <path d="M8.6 9.4L6.2 3.4h11.6l-2.4 6" />
    </>
  ),
  /* l'appareil photo : le boîtier et l'objectif */
  photo: (
    <>
      <path d="M3.2 8.8h3.4l1.7-2.6h7.4l1.7 2.6h3.4v10.4H3.2z" />
      <circle cx="12" cy="13.6" r="3.4" />
    </>
  ),
}

export default function Symbole({
  nom,
  taille = 22,
  epaisseur = 1.6,
  couleur = 'currentColor',
}: {
  nom: NomSymbole
  taille?: number
  epaisseur?: number
  couleur?: string
}) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {TRACES[nom]}
    </svg>
  )
}

/** Le symbole posé dans sa pastille de couleur — le motif de toutes les listes. */
export function Pastille({
  nom,
  fond,
  couleur,
  taille = 44,
}: {
  nom: NomSymbole
  fond: string
  couleur: string
  taille?: number
}) {
  return (
    <span className="pastille" style={{ width: taille, height: taille, background: fond, color: couleur }}>
      <Symbole nom={nom} taille={Math.round(taille * 0.5)} />
    </span>
  )
}
