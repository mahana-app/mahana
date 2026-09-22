/* Changer le code de notre famille, depuis l'app.

   Pourquoi ici et pas dans Supabase : Maru crée le compte des LENOIR — c'est
   elle qui tient le serveur — mais elle ne doit pas connaître leur code. Elle
   leur donne donc un code provisoire, et ils le remplacent eux-mêmes à leur
   première entrée. Après ça, personne d'autre qu'eux ne le connaît.

   Le compte de la maison (l'ancien code commun) n'est d'aucune famille : pas
   de bouton pour lui. */

import { useState } from 'react'
import { client } from '../lib/base'
import { useMaison } from '../lib/maison'
import { motDePasseDe } from '../lib/comptes'
import { foyerDe } from '../lib/types'

export default function ChangerCode() {
  const { maison, monFoyerId } = useMaison()
  const [nouveau, setNouveau] = useState('')
  const [encore, setEncore] = useState('')
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'fait'>('repos')
  const [souci, setSouci] = useState('')
  const foyer = foyerDe(maison, monFoyerId)

  if (!client || !foyer) return null

  const quatreChiffres = /^\d{4}$/.test(nouveau)
  const pret = quatreChiffres && nouveau === encore && etat !== 'envoi'

  async function changer() {
    if (!client || !pret) return
    setEtat('envoi')
    setSouci('')
    const { error } = await client.auth.updateUser({ password: motDePasseDe(nouveau) })
    if (error) {
      setSouci(error.message)
      setEtat('repos')
      return
    }
    setNouveau('')
    setEncore('')
    setEtat('fait')
  }

  return (
    <div className="carte">
      <div className="kicker">Le code des {foyer.nom}</div>
      <p className="doux mini" style={{ margin: '8px 0 12px', lineHeight: 1.75 }}>
        Quatre chiffres, que seule votre famille connaît. Si on vous a donné un code
        provisoire, changez-le maintenant : après, personne d'autre ne le saura.
      </p>

      <label className="etiquette" htmlFor="code-nouveau">
        Le nouveau code
      </label>
      <input
        id="code-nouveau"
        className="champ"
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        placeholder="••••"
        value={nouveau}
        onChange={(e) => {
          setNouveau(e.target.value.replace(/\D/g, ''))
          setEtat('repos')
        }}
        style={{ fontSize: 20, letterSpacing: '0.2em', textAlign: 'center' }}
      />

      <label className="etiquette" style={{ marginTop: 12 }} htmlFor="code-encore">
        Le même, une deuxième fois
      </label>
      <input
        id="code-encore"
        className="champ"
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        placeholder="••••"
        value={encore}
        onChange={(e) => setEncore(e.target.value.replace(/\D/g, ''))}
        style={{ fontSize: 20, letterSpacing: '0.2em', textAlign: 'center' }}
      />

      {nouveau.length === 4 && encore.length === 4 && nouveau !== encore && (
        <p className="doux mini" style={{ margin: '8px 0 0', color: 'var(--corail-fonce)' }}>
          Les deux codes ne sont pas les mêmes.
        </p>
      )}
      {souci && (
        <p className="doux mini" style={{ margin: '8px 0 0', color: 'var(--corail-fonce)' }}>
          {souci}
        </p>
      )}

      <button
        type="button"
        className="bouton"
        style={{ marginTop: 14 }}
        disabled={!pret}
        onClick={() => void changer()}
      >
        {etat === 'envoi' ? 'Un instant…' : etat === 'fait' ? 'Code changé' : 'Changer notre code'}
      </button>

      {etat === 'fait' && (
        <p className="doux mini" style={{ margin: '10px 0 0', lineHeight: 1.7 }}>
          C'est fait. Dites-le aux vôtres : le prochain téléphone qui entre tapera le nouveau
          code. Ceux déjà entrés restent entrés.
        </p>
      )}
    </div>
  )
}
