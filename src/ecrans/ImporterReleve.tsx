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
import { numerosDansPdf } from '../lib/pdf'
import { televerser } from '../lib/fichiers'
import type { LigneRelevee } from '../lib/releve'
import { natureDe, NATURES } from '../lib/types'
import type { Identifiant, NatureCharge } from '../lib/types'

type Rattachement = {
  nom: string
  numero: string | null
  /** jointe : rangée sur sa facture. deja : elle y était déjà. inconnue : le
      numéro ne correspond à aucune facture entrée. illisible : un scan. */
  etat: 'jointe' | 'deja' | 'inconnue' | 'illisible'
  chargeId?: string
}

export default function ImporterReleve({ fermer }: { fermer: () => void }) {
  const { maison, importerCharges, ajouterPiece } = useMaison()
  const champ = useRef<HTMLInputElement>(null)

  const [lignes, setLignes] = useState<LigneRelevee[]>([])
  const [souci, setSouci] = useState('')
  const [nature, setNature] = useState<NatureCharge>('electricite')
  const [avanceePar, setAvanceePar] = useState<Identifiant | null>(maison.foyers[0]?.id ?? null)
  const [dejaRemboursees, setDejaRemboursees] = useState(true)
  const [fait, setFait] = useState<number | null>(null)
  // Le deuxième usage de cet écran : déposer les PDF des factures pour qu'ils
  // aillent se ranger chacun sur la sienne.
  const [rattachements, setRattachements] = useState<Rattachement[] | null>(null)
  const [enCours, setEnCours] = useState('')

  const dejaConnues = new Set(maison.charges.map((c) => c.reference).filter((r) => r !== ''))
  const nouvelles = lignes.filter((l) => !l.reference || !dejaConnues.has(l.reference))
  const total = nouvelles.reduce((somme, l) => somme + l.montant, 0)

  async function recevoir(fichiers: File[]) {
    if (fichiers.length === 0) return
    setFait(null)
    setSouci('')

    // Deux usages, un seul bouton : le tableau de l'année, ou les PDF des
    // factures. On regarde ce qui arrive plutôt que de le demander.
    const pdf = fichiers.filter(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name),
    )
    if (pdf.length > 0) {
      setLignes([])
      await rattacherLesPdf(pdf)
      const images = fichiers.filter((f) => f.type.startsWith('image/'))
      if (images.length > 0) {
        setSouci(
          'Les photos ne portent pas de numéro lisible : ouvrez la facture concernée et ' +
            'utilisez « La facture en image ».',
        )
      }
      return
    }
    if (fichiers.some((f) => f.type.startsWith('image/'))) {
      setLignes([])
      setRattachements(null)
      setSouci(
        'Une photo ne porte pas de numéro lisible. Ouvrez la facture concernée et utilisez ' +
          '« La facture en image », ou ajoutez-la avec sa photo depuis « + Ajouter une facture ».',
      )
      return
    }

    setRattachements(null)
    const releve = lireReleve(await fichiers[0].text())
    setSouci(releve.souci)
    setLignes(releve.lignes)
  }

  /* Chaque PDF va sur la facture qui porte le même numéro. Douze PDF déposés
     d'un coup se rangent donc tout seuls — sans jamais demander lequel est
     lequel, ce qui serait douze occasions de se tromper. */
  async function rattacherLesPdf(fichiers: File[]) {
    const resultats: Rattachement[] = []
    setRattachements([])
    try {
      for (const fichier of fichiers) {
        setEnCours(fichier.name)
        const numeros = await numerosDansPdf(fichier)
        const charge = maison.charges.find((c) => c.reference && numeros.includes(c.reference))

        if (!charge) {
          resultats.push({
            nom: fichier.name,
            numero: numeros[0] ?? null,
            etat: numeros.length > 0 ? 'inconnue' : 'illisible',
          })
        } else if (maison.piecesCharge.some((p) => p.chargeId === charge.id && p.nom === fichier.name)) {
          resultats.push({ nom: fichier.name, numero: charge.reference, etat: 'deja', chargeId: charge.id })
        } else {
          const depose = await televerser(fichier, charge.id)
          await ajouterPiece(charge.id, depose)
          resultats.push({ nom: fichier.name, numero: charge.reference, etat: 'jointe', chargeId: charge.id })
        }
        setRattachements([...resultats])
      }
    } catch (erreur) {
      setSouci(erreur instanceof Error ? erreur.message : "L'envoi n'a pas abouti.")
    } finally {
      setEnCours('')
    }
  }

  /* ---------- l'écran de fin ---------- */
  if (fait !== null) {
    return (
      <div className="page">
        <Entete kicker="Factures" titre="C'est entré" retour={fermer} />
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
      <Entete kicker="Les charges" titre="Importer les factures" retour={fermer} />

      <div className="carte">
        <p className="doux mini" style={{ margin: '4px 0 12px' }}>
          Ici on entre <b>toute une année d'un coup</b>, à partir du tableau des
          factures qui se télécharge chez EDT, dans l'espace client. Prenez-le tel quel :
          les factures déjà entrées seront reconnues et laissées de côté.
        </p>
        <p className="doux mini" style={{ margin: '0 0 12px' }}>
          Vous pouvez aussi déposer ici <b>les PDF des factures</b>, autant que vous
          voulez : chacun porte son numéro et ira se ranger tout seul sur sa facture.
        </p>
        <input
          ref={champ}
          type="file"
          // Pas de filtre sur le type : sur Android, « .csv » grise le fichier
          // qu'on vient de télécharger et on ne peut plus le choisir.
          style={{ display: 'none' }}
          multiple
          onChange={(e) => {
            // Le tableau AVANT de vider le champ : vider efface aussi la liste
            // que le champ tient. Et il faut le vider, sinon rechoisir le MÊME
            // fichier ne déclenche rien et on croit que l'app n'a pas réagi.
            const fichiers = Array.from(e.target.files ?? [])
            e.target.value = ''
            void recevoir(fichiers)
          }}
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


      {/* ---------- les PDF rangés ---------- */}
      {rattachements !== null && (
        <>
          <div className="titre-section">
            {rattachements.filter((r) => r.etat === 'jointe').length} facture
            {rattachements.filter((r) => r.etat === 'jointe').length > 1 ? 's' : ''} en image
          </div>
          <div className="carte">
            {rattachements.map((r) => {
              const charge = maison.charges.find((c) => c.id === r.chargeId)
              return (
                <div key={r.nom} className="ligne-liste">
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {charge
                        ? `${natureDe(charge.nature).nom} · ${moisEnMots(charge.periode)}`
                        : r.nom}
                    </div>
                    <div className="doux mini">
                      {r.etat === 'jointe' && `rangée · ${r.numero}`}
                      {r.etat === 'deja' && `elle y était déjà · ${r.numero}`}
                      {r.etat === 'inconnue' &&
                        `${r.numero} : aucune facture entrée ne porte ce numéro`}
                      {r.etat === 'illisible' &&
                        "numéro illisible — c'est peut-être un scan, ouvrez la facture pour l'y joindre"}
                    </div>
                  </div>
                  <span
                    className={`pilule${r.etat === 'jointe' ? ' vert' : r.etat === 'deja' ? '' : ' ocre'}`}
                  >
                    {r.etat === 'jointe'
                      ? 'Rangée'
                      : r.etat === 'deja'
                        ? 'Déjà là'
                        : r.etat === 'inconnue'
                          ? 'Sans facture'
                          : 'Illisible'}
                  </span>
                </div>
              )
            })}
            {enCours && (
              <p className="doux mini" style={{ margin: '10px 0 0' }}>
                Lecture de {enCours}…
              </p>
            )}
            {rattachements.some((r) => r.etat === 'inconnue') && (
              <p className="doux mini" style={{ margin: '12px 0 0' }}>
                Une facture « sans facture », c'est qu'elle n'a pas encore été entrée :
                importez d'abord le tableau de l'année, puis redéposez ces PDF.
              </p>
            )}
          </div>
        </>
      )}

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
