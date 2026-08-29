/* L'état de l'app, partagé par tous les écrans : on le lit au démarrage,
   on le réécrit dans le téléphone à chaque changement. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clefJour } from './dates'
import { jeuneEnCours } from './jeune'
import type { Etat, Reglages } from './stockage'
import { ETAT_VIDE, ecrireEtat, lireEtat, nouvelId } from './stockage'

type Actions = {
  commencer: (debut?: Date) => void
  terminer: () => void
  abandonner: () => void
  corrigerDebut: (debut: Date) => void
  supprimerJeune: (id: string) => void
  ajouterVerres: (nombre: number, jour?: string) => void
  noterPoids: (poids: number, jour?: string) => void
  supprimerPesee: (jour: string) => void
  reglerLes: (changements: Partial<Reglages>) => void
  demarrer: () => void
  remplacerTout: (etat: Etat) => void
  toutEffacer: () => void
}

const Contexte = createContext<{ etat: Etat } & Actions | null>(null)

export function FournisseurEtat({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(() => lireEtat())

  useEffect(() => {
    ecrireEtat(etat)
  }, [etat])

  const commencer = useCallback((debut?: Date) => {
    setEtat((precedent) => {
      if (jeuneEnCours(precedent)) return precedent // déjà en cours : on ne double pas
      return {
        ...precedent,
        jeunes: [
          {
            id: nouvelId(),
            debut: (debut ?? new Date()).toISOString(),
            fin: null,
            objectifHeures: precedent.reglages.objectifHeures,
          },
          ...precedent.jeunes,
        ],
      }
    })
  }, [])

  const terminer = useCallback(() => {
    setEtat((precedent) => ({
      ...precedent,
      jeunes: precedent.jeunes.map((j) =>
        j.fin === null ? { ...j, fin: new Date().toISOString() } : j,
      ),
    }))
  }, [])

  const abandonner = useCallback(() => {
    setEtat((precedent) => ({
      ...precedent,
      jeunes: precedent.jeunes.filter((j) => j.fin !== null),
    }))
  }, [])

  const corrigerDebut = useCallback((debut: Date) => {
    setEtat((precedent) => ({
      ...precedent,
      jeunes: precedent.jeunes.map((j) =>
        j.fin === null ? { ...j, debut: debut.toISOString() } : j,
      ),
    }))
  }, [])

  const supprimerJeune = useCallback((id: string) => {
    setEtat((precedent) => ({
      ...precedent,
      jeunes: precedent.jeunes.filter((j) => j.id !== id),
    }))
  }, [])

  const ajouterVerres = useCallback((nombre: number, jour?: string) => {
    const clef = jour ?? clefJour()
    setEtat((precedent) => ({
      ...precedent,
      eau: { ...precedent.eau, [clef]: Math.max(0, (precedent.eau[clef] ?? 0) + nombre) },
    }))
  }, [])

  const noterPoids = useCallback((poids: number, jour?: string) => {
    const clef = jour ?? clefJour()
    setEtat((precedent) => ({
      ...precedent,
      // Une seule pesée par jour : la dernière remplace la précédente.
      pesees: [...precedent.pesees.filter((p) => p.jour !== clef), { jour: clef, poids }].sort(
        (a, b) => a.jour.localeCompare(b.jour),
      ),
    }))
  }, [])

  const supprimerPesee = useCallback((jour: string) => {
    setEtat((precedent) => ({
      ...precedent,
      pesees: precedent.pesees.filter((p) => p.jour !== jour),
    }))
  }, [])

  const reglerLes = useCallback((changements: Partial<Reglages>) => {
    setEtat((precedent) => ({
      ...precedent,
      reglages: { ...precedent.reglages, ...changements },
    }))
  }, [])

  const demarrer = useCallback(() => {
    setEtat((precedent) => ({ ...precedent, demarre: true }))
  }, [])

  const remplacerTout = useCallback((nouveau: Etat) => setEtat(nouveau), [])

  const toutEffacer = useCallback(() => setEtat(ETAT_VIDE), [])

  const valeur = useMemo(
    () => ({
      etat,
      commencer,
      terminer,
      abandonner,
      corrigerDebut,
      supprimerJeune,
      ajouterVerres,
      noterPoids,
      supprimerPesee,
      reglerLes,
      demarrer,
      remplacerTout,
      toutEffacer,
    }),
    [
      etat,
      commencer,
      terminer,
      abandonner,
      corrigerDebut,
      supprimerJeune,
      ajouterVerres,
      noterPoids,
      supprimerPesee,
      reglerLes,
      demarrer,
      remplacerTout,
      toutEffacer,
    ],
  )

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

export function useApp() {
  const valeur = useContext(Contexte)
  if (!valeur) throw new Error("useApp doit être appelé à l'intérieur de FournisseurEtat")
  return valeur
}

/**
 * Une horloge qui bat toutes les secondes : le minuteur s'y accroche.
 * Elle donne l'heure « maintenant » à l'écran qui l'appelle, pour que
 * l'affichage se recalcule tout seul sans jamais lire l'heure en plein rendu.
 */
export function useHorloge(): number {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    const battement = setInterval(() => setMaintenant(Date.now()), 1000)
    // Au retour d'un écran verrouillé, l'affichage doit se remettre à l'heure.
    const reveil = () => setMaintenant(Date.now())
    document.addEventListener('visibilitychange', reveil)
    return () => {
      clearInterval(battement)
      document.removeEventListener('visibilitychange', reveil)
    }
  }, [])
  return maintenant
}
