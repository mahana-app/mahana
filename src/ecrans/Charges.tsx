/* Les charges de la maison : électricité, eau, internet, impôts, déchets.

   La règle de la maison, celle qui a fait écrire cet écran : c'est presque
   toujours un seul foyer qui règle le fournisseur, et l'autre lui rend sa
   part ensuite. L'app suit donc deux choses distinctes — la facture est-elle
   payée, et chacun a-t-il rendu ce qu'il devait. Une facture payée dont la
   part n'est pas rendue reste en attente : c'est là que les oublis arrivent. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import { chargeSoldee, fcfp, moisDe, resteSurCharge, soldesCharges } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Vue } from '../lib/navigation'
import { foyerDe, natureDe } from '../lib/types'
import type { Charge } from '../lib/types'

export default function Charges({ ouvrir }: { ouvrir: (vue: Vue) => void }) {
  const { maison } = useMaison()
  const [periode, setPeriode] = useState(moisDe())

  const duMois = maison.charges
    .filter((c) => c.periode === periode)
    .sort((a, b) => a.nature.localeCompare(b.nature))
  const total = duMois.reduce((somme, c) => somme + c.montant, 0)
  const enAttente = duMois.filter((c) => !chargeSoldee(maison, c))

  return (
    <div className="page">
      <Entete kicker="La maison" titre="Les charges" ouvrirReglages={() => ouvrir({ nom: 'maisonnee' })} />

      <ChoixMois periode={periode} changer={setPeriode} />

      <div className="carte">
        <div className="rangee">
          <div>
            <div className="kicker">Total du mois</div>
            <div className="chiffre" style={{ fontSize: 32 }}>
              {fcfp(total)}
            </div>
          </div>
          <Symbole nom="eclair" taille={28} couleur="var(--ocre)" />
        </div>
        <div className="doux mini" style={{ marginTop: 6 }}>
          {duMois.length} facture{duMois.length > 1 ? 's' : ''}
          {enAttente.length > 0 ? ` · ${enAttente.length} en attente` : ' · tout est réglé'}
        </div>
      </div>

      <QuiDoitQuoi />

      <div className="titre-section">Les factures</div>

      {duMois.length === 0 && (
        <div className="carte">
          <p className="vide" style={{ padding: '10px 6px' }}>
            Rien de noté pour ce mois-ci. Ajoutez la première facture ci-dessous.
          </p>
        </div>
      )}

      {duMois.map((charge) => (
        <LigneCharge key={charge.id} charge={charge} ouvrir={ouvrir} />
      ))}

      <button type="button" className="bouton" onClick={() => ouvrir({ nom: 'nouvelle-charge' })}>
        + Ajouter une facture
      </button>
    </div>
  )
}

/* ---------- le solde entre les deux foyers ---------- */

export function QuiDoitQuoi() {
  const { maison } = useMaison()
  const soldes = soldesCharges(maison)
  const creancier = soldes.find((s) => s.solde > 0)
  const debiteur = soldes.find((s) => s.solde < 0)

  if (!creancier || !debiteur || creancier.solde === 0) {
    return (
      <div className="carte" style={{ background: 'var(--feuille-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Entre les foyers</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>Tout est à jour</div>
            <div className="doux mini">Personne ne doit rien à personne.</div>
          </div>
          <Symbole nom="coche" taille={26} couleur="var(--feuille)" />
        </div>
      </div>
    )
  }

  const qui = foyerDe(maison, debiteur.foyerId)
  const aQui = foyerDe(maison, creancier.foyerId)

  return (
    <div className="carte" style={{ background: 'var(--corail-pale)' }}>
      <div className="rangee">
        <div style={{ minWidth: 0 }}>
          <div className="kicker">Entre les foyers</div>
          <div className="chiffre" style={{ fontSize: 26, marginTop: 2 }}>
            {fcfp(-debiteur.solde)}
          </div>
          <div className="doux mini" style={{ lineHeight: 1.6 }}>
            <b>{qui?.nom}</b> doit à <b>{aQui?.nom}</b>, toutes factures confondues.
          </div>
        </div>
        <Symbole nom="echange" taille={26} couleur="var(--corail)" />
      </div>
    </div>
  )
}

/* ---------- une facture dans la liste ---------- */

function LigneCharge({ charge, ouvrir }: { charge: Charge; ouvrir: (vue: Vue) => void }) {
  const { maison } = useMaison()
  const nature = natureDe(charge.nature)
  const soldee = chargeSoldee(maison, charge)
  const reste = maison.foyers.reduce((somme, f) => somme + resteSurCharge(maison, charge, f.id), 0)
  const avancee = foyerDe(maison, charge.avanceePar)
  const pieces = maison.piecesCharge.filter((p) => p.chargeId === charge.id).length

  return (
    <button
      type="button"
      className="carte serree"
      style={{ width: '100%', border: 0, textAlign: 'left' }}
      onClick={() => ouvrir({ nom: 'charge', id: charge.id })}
    >
      <div className="rangee">
        <span
          className="pastille"
          style={{ width: 46, height: 46, background: 'var(--piste)', fontSize: 21 }}
        >
          {nature.emoji}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>{charge.libelle || nature.nom}</div>
          <div className="doux mini">
            {nature.nom}
            {avancee ? ` · avancée par ${avancee.nom}` : ' · pas encore payée'}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="pilule">{fcfp(charge.montant)}</span>
            {soldee ? (
              <span className="pilule vert">Soldée</span>
            ) : !charge.avanceePar ? (
              <span className="pilule ocre">À payer</span>
            ) : (
              <span className="pilule corail">Reste {fcfp(reste)}</span>
            )}
            {/* Un repère discret : d'un coup d'œil on sait quelles factures
                ont leur papier et lesquelles restent à photographier. */}
            {pieces > 0 && (
              <span className="pilule lagon" title={`${pieces} pièce${pieces > 1 ? 's' : ''} jointe${pieces > 1 ? 's' : ''}`}>
                <Symbole nom="papier" taille={13} />
                {pieces > 1 ? pieces : ''}
              </span>
            )}
          </div>
        </div>
        <Symbole nom="fleche" taille={18} couleur="var(--estompe)" />
      </div>
    </button>
  )
}
