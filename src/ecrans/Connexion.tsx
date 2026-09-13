/* L'entrée de la maison : un seul code, le même pour tout le monde.

   Quatre comptes avec quatre mots de passe, c'était la bonne façon de faire
   sur le papier — et la mauvaise dans cette maison : personne ne les aurait
   retenus, et Maru serait devenue le service d'assistance de sa propre
   famille. Un code partagé qu'on se dit une fois vaut mieux qu'un système
   parfait dont tout le monde se détourne.

   Techniquement, la maison a un seul compte chez Supabase. Son adresse est
   écrite ici et ne sert qu'à l'app ; le code que l'on tape est le mot de
   passe de ce compte. La serrure est donc la même que pour un vrai compte —
   c'est seulement la clé qui est partagée, comme celle de la porte d'entrée. */

import { useState } from 'react'
import Symbole from '../composants/Symbole'
import { client } from '../lib/base'

/** Le compte unique de la maison. Personne n'a à connaître cette adresse. */
export const COMPTE_MAISON = 'maison@sweet-home.pf'

/* Les messages de Supabase sont exacts mais secs, et en anglais. On les
   montre tels quels — jamais masqués, c'est la règle — mais quand on
   reconnaît une panne de réglage, on ajoute dessous la phrase qui dit où
   aller regarder. Un message sur lequel on ne peut pas agir ne sert à rien. */
function indice(message: string): string | null {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return "Ce n'est pas le code de la maison. Demandez-le à Maru — et vérifiez les majuscules."
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
    const { error } = await client.auth.signInWithPassword({
      email: COMPTE_MAISON,
      password: code,
    })
    if (error) setErreur(error.message)
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
          Le code de la maison
        </label>
        <input
          id="code"
          className="champ"
          type="password"
          inputMode="text"
          autoComplete="current-password"
          autoFocus
          placeholder="••••••"
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
        Le même code pour toute la maison. Une fois tapé, ce téléphone s'en souvient — vous ne
        le redemanderez pas tous les jours.
      </p>
    </div>
  )
}
