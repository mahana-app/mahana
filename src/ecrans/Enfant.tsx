/* L'écran des ados : rien que la roulotte.

   Mia et Manahiti prennent à manger à la roulotte comme tout le monde, et
   c'est à eux de le noter — personne d'autre ne sait ce qu'ils ont pris.
   Mais les factures d'électricité, les cotisations et les comptes entre les
   deux familles ne les regardent pas : ils n'ont donc que cet écran-ci.

   Deux champs et un bouton. S'il en fallait trois, ça ne serait pas noté. */

import { useState } from 'react'
import Symbole from '../composants/Symbole'
import { ardoiseDuMois, fcfp, jourCourt, jourDe, lireMontant, moisDe, moisEnMots } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { salutation } from '../lib/moi'
import { foyerDe, membreDe } from '../lib/types'

export default function Enfant() {
  const { maison, moiId, ajouterArdoise, supprimerArdoise, direQuiJeSuis } = useMaison()
  const moi = membreDe(maison, moiId)
  const foyer = foyerDe(maison, moi?.foyerId ?? null)
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [noté, setNoté] = useState(false)

  const periode = moisDe()
  const montant = lireMontant(montantTexte)
  // Les siennes seulement : ce qu'a pris son frère ou sa cousine ne le regarde
  // pas davantage que les factures.
  const siennes = ardoiseDuMois(maison, periode).filter((l) => l.parMembreId === moiId)
  const total = siennes.reduce((somme, l) => somme + l.montant, 0)

  function noter() {
    if (!moi || montant <= 0 || libelle.trim().length === 0) return
    void ajouterArdoise({
      le: jourDe(),
      foyerId: moi.foyerId,
      parMembreId: moi.id,
      libelle: libelle.trim(),
      montant,
    })
    setLibelle('')
    setMontantTexte('')
    setNoté(true)
    window.setTimeout(() => setNoté(false), 2500)
  }

  return (
    <div className="page" style={{ paddingBottom: 30 }}>
      <div style={{ textAlign: 'center', padding: '30px 0 20px', color: 'var(--corail)' }}>
        <span style={{ display: 'inline-block' }}>
          <Symbole nom="roulotte" taille={52} epaisseur={1.4} />
        </span>
        <h1 style={{ fontSize: 25, marginTop: 10 }}>
          {salutation()} {moi?.prenom}
        </h1>
        <p className="doux" style={{ margin: '4px 20px 0' }}>
          Qu'est-ce que tu as pris à la roulotte&nbsp;?
        </p>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="quoi">
          Qu'est-ce que c'était
        </label>
        <input
          id="quoi"
          className="champ"
          placeholder="ex. un casse-croûte et un jus"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="combien">
          Combien, en francs
        </label>
        <input
          id="combien"
          className="champ"
          inputMode="numeric"
          placeholder="ex. 850"
          value={montantTexte}
          onChange={(e) => setMontantTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') noter()
          }}
          style={{ fontSize: 22, fontWeight: 700 }}
        />
      </div>

      <button
        type="button"
        className="bouton corail"
        disabled={montant <= 0 || libelle.trim().length === 0}
        onClick={noter}
      >
        Noter
      </button>

      {noté && (
        <div className="bandeau" style={{ background: 'var(--feuille-pale)', color: 'var(--feuille)', marginTop: 13 }}>
          <b>C'est noté.</b> Merci&nbsp;!
        </div>
      )}

      {/* Ce qu'il a pris ce mois-ci, et le total */}
      <div className="titre-section" style={{ textTransform: 'capitalize' }}>
        {moisEnMots(periode)}
      </div>

      <div className="carte" style={{ background: 'var(--corail-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Tu as pris pour</div>
            <div className="chiffre" style={{ fontSize: 30 }}>
              {fcfp(total)}
            </div>
          </div>
          <Symbole nom="roulotte" taille={26} couleur="var(--corail)" />
        </div>
        <div className="doux mini" style={{ marginTop: 6 }}>
          {foyer ? `C'est mis sur le compte des ${foyer.nom}, remboursé à la fin du mois.` : ''}
        </div>
      </div>

      {siennes.length === 0 ? (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Rien de noté ce mois-ci.
          </p>
        </div>
      ) : (
        <div className="carte">
          {siennes.map((ligne) => (
            <div key={ligne.id} className="ligne-liste">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ligne.libelle}</div>
                <div className="doux mini">
                  {jourCourt(ligne.le)}
                  {ligne.rembourseeLe ? ' · remboursé' : ''}
                </div>
              </div>
              <span className="chiffre mini">{fcfp(ligne.montant)}</span>
              {/* On ne peut retirer que ce qui n'a pas encore été remboursé :
                  après, le compte est soldé et ne doit plus bouger. */}
              {!ligne.rembourseeLe && (
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label={`Retirer ${ligne.libelle}`}
                  onClick={() => {
                    if (confirm(`Retirer « ${ligne.libelle} » ?`)) void supprimerArdoise(ligne.id)
                  }}
                >
                  <Symbole nom="croix" taille={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', marginTop: 6 }}
        onClick={() => direQuiJeSuis(null)}
      >
        Ce n'est pas mon téléphone
      </button>
    </div>
  )
}
