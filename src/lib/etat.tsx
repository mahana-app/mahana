/* L'état de l'app, partagé par tous les écrans : on le lit au démarrage,
   on le réécrit dans le téléphone à chaque changement. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clefJour, minutesEntre } from './dates'
import { defiTermine, joursTenus } from './defis'
import { habitudeTerminee } from './habitudes'
import { jeuneEnCours } from './jeune'
import type {
  Etat,
  LigneRepas,
  MomentRepas,
  Nuit,
  Profil,
  SeanceFaite,
} from './stockage'
import { ETAT_VIDE, ecrireEtat, lireEtat, nouvelId } from './stockage'

type Actions = {
  /* le jeûne */
  commencer: (debut?: Date) => void
  terminer: () => void
  abandonner: () => void
  corrigerDebut: (debut: Date) => void
  supprimerJeune: (id: string) => void
  ajouterJeunePasse: (debut: Date, fin: Date) => void
  /* l'eau */
  ajouterVerres: (nombre: number, jour?: string) => void
  /* le corps */
  noterPoids: (poids: number, jour?: string) => void
  supprimerPesee: (jour: string) => void
  /* les repas */
  ajouterRepas: (ligne: Omit<LigneRepas, 'id' | 'jour'> & { jour?: string }) => void
  supprimerRepas: (id: string) => void
  /* le sport */
  noterSeance: (seance: Omit<SeanceFaite, 'id' | 'jour'> & { jour?: string }) => void
  supprimerSeance: (id: string) => void
  /* les pas et les nuits */
  noterPas: (nombre: number, jour?: string) => void
  noterNuit: (coucher: string, lever: string, jour?: string) => void
  supprimerNuit: (jour: string) => void
  /* les défis et les habitudes */
  lancerDefi: (defiId: string) => void
  cocherJour: (jour: string) => void
  arreterDefi: () => void
  lancerHabitude: (habitudeId: string) => void
  cocherHabitude: (jour: string) => void
  arreterHabitude: () => void
  /* le contenu */
  marquerLeconLue: (leconId: string) => void
  basculerRecette: (recetteId: string) => void
  /* le reste */
  reglerLe: (changements: Partial<Profil>) => void
  demarrer: () => void
  remplacerTout: (etat: Etat) => void
  toutEffacer: () => void
}

const Contexte = createContext<({ etat: Etat } & Actions) | null>(null)

export function FournisseurEtat({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(() => lireEtat())

  useEffect(() => {
    ecrireEtat(etat)
  }, [etat])

  // Un défi ou une habitude arrivés à leur terme se rangent tout seuls
  // dans le palmarès, au premier lancement de la journée.
  useEffect(() => {
    setEtat((precedent) => {
      let suite = precedent
      const defi = suite.defiEnCours
      if (defi && defiTermine(defi.debut)) {
        suite = {
          ...suite,
          defiEnCours: null,
          defisFinis: [
            ...suite.defisFinis,
            { defiId: defi.defiId, debut: defi.debut, reussis: joursTenus(suite) },
          ],
        }
      }
      const habitude = suite.habitudeEnCours
      if (habitude && habitudeTerminee(habitude.debut)) {
        suite = {
          ...suite,
          habitudeEnCours: null,
          habitudesFinies: [
            ...suite.habitudesFinies,
            {
              habitudeId: habitude.habitudeId,
              debut: habitude.debut,
              reussis: habitude.coches.length,
            },
          ],
        }
      }
      return suite
    })
  }, [])

  /* ---------- le jeûne ---------- */

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
            objectifHeures: precedent.profil.objectifJeuneHeures,
          },
          ...precedent.jeunes,
        ],
      }
    })
  }, [])

  const terminer = useCallback(() => {
    setEtat((p) => ({
      ...p,
      jeunes: p.jeunes.map((j) => (j.fin === null ? { ...j, fin: new Date().toISOString() } : j)),
    }))
  }, [])

  const abandonner = useCallback(() => {
    setEtat((p) => ({ ...p, jeunes: p.jeunes.filter((j) => j.fin !== null) }))
  }, [])

  const corrigerDebut = useCallback((debut: Date) => {
    setEtat((p) => ({
      ...p,
      jeunes: p.jeunes.map((j) => (j.fin === null ? { ...j, debut: debut.toISOString() } : j)),
    }))
  }, [])

  const supprimerJeune = useCallback((id: string) => {
    setEtat((p) => ({ ...p, jeunes: p.jeunes.filter((j) => j.id !== id) }))
  }, [])

  /** Un jeûne oublié sur le moment, noté après coup. */
  const ajouterJeunePasse = useCallback((debut: Date, fin: Date) => {
    setEtat((p) => ({
      ...p,
      jeunes: [
        {
          id: nouvelId(),
          debut: debut.toISOString(),
          fin: fin.toISOString(),
          objectifHeures: p.profil.objectifJeuneHeures,
        },
        ...p.jeunes,
      ].sort((a, b) => b.debut.localeCompare(a.debut)),
    }))
  }, [])

  /* ---------- l'eau ---------- */

  const ajouterVerres = useCallback((nombre: number, jour?: string) => {
    const clef = jour ?? clefJour()
    setEtat((p) => ({
      ...p,
      eau: { ...p.eau, [clef]: Math.max(0, (p.eau[clef] ?? 0) + nombre) },
    }))
  }, [])

  /* ---------- le corps ---------- */

  const noterPoids = useCallback((poids: number, jour?: string) => {
    const clef = jour ?? clefJour()
    setEtat((p) => ({
      ...p,
      // Une seule pesée par jour : la dernière remplace la précédente.
      pesees: [...p.pesees.filter((x) => x.jour !== clef), { jour: clef, poids }].sort((a, b) =>
        a.jour.localeCompare(b.jour),
      ),
    }))
  }, [])

  const supprimerPesee = useCallback((jour: string) => {
    setEtat((p) => ({ ...p, pesees: p.pesees.filter((x) => x.jour !== jour) }))
  }, [])

  /* ---------- les repas ---------- */

  const ajouterRepas = useCallback(
    (ligne: Omit<LigneRepas, 'id' | 'jour'> & { jour?: string }) => {
      const { jour, ...reste } = ligne
      setEtat((p) => ({
        ...p,
        repas: [...p.repas, { ...reste, id: nouvelId(), jour: jour ?? clefJour() }],
      }))
    },
    [],
  )

  const supprimerRepas = useCallback((id: string) => {
    setEtat((p) => ({ ...p, repas: p.repas.filter((r) => r.id !== id) }))
  }, [])

  /* ---------- le sport ---------- */

  const noterSeance = useCallback(
    (seance: Omit<SeanceFaite, 'id' | 'jour'> & { jour?: string }) => {
      const { jour, ...reste } = seance
      setEtat((p) => ({
        ...p,
        seances: [...p.seances, { ...reste, id: nouvelId(), jour: jour ?? clefJour() }],
      }))
    },
    [],
  )

  const supprimerSeance = useCallback((id: string) => {
    setEtat((p) => ({ ...p, seances: p.seances.filter((s) => s.id !== id) }))
  }, [])

  /* ---------- les pas et les nuits ---------- */

  const noterPas = useCallback((nombre: number, jour?: string) => {
    const clef = jour ?? clefJour()
    setEtat((p) => ({ ...p, pas: { ...p.pas, [clef]: Math.max(0, Math.round(nombre)) } }))
  }, [])

  const noterNuit = useCallback((coucher: string, lever: string, jour?: string) => {
    const clef = jour ?? clefJour()
    const nuit: Nuit = { jour: clef, coucher, lever, minutes: minutesEntre(coucher, lever) }
    setEtat((p) => ({
      ...p,
      nuits: [...p.nuits.filter((n) => n.jour !== clef), nuit].sort((a, b) =>
        a.jour.localeCompare(b.jour),
      ),
    }))
  }, [])

  const supprimerNuit = useCallback((jour: string) => {
    setEtat((p) => ({ ...p, nuits: p.nuits.filter((n) => n.jour !== jour) }))
  }, [])

  /* ---------- les défis ---------- */

  const lancerDefi = useCallback((defiId: string) => {
    setEtat((p) => ({ ...p, defiEnCours: { defiId, debut: clefJour(), coches: [] } }))
  }, [])

  const cocherJour = useCallback((jour: string) => {
    setEtat((p) => {
      if (!p.defiEnCours) return p
      const coches = p.defiEnCours.coches.includes(jour)
        ? p.defiEnCours.coches.filter((c) => c !== jour)
        : [...p.defiEnCours.coches, jour]
      return { ...p, defiEnCours: { ...p.defiEnCours, coches } }
    })
  }, [])

  const arreterDefi = useCallback(() => {
    setEtat((p) => ({ ...p, defiEnCours: null }))
  }, [])

  const lancerHabitude = useCallback((habitudeId: string) => {
    setEtat((p) => ({ ...p, habitudeEnCours: { habitudeId, debut: clefJour(), coches: [] } }))
  }, [])

  const cocherHabitude = useCallback((jour: string) => {
    setEtat((p) => {
      if (!p.habitudeEnCours) return p
      const coches = p.habitudeEnCours.coches.includes(jour)
        ? p.habitudeEnCours.coches.filter((c) => c !== jour)
        : [...p.habitudeEnCours.coches, jour]
      return { ...p, habitudeEnCours: { ...p.habitudeEnCours, coches } }
    })
  }, [])

  const arreterHabitude = useCallback(() => {
    setEtat((p) => ({ ...p, habitudeEnCours: null }))
  }, [])

  const marquerLeconLue = useCallback((leconId: string) => {
    setEtat((p) =>
      p.leconsLues.includes(leconId) ? p : { ...p, leconsLues: [...p.leconsLues, leconId] },
    )
  }, [])

  const basculerRecette = useCallback((recetteId: string) => {
    setEtat((p) => ({
      ...p,
      recettesGardees: p.recettesGardees.includes(recetteId)
        ? p.recettesGardees.filter((r) => r !== recetteId)
        : [...p.recettesGardees, recetteId],
    }))
  }, [])

  /* ---------- le reste ---------- */

  const reglerLe = useCallback((changements: Partial<Profil>) => {
    setEtat((p) => ({ ...p, profil: { ...p.profil, ...changements } }))
  }, [])

  const demarrer = useCallback(() => setEtat((p) => ({ ...p, demarre: true })), [])
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
      ajouterJeunePasse,
      ajouterVerres,
      noterPoids,
      supprimerPesee,
      ajouterRepas,
      supprimerRepas,
      noterSeance,
      supprimerSeance,
      noterPas,
      noterNuit,
      supprimerNuit,
      lancerDefi,
      cocherJour,
      arreterDefi,
      lancerHabitude,
      cocherHabitude,
      arreterHabitude,
      marquerLeconLue,
      basculerRecette,
      reglerLe,
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
      ajouterJeunePasse,
      ajouterVerres,
      noterPoids,
      supprimerPesee,
      ajouterRepas,
      supprimerRepas,
      noterSeance,
      supprimerSeance,
      noterPas,
      noterNuit,
      supprimerNuit,
      lancerDefi,
      cocherJour,
      arreterDefi,
      lancerHabitude,
      cocherHabitude,
      arreterHabitude,
      marquerLeconLue,
      basculerRecette,
      reglerLe,
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
 * Une horloge qui bat toutes les secondes : les minuteurs s'y accrochent.
 * Elle donne l'heure « maintenant » à l'écran qui l'appelle, pour que
 * l'affichage se recalcule tout seul sans jamais lire l'heure en plein rendu.
 */
export function useHorloge(): number {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    const battement = setInterval(() => setMaintenant(Date.now()), 1000)
    const reveil = () => setMaintenant(Date.now())
    document.addEventListener('visibilitychange', reveil)
    return () => {
      clearInterval(battement)
      document.removeEventListener('visibilitychange', reveil)
    }
  }, [])
  return maintenant
}

/** Les totaux d'une journée : ce que tous les écrans affichent en haut. */
export function totauxDuJour(etat: Etat, jour: string) {
  const repas = etat.repas.filter((r) => r.jour === jour)
  const seances = etat.seances.filter((s) => s.jour === jour)
  return {
    kcalMangees: Math.round(repas.reduce((t, r) => t + r.kcal, 0)),
    glucides: Math.round(repas.reduce((t, r) => t + r.glucides, 0)),
    proteines: Math.round(repas.reduce((t, r) => t + r.proteines, 0)),
    lipides: Math.round(repas.reduce((t, r) => t + r.lipides, 0)),
    kcalBrulees: Math.round(seances.reduce((t, s) => t + s.kcal, 0)),
    minutesSport: seances.reduce((t, s) => t + s.minutes, 0),
    pas: etat.pas[jour] ?? 0,
    verres: etat.eau[jour] ?? 0,
  }
}

/** Le moment de la journée, pour proposer le bon repas par défaut. */
export function momentProbable(): MomentRepas {
  const heure = new Date().getHours()
  if (heure < 10) return 'petit-dejeuner'
  if (heure < 15) return 'dejeuner'
  if (heure < 18) return 'encas'
  return 'diner'
}
