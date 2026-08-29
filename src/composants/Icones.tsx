/* Les petits dessins de la barre du bas. Dessinés à la main en SVG :
   aucune bibliothèque d'icônes à installer, rien à charger sur internet. */

type Props = { taille?: number }

const commun = (taille: number) => ({
  width: taille,
  height: taille,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconeJeune = ({ taille = 22 }: Props) => (
  <svg {...commun(taille)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2" />
    <path d="M9 2h6" />
  </svg>
)

export const IconeEau = ({ taille = 22 }: Props) => (
  <svg {...commun(taille)}>
    <path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3z" />
  </svg>
)

export const IconeCorps = ({ taille = 22 }: Props) => (
  <svg {...commun(taille)}>
    <path d="M4 18h16" />
    <path d="M6 18V9l6-4 6 4v9" />
    <path d="M12 18v-5" />
  </svg>
)

export const IconeJournal = ({ taille = 22 }: Props) => (
  <svg {...commun(taille)}>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
)

export const IconeReglages = ({ taille = 20 }: Props) => (
  <svg {...commun(taille)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-3-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.1-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 3 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export const IconeRetour = ({ taille = 20 }: Props) => (
  <svg {...commun(taille)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)
