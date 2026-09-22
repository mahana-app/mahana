/* Où vivent les données.

   Cette application n'a de sens que partagée : quand Maru note la facture
   d'électricité, il faut que Manahiti la voie sur son téléphone. Les données
   sont donc sur un serveur (Supabase), et non plus seulement dans le
   téléphone comme dans Mahana.

   Mais tant que le serveur n'est pas branché, l'app ne doit pas être un mur :
   elle bascule alors en **mode essai**, tout reste dans le navigateur, et elle
   le dit clairement en haut de l'écran. C'est ce qui permet aussi de la
   mettre à l'épreuve écran par écran avant que qui que ce soit ait à créer
   quoi que ce soit.

   Toute l'intelligence (les partages, les soldes, les totaux) est calculée en
   TypeScript, jamais dans la base. Le serveur ne fait que garder des lignes :
   c'est ce qui permet d'avoir deux rangements différents sans jamais écrire
   deux fois la même règle de calcul. */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Maison } from './types'
import { FOYERS_DE_DEPART, MAISON_VIDE, REGLAGES_PAR_DEFAUT } from './types'

export type NomTable =
  | 'foyers'
  | 'membres'
  | 'charges'
  | 'parts_charge'
  | 'pieces_charge'
  | 'reglements'
  | 'cotisations'
  | 'achats'
  | 'ardoise'
  | 'depenses_perso'
  | 'budget_perso'
  | 'comptes_perso'

/* Le rangement de la maison dans l'objet Maison, table par table. */
const RUBRIQUE: Record<NomTable, keyof Maison> = {
  foyers: 'foyers',
  membres: 'membres',
  charges: 'charges',
  parts_charge: 'partsCharge',
  pieces_charge: 'piecesCharge',
  reglements: 'reglements',
  cotisations: 'cotisations',
  achats: 'achats',
  ardoise: 'ardoise',
  depenses_perso: 'depensesPerso',
  budget_perso: 'budgetPerso',
  comptes_perso: 'comptesPerso',
}

export const TABLES = Object.keys(RUBRIQUE) as NomTable[]

export function rubriqueDe(table: NomTable): keyof Maison {
  return RUBRIQUE[table]
}

/* ---------- les noms de colonnes ----------
   En TypeScript on écrit « foyerId », en SQL « foyer_id ». La conversion est
   mécanique dans les deux sens : inutile d'entretenir une liste à la main,
   qu'on oublierait de compléter en ajoutant un champ. */

const versSql = (clef: string) => clef.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase())
const versCode = (clef: string) => clef.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase())

function enSql(ligne: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(ligne).map(([c, v]) => [versSql(c), v]))
}

function enCode(ligne: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(ligne).map(([c, v]) => [versCode(c), v]))
}

/** Un identifiant lisible, pour ne pas dépendre d'une API du navigateur. */
export function nouvelId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export type Base = {
  /** Vrai quand les données sont sur le serveur, donc visibles par tous. */
  readonly partagee: boolean
  charger(): Promise<Maison>
  ajouter(table: NomTable, ligne: Record<string, unknown>): Promise<void>
  modifier(table: NomTable, id: string, changements: Record<string, unknown>): Promise<void>
  supprimer(table: NomTable, id: string): Promise<void>
  reglerLe(cle: string, valeur: unknown): Promise<void>
}

/* ---------- le mode essai : tout dans le navigateur ---------- */

const CLE = 'fare.v1'

function lireLocal(): Maison {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return { ...MAISON_VIDE, foyers: FOYERS_DE_DEPART }
    const lu = JSON.parse(brut) as Partial<Maison>
    // On recolle sur la maison vide : une sauvegarde à qui il manque une
    // rubrique ajoutée depuis ne doit pas faire planter l'écran.
    return {
      ...MAISON_VIDE,
      ...lu,
      foyers: lu.foyers?.length ? lu.foyers : FOYERS_DE_DEPART,
      reglages: { ...REGLAGES_PAR_DEFAUT, ...(lu.reglages ?? {}) },
    }
  } catch {
    return { ...MAISON_VIDE, foyers: FOYERS_DE_DEPART }
  }
}

function ecrireLocal(maison: Maison): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(maison))
  } catch {
    /* navigation privée ou mémoire pleine : on continue sans rien retenir */
  }
}

export function baseLocale(): Base {
  const majRubrique = (table: NomTable, change: (liste: unknown[]) => unknown[]) => {
    const maison = lireLocal()
    const rubrique = RUBRIQUE[table]
    const liste = maison[rubrique] as unknown[]
    ecrireLocal({ ...maison, [rubrique]: change(liste) } as Maison)
  }

  return {
    partagee: false,
    async charger() {
      return lireLocal()
    },
    async ajouter(table, ligne) {
      majRubrique(table, (liste) => [...liste, ligne])
    },
    async modifier(table, id, changements) {
      majRubrique(table, (liste) =>
        liste.map((l) => ((l as { id: string }).id === id ? { ...(l as object), ...changements } : l)),
      )
    },
    async supprimer(table, id) {
      majRubrique(table, (liste) => liste.filter((l) => (l as { id: string }).id !== id))
    },
    async reglerLe(cle, valeur) {
      const maison = lireLocal()
      ecrireLocal({ ...maison, reglages: { ...maison.reglages, [cle]: valeur } } as Maison)
    },
  }
}

/* ---------- le mode partagé : tout sur le serveur ---------- */

export function baseSupabase(client: SupabaseClient): Base {
  const verifier = (erreur: { message: string } | null) => {
    // On remonte le message de la base tel quel. Un écran qui ne peut pas
    // lire ne doit jamais afficher une liste vide : ça se lit comme
    // « il n'y a rien », et on cherche pendant des jours au mauvais endroit.
    if (erreur) throw new Error(erreur.message)
  }

  return {
    partagee: true,
    async charger() {
      const maison: Maison = { ...MAISON_VIDE, reglages: { ...REGLAGES_PAR_DEFAUT } }
      for (const table of TABLES) {
        const { data, error } = await client.from(table).select('*')
        verifier(error)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(maison[RUBRIQUE[table]] as unknown[]) = (data ?? []).map(enCode)
      }
      const { data, error } = await client.from('reglages').select('*')
      verifier(error)
      for (const ligne of data ?? []) {
        ;(maison.reglages as Record<string, unknown>)[versCode(ligne.cle as string)] = ligne.valeur
      }
      return maison
    },
    async ajouter(table, ligne) {
      const { error } = await client.from(table).insert(enSql(ligne))
      verifier(error)
    },
    async modifier(table, id, changements) {
      const { error } = await client.from(table).update(enSql(changements)).eq('id', id)
      verifier(error)
    },
    async supprimer(table, id) {
      const { error } = await client.from(table).delete().eq('id', id)
      verifier(error)
    },
    async reglerLe(cle, valeur) {
      const { error } = await client.from('reglages').upsert({ cle: versSql(cle), valeur })
      verifier(error)
    },
  }
}

/* ---------- laquelle des deux ---------- */

/* L'adresse du serveur, nettoyée de ce qu'on y colle par mégarde.

   Supabase montre cette adresse à trois endroits différents, et l'un d'eux
   la donne suivie de « /rest/v1 ». Collée telle quelle, l'app demandait
   « …/rest/v1/auth/v1/token » et le serveur répondait « Invalid path
   specified in request URL » — un message juste, mais qui ne dit pas où est
   la faute. Un réglage qui se fait sur un téléphone, à 22 h, doit pardonner
   une barre oblique de trop. */
function origineSeule(adresse: string | undefined): string | undefined {
  if (!adresse) return undefined
  const propre = adresse.trim()
  try {
    return new URL(propre).origin
  } catch {
    // Pas une adresse complète : au moins, on retire ce qui traîne au bout.
    return propre.replace(/\/+$/, '')
  }
}

const ADRESSE = origineSeule(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const CLE_PUBLIQUE = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

/** Vrai quand le serveur est branché : l'app est alors vraiment partagée. */
export const SERVEUR_BRANCHE = Boolean(ADRESSE && CLE_PUBLIQUE)

/* Le client Supabase, quand il y en a un. Il sert aussi à la connexion :
   la clé publique qui est dans la page n'est pas un secret, c'est le compte
   de chacun qui donne le droit de lire — voir la politique du schéma. */
export const client: SupabaseClient | null = SERVEUR_BRANCHE
  ? createClient(ADRESSE as string, CLE_PUBLIQUE as string)
  : null

export const base: Base = client ? baseSupabase(client) : baseLocale()
