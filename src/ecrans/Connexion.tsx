/* L'entrée de la maison : un code par famille, tapé dans le même champ.

   Quatre comptes avec quatre mots de passe, c'était la bonne façon de faire
   sur le papier — et la mauvaise dans cette maison : personne ne les aurait
   retenus, et Maru serait devenue le service d'assistance de sa propre
   famille. Un code qu'on se dit une fois vaut mieux qu'un système parfait
   dont tout le monde se détourne.

   Il y a pourtant deux codes, un par famille — parce que chaque famille a
   des dépenses que l'autre ne doit pas voir, et que seule la base peut
   garantir ça, à condition de savoir qui frappe. L'app essaie chaque compte
   avec le code tapé : personne n'a à choisir sa famille dans une liste,
   le code le dit. */

import { useState } from 'react'
import Symbole from '../composants/Symbole'
import { client } from '../lib/base'
import { COMPTES_FOYER, COMPTE_MAISON, motDePasseDe } from '../lib/comptes'

/* Les messages de Supabase sont exacts mais secs, et en anglais. On les
   montre tels quels — jamais masqués, c'est la règle — mais quand on
   reconnaît une panne de réglage, on ajoute dessous la phrase qui dit où
   aller regarder. Un message sur lequel on ne peut pas agir ne sert à rien. */
function indice(message: string): string | null {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return "Ce n'est le code d'aucune des deux familles. Demandez-le à Maru — et vérifiez les majuscules."
  }
  if (m.includes('invalid path') || m.includes('not found')) {
    return "L'adresse du serveur est mal réglée : VITE_SUPABASE_URL doit se terminer par « .supabase.co »."
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return "Le serveur n'a pas répondu. Vérifiez la connexion internet."
  }
  if (m.includes('api key') || m.includes('apikey') || m.includes('jwt')) {
    return 'La clé du serveur ne convient pas : il faut celle marquée « publishable », jamais la secrète.'
  }
  return null
}

export default function Connexion() {
  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function entrer() {
    if (!client || code.length === 0) return
    setEnCours(true)
    setErreur(null)
    // Chaque compte de famille, puis l'ancien compte commun : il ouvre encore
    // tout ce qui est partagé, le temps que les nouveaux codes circulent.
    let dernier: string | null = null
    for (const email of [...COMPTES_FOYER.map((c) => c.email), COMPTE_MAISON]) {
      const { error } = await client.auth.signInWithPassword({
        email,
        password: motDePasseDe(code),
      })
      if (!error) {
        dernier = null
        break
      }
      dernier = error.message
      // Une panne de réglage (adresse, clé, réseau) sera la même pour tous
      // les comptes : inutile d'insister trois fois.
      if (!error.message.toLowerCase().includes('invalid login credentials')) break
    }
    if (dernier) setErreur(dernier)
    setEnCours(false)
  }

  return (
    <div className="page" style={{ paddingTop: 70 }}>
      <div style={{ textAlign: 'center', marginBottom: 30, color: 'var(--lagon)' }}>
        <span style={{ display: 'inline-block' }}>
          <Symbole nom="maison" taille={68} epaisseur={1.3} />
        </span>
        <h1 style={{ fontSize: 31, marginTop: 12 }}>Sweet Home</h1>
        <p className="doux" style={{ margin: '4px 0 0' }}>
          La maison, à deux familles.
        </p>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="code">
          Le code de votre famille, à 4 chiffres
        </label>
        <input
          id="code"
          className="champ"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          placeholder="••••"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void entrer()
          }}
          style={{ fontSize: 20, letterSpacing: '0.15em', textAlign: 'center' }}
        />

        {erreur && (
          <>
            <p className="doux mini" style={{ margin: '12px 0 0', color: 'var(--corail-fonce)' }}>
              {erreur}
            </p>
            {indice(erreur) && (
              <p className="doux mini" style={{ margin: '8px 0 0', lineHeight: 1.7 }}>
                {indice(erreur)}
              </p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        className="bouton"
        disabled={enCours || code.length === 0}
        onClick={() => void entrer()}
      >
        {enCours ? 'Un instant…' : 'Entrer'}
      </button>

      <p className="doux mini" style={{ marginTop: 18, textAlign: 'center', lineHeight: 1.75 }}>
        Un code par famille : il ouvre tout ce qui est commun, et les dépenses de la vôtre
        seulement. Une fois tapé, ce téléphone s'en souvient.
      </p>
    </div>
  )
}
