/* L'aiguillage : l'accueil au premier lancement, puis les quatre onglets
   et l'écran des réglages. Pas de routeur — l'app tient en cinq écrans. */

import { useState } from 'react'
import BarreOnglets from './composants/BarreOnglets'
import type { Onglet } from './composants/BarreOnglets'
import Bienvenue from './ecrans/Bienvenue'
import EcranCorps from './ecrans/Corps'
import EcranEau from './ecrans/Eau'
import EcranJeune from './ecrans/Jeune'
import EcranJournal from './ecrans/Journal'
import EcranReglages from './ecrans/Reglages'
import { useApp } from './lib/etat'

export default function App() {
  const { etat } = useApp()
  const [onglet, setOnglet] = useState<Onglet>('jeune')
  const [reglagesOuverts, setReglagesOuverts] = useState(false)

  if (!etat.demarre) return <Bienvenue />

  if (reglagesOuverts) return <EcranReglages fermer={() => setReglagesOuverts(false)} />

  const ouvrirReglages = () => setReglagesOuverts(true)

  return (
    <>
      {onglet === 'jeune' && <EcranJeune ouvrirReglages={ouvrirReglages} />}
      {onglet === 'eau' && <EcranEau ouvrirReglages={ouvrirReglages} />}
      {onglet === 'corps' && <EcranCorps ouvrirReglages={ouvrirReglages} />}
      {onglet === 'journal' && <EcranJournal ouvrirReglages={ouvrirReglages} />}
      <BarreOnglets actif={onglet} changer={setOnglet} />
    </>
  )
}
