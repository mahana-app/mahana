/* Nos comptes en banque — courants, crédits, livret, compte pro — en un
   coup d'œil, comme sur le site de la banque mais dans notre tiroir.

   Le solde se tape à la main, ou se met à jour tout seul quand on importe
   le relevé du compte : le numéro du fichier dit de quel compte il s'agit.
   Pour un crédit, on suit la part déjà remboursée et la prochaine échéance. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { fcfp, jourCourt, jourDe, lireMontant } from '../lib/argent'
import { useMaison } from '../lib/maison'
import type { Vue } from '../lib/navigation'
import { GENRES_COMPTE, foyerDe } from '../lib/types'
import type { ComptePerso, GenreCompte } from '../lib/types'

export default function Comptes({ ouvrir, fermer }: { ouvrir: (vue: Vue) => void; fermer: () => void }) {
  const { maison, monFoyerId, ajouterCompte, modifierCompte, supprimerCompte } = useMaison()
  const foyer = foyerDe(maison, monFoyerId)
  const [nouveau, setNouveau] = useState<GenreCompte | null>(null)
  const [nom, setNom] = useState('')
  const [numero, setNumero] = useState('')
  const [titulaire, setTitulaire] = useState('')

  if (!monFoyerId || !foyer) {
    return (
      <div className="page">
        <Entete kicker="Nos dépenses" titre="Nos comptes" retour={fermer} />
        <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
          <p className="doux mini" style={{ margin: 0 }}>Les comptes sont ceux de votre famille : entrez avec son code.</p>
        </div>
      </div>
    )
  }

  const foyerId = monFoyerId
  const comptes = maison.comptesPerso.filter((c) => c.foyerId === foyerId)
  const de = (genre: GenreCompte) => comptes.filter((c) => c.genre === genre)
  const disponible = comptes.filter((c) => c.genre !== 'credit').reduce((s, c) => s + c.solde, 0)

  return (
    <div className="page fiche">
      <Entete kicker={foyer.nom} titre="Nos comptes" retour={fermer} />

      <div className="fiche-entete">
        <span className="deco" style={{ left: 14, top: 12 }} aria-hidden="true">🌿</span>
        <span className="deco" style={{ right: 14, top: 14 }} aria-hidden="true">🏦</span>
        <div className="fiche-titre">NOS COMPTES</div>
        <span className="fiche-script">en banque</span>
        <div className="etiquette" style={{ marginTop: 12 }}>Disponible, tous comptes réunis</div>
        <div className="chiffre" style={{ fontSize: 30, color: 'var(--fiche-sauge)' }}>{fcfp(disponible)}</div>
        <div className="doux mini">courants + épargne + compte pro, hors crédits</div>
      </div>

      {GENRES_COMPTE.map((g) => (
        <div key={g.id} className={`fiche-bloc${g.id === 'credit' ? ' rose' : g.id === 'epargne' ? ' sauge' : ''}`}>
          <div className="fiche-bloc-titre">
            <span>{g.emoji}</span> {g.nom}{de(g.id).length > 1 ? 's' : ''}
            <span className="bout">{fcfp(de(g.id).reduce((s, c) => s + c.solde, 0))}</span>
          </div>

          {de(g.id).map((c) => (
            <Compte key={c.id} compte={c} modifier={(ch) => void modifierCompte(c.id, ch)} retirer={() => { if (confirm(`Retirer « ${c.nom} » ?`)) void supprimerCompte(c.id) }} />
          ))}

          {nouveau === g.id ? (
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <input className="champ" placeholder={g.id === 'credit' ? 'ex. Prêt personnel' : 'ex. Compte courant Will'} value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
              <input className="champ" inputMode="numeric" placeholder="numéro chez la banque" value={numero} onChange={(e) => setNumero(e.target.value)} />
              <input className="champ" placeholder="au nom de" value={titulaire} onChange={(e) => setTitulaire(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="bouton-fiche"
                  style={{ flex: 1 }}
                  disabled={nom.trim().length === 0}
                  onClick={() => {
                    void ajouterCompte({ foyerId, genre: g.id, numero: numero.trim(), nom: nom.trim(), titulaire: titulaire.trim(), solde: 0, rembourse: 0, echeance: null, majLe: jourDe() })
                    setNouveau(null); setNom(''); setNumero(''); setTitulaire('')
                  }}
                >
                  Ajouter
                </button>
                <button type="button" className="fiche-sticker" onClick={() => setNouveau(null)}>Annuler</button>
              </div>
            </div>
          ) : (
            <button type="button" className="fiche-sticker" style={{ marginTop: 10 }} onClick={() => setNouveau(g.id)}>
              + {g.id === 'credit' ? 'Un crédit' : 'Un compte'}
            </button>
          )}
        </div>
      ))}

      <div className="fiche-astuce">
        <span style={{ fontSize: 26 }} aria-hidden="true">📥</span>
        <div>
          Le solde d'un compte se met à jour tout seul quand vous importez son relevé : le numéro
          du fichier dit de quel compte il s'agit.
          <br />
          <button type="button" className="fiche-sticker" style={{ marginTop: 8 }} onClick={() => ouvrir({ nom: 'importer-banque' })}>
            Importer un relevé
          </button>
        </div>
      </div>
    </div>
  )
}

function Compte({ compte, modifier, retirer }: { compte: ComptePerso; modifier: (ch: Partial<ComptePerso>) => void; retirer: () => void }) {
  const credit = compte.genre === 'credit'
  return (
    <div style={{ padding: '10px 0', borderBottom: '1.5px dotted var(--fiche-trait)' }}>
      <div className="rangee" style={{ gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input key={`n-${compte.id}`} className="champ" style={{ padding: '6px 8px', fontSize: 15, fontWeight: 600 }} defaultValue={compte.nom} aria-label="Nom du compte" onBlur={(e) => modifier({ nom: e.target.value })} />
          <div className="doux mini" style={{ marginTop: 3 }}>
            {compte.numero ? `n° ${compte.numero}` : 'sans numéro'}{compte.titulaire ? ` · ${compte.titulaire}` : ''}
          </div>
        </div>
        <button type="button" className="croix" aria-label={`Retirer ${compte.nom}`} onClick={retirer}>
          <Symbole nom="croix" taille={12} />
        </button>
      </div>

      {credit ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <div>
              <div className="etiquette">remboursé, en %</div>
              <input key={`r-${compte.id}-${compte.rembourse}`} className="champ" inputMode="decimal" style={{ padding: '7px 8px', fontSize: 14, textAlign: 'right' }} defaultValue={compte.rembourse || ''} aria-label={`Part remboursée ${compte.nom}`} onBlur={(e) => modifier({ rembourse: Number(e.target.value.replace(',', '.')) || 0 })} />
            </div>
            <div>
              <div className="etiquette">prochaine échéance</div>
              <input key={`e-${compte.id}-${compte.echeance}`} className="champ" type="date" style={{ padding: '7px 8px', fontSize: 14 }} defaultValue={compte.echeance ?? ''} aria-label={`Échéance ${compte.nom}`} onBlur={(e) => modifier({ echeance: e.target.value || null })} />
            </div>
          </div>
          <div className="rangee" style={{ marginTop: 8, gap: 10 }}>
            <div className="fiche-progression"><i style={{ width: `${Math.min(100, compte.rembourse)}%` }} /></div>
            <span className="chiffre mini">{compte.rembourse.toLocaleString('fr-FR')} %</span>
          </div>
        </>
      ) : (
        <div className="rangee" style={{ marginTop: 8, gap: 10 }}>
          <div className="doux mini">à jour le {jourCourt(compte.majLe)}</div>
          <input
            key={`s-${compte.id}-${compte.solde}`}
            className="champ"
            inputMode="numeric"
            style={{ padding: '7px 8px', fontSize: 16, fontWeight: 700, textAlign: 'right', width: 140 }}
            defaultValue={compte.solde || ''}
            aria-label={`Solde ${compte.nom}`}
            onBlur={(e) => { const solde = lireMontant(e.target.value); if (solde !== compte.solde) modifier({ solde, majLe: jourDe() }) }}
          />
        </div>
      )}
    </div>
  )
}
