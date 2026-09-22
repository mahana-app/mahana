/* Les comptes de la maison chez Supabase : un par famille.

   Un seul compte pour toute la maison, c'était plus simple — et ça
   interdisait tout ce qui est privé. La base ne savait pas distinguer un
   LAI AH CHE d'un LENOIR : la question « qui es-tu ? » était une politesse,
   pas une serrure. Dès qu'on veut des dépenses que l'autre famille ne voit
   pas, il faut que la base sache qui frappe à la porte.

   D'où un compte par foyer, avec son propre code. Deux codes pour toute la
   maison, ce n'est pas quatre mots de passe : on se le dit une fois. Et le
   code se tape dans le même champ qu'avant, l'app essaie chaque compte —
   personne n'a à savoir qu'il y en a deux. */

import type { Identifiant } from './types'

export type CompteFoyer = { foyerId: Identifiant; email: string }

/* Ces adresses ne servent qu'à l'app : elles ne reçoivent aucun courrier et
   personne n'a à les taper. Elles sont aussi écrites dans la base
   (foyers.compte), qui s'en sert pour ne montrer à chaque famille que ses
   propres dépenses. Changer l'une sans l'autre ouvre la serrure. */
export const COMPTES_FOYER: CompteFoyer[] = [
  { foyerId: 'lai-ah-che', email: 'lai-ah-che@sweet-home.pf' },
  { foyerId: 'lenoir', email: 'lenoir@sweet-home.pf' },
]

/** L'ancien compte commun. Il ouvre encore tout ce qui est partagé, mais ne
    voit les dépenses perso de personne : il n'est d'aucune famille. */
export const COMPTE_MAISON = 'maison@sweet-home.pf'

/* Un code à quatre chiffres, comme sur Sodi's App : c'est ce qu'une famille
   retient. Supabase, lui, refuse un mot de passe de moins de six signes. On
   complète donc le code en coulisses avant de l'envoyer — le mot de passe
   réel du compte est « 1234-fare » quand le code est 1234. C'est un code de
   porte, pas un coffre : dix mille combinaisons, et le serveur freine les
   essais répétés. Pour cette maison, c'est le bon compromis. */
export const SUFFIXE_CODE = '-fare'

export const motDePasseDe = (code: string) =>
  code.length < 6 ? code + SUFFIXE_CODE : code

/** Le foyer derrière une adresse de compte. Rien si c'est l'ancien compte. */
export const foyerDuCompte = (email: string | null | undefined): Identifiant | null =>
  COMPTES_FOYER.find((c) => c.email === email)?.foyerId ?? null
