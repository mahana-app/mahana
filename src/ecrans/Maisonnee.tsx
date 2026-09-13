/* Qui vit ici, et comment on partage.

   Deux réglages seulement, mais ce sont eux qui commandent tout le reste :
   la part de chaque foyer dans les charges, et ce qu'il verse dans la caisse
   chaque mois. Changer la part ne touche pas aux factures déjà saisies —
   celles-là gardent le partage qu'elles avaient, sinon des comptes déjà
   soldés se remettraient à bouger tout seuls. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { fcfp, lireMontant } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { membreDe } from '../lib/types'
import type { Identifiant, RoleMembre } from '../lib/types'

export default function Maisonnee({ fermer }: { fermer: () => void }) {
  const {
    maison,
    partagee,
    moiId,
    direQuiJeSuis,
    sortir,
    modifierFoyer,
    ajouterMembre,
    modifierMembre,
    supprimerMembre,
    reglerCotisationMensuelle,
  } = useMaison()
  const [nouveau, setNouveau] = useState<Identifiant | null>(null)
  const [prenom, setPrenom] = useState('')
  const [role, setRole] = useState<RoleMembre>('adulte')

  const moi = membreDe(maison, moiId)
  const cotisations = maison.reglages.cotisationMensuelle
  const totalCotisations = maison.foyers.reduce((s, f) => s + (cotisations[f.id] ?? 0), 0)

  return (
    <div className="page">
      <Entete kicker="Réglages" titre="La maisonnée" retour={fermer} />

      {maison.foyers.map((foyer) => {
        const membres = maison.membres.filter((m) => m.foyerId === foyer.id)
        return (
          <div className="carte" key={foyer.id}>
            <div className="rangee">
              <h2 style={{ fontSize: 19, color: foyer.couleur }}>{foyer.nom}</h2>
              <span className="pilule">{Math.round(foyer.part * 100)} % des charges</span>
            </div>

            <label className="etiquette" style={{ marginTop: 14 }} htmlFor={`part-${foyer.id}`}>
              Sa part des charges, en pour cent
            </label>
            <input
              id={`part-${foyer.id}`}
              className="champ"
              inputMode="numeric"
              value={Math.round(foyer.part * 100)}
              onChange={(e) => {
                const pourcent = Math.max(0, Math.min(100, lireMontant(e.target.value)))
                void modifierFoyer(foyer.id, { part: pourcent / 100 })
              }}
            />

            <label className="etiquette" style={{ marginTop: 14 }} htmlFor={`cotis-${foyer.id}`}>
              Ce qu'il verse dans la caisse chaque mois
            </label>
            <input
              id={`cotis-${foyer.id}`}
              className="champ"
              inputMode="numeric"
              placeholder="ex. 30 000"
              value={cotisations[foyer.id] ?? ''}
              onChange={(e) =>
                void reglerCotisationMensuelle({
                  ...cotisations,
                  [foyer.id]: lireMontant(e.target.value),
                })
              }
            />

            {/* les personnes du foyer */}
            <div className="kicker" style={{ marginTop: 18 }}>
              Qui en fait partie
            </div>
            {membres.length === 0 && (
              <p className="doux mini" style={{ margin: '8px 0 0' }}>
                Personne encore. Ajoutez les adultes et les enfants ci-dessous.
              </p>
            )}
            {membres.map((membre) => (
              <div key={membre.id} className="ligne-liste">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    className="champ"
                    style={{ padding: '8px 12px', fontWeight: 600 }}
                    value={membre.prenom}
                    onChange={(e) => void modifierMembre(membre.id, { prenom: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="pilule"
                  onClick={() =>
                    void modifierMembre(membre.id, {
                      role: membre.role === 'adulte' ? 'enfant' : 'adulte',
                    })
                  }
                >
                  {membre.role === 'adulte' ? 'Adulte' : 'Enfant'}
                </button>
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label={`Retirer ${membre.prenom}`}
                  onClick={() => {
                    if (confirm(`Retirer ${membre.prenom} de la maison ?`)) {
                      void supprimerMembre(membre.id)
                    }
                  }}
                >
                  <Symbole nom="croix" taille={13} />
                </button>
              </div>
            ))}

            {nouveau === foyer.id ? (
              <div style={{ marginTop: 12 }}>
                <input
                  className="champ"
                  autoFocus
                  placeholder="Le prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
                <div className="grille2" style={{ marginTop: 10 }}>
                  {(['adulte', 'enfant'] as RoleMembre[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`choix${role === r ? ' actif' : ''}`}
                      style={{ padding: '10px 12px', textAlign: 'center' }}
                      onClick={() => setRole(r)}
                    >
                      <b>{r === 'adulte' ? 'Adulte' : 'Enfant'}</b>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    className="bouton"
                    disabled={prenom.trim().length === 0}
                    onClick={() => {
                      void ajouterMembre({
                        foyerId: foyer.id,
                        prenom: prenom.trim(),
                        role,
                        code: '',
                        actif: true,
                      })
                      setPrenom('')
                      setNouveau(null)
                    }}
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    className="bouton-fin"
                    style={{ flex: '0 0 auto' }}
                    onClick={() => setNouveau(null)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="bouton-fin"
                style={{ width: '100%', marginTop: 12 }}
                onClick={() => {
                  setNouveau(foyer.id)
                  setRole('adulte')
                }}
              >
                + Ajouter quelqu'un
              </button>
            )}
          </div>
        )
      })}

      {/* À qui est ce téléphone : posé une fois, changeable ici. */}
      <div className="carte">
        <div className="kicker">Ce téléphone</div>
        {moi ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4 }}>
              C'est celui de {moi.prenom}
            </div>
            <p className="doux mini" style={{ margin: '4px 0 0', lineHeight: 1.7 }}>
              L'app dit bonjour par ce prénom, et le coche d'avance quand on note une course ou
              ce qu'on a pris à la roulotte.
            </p>
          </>
        ) : (
          <p className="doux mini" style={{ margin: '6px 0 0' }}>
            Ce téléphone n'est attribué à personne.
          </p>
        )}
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => direQuiJeSuis(null)}
        >
          {moi ? 'Ce n’est pas moi' : 'Dire qui je suis'}
        </button>
      </div>

      <div className="carte" style={{ background: 'var(--lagon-pale)' }}>
        <div className="kicker">Ce que ça donne</div>
        <div className="rangee" style={{ marginTop: 8 }}>
          <span className="doux">Dans la caisse chaque mois</span>
          <span className="chiffre">{fcfp(totalCotisations)}</span>
        </div>
        <div className="rangee" style={{ marginTop: 8 }}>
          <span className="doux">Total des parts</span>
          <span className="chiffre">
            {Math.round(maison.foyers.reduce((s, f) => s + f.part, 0) * 100)} %
          </span>
        </div>
        {Math.round(maison.foyers.reduce((s, f) => s + f.part, 0) * 100) !== 100 && (
          <p className="doux mini" style={{ margin: '10px 0 0', color: 'var(--corail-fonce)' }}>
            Les parts ne font pas 100 % : le partage des prochaines factures sera bancal.
          </p>
        )}
      </div>

      <div className="carte">
        <div className="kicker">Où sont les données</div>
        <p className="doux mini" style={{ margin: '8px 0 0', lineHeight: 1.75 }}>
          {partagee ? (
            <>
              L'application est <b>partagée</b> : tout ce que vous notez ici est visible par
              chaque personne de la maison qui ouvre l'app, sur son propre téléphone. Toute la
              maison entre avec <b>le même code</b> — pour le changer, il faut modifier le mot de
              passe du compte de la maison dans Supabase.
            </>
          ) : (
            <>
              L'application tourne en <b>mode essai</b> : tout reste dans ce téléphone et
              personne d'autre ne voit rien. Pour la partager entre les deux foyers, il faut
              brancher le serveur — la marche à suivre est dans le fichier
              <code> README.md </code> du projet.
            </>
          )}
        </p>
        {partagee && (
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 14 }}
            onClick={() => void sortir()}
          >
            Se déconnecter de ce téléphone
          </button>
        )}
      </div>
    </div>
  )
}
