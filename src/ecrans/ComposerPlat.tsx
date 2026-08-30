/* Décrire un repas en une phrase, et laisser l'app faire le calcul.

   On écrit « un sandwich avec 2 pains de mie complets, 80 g de poulet pané,
   un peu de salade… », l'app découpe, reconnaît et propose les quantités.
   Tout reste modifiable : une estimation qu'on ne peut pas corriger ne vaut
   rien, et c'est celle qui mange qui sait ce qu'il y avait dans l'assiette. */

import { useEffect, useMemo, useRef, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import type { Aliment } from '../lib/aliments'
import { chercherAliment, pour } from '../lib/aliments'
import { analyser } from '../lib/analyse'
import { useApp } from '../lib/etat'
import { nombreFr } from '../lib/formats'
import { enregistrerPhoto, reduireImage } from '../lib/photos'
import { nouvelId } from '../lib/stockage'
import type { MomentRepas } from '../lib/stockage'

type Ligne = { id: string; texte: string; aliment: Aliment | null; quantite: number }

const NOMS: Record<MomentRepas, string> = {
  'petit-dejeuner': 'au petit-déjeuner',
  dejeuner: 'au déjeuner',
  diner: 'au dîner',
  encas: 'aux en-cas',
}

const EXEMPLE =
  "un sandwich avec 2 pains de mie complets, 80 g de poulet pané, un peu de salade, carotte râpée, tomate, beurre d'olive et du chimichurri"

export default function ComposerPlat({
  moment: momentDepart,
  fermer,
}: {
  moment: MomentRepas
  fermer: () => void
}) {
  const { ajouterRepas, garderPlat } = useApp()
  const [phrase, setPhrase] = useState('')
  const [analyse, setAnalyse] = useState(false)
  const [nom, setNom] = useState('')
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [moment, setMoment] = useState<MomentRepas>(momentDepart)
  const [recherchePour, setRecherchePour] = useState<string | null>(null)
  const [garde, setGarde] = useState(false)
  // La photo est facultative : elle ne change pas les calories, elle sert
  // à se souvenir de la portion en relisant sa semaine.
  const [image, setImage] = useState<Blob | null>(null)
  const champFichier = useRef<HTMLInputElement>(null)

  // L'aperçu se déduit de la photo choisie, et se libère dès qu'elle change.
  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
  useEffect(() => {
    if (!apercu) return
    return () => URL.revokeObjectURL(apercu)
  }, [apercu])

  async function choisirPhoto(fichier: File | undefined) {
    if (!fichier) return
    try {
      setImage(await reduireImage(fichier))
    } catch {
      setImage(fichier)
    }
  }

  function lancerAnalyse() {
    const resultat = analyser(phrase)
    setNom(resultat.nom ?? '')
    setLignes(
      resultat.lignes.map((l) => ({
        id: nouvelId(),
        texte: l.texte,
        aliment: l.aliment,
        quantite: l.quantite,
      })),
    )
    setAnalyse(true)
  }

  const totaux = lignes.reduce(
    (total, ligne) => {
      if (!ligne.aliment) return total
      const v = pour(ligne.aliment, ligne.quantite)
      return {
        kcal: total.kcal + v.kcal,
        glucides: total.glucides + v.glucides,
        proteines: total.proteines + v.proteines,
        lipides: total.lipides + v.lipides,
      }
    },
    { kcal: 0, glucides: 0, proteines: 0, lipides: 0 },
  )

  const arrondi = (v: number) => Math.round(v * 10) / 10

  async function enregistrer() {
    const titre = nom.trim() || 'Repas'
    let photoId: string | undefined
    if (image) {
      photoId = nouvelId()
      try {
        await enregistrerPhoto(photoId, image)
      } catch {
        /* réserve d'images pleine : on garde au moins le repas */
        photoId = undefined
      }
    }
    ajouterRepas({
      moment,
      nom: titre,
      quantite: 1,
      unite: 'portion',
      kcal: Math.round(totaux.kcal),
      glucides: arrondi(totaux.glucides),
      proteines: arrondi(totaux.proteines),
      lipides: arrondi(totaux.lipides),
      photoId,
    })
    if (garde) {
      garderPlat({
        nom: titre,
        kcal: Math.round(totaux.kcal),
        glucides: arrondi(totaux.glucides),
        proteines: arrondi(totaux.proteines),
        lipides: arrondi(totaux.lipides),
      })
    }
    fermer()
  }

  /* ---------- l'écriture ---------- */
  if (!analyse) {
    return (
      <div className="page">
        <Entete kicker="Repas" titre="Décrire ce que j'ai mangé" retour={fermer} />

        <div className="carte">
          <p className="doux" style={{ marginTop: 0 }}>
            Écrivez le repas comme vous le raconteriez. Séparez par des virgules, mettez les
            quantités quand vous les connaissez — l'app devine le reste et vous corrigez.
          </p>
          <textarea
            className="champ"
            rows={6}
            autoFocus
            style={{ resize: 'vertical', lineHeight: 1.5 }}
            placeholder={EXEMPLE}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => setPhrase(EXEMPLE)}
          >
            Voir un exemple
          </button>
        </div>

        <button type="button" className="bouton" disabled={phrase.trim().length < 3} onClick={lancerAnalyse}>
          Calculer les calories
        </button>
      </div>
    )
  }

  /* ---------- le résultat, corrigeable ---------- */
  return (
    <div className="page">
      <Entete kicker="Repas" titre="Ce que j'ai compris" retour={() => setAnalyse(false)} />

      <div className="carte">
        <label className="etiquette" htmlFor="nom-plat">
          Le nom du plat
        </label>
        <input
          id="nom-plat"
          className="champ"
          placeholder="ex. Sandwich au poulet"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </div>

      <div className="carte">
        <div className="kicker">La photo (facultative)</div>
        <input
          ref={champFichier}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            void choisirPhoto(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {apercu ? (
          <>
            <img
              src={apercu}
              alt="Le repas photographié"
              style={{
                width: '100%',
                marginTop: 10,
                borderRadius: 14,
                display: 'block',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
              }}
            />
            <button
              type="button"
              className="bouton-fin"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setImage(null)}
            >
              Retirer la photo
            </button>
          </>
        ) : (
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => champFichier.current?.click()}
          >
            ◎ Ajouter une photo du plat
          </button>
        )}
      </div>

      <div className="carte">
        <div className="kicker">Les ingrédients</div>
        {lignes.length === 0 && <p className="vide">Rien de reconnu dans cette phrase.</p>}

        {lignes.map((ligne) => (
          <div key={ligne.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--bord)' }}>
            {ligne.aliment ? (
              <>
                <div className="rangee">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{ligne.aliment.nom}</div>
                    <div className="doux mini">« {ligne.texte} »</div>
                  </div>
                  <span className="chiffre">{pour(ligne.aliment, ligne.quantite).kcal} kcal</span>
                  <button
                    type="button"
                    className="bouton-fin"
                    style={{ padding: '4px 10px' }}
                    aria-label="Retirer"
                    onClick={() => setLignes((l) => l.filter((x) => x.id !== ligne.id))}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    className="champ"
                    style={{ width: 100, padding: '8px 12px' }}
                    inputMode="numeric"
                    value={ligne.quantite}
                    onChange={(e) =>
                      setLignes((l) =>
                        l.map((x) =>
                          x.id === ligne.id
                            ? { ...x, quantite: Math.max(0, Number(e.target.value) || 0) }
                            : x,
                        ),
                      )
                    }
                  />
                  <span className="doux mini">{ligne.aliment.unite}</span>
                  <button
                    type="button"
                    className="pilule"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setRecherchePour(ligne.id)}
                  >
                    Ce n'est pas ça
                  </button>
                </div>
              </>
            ) : (
              <div className="rangee">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--argile)' }}>« {ligne.texte} »</div>
                  <div className="doux mini">Pas reconnu — à chercher ou à retirer</div>
                </div>
                <button type="button" className="pilule corail" onClick={() => setRecherchePour(ligne.id)}>
                  Chercher
                </button>
                <button
                  type="button"
                  className="bouton-fin"
                  style={{ padding: '4px 10px' }}
                  aria-label="Retirer"
                  onClick={() => setLignes((l) => l.filter((x) => x.id !== ligne.id))}
                >
                  ✕
                </button>
              </div>
            )}

            {recherchePour === ligne.id && (
              <Recherche
                depart={ligne.texte}
                choisir={(aliment) => {
                  setLignes((l) =>
                    l.map((x) =>
                      x.id === ligne.id
                        ? { ...x, aliment, quantite: x.quantite || aliment.portion }
                        : x,
                    ),
                  )
                  setRecherchePour(null)
                }}
                fermer={() => setRecherchePour(null)}
              />
            )}
          </div>
        ))}

        {recherchePour === 'nouveau' ? (
          <Recherche
            depart=""
            choisir={(aliment) => {
              setLignes((l) => [
                ...l,
                { id: nouvelId(), texte: aliment.nom, aliment, quantite: aliment.portion },
              ])
              setRecherchePour(null)
            }}
            fermer={() => setRecherchePour(null)}
          />
        ) : (
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 12 }}
            onClick={() => setRecherchePour('nouveau')}
          >
            + Ajouter un ingrédient
          </button>
        )}
      </div>

      <div className="carte" style={{ background: 'var(--argile-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Ce repas fait</div>
            <div className="chiffre" style={{ fontSize: 34 }}>
              {Math.round(totaux.kcal)}
              <span className="doux" style={{ fontSize: 16, fontWeight: 500 }}> kcal</span>
            </div>
          </div>
          <Symbole nom="flamme" taille={30} couleur="var(--argile)" />
        </div>
        <div className="doux mini" style={{ marginTop: 8, lineHeight: 1.8 }}>
          {nombreFr(totaux.glucides, 1)} g de glucides · {nombreFr(totaux.proteines, 1)} g de
          protéines · {nombreFr(totaux.lipides, 1)} g de lipides
        </div>
      </div>

      <div className="carte">
        <div className="kicker">À quel repas</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {(Object.keys(NOMS) as MomentRepas[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`choix${moment === valeur ? ' actif' : ''}`}
              style={{ padding: '10px 12px' }}
              onClick={() => setMoment(valeur)}
            >
              <b style={{ fontSize: 15 }}>
                {NOMS[valeur].replace(/^au[x]? /, '').replace(/^./, (c) => c.toUpperCase())}
              </b>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', marginBottom: 12 }}
        onClick={() => setGarde(!garde)}
      >
        {garde ? '★ Ce plat sera gardé' : '☆ Garder ce plat pour la prochaine fois'}
      </button>

      <button type="button" className="bouton" disabled={totaux.kcal <= 0} onClick={() => void enregistrer()}>
        Ajouter {NOMS[moment]}
      </button>
    </div>
  )
}

/* ---------- la petite recherche, glissée dans une ligne ---------- */

function Recherche({
  depart,
  choisir,
  fermer,
}: {
  depart: string
  choisir: (aliment: Aliment) => void
  fermer: () => void
}) {
  const [texte, setTexte] = useState(depart)
  const resultats = chercherAliment(texte).slice(0, 8)

  return (
    <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: 'var(--piste)' }}>
      <input
        className="champ"
        autoFocus
        placeholder="Chercher un aliment…"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
      />
      <div style={{ marginTop: 6 }}>
        {resultats.map((aliment) => (
          <button
            key={aliment.nom}
            type="button"
            className="ligne-liste"
            style={{ width: '100%', border: 0, background: 'none', textAlign: 'left' }}
            onClick={() => choisir(aliment)}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>{aliment.nom}</span>
            <span className="doux mini">
              {aliment.kcal} kcal / 100 {aliment.unite}
            </span>
          </button>
        ))}
        {texte.length > 1 && resultats.length === 0 && (
          <p className="doux mini" style={{ margin: '8px 0 0' }}>
            Rien trouvé. Retirez la ligne et notez le plat à la main dans « Ajouter ».
          </p>
        )}
      </div>
      <button type="button" className="bouton-fin" style={{ width: '100%', marginTop: 8 }} onClick={fermer}>
        Annuler
      </button>
    </div>
  )
}
