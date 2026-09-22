/* Noter une dépense de la famille. Aussi court que la course en gros : ça
   se fait debout, le ticket à la main. Le foyer n'est pas demandé — c'est
   celui du compte, et la base refuserait un autre. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { jourDe, lireMontant } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { CATEGORIES_DEPENSE } from '../lib/types'
import type { CategorieDepense } from '../lib/types'

export default function NouvelleDepensePerso({ fermer }: { fermer: () => void }) {
  const { maison, moiId, monFoyerId, ajouterDepensePerso } = useMaison()
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [categorie, setCategorie] = useState<CategorieDepense>('courses')
  const [parMembreId, setParMembreId] = useState<string | null>(moiId)
  const [le, setLe] = useState(jourDe())

  const montant = lireMontant(montantTexte)
  const gens = maison.membres.filter(
    (m) => m.foyerId === monFoyerId && m.aUnTelephone && m.actif,
  )

  return (
    <div className="page">
      <Entete kicker="Nos dépenses" titre="Noter une dépense" retour={fermer} />

      <div className="carte">
        <label className="etiquette" htmlFor="montant-depense">
          Combien, en francs
        </label>
        <input
          id="montant-depense"
          className="champ"
          inputMode="numeric"
          autoFocus
          placeholder="ex. 4 500"
          value={montantTexte}
          onChange={(e) => setMontantTexte(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700 }}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="libelle-depense">
          Qu'est-ce que c'était
        </label>
        <input
          id="libelle-depense"
          className="champ"
          placeholder="ex. Forfait Vini de Will"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="date-depense">
          Quel jour
        </label>
        <input
          id="date-depense"
          className="champ"
          type="date"
          value={le}
          onChange={(e) => setLe(e.target.value)}
        />
      </div>

      <div className="carte">
        <div className="kicker">C'est pour quoi</div>
        <div className="grille3" style={{ marginTop: 10 }}>
          {CATEGORIES_DEPENSE.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`choix${categorie === c.id ? ' actif' : ''}`}
              style={{ padding: '12px 6px', textAlign: 'center' }}
              onClick={() => setCategorie(c.id)}
            >
              <span style={{ fontSize: 22, display: 'block' }}>{c.emoji}</span>
              <b style={{ fontSize: 12, marginTop: 2 }}>{c.nom}</b>
            </button>
          ))}
        </div>
      </div>

      {gens.length > 0 && (
        <div className="carte">
          <div className="kicker">Qui a payé (facultatif)</div>
          <div className="grille2" style={{ marginTop: 10 }}>
            {gens.map((membre) => (
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
        disabled={montant <= 0 || libelle.trim().length === 0 || !monFoyerId}
        onClick={() => {
          if (!monFoyerId) return
          void ajouterDepensePerso({
            foyerId: monFoyerId,
            le,
            libelle: libelle.trim(),
            montant,
            categorie,
            parMembreId,
            note: '',
          })
          fermer()
        }}
      >
        Noter la dépense
      </button>
    </div>
  )
}
