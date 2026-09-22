/* Le détail d'une facture : qui a payé le fournisseur, ce que chaque foyer
   doit, et ce qu'il a déjà rendu. Tout se règle depuis cet écran — c'est le
   seul endroit où l'on marque « payée » et « remboursée », pour qu'il n'y
   ait jamais deux façons de solder la même chose. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import PiecesCharge from '../composants/PiecesCharge'
import CorrigerCharge from '../composants/CorrigerCharge'
import { chargeSoldee, fcfp, jourCourt, jourDe, lireMontant, moisEnMots, resteSurCharge } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { foyerDe, natureDe } from '../lib/types'

export default function UneCharge({ id, fermer }: { id: string; fermer: () => void }) {
  const { maison, noterPaiement, annulerPaiement, ajouterReglement, supprimerCharge } = useMaison()
  const charge = maison.charges.find((c) => c.id === id)
  const [partiel, setPartiel] = useState<string | null>(null)
  const [montantPartiel, setMontantPartiel] = useState('')

  if (!charge) {
    return (
      <div className="page">
        <Entete kicker="Facture" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  const nature = natureDe(charge.nature)
  const avancee = foyerDe(maison, charge.avanceePar)
  const soldee = chargeSoldee(maison, charge)

  return (
    <div className="page">
      <Entete kicker={nature.nom} titre={charge.libelle || nature.nom} retour={fermer} />

      <div className="carte" style={{ background: 'var(--lagon-pale)', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>{nature.emoji}</div>
        <div className="chiffre" style={{ fontSize: 34, marginTop: 4 }}>
          {fcfp(charge.montant)}
        </div>
        <div className="doux mini" style={{ textTransform: 'capitalize' }}>
          {moisEnMots(charge.periode)}
        </div>
      </div>

      {/* ---------- le paiement au fournisseur ---------- */}
      <div className="carte">
        <div className="kicker">Le fournisseur</div>
        {avancee ? (
          <>
            <div style={{ fontWeight: 700, marginTop: 6 }}>
              Payé par {avancee.nom}
              {charge.payeeLe ? ` le ${jourCourt(charge.payeeLe)}` : ''}
            </div>
            <div className="doux mini" style={{ marginTop: 4 }}>
              {avancee.nom} a avancé la totalité. L'autre foyer lui rend sa part ci-dessous.
            </div>
            <button
              type="button"
              className="bouton-fin"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => void annulerPaiement(charge.id)}
            >
              Ce n'est pas encore payé
            </button>
          </>
        ) : (
          <>
            <p className="doux mini" style={{ margin: '6px 0 10px' }}>
              La facture n'est pas encore réglée. Qui l'a payée ?
            </p>
            <div className="grille2">
              {maison.foyers.map((foyer) => (
                <button
                  key={foyer.id}
                  type="button"
                  className="choix"
                  style={{ padding: '12px 10px', textAlign: 'center' }}
                  onClick={() => void noterPaiement(charge.id, foyer.id, jourDe())}
                >
                  <b style={{ color: foyer.couleur }}>{foyer.nom}</b>
                  <span className="doux mini">a payé</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ---------- la facture elle-même ---------- */}
      <PiecesCharge chargeId={charge.id} />

      {/* ---------- les parts ---------- */}
      <div className="carte">
        <div className="kicker">Ce que chacun doit</div>
        {maison.foyers.map((foyer) => {
          const part =
            maison.partsCharge.find((p) => p.chargeId === charge.id && p.foyerId === foyer.id)
              ?.montant ?? 0
          const reste = resteSurCharge(maison, charge, foyer.id)
          const rendu = part - reste
          const cestLui = charge.avanceePar === foyer.id

          return (
            <div key={foyer.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--bord)' }}>
              <div className="rangee">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: foyer.couleur }}>{foyer.nom}</div>
                  <div className="doux mini">
                    {cestLui
                      ? 'A avancé la facture : sa part est déjà réglée.'
                      : reste === 0
                        ? part === 0
                          ? 'Rien à sa charge.'
                          : 'A rendu sa part.'
                        : `A rendu ${fcfp(rendu)} sur ${fcfp(part)}.`}
                  </div>
                </div>
                <span className="chiffre">{fcfp(part)}</span>
              </div>

              {!cestLui && reste > 0 && charge.avanceePar && (
                <div style={{ marginTop: 8 }}>
                  {partiel === foyer.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="champ"
                        inputMode="numeric"
                        autoFocus
                        placeholder={String(reste)}
                        value={montantPartiel}
                        onChange={(e) => setMontantPartiel(e.target.value)}
                      />
                      <button
                        type="button"
                        className="bouton"
                        style={{ width: 'auto', padding: '12px 18px' }}
                        onClick={() => {
                          const montant = Math.min(reste, lireMontant(montantPartiel) || reste)
                          if (montant > 0) {
                            void ajouterReglement({
                              chargeId: charge.id,
                              foyerId: foyer.id,
                              montant,
                              le: jourDe(),
                              note: '',
                            })
                          }
                          setPartiel(null)
                          setMontantPartiel('')
                        }}
                      >
                        Noter
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="bouton"
                        style={{ flex: 1, padding: '11px 14px', fontSize: 14 }}
                        onClick={() =>
                          void ajouterReglement({
                            chargeId: charge.id,
                            foyerId: foyer.id,
                            montant: reste,
                            le: jourDe(),
                            note: '',
                          })
                        }
                      >
                        A rendu {fcfp(reste)}
                      </button>
                      <button
                        type="button"
                        className="bouton-fin"
                        style={{ flex: '0 0 auto' }}
                        onClick={() => setPartiel(foyer.id)}
                      >
                        Une partie
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {soldee && (
          <div className="rangee" style={{ marginTop: 12, color: 'var(--feuille)' }}>
            <span style={{ fontWeight: 700 }}>Cette facture est soldée</span>
            <Symbole nom="coche" taille={20} couleur="var(--feuille)" />
          </div>
        )}
      </div>

      {/* ---------- l'historique des remboursements ---------- */}
      {maison.reglements.some((r) => r.chargeId === charge.id) && (
        <div className="carte">
          <div className="kicker">Les remboursements</div>
          {maison.reglements
            .filter((r) => r.chargeId === charge.id)
            .map((r) => (
              <div key={r.id} className="ligne-liste">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {foyerDe(maison, r.foyerId)?.nom}
                  </div>
                  <div className="doux mini">{jourCourt(r.le)}</div>
                </div>
                <span className="chiffre mini">{fcfp(r.montant)}</span>
              </div>
            ))}
        </div>
      )}

      {charge.note && (
        <div className="carte">
          <div className="kicker">Note</div>
          <p className="doux" style={{ margin: '6px 0 0' }}>
            {charge.note}
          </p>
        </div>
      )}

      <CorrigerCharge key={charge.id} charge={charge} />

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', color: 'var(--corail-fonce)' }}
        onClick={() => {
          if (!confirm('Supprimer cette facture et tout ce qui s’y rattache ?')) return
          void supprimerCharge(charge.id)
          fermer()
        }}
      >
        Supprimer la facture
      </button>
    </div>
  )
}
