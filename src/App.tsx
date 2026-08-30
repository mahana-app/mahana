/* L'aiguillage : cinq onglets, et les écrans qui s'ouvrent par-dessus.
   Pas de routeur — l'app tient dans une poignée d'écrans. */

import { useEffect, useState } from 'react'
import BarreOnglets from './composants/BarreOnglets'
import type { Onglet } from './composants/BarreOnglets'
import Accueil from './ecrans/Accueil'
import Activite from './ecrans/Activite'
import AjoutAliment from './ecrans/AjoutAliment'
import Bienvenue from './ecrans/Bienvenue'
import EcranCorps from './ecrans/Corps'
import Defis from './ecrans/Defis'
import EcranEau from './ecrans/Eau'
import EcranJeune from './ecrans/Jeune'
import Moi from './ecrans/Moi'
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
  const [vue, setVue] = useState<Vue | null>(null)

  // Chaque changement d'écran repart du haut : sinon on arrive au milieu
  // de la page suivante, à l'endroit où on avait laissé la précédente.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [onglet, vue])

  if (!etat.demarre) return <Bienvenue />

  const fermer = () => setVue(null)

  if (vue) {
    switch (vue.nom) {
      case 'jeune':
        return <EcranJeune fermer={fermer} />
      case 'seance':
        return <EcranSeance id={vue.id} fermer={fermer} />
      case 'sortie':
        return <Sortie fermer={fermer} />
      case 'ajout':
        return <AjoutAliment moment={vue.moment} fermer={fermer} />
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
      {onglet === 'accueil' && <Accueil ouvrir={setVue} allerA={setOnglet} />}
      {onglet === 'sport' && <Sport ouvrir={setVue} />}
      {onglet === 'repas' && <Repas ouvrir={setVue} />}
      {onglet === 'defis' && <Defis ouvrir={setVue} />}
      {onglet === 'moi' && <Moi ouvrir={setVue} />}
      <BarreOnglets actif={onglet} changer={setOnglet} />
    </>
  )
}
