/* Les petits dessins de l'interface. Tracés à la main en SVG : aucune
   bibliothèque d'icônes à installer, rien à charger sur internet. */

type Props = { taille?: number }

const trait = (taille: number) => ({
  width: taille,
  height: taille,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconeAccueil = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M9.5 20v-5h5v5" />
  </svg>
)

export const IconeSport = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M3 9v6M21 9v6M6.5 6.5v11M17.5 6.5v11" />
    <path d="M6.5 12h11" />
  </svg>
)

export const IconeRepas = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10" />
    <path d="M16.5 3c-1.5 1.6-2 3.2-2 5.5 0 1.6.7 2.5 2 2.5s2-.9 2-2.5c0-2.3-.5-3.9-2-5.5z" />
    <path d="M16.5 11v10" />
  </svg>
)

export const IconeDefi = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

export const IconeMoi = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </svg>
)

export const IconeReglages = ({ taille = 20 }: Props) => (
  <svg {...trait(taille)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-3-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.1-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 3 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export const IconeRetour = ({ taille = 20 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const IconeFleche = ({ taille = 18 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const IconePlus = ({ taille = 20 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconeChrono = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M9 2h6" />
  </svg>
)

export const IconeGps = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const IconeEau = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3z" />
  </svg>
)

export const IconeLune = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </svg>
)

export const IconePas = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M7 4c1.6 0 2.5 1.3 2.5 3.2 0 1.6-.6 2.6-.6 4 0 1.2.6 1.8.6 2.8 0 1.2-.9 2-2.5 2s-2.5-.8-2.5-2c0-1 .6-1.6.6-2.8 0-1.4-.6-2.4-.6-4C4.5 5.3 5.4 4 7 4z" />
    <path d="M17 8c1.6 0 2.5 1.3 2.5 3.2 0 1.6-.6 2.6-.6 4 0 1.2.6 1.8.6 2.8 0 1.2-.9 2-2.5 2s-2.5-.8-2.5-2c0-1 .6-1.6.6-2.8 0-1.4-.6-2.4-.6-4C14.5 9.3 15.4 8 17 8z" />
  </svg>
)

export const IconeCorps = ({ taille = 22 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M4 18h16M6 18V9l6-4 6 4v9M12 18v-5" />
  </svg>
)

export const IconePartage = ({ taille = 20 }: Props) => (
  <svg {...trait(taille)}>
    <path d="M12 15V3M8.5 6.5 12 3l3.5 3.5" />
    <path d="M5 13v6.5h14V13" />
  </svg>
)
