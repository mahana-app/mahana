/* L'aiguillage : quatre onglets, le bouton + au milieu, et les écrans qui
   s'ouvrent par-dessus. Pas de routeur — l'app tient dans une poignée
   d'écrans, et un simple aiguillage suffit. */

import { useEffect, useState } from 'react'
import BarreOnglets from './composants/BarreOnglets'
import type { Onglet } from './composants/BarreOnglets'
import FeuilleActions from './composants/FeuilleActions'
import Accueil from './ecrans/Accueil'
import Activite from './ecrans/Activite'
import AjoutAliment from './ecrans/AjoutAliment'
import Bienvenue from './ecrans/Bienvenue'
import ComposerPlat from './ecrans/ComposerPlat'
import EcranCorps from './ecrans/Corps'
import Defis from './ecrans/Defis'
import EcranEau from './ecrans/Eau'
import EcranJeune from './ecrans/Jeune'
import { ListeLecons, UneLecon } from './ecrans/Lecons'
import Moi from './ecrans/Moi'
import NoterSeance from './ecrans/NoterSeance'
import EcranProgramme, { NouveauProgramme } from './ecrans/Programme'
import Progres from './ecrans/Progres'
import EcranRecette from './ecrans/Recette'
import Recettes from './ecrans/Recettes'
import EcranReglages from './ecrans/Reglages'
import Repas from './ecrans/Repas'
import EcranSeance from './ecrans/Seance'
import Sortie from './ecrans/Sortie'
import Sport from './ecrans/Sport'
import { useApp } from './lib/etat'
import type { Vue } from './lib/navigation'

export default function App() {
  const { etat } = useApp()
  const [onglet, setOnglet] = useState<Onglet>('accueil')
  const [pile, setPile] = useState<Vue[]>([])
  const [ajout, setAjout] = useState(false)

  const vue = pile[pile.length - 1] ?? null
  const ouvrir = (nouvelle: Vue) => setPile((p) => [...p, nouvelle])
  const fermer = () => setPile((p) => p.slice(0, -1))

  // Chaque changement d'écran repart du haut : sinon on arrive au milieu
  // de la page suivante, à l'endroit où on avait laissé la précédente.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [onglet, pile.length])

  if (!etat.demarre) return <Bienvenue />

  if (vue) {
    switch (vue.nom) {
      case 'sport':
        return <Sport ouvrir={ouvrir} fermer={fermer} />
      case 'noter-seance':
        return (
          <NoterSeance
            programmeId={vue.programmeId}
            numeroJour={vue.numeroJour}
            fermer={fermer}
          />
        )
      case 'programme':
        return <EcranProgramme id={vue.id} ouvrir={ouvrir} fermer={fermer} />
      case 'nouveau-programme':
        return <NouveauProgramme fermer={fermer} />
      case 'seance':
        return <EcranSeance id={vue.id} fermer={fermer} />
      case 'sortie':
        return <Sortie fermer={fermer} />
      case 'ajout':
        return <AjoutAliment moment={vue.moment} fermer={fermer} ouvrir={ouvrir} />
      case 'composer':
        return <ComposerPlat moment={vue.moment} fermer={fermer} />
      case 'defis':
        return <Defis fermer={fermer} />
      case 'moi':
        return <Moi ouvrir={ouvrir} fermer={fermer} />
      case 'recettes':
        return <Recettes ouvrir={ouvrir} fermer={fermer} />
      case 'recette':
        return <EcranRecette id={vue.id} fermer={fermer} />
      case 'lecons':
        return <ListeLecons ouvrir={ouvrir} fermer={fermer} />
      case 'lecon':
        return <UneLecon id={vue.id} fermer={fermer} />
      case 'corps':
        return <EcranCorps fermer={fermer} />
      case 'eau':
        return <EcranEau fermer={fermer} />
      case 'activite':
        return <Activite fermer={fermer} />
      case 'reglages':
        return <EcranReglages fermer={fermer} />
    }
  }

  return (
    <>
      {onglet === 'accueil' && <Accueil ouvrir={ouvrir} allerA={setOnglet} />}
      {onglet === 'repas' && <Repas ouvrir={ouvrir} />}
      {onglet === 'jeune' && <EcranJeune ouvrir={ouvrir} />}
      {onglet === 'progres' && <Progres ouvrir={ouvrir} />}
      <BarreOnglets actif={onglet} changer={setOnglet} ouvrirAjout={() => setAjout(true)} />
      {ajout && <FeuilleActions fermer={() => setAjout(false)} ouvrir={ouvrir} />}
    </>
  )
}
