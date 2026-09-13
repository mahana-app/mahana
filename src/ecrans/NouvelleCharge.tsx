/* Saisir une facture. Trois choses seulement : ce que c'est, combien, quel
   mois. Le partage est proposé d'après les parts de la maison, et se corrige
   à la main quand cette facture-là se partage autrement. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { fcfp, lireMontant, moisDe, moisDecale, moisEnMots, repartir } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { NATURES } from '../lib/types'
import type { Identifiant, NatureCharge } from '../lib/types'

export default function NouvelleCharge({ fermer }: { fermer: () => void }) {
  const { maison, ajouterCharge } = useMaison()
  const [nature, setNature] = useState<NatureCharge>('electricite')
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [periode, setPeriode] = useState(moisDe())
  const [note, setNote] = useState('')
  const [partsCorrigees, setPartsCorrigees] = useState<Record<Identifiant, string> | null>(null)

  const montant = lireMontant(montantTexte)
  const proposees = repartir(montant, maison.foyers)

  const parts: Record<Identifiant, number> = partsCorrigees
    ? Object.fromEntries(
        maison.foyers.map((f) => [f.id, lireMontant(partsCorrigees[f.id] ?? '0')]),
      )
    : proposees
  const sommeParts = Object.values(parts).reduce((somme, v) => somme + v, 0)
  const ecart = montant - sommeParts

  const mois = [moisDecale(moisDe(), -1), moisDe(), moisDecale(moisDe(), 1)]

  return (
    <div className="page">
      <Entete kicker="Les charges" titre="Ajouter une facture" retour={fermer} />

      <div className="carte">
        <div className="kicker">De quoi s'agit-il</div>
        <div className="grille3" style={{ marginTop: 10 }}>
          {NATURES.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`choix${nature === n.id ? ' actif' : ''}`}
              style={{ padding: '12px 6px', textAlign: 'center' }}
              onClick={() => setNature(n.id)}
            >
              <span style={{ fontSize: 22, display: 'block' }}>{n.emoji}</span>
              <b style={{ fontSize: 12.5, marginTop: 2 }}>{n.nom}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="montant">
          Le montant, en francs
        </label>
        <input
          id="montant"
          className="champ"
          inputMode="numeric"
          autoFocus
          placeholder="ex. 24 600"
          value={montantTexte}
          onChange={(e) => setMontantTexte(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700 }}
        />

        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="libelle">
          Un mot pour la reconnaître (facultatif)
        </label>
        <input
          id="libelle"
          className="champ"
          placeholder="ex. Relevé de septembre"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }}>
          Quel mois
        </label>
        <div className="grille3">
          {mois.map((m) => (
            <button
              key={m}
              type="button"
              className={`choix${periode === m ? ' actif' : ''}`}
              style={{ padding: '10px 6px', textAlign: 'center' }}
              onClick={() => setPeriode(m)}
            >
              <b style={{ fontSize: 13, textTransform: 'capitalize' }}>
                {moisEnMots(m).split(' ')[0]}
              </b>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- le partage ---------- */}
      <div className="carte">
        <div className="rangee">
          <div className="kicker">Le partage</div>
          {partsCorrigees && (
            <button
              type="button"
              className="doux mini"
              style={{ border: 0, background: 'none', textDecoration: 'underline' }}
              onClick={() => setPartsCorrigees(null)}
            >
              revenir au partage habituel
            </button>
          )}
        </div>

        {maison.foyers.map((foyer) => (
          <div key={foyer.id} style={{ marginTop: 12 }}>
            <label className="etiquette" htmlFor={`part-${foyer.id}`} style={{ color: foyer.couleur }}>
              {foyer.nom} · {Math.round(foyer.part * 100)} % d'habitude
            </label>
            <input
              id={`part-${foyer.id}`}
              className="champ"
              inputMode="numeric"
              value={partsCorrigees ? (partsCorrigees[foyer.id] ?? '') : String(proposees[foyer.id] ?? 0)}
              onChange={(e) =>
                setPartsCorrigees({
                  ...(partsCorrigees ??
                    Object.fromEntries(maison.foyers.map((f) => [f.id, String(proposees[f.id] ?? 0)]))),
                  [foyer.id]: e.target.value,
                })
              }
            />
          </div>
        ))}

        {ecart !== 0 && montant > 0 && (
          <p className="doux mini" style={{ margin: '10px 0 0', color: 'var(--corail-fonce)' }}>
            Les parts font {fcfp(sommeParts)} au lieu de {fcfp(montant)} :{' '}
            {ecart > 0 ? `il manque ${fcfp(ecart)}` : `il y a ${fcfp(-ecart)} de trop`}.
          </p>
        )}
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="note">
          Une note (facultative)
        </label>
        <textarea
          id="note"
          className="champ"
          rows={2}
          style={{ resize: 'vertical' }}
          placeholder="ex. relevé en retard, régularisation"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="bouton"
        disabled={montant <= 0 || ecart !== 0}
        onClick={() => {
          void ajouterCharge(
            { nature, libelle: libelle.trim(), periode, montant, note: note.trim() },
            parts,
          )
          fermer()
        }}
      >
        Ajouter la facture
      </button>
    </div>
  )
}
