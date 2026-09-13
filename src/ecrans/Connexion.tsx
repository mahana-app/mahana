/* L'entrée de la maison.

   Les comptes sont créés une fois pour toutes dans Supabase, un par adulte.
   Pas d'inscription depuis l'app : on n'ouvre pas les comptes de deux
   familles à qui tomberait sur l'adresse. */

import { useState } from 'react'
import Symbole from '../composants/Symbole'
import { client } from '../lib/base'

export default function Connexion() {
  const [courriel, setCourriel] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function entrer() {
    if (!client) return
    setEnCours(true)
    setErreur(null)
    const { error } = await client.auth.signInWithPassword({
      email: courriel.trim(),
      password: motDePasse,
    })
    // Le message vient de Supabase : on le montre tel quel plutôt que de
    // deviner. « Invalid login credentials » dit au moins où chercher.
    if (error) setErreur(error.message)
    setEnCours(false)
  }

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 28, color: 'var(--lagon)' }}>
        <span style={{ display: 'inline-block' }}>
          <Symbole nom="maison" taille={64} epaisseur={1.3} />
        </span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>Fare</h1>
        <p className="doux" style={{ margin: '4px 0 0' }}>
          La maison, à deux familles.
        </p>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="courriel">
          Votre adresse
        </label>
        <input
          id="courriel"
          className="champ"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="prenom@exemple.pf"
          value={courriel}
          onChange={(e) => setCourriel(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="mot-de-passe">
          Votre mot de passe
        </label>
        <input
          id="mot-de-passe"
          className="champ"
          type="password"
          autoComplete="current-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void entrer()
          }}
        />

        {erreur && (
          <p className="doux mini" style={{ margin: '12px 0 0', color: 'var(--corail-fonce)' }}>
            {erreur}
          </p>
        )}
      </div>

      <button
        type="button"
        className="bouton"
        disabled={enCours || courriel.trim().length === 0 || motDePasse.length === 0}
        onClick={() => void entrer()}
      >
        {enCours ? 'Un instant…' : 'Entrer'}
      </button>

      <p className="doux mini" style={{ marginTop: 16, textAlign: 'center', lineHeight: 1.7 }}>
        Les comptes sont créés par Maru. Si vous n'en avez pas encore, demandez-lui — il n'y a
        pas d'inscription depuis cette page, exprès.
      </p>
    </div>
  )
}
