/* Saisir une facture. Trois choses seulement : ce que c'est, combien, quel
   mois. Le partage est proposé d'après les parts de la maison, et se corrige
   à la main quand cette facture-là se partage autrement. */

import { useRef, useState } from 'react'
import Entete from '../composants/Entete'
import ChoixMois from '../composants/ChoixMois'
import Symbole from '../composants/Symbole'
import { fcfp, lireMontant, moisDe, partsDeLaNature, repartir } from '../lib/argent'
import { useMaison } from '../lib/maison'
import { TAILLE_MAXIMUM, estUneImage, poids, televerser } from '../lib/fichiers'
import { NATURES } from '../lib/types'
import type { Identifiant, NatureCharge } from '../lib/types'

export default function NouvelleCharge({ fermer }: { fermer: () => void }) {
  const { maison, ajouterCharge, ajouterPiece } = useMaison()
  const [nature, setNature] = useState<NatureCharge>('electricite')
  const [libelle, setLibelle] = useState('')
  const [montantTexte, setMontantTexte] = useState('')
  const [periode, setPeriode] = useState(moisDe())
  const [note, setNote] = useState('')
  const [partsCorrigees, setPartsCorrigees] = useState<Record<Identifiant, string> | null>(null)
  // Les photos attendent ici : la facture n'existe pas encore, donc rien ne
  // part tant qu'on n'a pas appuyé sur « Ajouter la facture ».
  const [aJoindre, setAJoindre] = useState<File[]>([])
  const [envoi, setEnvoi] = useState(false)
  const [souci, setSouci] = useState('')
  const champ = useRef<HTMLInputElement>(null)

  const montant = lireMontant(montantTexte)
  const proposees = repartir(montant, maison.foyers, partsDeLaNature(maison, nature))

  const parts: Record<Identifiant, number> = partsCorrigees
    ? Object.fromEntries(
        maison.foyers.map((f) => [f.id, lireMontant(partsCorrigees[f.id] ?? '0')]),
      )
    : proposees
  const sommeParts = Object.values(parts).reduce((somme, v) => somme + v, 0)
  const ecart = montant - sommeParts

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

        {/* Les flèches remontent aussi loin qu'il faut : on entre souvent des
            factures de l'année passée, pas seulement celles du mois. */}
        <label className="etiquette" style={{ marginTop: 14 }}>
          Quel mois
        </label>
        <div style={{ marginTop: -4 }}>
          <ChoixMois periode={periode} changer={setPeriode} />
        </div>
      </div>

      {/* ---------- la facture en image ---------- */}
      <div className="carte">
        <div className="kicker">La facture en image</div>
        {aJoindre.length === 0 ? (
          <p className="doux mini" style={{ margin: '6px 0 10px' }}>
            Photographiez-la maintenant, pendant qu'elle est dans la main.
          </p>
        ) : (
          aJoindre.map((fichier, rang) => (
            <div key={`${fichier.name}-${rang}`} className="ligne-liste">
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
                  {fichier.name}
                </div>
                <div className="doux mini">
                  {estUneImage(fichier.type) ? 'Photo' : 'PDF'} · {poids(fichier.size)}
                </div>
              </div>
              <button
                type="button"
                className="bouton-fin"
                style={{ flex: '0 0 auto', padding: '8px 10px' }}
                aria-label={`Retirer ${fichier.name}`}
                onClick={() => setAJoindre((avant) => avant.filter((_, i) => i !== rang))}
              >
                <Symbole nom="croix" taille={16} couleur="var(--corail-fonce)" />
              </button>
            </div>
          ))
        )}
        <input
          ref={champ}
          type="file"
          accept="image/*,application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const choisis = Array.from(e.target.files ?? [])
            const trop = choisis.find((f) => f.size > TAILLE_MAXIMUM)
            setSouci(trop ? `« ${trop.name} » est trop lourd (${poids(trop.size)}). 10 Mo au maximum.` : '')
            setAJoindre((avant) => [...avant, ...choisis.filter((f) => f.size <= TAILLE_MAXIMUM)])
            if (champ.current) champ.current.value = ''
          }}
        />
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => champ.current?.click()}
        >
          {aJoindre.length === 0 ? 'Photo ou PDF de la facture' : 'Ajouter une autre pièce'}
        </button>
        {souci && (
          <p className="doux mini" style={{ color: 'var(--corail-fonce)', margin: '10px 0 0' }}>
            {souci}
          </p>
        )}
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
        disabled={montant <= 0 || ecart !== 0 || envoi}
        onClick={() => {
          setEnvoi(true)
          void (async () => {
            try {
              const id = await ajouterCharge(
                { nature, libelle: libelle.trim(), periode, montant, note: note.trim(), reference: '' },
                parts,
              )
              // Les photos ne partent qu'une fois la facture créée : c'est
              // elle qui leur donne un endroit où se ranger.
              for (const fichier of aJoindre) {
                const depose = await televerser(fichier, id)
                await ajouterPiece(id, depose)
              }
              fermer()
            } catch (erreur) {
              setSouci(erreur instanceof Error ? erreur.message : "L'envoi n'a pas abouti.")
              setEnvoi(false)
            }
          })()
        }}
      >
        {envoi ? 'Enregistrement…' : 'Ajouter la facture'}
      </button>
    </div>
  )
}
