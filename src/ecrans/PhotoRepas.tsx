/* Photographier un repas, et en estimer les calories.

   Il faut être honnête sur ce que fait cet écran : aucune application ne
   devine des calories en regardant une photo sans envoyer l'image à un
   serveur d'intelligence artificielle. Ici rien ne quitte le téléphone —
   alors la photo sert de souvenir, et l'estimation vient de trois questions
   auxquelles on répond en regardant son assiette.

   C'est moins magique et beaucoup plus juste : sur une semaine, une
   fourchette honnête vaut mieux qu'un chiffre inventé. Et tout reste
   corrigeable à la main avant d'enregistrer. */

import { useEffect, useMemo, useRef, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { estimer, RICHESSES, TAILLES, TYPES_PLAT } from '../lib/estimation'
import { useApp } from '../lib/etat'
import { enregistrerPhoto, reduireImage } from '../lib/photos'
import { nouvelId } from '../lib/stockage'
import type { MomentRepas } from '../lib/stockage'

const NOMS: Record<MomentRepas, string> = {
  'petit-dejeuner': 'au petit-déjeuner',
  dejeuner: 'au déjeuner',
  diner: 'au dîner',
  encas: 'aux en-cas',
}

export default function PhotoRepas({
  moment: momentDepart,
  fermer,
}: {
  moment: MomentRepas
  fermer: () => void
}) {
  const { ajouterRepas } = useApp()
  const [image, setImage] = useState<Blob | null>(null)
  const [type, setType] = useState('assiette')
  const [taille, setTaille] = useState('normale')
  const [richesse, setRichesse] = useState('normale')
  const [nom, setNom] = useState('')
  const [kcal, setKcal] = useState<number | null>(null)
  const [moment, setMoment] = useState<MomentRepas>(momentDepart)
  const [occupe, setOccupe] = useState(false)
  const champFichier = useRef<HTMLInputElement>(null)

  const calcul = estimer(type, taille, richesse)

  // Le chiffre suit les réponses tant qu'on ne l'a pas corrigé soi-même :
  // dès qu'on tape un nombre, c'est le sien qui gagne.
  const corrige = kcal !== null
  const retenu = corrige ? kcal : calcul.milieu

  // L'aperçu se déduit de la photo choisie, et se libère dès qu'elle change.
  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
  useEffect(() => {
    if (!apercu) return
    return () => URL.revokeObjectURL(apercu)
  }, [apercu])

  async function choisirPhoto(fichier: File | undefined) {
    if (!fichier) return
    setOccupe(true)
    try {
      setImage(await reduireImage(fichier))
    } catch {
      /* certains formats de photo ne se relisent pas : on garde l'original */
      setImage(fichier)
    }
    setOccupe(false)
  }

  async function enregistrer() {
    const titre = nom.trim() || (TYPES_PLAT.find((t) => t.id === type)?.nom ?? 'Repas')
    let photoId: string | undefined
    if (image) {
      photoId = nouvelId()
      try {
        await enregistrerPhoto(photoId, image)
      } catch {
        /* réserve d'images pleine ou refusée : on garde au moins les calories */
        photoId = undefined
      }
    }
    const facteur = retenu / (calcul.milieu || 1)
    ajouterRepas({
      moment,
      nom: titre,
      quantite: 1,
      unite: 'portion',
      kcal: Math.round(retenu),
      glucides: Math.round(calcul.glucides * facteur),
      proteines: Math.round(calcul.proteines * facteur),
      lipides: Math.round(calcul.lipides * facteur),
      photoId,
      estime: true,
    })
    fermer()
  }

  return (
    <div className="page">
      <Entete kicker="Repas" titre="Photographier mon repas" retour={fermer} />

      {/* ---------- la photo ---------- */}
      <div className="carte">
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
                borderRadius: 16,
                display: 'block',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                className="bouton-fin"
                style={{ flex: 1 }}
                onClick={() => champFichier.current?.click()}
              >
                Reprendre
              </button>
              <button
                type="button"
                className="bouton-fin"
                style={{ flex: 1 }}
                onClick={() => setImage(null)}
              >
                Retirer
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            style={{
              width: '100%',
              border: '1px dashed var(--bord)',
              background: 'var(--piste)',
              borderRadius: 16,
              padding: '30px 16px',
              display: 'grid',
              placeItems: 'center',
              gap: 8,
              color: 'var(--argile)',
            }}
            onClick={() => champFichier.current?.click()}
          >
            <Symbole nom="photo" taille={34} />
            <span style={{ fontWeight: 700, color: 'var(--encre)' }}>
              {occupe ? 'Un instant…' : 'Prendre la photo'}
            </span>
            <span className="doux mini">Ou en choisir une dans la galerie</span>
          </button>
        )}

        <p className="doux mini" style={{ margin: '12px 0 0', lineHeight: 1.7 }}>
          La photo reste dans le téléphone : elle n'est envoyée nulle part, et personne ne peut
          la voir. Elle sert à se souvenir des portions quand on regarde sa semaine.
        </p>
      </div>

      {/* ---------- les trois questions ---------- */}
      <div className="carte">
        <div className="kicker">1 · Qu'est-ce que c'était</div>
        <div style={{ marginTop: 10 }}>
          {TYPES_PLAT.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`choix${type === t.id ? ' actif' : ''}`}
              style={{ width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: 6 }}
              onClick={() => setType(t.id)}
            >
              <b style={{ fontSize: 15 }}>{t.nom}</b>
              <span className="doux mini" style={{ display: 'block' }}>
                {t.detail}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">2 · La portion</div>
        <div className="grille3" style={{ marginTop: 10 }}>
          {TAILLES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`choix${taille === t.id ? ' actif' : ''}`}
              style={{ padding: '10px 8px' }}
              onClick={() => setTaille(t.id)}
            >
              <b style={{ fontSize: 14 }}>{t.nom}</b>
              <span className="doux mini" style={{ display: 'block' }}>
                {t.detail}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">3 · La préparation</div>
        <div className="grille3" style={{ marginTop: 10 }}>
          {RICHESSES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`choix${richesse === r.id ? ' actif' : ''}`}
              style={{ padding: '10px 8px' }}
              onClick={() => setRichesse(r.id)}
            >
              <b style={{ fontSize: 14 }}>{r.nom}</b>
              <span className="doux mini" style={{ display: 'block' }}>
                {r.detail}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- l'estimation ---------- */}
      <div className="carte" style={{ background: 'var(--argile-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Estimation</div>
            <div className="chiffre" style={{ fontSize: 34 }}>
              {Math.round(retenu)}
              <span className="doux" style={{ fontSize: 16, fontWeight: 500 }}>
                {' '}
                kcal
              </span>
            </div>
          </div>
          <Symbole nom="flamme" taille={30} couleur="var(--argile)" />
        </div>
        <div className="doux mini" style={{ marginTop: 6 }}>
          {corrige
            ? 'Chiffre corrigé à la main.'
            : `Sans doute entre ${calcul.bas} et ${calcul.haut} kcal.`}
        </div>

        <label className="etiquette" htmlFor="kcal-photo" style={{ marginTop: 14 }}>
          Corriger le chiffre si vous le connaissez
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="kcal-photo"
            className="champ"
            inputMode="numeric"
            placeholder={String(calcul.milieu)}
            value={kcal ?? ''}
            onChange={(e) => {
              const valeur = e.target.value.trim()
              setKcal(valeur === '' ? null : Math.max(0, Number(valeur) || 0))
            }}
          />
          {corrige && (
            <button
              type="button"
              className="bouton-fin"
              style={{ flex: '0 0 auto' }}
              onClick={() => setKcal(null)}
            >
              Reprendre l'estimation
            </button>
          )}
        </div>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="nom-photo">
          Le nom du repas
        </label>
        <input
          id="nom-photo"
          className="champ"
          placeholder={TYPES_PLAT.find((t) => t.id === type)?.nom}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
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

      <button type="button" className="bouton" onClick={() => void enregistrer()}>
        Ajouter {NOMS[moment]}
      </button>
    </div>
  )
}
