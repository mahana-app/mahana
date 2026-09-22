/* Noter ce qu'on a pris à la roulotte. Deux touches et c'est fait : si c'est
   plus long que ça, personne ne le notera et le mois sera faux. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { jourDe, lireMontant } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { foyersFamille } from '../lib/types'

export default function NouvelleArdoise({ fermer }: { fermer: () => void }) {
  const { maison, moiId, monFoyerId, ajouterArdoise } = useMaison()
  // On part de celui qui tient le téléphone, et de son foyer : c'est presque
  // toujours pour soi qu'on prend à manger à la roulotte.
  const moi = maison.membres.find((m) => m.id === moiId)
  const [foyerId, setFoyerId] = useState(
    moi?.foyerId ?? monFoyerId ?? foyersFamille(maison)[0]?.id ?? '',
  )
  const [parMembreId, setParMembreId] = useState<string | null>(moi?.id ?? null)
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [le, setLe] = useState(jourDe())

  const montant = lireMontant(montantTexte)
  const membres = maison.membres.filter((m) => m.foyerId === foyerId && m.aUnTelephone && m.actif)

  return (
    <div className="page">
      <Entete kicker="La roulotte" titre="Noter ce qu'on a pris" retour={fermer} />

      <div className="carte">
        <div className="kicker">Quel foyer</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {foyersFamille(maison).map((foyer) => (
            <button
              key={foyer.id}
              type="button"
              className={`choix${foyerId === foyer.id ? ' actif' : ''}`}
              style={{ padding: '12px 10px', textAlign: 'center' }}
              onClick={() => {
                setFoyerId(foyer.id)
                setParMembreId(null)
              }}
            >
              <b style={{ color: foyer.couleur }}>{foyer.nom}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="montant-ardoise">
          Combien, en francs
        </label>
        <input
          id="montant-ardoise"
          className="champ"
          inputMode="numeric"
          autoFocus
          placeholder="ex. 1 800"
          value={montantTexte}
          onChange={(e) => setMontantTexte(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700 }}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="libelle-ardoise">
          Qu'est-ce que c'était
        </label>
        <input
          id="libelle-ardoise"
          className="champ"
          placeholder="ex. 2 casse-croûtes et un poulet"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="date-ardoise">
          Quel jour
        </label>
        <input
          id="date-ardoise"
          className="champ"
          type="date"
          value={le}
          onChange={(e) => setLe(e.target.value)}
        />
      </div>

      {membres.length > 0 && (
        <div className="carte">
          <div className="kicker">Qui est venu chercher (facultatif)</div>
          <div className="grille2" style={{ marginTop: 10 }}>
            {membres.map((membre) => (
              <button
                key={membre.id}
                type="button"
                className={`choix${parMembreId === membre.id ? ' actif' : ''}`}
                style={{ padding: '10px 12px', textAlign: 'center' }}
                onClick={() => setParMembreId(parMembreId === membre.id ? null : membre.id)}
              >
                <b>{membre.prenom}</b>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="bouton"
        disabled={montant <= 0 || libelle.trim().length === 0 || !foyerId}
        onClick={() => {
          void ajouterArdoise({ le, foyerId, parMembreId, libelle: libelle.trim(), montant })
          fermer()
        }}
      >
        Noter sur l'ardoise
      </button>
    </div>
  )
}
