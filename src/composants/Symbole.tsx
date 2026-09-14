/* Les symboles, tous dessinés au trait, dans le même esprit : un toit, une
   courbe, rien de plus. Aucune bibliothèque à charger, et une famille
   cohérente — c'est ce qui fait qu'une app a l'air dessinée plutôt
   qu'assemblée. Les emoji restent au contenu (natures de charges, catégories
   de courses), jamais à la structure. */

import type { JSX } from 'react'

export type NomSymbole =
  | 'maison'
  | 'eclair'
  | 'panier'
  | 'roulotte'
  | 'famille'
  | 'plus'
  | 'fleche'
  | 'croix'
  | 'reglages'
  | 'coche'
  | 'echange'
  | 'calendrier'
  | 'crayon'
  | 'papier'

const TRACES: Record<NomSymbole, JSX.Element> = {
  /* le logo : le toit du fare, et la ligne du lagon dessous */
  maison: (
    <>
      <path d="M3.4 10.6L12 4l8.6 6.6" />
      <path d="M5.6 9.4v9.4h12.8V9.4" />
      <path d="M8.4 18.8v-4.6h7.2v4.6" />
    </>
  ),
  eclair: <path d="M13.4 3L5.6 13.4h5.2L10.6 21l7.8-10.4h-5.2z" />,
  panier: (
    <>
      <path d="M3.4 8.6h17.2l-1.7 10.2H5.1z" />
      <path d="M8.6 8.6l2-4.4M15.4 8.6l-2-4.4" />
    </>
  ),
  roulotte: (
    <>
      <path d="M2.8 7.4h13.8v8.4H2.8z" />
      <path d="M16.6 10.2h3l1.6 3v2.6h-4.6" />
      <circle cx="7" cy="18.2" r="2.2" />
      <circle cx="17.4" cy="18.2" r="2.2" />
    </>
  ),
  famille: (
    <>
      <circle cx="8.4" cy="8" r="3" />
      <circle cx="16.4" cy="9.4" r="2.3" />
      <path d="M2.8 19.4c0-3.1 2.5-5.4 5.6-5.4s5.6 2.3 5.6 5.4" />
      <path d="M15.2 14.4c3 0 5.2 1.9 5.2 4.4" />
    </>
  ),
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  fleche: <path d="M9 5.5l6.5 6.5L9 18.5" />,
  croix: <path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" />,
  reglages: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.6v2.6M12 18.8v2.6M4.4 12H1.8M22.2 12h-2.6M6.3 6.3L4.5 4.5M19.5 19.5l-1.8-1.8M17.7 6.3l1.8-1.8M4.5 19.5l1.8-1.8" />
    </>
  ),
  coche: <path d="M4.6 12.6l4.8 4.8L19.4 7.2" />,
  /* deux flèches qui se croisent : un remboursement d'un foyer à l'autre */
  echange: (
    <>
      <path d="M4 8.4h13l-3.2-3.4M20 15.6H7l3.2 3.4" />
    </>
  ),
  calendrier: (
    <>
      <path d="M3.6 6.4h16.8v14H3.6z" />
      <path d="M3.6 10.6h16.8M8.2 3.4v4M15.8 3.4v4" />
    </>
  ),
  crayon: (
    <>
      <path d="M4 20l1.1-4 10-10a2.1 2.1 0 013 3l-10 10z" />
      <path d="M13.4 7.6l3 3" />
    </>
  ),
  /* une feuille au coin corné : la facture reçue du fournisseur */
  papier: (
    <>
      <path d="M6 2.8h7.6l4.4 4.4v14H6z" />
      <path d="M13.6 2.8v4.4H18" />
      <path d="M8.8 12.6h6.4M8.8 16.2h6.4" />
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
      aria-hidden="true"
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      {TRACES[nom]}
    </svg>
  )
}
