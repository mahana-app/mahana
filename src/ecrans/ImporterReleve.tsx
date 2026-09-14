/* Entrer une année de factures d'un coup.

   EDT met à disposition, dans l'espace client, un fichier qui liste toutes
   les factures de l'année avec leur date et leur montant. Le retaper mois
   par mois, c'est douze fois la même manipulation — et une faute de frappe
   quelque part, qu'on ne retrouvera jamais.

   Deux précautions tiennent tout cet écran :

   * On montre ce qu'on a compris AVANT d'écrire quoi que ce soit. Un import
     qui se fait tout seul et se trompe coûte plus cher que la saisie à la
     main.
   * Une facture déjà entrée est reconnue par son numéro chez le fournisseur
     et laissée de côté. Le même fichier peut donc être repris chaque mois
     sans rien créer en double. */

import { useRef, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { useMaison } from '../lib/maison'
import { fcfp, jourCourt, moisEnMots } from '../lib/argent'
import { lireReleve } from '../lib/releve'
import type { LigneRelevee } from '../lib/releve'
import { NATURES } from '../lib/types'
import type { Identifiant, NatureCharge } from '../lib/types'

export default function ImporterReleve({ fermer }: { fermer: () => void }) {
  const { maison, importerCharges } = useMaison()
  const champ = useRef<HTMLInputElement>(null)

  const [lignes, setLignes] = useState<LigneRelevee[]>([])
  const [souci, setSouci] = useState('')
  const [nature, setNature] = useState<NatureCharge>('electricite')
  const [avanceePar, setAvanceePar] = useState<Identifiant | null>(maison.foyers[0]?.id ?? null)
  const [dejaRemboursees, setDejaRemboursees] = useState(true)
  const [fait, setFait] = useState<number | null>(null)

  const dejaConnues = new Set(maison.charges.map((c) => c.reference).filter((r) => r !== ''))
  const nouvelles = lignes.filter((l) => !l.reference || !dejaConnues.has(l.reference))
  const total = nouvelles.reduce((somme, l) => somme + l.montant, 0)

  async function recevoir(fichier: File | undefined) {
    if (!fichier) return
    setFait(null)
    const releve = lireReleve(await fichier.text())
    setSouci(releve.souci)
    setLignes(releve.lignes)
  }

  /* ---------- l'écran de fin ---------- */
  if (fait !== null) {
    return (
      <div className="page">
        <Entete kicker="Relevé" titre="C'est entré" retour={fermer} />
        <div className="carte" style={{ textAlign: 'center' }}>
          <Symbole nom="coche" taille={40} couleur="var(--feuille)" />
          <div className="chiffre" style={{ fontSize: 30, marginTop: 8 }}>
            {fait}
          </div>
          <div className="doux mini">
            facture{fait > 1 ? 's' : ''} ajoutée{fait > 1 ? 's' : ''}
            {lignes.length - fait > 0
              ? ` · ${lignes.length - fait} étaient déjà là`
              : ''}
          </div>
        </div>
        <button type="button" className="bouton" onClick={fermer}>
          Voir les factures
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <Entete kicker="Les charges" titre="Importer un relevé" retour={fermer} />

      <div className="carte">
        <p className="doux mini" style={{ margin: '4px 0 12px' }}>
          Sur le site d'EDT, espace client, la liste des factures se télécharge en un
          fichier. Prenez-le tel quel : les factures déjà entrées ici seront reconnues
          et laissées de côté.
        </p>
        <input
          ref={champ}
          type="file"
          accept=".csv,text/csv,text/plain"
          style={{ display: 'none' }}
          onChange={(e) => void recevoir(e.target.files?.[0])}
        />
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%' }}
          onClick={() => champ.current?.click()}
        >
          {lignes.length > 0 ? 'Choisir un autre fichier' : 'Choisir le fichier'}
        </button>
        {souci && (
          <p className="doux mini" style={{ color: 'var(--corail-fonce)', margin: '10px 0 0' }}>
            {souci}
          </p>
        )}
      </div>

      {lignes.length > 0 && (
        <>
          {/* ---------- de quoi s'agit-il ---------- */}
          <div className="carte">
            <div className="kicker">Quelle charge</div>
            <div className="grille3" style={{ marginTop: 8 }}>
              {NATURES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`choix${nature === n.id ? ' actif' : ''}`}
                  onClick={() => setNature(n.id)}
                >
                  <span style={{ fontSize: 20 }}>{n.emoji}</span>
                  <b>{n.nom}</b>
                </button>
              ))}
            </div>
          </div>

          {/* ---------- qui a payé ---------- */}
          <div className="carte">
            <div className="kicker">Qui a payé le fournisseur</div>
            <div className="grille2" style={{ marginTop: 8 }}>
              {maison.foyers.map((foyer) => (
                <button
                  key={foyer.id}
                  type="button"
                  className={`choix${avanceePar === foyer.id ? ' actif' : ''}`}
                  style={{ padding: '12px 10px', textAlign: 'center' }}
                  onClick={() => setAvanceePar(foyer.id)}
                >
                  <b style={{ color: foyer.couleur }}>{foyer.nom}</b>
                </button>
              ))}
            </div>

            {/* Des factures de l'an passé sont presque toujours déjà réglées
                entre les deux foyers : les entrer sans le dire ferait
                apparaître une dette qui n'existe pas. */}
            <button
              type="button"
              className={`choix${dejaRemboursees ? ' actif' : ''}`}
              style={{ width: '100%', marginTop: 10, textAlign: 'left' }}
              onClick={() => setDejaRemboursees((v) => !v)}
            >
              <b>Ces factures sont déjà remboursées entre nous</b>
              <span className="doux mini">
                {dejaRemboursees
                  ? 'Elles entreront soldées — rien n’apparaîtra comme dû.'
                  : 'Chaque foyer devra sa part : à décocher seulement si c’est vrai.'}
              </span>
            </button>
          </div>

          {/* ---------- ce qu'on a compris ---------- */}
          <div className="titre-section">
            {nouvelles.length} facture{nouvelles.length > 1 ? 's' : ''} à ajouter · {fcfp(total)}
          </div>

          <div className="carte">
            {lignes.map((ligne) => {
              const connue = !!ligne.reference && dejaConnues.has(ligne.reference)
              return (
                <div key={ligne.reference || ligne.date} className="ligne-liste">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>
                      {moisEnMots(ligne.periode)}
                    </div>
                    <div className="doux mini">
                      {jourCourt(ligne.date)}
                      {ligne.reference ? ` · ${ligne.reference}` : ''}
                    </div>
                  </div>
                  {connue ? (
                    <span className="pilule">Déjà là</span>
                  ) : (
                    <span className="chiffre mini">{fcfp(ligne.montant)}</span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="bouton"
            disabled={nouvelles.length === 0}
            onClick={() => {
              void importerCharges(lignes, { nature, avanceePar, dejaRemboursees }).then(setFait)
            }}
          >
            {nouvelles.length === 0
              ? 'Tout est déjà entré'
              : `Ajouter ${nouvelles.length} facture${nouvelles.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}
    </div>
  )
}
