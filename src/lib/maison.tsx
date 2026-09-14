/* L'état de la maison, partagé par tous les écrans.

   On charge tout une fois au démarrage — une maison, ce n'est que quelques
   centaines de lignes — puis chaque geste écrit dans la base ET dans l'état
   affiché. Pas de rechargement complet après chaque clic : sur un téléphone
   en 4G à Mahina, ça se verrait. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SERVEUR_BRANCHE, base, client, nouvelId, rubriqueDe } from './base'
import type { NomTable } from './base'
import { jourDe, repartir } from './argent'
import { ecrireMoi, lireMoi } from './moi'
import { retirerFichier } from './fichiers'
import type { Fichier } from './fichiers'
import type { LigneRelevee } from './releve'
import type { ReglagesDechets } from './dechets'
import type {
  Achat,
  Charge,
  Cotisation,
  Foyer,
  Identifiant,
  LigneArdoise,
  Maison,
  Membre,
  NatureCharge,
  PartCharge,
  Reglement,
} from './types'

import { MAISON_VIDE } from './types'

type Actions = {
  /* les charges */
  ajouterCharge: (
    charge: Omit<Charge, 'id' | 'creeeLe' | 'avanceePar' | 'payeeLe'>,
    partsChoisies?: Record<Identifiant, number>,
  ) => Promise<void>
  modifierCharge: (id: Identifiant, changements: Partial<Charge>) => Promise<void>
  supprimerCharge: (id: Identifiant) => Promise<void>
  /** Entre d'un coup les factures d'un relevé de fournisseur. Rend le nombre
      réellement ajouté : celles déjà connues sont passées. */
  importerCharges: (
    lignes: LigneRelevee[],
    choix: { nature: NatureCharge; avanceePar: Identifiant | null; dejaRemboursees: boolean },
  ) => Promise<number>
  noterPaiement: (chargeId: Identifiant, foyerId: Identifiant, le: string) => Promise<void>
  annulerPaiement: (chargeId: Identifiant) => Promise<void>
  ajouterReglement: (reglement: Omit<Reglement, 'id'>) => Promise<void>
  /* les factures scannées */
  ajouterPiece: (chargeId: Identifiant, fichier: Fichier) => Promise<void>
  supprimerPiece: (id: Identifiant) => Promise<void>
  supprimerReglement: (id: Identifiant) => Promise<void>
  /* la caisse */
  ajouterCotisation: (cotisation: Omit<Cotisation, 'id'>) => Promise<void>
  modifierCotisation: (id: Identifiant, changements: Partial<Cotisation>) => Promise<void>
  supprimerCotisation: (id: Identifiant) => Promise<void>
  ajouterAchat: (achat: Omit<Achat, 'id'>) => Promise<void>
  supprimerAchat: (id: Identifiant) => Promise<void>
  /* l'ardoise */
  ajouterArdoise: (ligne: Omit<LigneArdoise, 'id' | 'rembourseeLe'>) => Promise<void>
  supprimerArdoise: (id: Identifiant) => Promise<void>
  rembourserArdoise: (foyerId: Identifiant, periode: string) => Promise<void>
  /* la maisonnée */
  modifierFoyer: (id: Identifiant, changements: Partial<Foyer>) => Promise<void>
  ajouterMembre: (membre: Omit<Membre, 'id'>) => Promise<void>
  modifierMembre: (id: Identifiant, changements: Partial<Membre>) => Promise<void>
  supprimerMembre: (id: Identifiant) => Promise<void>
  reglerDechets: (dechets: ReglagesDechets) => Promise<void>
  reglerCotisationMensuelle: (montants: Record<Identifiant, number>) => Promise<void>
  /* le reste */
  recharger: () => Promise<void>
}

type Contenu = {
  maison: Maison
  chargement: boolean
  /** Le message de la base quand elle refuse. Jamais masqué par l'app. */
  erreur: string | null
  partagee: boolean
  /** Faux quand le serveur est branché mais que personne n'est connecté. */
  connecte: boolean
  sortir: () => Promise<void>
  /** Le membre qui se sert de ce téléphone. Vide tant qu'il ne l'a pas dit. */
  moiId: Identifiant | null
  direQuiJeSuis: (id: Identifiant | null) => void
} & Actions

const Contexte = createContext<Contenu | null>(null)

export function FournisseurMaison({ children }: { children: ReactNode }) {
  const [maison, setMaison] = useState<Maison>(MAISON_VIDE)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  // Sans serveur, il n'y a personne à connecter : le mode essai est ouvert.
  const [connecte, setConnecte] = useState(!SERVEUR_BRANCHE)
  const [moiId, setMoiId] = useState<Identifiant | null>(() => lireMoi())

  // Les actions qui suppriment en cascade ou répartissent une facture doivent
  // lire l'état au moment où elles s'exécutent, pas celui figé à leur
  // création. D'où cette référence, tenue à jour à chaque rendu.
  const maisonRef = useRef(maison)
  useEffect(() => {
    maisonRef.current = maison
  }, [maison])

  // On suit la session Supabase plutôt que de la lire une fois : se
  // déconnecter sur un écran doit fermer l'app sur tous les autres.
  useEffect(() => {
    if (!client) return
    void client.auth.getSession().then(({ data }) => setConnecte(Boolean(data.session)))
    const { data } = client.auth.onAuthStateChange((_evenement, session) => {
      setConnecte(Boolean(session))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const recharger = useCallback(async () => {
    setChargement(true)
    try {
      setMaison(await base.charger())
      setErreur(null)
    } catch (e) {
      // On montre le message de la base tel quel. Un écran qui ne peut pas
      // lire ne doit jamais afficher une liste vide : ça se lit comme
      // « il n'y a rien », et on cherche au mauvais endroit pendant des jours.
      setErreur(e instanceof Error ? e.message : String(e))
    }
    setChargement(false)
  }, [])

  useEffect(() => {
    // Charger avant d'être connecté ne ramènerait rien : la politique de la
    // base refuse, et l'écran afficherait une maison vide au lieu d'une
    // demande de mot de passe.
    if (!connecte) return
    void recharger()
  }, [recharger, connecte])

  /* Les trois gestes élémentaires, écrits une fois : la base d'abord, puis
     l'écran. Si la base refuse, l'écran ne bouge pas et le message s'affiche. */

  const poser = useCallback(async (table: NomTable, ligne: Record<string, unknown>) => {
    try {
      await base.ajouter(table, ligne)
      setMaison((p) => ({ ...p, [rubriqueDe(table)]: [...(p[rubriqueDe(table)] as unknown[]), ligne] }))
      setErreur(null)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const changer = useCallback(
    async (table: NomTable, id: Identifiant, changements: Record<string, unknown>) => {
      try {
        await base.modifier(table, id, changements)
        setMaison((p) => ({
          ...p,
          [rubriqueDe(table)]: (p[rubriqueDe(table)] as Array<{ id: string }>).map((l) =>
            l.id === id ? { ...l, ...changements } : l,
          ),
        }))
        setErreur(null)
      } catch (e) {
        setErreur(e instanceof Error ? e.message : String(e))
      }
    },
    [],
  )

  const retirer = useCallback(async (table: NomTable, id: Identifiant) => {
    try {
      await base.supprimer(table, id)
      setMaison((p) => ({
        ...p,
        [rubriqueDe(table)]: (p[rubriqueDe(table)] as Array<{ id: string }>).filter((l) => l.id !== id),
      }))
      setErreur(null)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e))
    }
  }, [])

  /* ---------- les charges ---------- */

  const ajouterCharge = useCallback<Actions['ajouterCharge']>(
    async (charge, partsChoisies) => {
      const id = nouvelId()
      const ligne: Charge = {
        ...charge,
        id,
        avanceePar: null,
        payeeLe: null,
        creeeLe: jourDe(),
      }
      await poser('charges', ligne as unknown as Record<string, unknown>)
      // Les parts sont figées maintenant : changer la répartition de la maison
      // plus tard ne doit pas faire bouger des comptes déjà soldés.
      const parts = partsChoisies ?? repartir(charge.montant, maisonRef.current.foyers)
      for (const [foyerId, montant] of Object.entries(parts)) {
        const part: PartCharge = { id: nouvelId(), chargeId: id, foyerId, montant }
        await poser('parts_charge', part as unknown as Record<string, unknown>)
      }
    },
    [poser],
  )

  const importerCharges = useCallback<Actions['importerCharges']>(
    async (lignes, choix) => {
      // Le relevé d'EDT contient toute l'année : on le reprend en septembre
      // comme en mars, et il ne doit jamais créer de doublon. Le numéro de
      // facture du fournisseur est ce qui permet de reconnaître une facture
      // déjà entrée.
      const connues = new Set(
        maisonRef.current.charges.map((c) => c.reference).filter((r) => r !== ''),
      )
      let ajoutees = 0

      for (const ligne of lignes) {
        if (ligne.reference && connues.has(ligne.reference)) continue
        connues.add(ligne.reference)

        const id = nouvelId()
        const charge: Charge = {
          id,
          nature: choix.nature,
          libelle: '',
          periode: ligne.periode,
          montant: ligne.montant,
          avanceePar: choix.avanceePar,
          payeeLe: choix.avanceePar ? ligne.date : null,
          note: '',
          reference: ligne.reference,
          creeeLe: jourDe(),
        }
        await poser('charges', charge as unknown as Record<string, unknown>)

        const parts = repartir(ligne.montant, maisonRef.current.foyers)
        for (const [foyerId, montant] of Object.entries(parts)) {
          const part: PartCharge = { id: nouvelId(), chargeId: id, foyerId, montant }
          await poser('parts_charge', part as unknown as Record<string, unknown>)
          // Des factures d'il y a six mois sont presque toujours déjà réglées
          // entre les deux foyers. Les entrer sans le dire ferait apparaître
          // une dette qui n'existe pas — et c'est le genre de chiffre faux
          // qu'on ne remarque qu'après une dispute.
          if (choix.dejaRemboursees && choix.avanceePar && foyerId !== choix.avanceePar && montant > 0) {
            await poser('reglements', {
              id: nouvelId(),
              chargeId: id,
              foyerId,
              montant,
              le: ligne.date,
              note: 'relevé importé',
            })
          }
        }
        ajoutees++
      }
      return ajoutees
    },
    [poser],
  )

  const supprimerCharge = useCallback<Actions['supprimerCharge']>(
    async (id) => {
      for (const part of maisonRef.current.partsCharge.filter((p) => p.chargeId === id)) {
        await retirer('parts_charge', part.id)
      }
      for (const r of maisonRef.current.reglements.filter((r) => r.chargeId === id)) {
        await retirer('reglements', r.id)
      }
      for (const piece of maisonRef.current.piecesCharge.filter((p) => p.chargeId === id)) {
        await retirerFichier(piece.chemin)
        await retirer('pieces_charge', piece.id)
      }
      await retirer('charges', id)
    },
    [retirer],
  )

  const modifierCharge = useCallback<Actions['modifierCharge']>(
    (id, changements) => changer('charges', id, changements),
    [changer],
  )

  const noterPaiement = useCallback<Actions['noterPaiement']>(
    (chargeId, foyerId, le) => changer('charges', chargeId, { avanceePar: foyerId, payeeLe: le }),
    [changer],
  )

  const annulerPaiement = useCallback<Actions['annulerPaiement']>(
    (chargeId) => changer('charges', chargeId, { avanceePar: null, payeeLe: null }),
    [changer],
  )

  const ajouterReglement = useCallback<Actions['ajouterReglement']>(
    (reglement) => poser('reglements', { ...reglement, id: nouvelId() }),
    [poser],
  )

  const supprimerReglement = useCallback<Actions['supprimerReglement']>(
    (id) => retirer('reglements', id),
    [retirer],
  )

  const ajouterPiece = useCallback<Actions['ajouterPiece']>(
    (chargeId, fichier) =>
      poser('pieces_charge', { ...fichier, id: nouvelId(), chargeId, ajouteeLe: jourDe() }),
    [poser],
  )

  const supprimerPiece = useCallback<Actions['supprimerPiece']>(
    async (id) => {
      // Le fichier part avec la ligne : sinon la réserve se remplit de
      // factures que plus rien ne désigne, et personne ne saura les retrouver.
      const piece = maisonRef.current.piecesCharge.find((p) => p.id === id)
      if (piece) await retirerFichier(piece.chemin)
      await retirer('pieces_charge', id)
    },
    [retirer],
  )

  /* ---------- la caisse ---------- */

  const ajouterCotisation = useCallback<Actions['ajouterCotisation']>(
    (cotisation) => poser('cotisations', { ...cotisation, id: nouvelId() }),
    [poser],
  )
  const modifierCotisation = useCallback<Actions['modifierCotisation']>(
    (id, changements) => changer('cotisations', id, changements),
    [changer],
  )
  const supprimerCotisation = useCallback<Actions['supprimerCotisation']>(
    (id) => retirer('cotisations', id),
    [retirer],
  )
  const ajouterAchat = useCallback<Actions['ajouterAchat']>(
    (achat) => poser('achats', { ...achat, id: nouvelId() }),
    [poser],
  )
  const supprimerAchat = useCallback<Actions['supprimerAchat']>(
    (id) => retirer('achats', id),
    [retirer],
  )

  /* ---------- l'ardoise ---------- */

  const ajouterArdoise = useCallback<Actions['ajouterArdoise']>(
    (ligne) => poser('ardoise', { ...ligne, id: nouvelId(), rembourseeLe: null }),
    [poser],
  )
  const supprimerArdoise = useCallback<Actions['supprimerArdoise']>(
    (id) => retirer('ardoise', id),
    [retirer],
  )
  const rembourserArdoise = useCallback<Actions['rembourserArdoise']>(
    async (foyerId, periode) => {
      const le = jourDe()
      const aSolder = maisonRef.current.ardoise.filter(
        (l) => l.foyerId === foyerId && l.le.startsWith(periode) && !l.rembourseeLe,
      )
      for (const ligne of aSolder) await changer('ardoise', ligne.id, { rembourseeLe: le })
    },
    [changer],
  )

  /* ---------- la maisonnée ---------- */

  const modifierFoyer = useCallback<Actions['modifierFoyer']>(
    (id, changements) => changer('foyers', id, changements),
    [changer],
  )
  const ajouterMembre = useCallback<Actions['ajouterMembre']>(
    (membre) => poser('membres', { ...membre, id: nouvelId() }),
    [poser],
  )
  const modifierMembre = useCallback<Actions['modifierMembre']>(
    (id, changements) => changer('membres', id, changements),
    [changer],
  )
  const supprimerMembre = useCallback<Actions['supprimerMembre']>(
    (id) => retirer('membres', id),
    [retirer],
  )

  const sortir = useCallback(async () => {
    if (client) await client.auth.signOut()
    setMaison(MAISON_VIDE)
  }, [])

  const direQuiJeSuis = useCallback((id: Identifiant | null) => {
    ecrireMoi(id)
    setMoiId(id)
  }, [])

  const reglerDechets = useCallback<Actions['reglerDechets']>(async (dechets) => {
    try {
      await base.reglerLe('dechets', dechets)
      setMaison((p) => ({ ...p, reglages: { ...p.reglages, dechets } }))
      setErreur(null)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const reglerCotisationMensuelle = useCallback<Actions['reglerCotisationMensuelle']>(
    async (montants) => {
      try {
        await base.reglerLe('cotisationMensuelle', montants)
        setMaison((p) => ({ ...p, reglages: { ...p.reglages, cotisationMensuelle: montants } }))
        setErreur(null)
      } catch (e) {
        setErreur(e instanceof Error ? e.message : String(e))
      }
    },
    [],
  )

  const valeur = useMemo<Contenu>(
    () => ({
      maison,
      chargement,
      erreur,
      partagee: SERVEUR_BRANCHE,
      connecte,
      sortir,
      moiId,
      direQuiJeSuis,
      ajouterCharge,
      modifierCharge,
      supprimerCharge,
      noterPaiement,
      annulerPaiement,
      ajouterReglement,
      supprimerReglement,
      importerCharges,
      ajouterPiece,
      supprimerPiece,
      ajouterCotisation,
      modifierCotisation,
      supprimerCotisation,
      ajouterAchat,
      supprimerAchat,
      ajouterArdoise,
      supprimerArdoise,
      rembourserArdoise,
      modifierFoyer,
      ajouterMembre,
      modifierMembre,
      supprimerMembre,
      reglerDechets,
      reglerCotisationMensuelle,
      recharger,
    }),
    [
      maison,
      chargement,
      erreur,
      connecte,
      sortir,
      moiId,
      direQuiJeSuis,
      ajouterCharge,
      modifierCharge,
      supprimerCharge,
      noterPaiement,
      annulerPaiement,
      ajouterReglement,
      supprimerReglement,
      importerCharges,
      ajouterPiece,
      supprimerPiece,
      ajouterCotisation,
      modifierCotisation,
      supprimerCotisation,
      ajouterAchat,
      supprimerAchat,
      ajouterArdoise,
      supprimerArdoise,
      rembourserArdoise,
      modifierFoyer,
      ajouterMembre,
      modifierMembre,
      supprimerMembre,
      reglerDechets,
      reglerCotisationMensuelle,
      recharger,
    ],
  )

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

export function useMaison(): Contenu {
  const contenu = useContext(Contexte)
  if (!contenu) throw new Error('useMaison doit être appelé dans le fournisseur')
  return contenu
}
