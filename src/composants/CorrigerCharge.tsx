/* Corriger une facture déjà entrée.

   Une faute de frappe sur le montant, un mauvais mois, la mauvaise nature :
   ça arrive, et supprimer la facture pour la ressaisir ferait perdre les
   remboursements déjà notés dessus et sa photo. On corrige donc sur place.

   Si le montant change, les parts suivent dans les mêmes proportions — une
   part corrigée à la main le reste. Et si quelqu'un avait déjà rendu plus
   que sa nouvelle part, on le dit ici plutôt que de le laisser découvrir. */

import { useState } from 'react'
import ChoixMois from './ChoixMois'
import Pliant from './Pliant'
import { fcfp, lireMontant, partsDeLaNature, repartir } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { NATURES, foyerDe } from '../lib/types'
import type { Charge, NatureCharge } from '../lib/types'

export default function CorrigerCharge({ charge }: { charge: Charge }) {
  const { maison, corrigerCharge, repartagerCharge } = useMaison()
  const [montantTexte, setMontantTexte] = useState(String(charge.montant))
  const [libelle, setLibelle] = useState(charge.libelle)
  const [nature, setNature] = useState<NatureCharge>(charge.nature)
  const [periode, setPeriode] = useState(charge.periode)
  const [enregistre, setEnregistre] = useState(false)

  const montant = lireMontant(montantTexte)
  const rienNaChange =
    montant === charge.montant &&
    libelle.trim() === charge.libelle &&
    nature === charge.nature &&
    periode === charge.periode

  // Ce que chacun aurait à sa charge après correction : les parts d'aujourd'hui,
  // reportées sur le nouveau montant. Sert à prévenir d'un trop-rendu.
  const anciennes = maison.partsCharge.filter((p) => p.chargeId === charge.id)
  const totalParts = anciennes.reduce((somme, p) => somme + p.montant, 0) || 1
  const tropRendus = maison.foyers
    .map((foyer) => {
      const part = anciennes.find((p) => p.foyerId === foyer.id)?.montant ?? 0
      const nouvellePart = Math.round((montant * part) / totalParts)
      const rendu = maison.reglements
        .filter((r) => r.chargeId === charge.id && r.foyerId === foyer.id)
        .reduce((somme, r) => somme + r.montant, 0)
      return { foyer, nouvellePart, rendu }
    })
    .filter((x) => x.rendu > x.nouvellePart)

  // Le partage que donnerait le réglage du jour, comparé à celui qui est figé
  // sur la facture. S'ils diffèrent, on propose de la repartager — c'est le
  // cas des factures entrées avant que la roulotte prenne deux tiers de
  // l'électricité.
  const duJour = repartir(charge.montant, maison.foyers, partsDeLaNature(maison, charge.nature))
  const partageDiffere = maison.foyers.some(
    (f) => (anciennes.find((p) => p.foyerId === f.id)?.montant ?? 0) !== (duJour[f.id] ?? 0),
  )
  const [repartagee, setRepartagee] = useState(false)

  return (
    <Pliant titre="Corriger la facture" ouvertAuDepart={partageDiffere}>
      {partageDiffere && (
        <div
          style={{
            background: 'var(--ocre-pale)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 700 }}>Cette facture n'est pas partagée comme aujourd'hui</div>
          <p className="doux mini" style={{ margin: '4px 0 8px', lineHeight: 1.7 }}>
            Le réglage du jour donnerait{' '}
            {maison.foyers
              .map((f) => `${f.nom} ${fcfp(duJour[f.id] ?? 0)}`)
              .join(' · ')}
            . Les parts sont figées à la saisie : elles ne bougent que si vous le demandez.
          </p>
          <button
            type="button"
            className="bouton"
            style={{ padding: '11px 14px', fontSize: 14 }}
            disabled={repartagee}
            onClick={() => void repartagerCharge(charge.id).then(() => setRepartagee(true))}
          >
            {repartagee ? 'Repartagée' : "Repartager selon le réglage d'aujourd'hui"}
          </button>
        </div>
      )}

      <label className="etiquette" htmlFor="corriger-montant">
        Le montant, en francs
      </label>
      <input
        id="corriger-montant"
        className="champ"
        inputMode="numeric"
        value={montantTexte}
        onChange={(e) => {
          setMontantTexte(e.target.value)
          setEnregistre(false)
        }}
        style={{ fontSize: 20, fontWeight: 700 }}
      />

      <label className="etiquette" style={{ marginTop: 14 }} htmlFor="corriger-libelle">
        Un mot pour la reconnaître
      </label>
      <input
        id="corriger-libelle"
        className="champ"
        value={libelle}
        placeholder="ex. Relevé de septembre"
        onChange={(e) => {
          setLibelle(e.target.value)
          setEnregistre(false)
        }}
      />

      <label className="etiquette" style={{ marginTop: 14 }}>
        De quoi s'agit-il
      </label>
      <div className="grille3">
        {NATURES.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`choix${nature === n.id ? ' actif' : ''}`}
            style={{ padding: '10px 6px', textAlign: 'center' }}
            onClick={() => {
              setNature(n.id)
              setEnregistre(false)
            }}
          >
            <span style={{ fontSize: 20, display: 'block' }}>{n.emoji}</span>
            <b style={{ fontSize: 12.5 }}>{n.nom}</b>
          </button>
        ))}
      </div>

      <label className="etiquette" style={{ marginTop: 14 }}>
        Quel mois
      </label>
      <div style={{ marginTop: -4 }}>
        <ChoixMois
          periode={periode}
          changer={(p) => {
            setPeriode(p)
            setEnregistre(false)
          }}
        />
      </div>

      {montant !== charge.montant && montant > 0 && (
        <p className="doux mini" style={{ margin: '4px 0 0', lineHeight: 1.7 }}>
          Les parts passeront de {fcfp(charge.montant)} à {fcfp(montant)}, dans les mêmes
          proportions qu'aujourd'hui.
        </p>
      )}

      {tropRendus.map(({ foyer, nouvellePart, rendu }) => (
        <p
          key={foyer.id}
          className="doux mini"
          style={{ margin: '8px 0 0', color: 'var(--corail-fonce)', lineHeight: 1.7 }}
        >
          <b>{foyerDe(maison, foyer.id)?.nom}</b> a déjà rendu {fcfp(rendu)} pour une part qui
          ne serait plus que de {fcfp(nouvellePart)} : il faudra lui rendre la différence, ou
          retirer un remboursement.
        </p>
      ))}

      <button
        type="button"
        className="bouton"
        style={{ marginTop: 14 }}
        disabled={montant <= 0 || rienNaChange}
        onClick={() => {
          void corrigerCharge(charge.id, {
            montant,
            libelle: libelle.trim(),
            nature,
            periode,
          }).then(() => setEnregistre(true))
        }}
      >
        {enregistre ? 'Corrigé' : 'Enregistrer la correction'}
      </button>
    </Pliant>
  )
}
