/* Noter une course payée avec la caisse commune. Court exprès : ça se fait
   debout dans le magasin, le ticket à la main. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { jourDe, lireMontant } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { CATEGORIES_ACHAT } from '../lib/types'
import type { CategorieAchat } from '../lib/types'

export default function NouvelAchat({ fermer }: { fermer: () => void }) {
  const { maison, moiId, ajouterAchat } = useMaison()
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [categorie, setCategorie] = useState<CategorieAchat>('viande')
  // Neuf fois sur dix, c'est celui qui tient le téléphone qui y est allé.
  const [parMembreId, setParMembreId] = useState<string | null>(moiId)
  const [le, setLe] = useState(jourDe())

  const montant = lireMontant(montantTexte)
  const adultes = maison.membres.filter((m) => m.role === 'adulte' && m.actif)

  return (
    <div className="page">
      <Entete kicker="La caisse" titre="Noter une course" retour={fermer} />

      <div className="carte">
        <label className="etiquette" htmlFor="montant-achat">
          Combien, en francs
        </label>
        <input
          id="montant-achat"
          className="champ"
          inputMode="numeric"
          autoFocus
          placeholder="ex. 18 500"
          value={montantTexte}
          onChange={(e) => setMontantTexte(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700 }}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="libelle-achat">
          Qu'est-ce que c'était
        </label>
        <input
          id="libelle-achat"
          className="champ"
          placeholder="ex. Poulet et viande hachée en gros"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="date-achat">
          Quel jour
        </label>
        <input
          id="date-achat"
          className="champ"
          type="date"
          value={le}
          onChange={(e) => setLe(e.target.value)}
        />
      </div>

      <div className="carte">
        <div className="kicker">Dans quel rayon</div>
        <div className="grille3" style={{ marginTop: 10 }}>
          {CATEGORIES_ACHAT.map((c) => (
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

      {adultes.length > 0 && (
        <div className="carte">
          <div className="kicker">Qui y est allé (facultatif)</div>
          <div className="grille2" style={{ marginTop: 10 }}>
            {adultes.map((membre) => (
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
        disabled={montant <= 0 || libelle.trim().length === 0}
        onClick={() => {
          void ajouterAchat({
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
        Noter la course
      </button>
    </div>
  )
}
