/* Importer le relevé de la banque dans « nos dépenses ».

   Sept cents lignes par an : on ne les note pas à la main. Le fichier se
   télécharge depuis le site de la banque, l'app reconnaît les enseignes et
   range chaque ligne dans son poste. Ce qu'elle a compris s'affiche AVANT
   d'écrire quoi que ce soit, et une ligne déjà entrée est reconnue à son
   empreinte : le même relevé peut être repris chaque mois sans doublon. */

import { useRef, useState } from 'react'
import Entete from '../composants/Entete'
import { fcfp, jourDe } from '../lib/argent'
import { lireReleveBanque, numeroDansNomDeFichier } from '../lib/banque'
import type { LigneBanque } from '../lib/banque'
import { useMaison } from '../lib/maison'
import { CATEGORIES_DEPENSE, categorieDepenseDe } from '../lib/types'

export default function ImporterBanque({ fermer }: { fermer: () => void }) {
  const { maison, monFoyerId, importerDepenses, modifierCompte } = useMaison()
  const champ = useRef<HTMLInputElement>(null)
  const [lignes, setLignes] = useState<LigneBanque[]>([])
  const [souci, setSouci] = useState('')
  const [annee, setAnnee] = useState<string | null>(null)
  const [fait, setFait] = useState<number | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const [numeroFichier, setNumeroFichier] = useState<string | null>(null)
  const [soldeMisAJour, setSoldeMisAJour] = useState<string | null>(null)

  const connues = new Set(maison.depensesPerso.map((d) => d.reference))
  const annees = [...new Set(lignes.map((l) => l.le.slice(0, 4)))].sort().reverse()
  const retenues = lignes.filter((l) => !annee || l.le.startsWith(annee))
  const nouvelles = retenues.filter((l) => !connues.has(l.reference))
  const parPoste = CATEGORIES_DEPENSE.map((c) => ({
    ...c,
    total: nouvelles.filter((l) => l.sens === 'depense' && l.categorie === c.id).reduce((s, l) => s + l.montant, 0),
    nb: nouvelles.filter((l) => l.sens === 'depense' && l.categorie === c.id).length,
  })).filter((c) => c.nb > 0)
  const revenus = nouvelles.filter((l) => l.sens === 'revenu')

  async function recevoir(fichier: File | undefined) {
    if (!fichier) return
    setFait(null)
    setNumeroFichier(numeroDansNomDeFichier(fichier.name))
    const lu = lireReleveBanque(await fichier.arrayBuffer())
    setSouci(lu.souci)
    setLignes(lu.lignes)
    const derniere = [...new Set(lu.lignes.map((l) => l.le.slice(0, 4)))].sort().reverse()[0]
    setAnnee(derniere ?? null)
  }

  if (!monFoyerId) {
    return (
      <div className="page">
        <Entete kicker="Nos dépenses" titre="Importer la banque" retour={fermer} />
        <div className="carte" style={{ background: 'var(--ocre-pale)' }}>
          <p className="doux mini" style={{ margin: 0 }}>Entrez avec le code de votre famille : les dépenses vont dans son tiroir.</p>
        </div>
      </div>
    )
  }

  if (fait !== null) {
    return (
      <div className="page">
        <Entete kicker="Nos dépenses" titre="C'est entré" retour={fermer} />
        <div className="carte" style={{ textAlign: 'center' }}>
          <div className="chiffre" style={{ fontSize: 30 }}>{fait}</div>
          <div className="doux mini">
            ligne{fait > 1 ? 's' : ''} ajoutée{fait > 1 ? 's' : ''}
            {retenues.length - fait > 0 ? ` · ${retenues.length - fait} étaient déjà là` : ''}
          </div>
          {soldeMisAJour && <div className="doux mini" style={{ marginTop: 8 }}>Solde mis à jour — {soldeMisAJour}</div>}
        </div>
        <button type="button" className="bouton" onClick={fermer}>Voir le rapport</button>
      </div>
    )
  }

  return (
    <div className="page">
      <Entete kicker="Nos dépenses" titre="Importer la banque" retour={fermer} />

      <div className="carte">
        <p className="doux mini" style={{ margin: '4px 0 12px', lineHeight: 1.7 }}>
          Sur le site de la banque, les mouvements du compte se téléchargent en un fichier. Prenez-le
          tel quel : chaque ligne sera rangée dans son poste, et celles déjà entrées seront laissées de
          côté. Rien ne s'écrit avant que vous ayez validé.
        </p>
        <input ref={champ} type="file" style={{ display: 'none' }} onChange={(e) => void recevoir(e.target.files?.[0])} />
        <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={() => champ.current?.click()}>
          {lignes.length > 0 ? 'Choisir un autre fichier' : 'Choisir le fichier'}
        </button>
        {souci && <p className="doux mini" style={{ color: 'var(--corail-fonce)', margin: '10px 0 0' }}>{souci}</p>}
      </div>

      {lignes.length > 0 && (
        <>
          {annees.length > 1 && (
            <div className="carte">
              <div className="kicker">Quelle année</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {annees.map((a) => (
                  <button key={a} type="button" className={`choix${annee === a ? ' actif' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setAnnee(a)}>
                    <b>{a}</b>
                  </button>
                ))}
                <button type="button" className={`choix${annee === null ? ' actif' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setAnnee(null)}>
                  <b>Tout</b>
                </button>
              </div>
            </div>
          )}

          <div className="titre-section">
            {nouvelles.length} ligne{nouvelles.length > 1 ? 's' : ''} à ajouter
            {retenues.length - nouvelles.length > 0 ? ` · ${retenues.length - nouvelles.length} déjà là` : ''}
          </div>

          <div className="carte">
            <div className="kicker">Ce que j'ai compris</div>
            {revenus.length > 0 && (
              <div className="ligne-liste">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>💰 Rentrées d'argent</div>
                  <div className="doux mini">{revenus.length} ligne{revenus.length > 1 ? 's' : ''}</div>
                </div>
                <span className="chiffre mini">{fcfp(revenus.reduce((s, l) => s + l.montant, 0))}</span>
              </div>
            )}
            {parPoste.sort((a, b) => b.total - a.total).map((c) => (
              <div key={c.id} className="ligne-liste">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.emoji} {c.nom}</div>
                  <div className="doux mini">{c.nb} ligne{c.nb > 1 ? 's' : ''}</div>
                </div>
                <span className="chiffre mini">{fcfp(c.total)}</span>
              </div>
            ))}
            {parPoste.some((c) => c.id === 'autre') && (
              <p className="doux mini" style={{ margin: '10px 0 0' }}>
                Les lignes « {categorieDepenseDe('autre').nom} » sont celles dont je n'ai pas reconnu l'enseigne. Elles se rangent après coup, depuis la liste.
              </p>
            )}
          </div>

          <button
            type="button"
            className="bouton"
            disabled={nouvelles.length === 0 || envoi}
            onClick={() => {
              setEnvoi(true)
              void importerDepenses(nouvelles).then((n) => {
                // Le relevé porte le solde du compte : autant le reporter sur
                // le compte qui porte ce numéro, plutôt que de le retaper.
                const compte = maison.comptesPerso.find((c) => c.foyerId === monFoyerId && numeroFichier && c.numero === numeroFichier)
                const plusRecente = [...lignes].sort((a, b) => b.le.localeCompare(a.le))[0]
                if (compte && plusRecente?.solde !== null && plusRecente?.solde !== undefined) {
                  void modifierCompte(compte.id, { solde: plusRecente.solde, majLe: jourDe() })
                  setSoldeMisAJour(`${compte.nom} : ${fcfp(plusRecente.solde)}`)
                }
                setFait(n)
                setEnvoi(false)
              })
            }}
          >
            {envoi ? 'Enregistrement…' : nouvelles.length === 0 ? 'Tout est déjà entré' : `Ajouter ${nouvelles.length} ligne${nouvelles.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}
    </div>
  )
}
