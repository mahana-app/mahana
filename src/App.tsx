/* L'aiguillage : quatre onglets, le bouton + au milieu, et les écrans qui
   s'ouvrent par-dessus. Pas de routeur — l'app tient dans une poignée
   d'écrans, et un simple aiguillage suffit. */

import { useEffect, useState } from 'react'
import BarreOnglets from './composants/BarreOnglets'
import type { Onglet } from './composants/BarreOnglets'
import { BandeauErreur, BandeauEssai } from './composants/Bandeaux'
import FeuilleActions from './composants/FeuilleActions'
import Accueil from './ecrans/Accueil'
import Ardoise from './ecrans/Ardoise'
import Caisse from './ecrans/Caisse'
import Charges from './ecrans/Charges'
import Connexion from './ecrans/Connexion'
import Maisonnee from './ecrans/Maisonnee'
import NouvelAchat from './ecrans/NouvelAchat'
import NouvelleArdoise from './ecrans/NouvelleArdoise'
import NouvelleCharge from './ecrans/NouvelleCharge'
import QuiEsTu from './ecrans/QuiEsTu'
import UneCharge from './ecrans/UneCharge'
import { useMaison } from './lib/maison'
import type { Vue } from './lib/navigation'

export default function App() {
  const { maison, chargement, erreur, partagee, connecte, moiId } = useMaison()
  const [onglet, setOnglet] = useState<Onglet>('accueil')
  const [pile, setPile] = useState<Vue[]>([])
  const [ajout, setAjout] = useState(false)

  const vue = pile[pile.length - 1] ?? null
  const ouvrir = (nouvelle: Vue) => setPile((p) => [...p, nouvelle])
  const fermer = () => setPile((p) => p.slice(0, -1))

  // Chaque changement d'écran repart du haut : sinon on arrive au milieu de
  // la page suivante, à l'endroit où on avait laissé la précédente.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [onglet, pile.length])

  if (!connecte) return <Connexion />

  if (chargement) {
    return (
      <div className="page">
        <p className="vide" style={{ paddingTop: 60 }}>
          Un instant, on ouvre la maison…
        </p>
      </div>
    )
  }

  // La question ne se pose que s'il y a des prénoms à proposer : à la toute
  // première ouverture, la maison est vide et l'accueil invite à la remplir.
  const aDuMonde = maison.membres.some((m) => m.role === 'adulte' && m.actif)
  if (aDuMonde && !moiId) return <QuiEsTu />

  if (vue) {
    switch (vue.nom) {
      case 'charge':
        return <UneCharge id={vue.id} fermer={fermer} />
      case 'nouvelle-charge':
        return <NouvelleCharge fermer={fermer} />
      case 'nouvel-achat':
        return <NouvelAchat fermer={fermer} />
      case 'nouvelle-ardoise':
        return <NouvelleArdoise fermer={fermer} />
      case 'maisonnee':
        return <Maisonnee fermer={fermer} />
    }
  }

  return (
    <>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '10px 16px 0' }}>
        {!partagee && <BandeauEssai />}
        {erreur && <BandeauErreur message={erreur} />}
      </div>
      {onglet === 'accueil' && <Accueil ouvrir={ouvrir} allerA={setOnglet} />}
      {onglet === 'charges' && <Charges ouvrir={ouvrir} />}
      {onglet === 'caisse' && <Caisse ouvrir={ouvrir} />}
      {onglet === 'ardoise' && <Ardoise ouvrir={ouvrir} />}
      <BarreOnglets actif={onglet} changer={setOnglet} ouvrirAjout={() => setAjout(true)} />
      {ajout && <FeuilleActions fermer={() => setAjout(false)} ouvrir={ouvrir} />}
    </>
  )
}
