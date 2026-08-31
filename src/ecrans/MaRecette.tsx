/* Mes recettes : ce que je cuisine vraiment.

   Le carnet de recettes toutes faites donne des idées ; celui-ci donne les
   siennes. C'est celui qu'on regarde à 18 h quand on ne sait pas quoi faire
   à dîner, et c'est pour ça que l'accueil pioche dedans en priorité.

   Les calories ne se saisissent pas : on écrit les ingrédients comme on les
   dirait, l'app les reconnaît et fait le total, qu'on divise par le nombre de
   portions. Tout reste corrigeable — c'est celle qui a cuisiné qui sait
   combien d'huile est passée dans la poêle. */

import { useEffect, useMemo, useRef, useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { pour } from '../lib/aliments'
import { analyser } from '../lib/analyse'
import { useApp } from '../lib/etat'
import { nombreFr } from '../lib/formats'
import { enregistrerPhoto, reduireImage, supprimerPhoto, usePhoto } from '../lib/photos'
import { couleurDuMoment } from '../lib/recettes'
import { nouvelId } from '../lib/stockage'
import type { MomentRepas, RecettePerso } from '../lib/stockage'

const NOMS: Record<MomentRepas, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
  encas: 'En-cas',
}

const AU: Record<MomentRepas, string> = {
  'petit-dejeuner': 'au petit-déjeuner',
  dejeuner: 'au déjeuner',
  diner: 'au dîner',
  encas: 'aux en-cas',
}

/* De quoi reconnaître une recette d'un coup d'œil dans la liste. */
const EMOJIS = ['🍲', '🥘', '🍖', '🐟', '🥗', '🍚', '🍜', '🥑', '🍳', '🥞', '🍠', '🌿']

export default function MaRecette({
  id,
  fermer,
}: {
  id?: string
  fermer: () => void
}) {
  const { etat } = useApp()
  const recette = id ? etat.mesRecettes.find((r) => r.id === id) : undefined
  // Sans identifiant on arrive pour écrire ; avec, on arrive pour lire.
  const [modifie, setModifie] = useState(!id)

  if (id && !recette) {
    return (
      <div className="page">
        <Entete kicker="Ma recette" titre="Introuvable" retour={fermer} />
      </div>
    )
  }

  if (modifie) {
    return (
      <Formulaire
        recette={recette}
        fermer={() => (recette ? setModifie(false) : fermer())}
        apresEnvoi={fermer}
      />
    )
  }

  return <Fiche recette={recette as RecettePerso} fermer={fermer} modifier={() => setModifie(true)} />
}

/* ---------- la fiche : ce qu'il faut, comment on fait, et au repas ---------- */

function Fiche({
  recette,
  fermer,
  modifier,
}: {
  recette: RecettePerso
  fermer: () => void
  modifier: () => void
}) {
  const { ajouterRepas, supprimerRecettePerso } = useApp()
  const photo = usePhoto(recette.photoId)
  const [moment, setMoment] = useState<MomentRepas>(recette.moment)
  const [ajoutee, setAjoutee] = useState(false)

  return (
    <div className="page">
      <Entete kicker="Ma recette" titre={recette.nom} retour={fermer} />

      {photo ? (
        <img
          src={photo}
          alt={recette.nom}
          style={{
            width: '100%',
            borderRadius: 20,
            marginBottom: 13,
            display: 'block',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          className="carte"
          style={{ background: couleurDuMoment(recette.moment), textAlign: 'center', padding: 26 }}
        >
          <div style={{ fontSize: 54 }}>{recette.emoji}</div>
        </div>
      )}

      <div className="carte">
        <div className="rangee">
          <Bloc valeur={String(recette.kcal)} legende="kcal / portion" />
          <Bloc valeur={`${recette.minutes} min`} legende="préparation" />
          <Bloc valeur={String(recette.portions)} legende="portions" />
        </div>
        <div className="doux mini" style={{ marginTop: 10, textAlign: 'center' }}>
          {nombreFr(recette.proteines, 0)} g de protéines · {nombreFr(recette.glucides, 0)} g de
          glucides · {nombreFr(recette.lipides, 0)} g de lipides
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Il me faut</div>
        <ul className="doux" style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.9 }}>
          {recette.ingredients.map((ingredient, index) => (
            <li key={`${ingredient}-${index}`}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {recette.etapes.length > 0 && (
        <div className="carte">
          <div className="kicker">Comment je fais</div>
          <ol className="doux" style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.7 }}>
            {recette.etapes.map((etape, index) => (
              <li key={`${etape}-${index}`} style={{ marginBottom: 8 }}>
                {etape}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="carte">
        <div className="kicker">La mettre dans ma journée</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {(Object.keys(NOMS) as MomentRepas[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`choix${moment === valeur ? ' actif' : ''}`}
              style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700 }}
              onClick={() => setMoment(valeur)}
            >
              {NOMS[valeur]}
            </button>
          ))}
        </div>
        <div style={{ height: 12 }} />
        <button
          type="button"
          className="bouton"
          disabled={ajoutee}
          onClick={() => {
            ajouterRepas({
              moment,
              nom: recette.nom,
              quantite: 1,
              unite: 'portion',
              kcal: recette.kcal,
              glucides: recette.glucides,
              proteines: recette.proteines,
              lipides: recette.lipides,
            })
            setAjoutee(true)
          }}
        >
          {ajoutee ? 'Ajouté ✓' : `Ajouter ${AU[moment]}`}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="bouton-fin" style={{ flex: 1 }} onClick={modifier}>
          Modifier
        </button>
        <button
          type="button"
          className="bouton-fin"
          style={{ flex: 1, color: 'var(--alerte)' }}
          onClick={() => {
            if (!confirm(`Supprimer « ${recette.nom} » de mes recettes ?`)) return
            if (recette.photoId) void supprimerPhoto(recette.photoId)
            supprimerRecettePerso(recette.id)
            fermer()
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

/* ---------- le formulaire ---------- */

function Formulaire({
  recette,
  fermer,
  apresEnvoi,
}: {
  recette?: RecettePerso
  fermer: () => void
  apresEnvoi: () => void
}) {
  const { ajouterRecettePerso, modifierRecettePerso } = useApp()
  const [nom, setNom] = useState(recette?.nom ?? '')
  const [moment, setMoment] = useState<MomentRepas>(recette?.moment ?? 'diner')
  const [emoji, setEmoji] = useState(recette?.emoji ?? '🍲')
  const [ingredients, setIngredients] = useState((recette?.ingredients ?? []).join('\n'))
  const [etapes, setEtapes] = useState((recette?.etapes ?? []).join('\n'))
  const [minutes, setMinutes] = useState(String(recette?.minutes ?? 30))
  const [portions, setPortions] = useState(String(recette?.portions ?? 2))
  const [kcalCorrige, setKcalCorrige] = useState<number | null>(null)
  const [image, setImage] = useState<Blob | null>(null)
  const champFichier = useRef<HTMLInputElement>(null)
  const photoExistante = usePhoto(recette?.photoId)

  const apercu = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
  useEffect(() => {
    if (!apercu) return
    return () => URL.revokeObjectURL(apercu)
  }, [apercu])

  const nombreDePortions = Math.max(1, Number(portions) || 1)

  /* L'estimation : on lit les ingrédients comme une phrase de repas, on
     additionne, et on divise par le nombre de portions. */
  const estimation = useMemo(() => {
    const lignes = ingredients
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lignes.length === 0) return null
    const analyse = analyser(lignes.join(', '))
    const reconnus = analyse.lignes.filter((l) => l.aliment)
    if (reconnus.length === 0) return { total: null, reconnus: 0, sur: lignes.length }
    const total = reconnus.reduce(
      (somme, ligne) => {
        const v = pour(ligne.aliment!, ligne.quantite)
        return {
          kcal: somme.kcal + v.kcal,
          glucides: somme.glucides + v.glucides,
          proteines: somme.proteines + v.proteines,
          lipides: somme.lipides + v.lipides,
        }
      },
      { kcal: 0, glucides: 0, proteines: 0, lipides: 0 },
    )
    return { total, reconnus: reconnus.length, sur: analyse.lignes.length }
  }, [ingredients])

  const parPortion = estimation?.total
    ? {
        kcal: Math.round(estimation.total.kcal / nombreDePortions),
        glucides: Math.round(estimation.total.glucides / nombreDePortions),
        proteines: Math.round(estimation.total.proteines / nombreDePortions),
        lipides: Math.round(estimation.total.lipides / nombreDePortions),
      }
    : null

  const kcalRetenu = kcalCorrige ?? parPortion?.kcal ?? recette?.kcal ?? 0

  async function choisirPhoto(fichier: File | undefined) {
    if (!fichier) return
    try {
      setImage(await reduireImage(fichier))
    } catch {
      setImage(fichier)
    }
  }

  async function enregistrer() {
    let photoId = recette?.photoId
    if (image) {
      const nouvelle = nouvelId()
      try {
        await enregistrerPhoto(nouvelle, image)
        if (photoId) void supprimerPhoto(photoId)
        photoId = nouvelle
      } catch {
        /* réserve d'images pleine : on garde au moins la recette */
      }
    }
    // Le facteur garde les macros cohérentes quand on corrige les calories.
    const facteur = parPortion?.kcal ? kcalRetenu / parPortion.kcal : 1
    const commun = {
      nom: nom.trim() || 'Ma recette',
      moment,
      emoji,
      ingredients: ingredients
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      etapes: etapes
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      minutes: Math.max(0, Number(minutes) || 0),
      portions: nombreDePortions,
      kcal: Math.round(kcalRetenu),
      glucides: Math.round((parPortion?.glucides ?? recette?.glucides ?? 0) * facteur),
      proteines: Math.round((parPortion?.proteines ?? recette?.proteines ?? 0) * facteur),
      lipides: Math.round((parPortion?.lipides ?? recette?.lipides ?? 0) * facteur),
      photoId,
    }
    if (recette) modifierRecettePerso(recette.id, commun)
    else ajouterRecettePerso(commun)
    apresEnvoi()
  }

  return (
    <div className="page">
      <Entete
        kicker="Mes recettes"
        titre={recette ? 'Modifier la recette' : 'Écrire une recette'}
        retour={fermer}
      />

      <div className="carte">
        <label className="etiquette" htmlFor="nom-recette">
          Le nom du plat
        </label>
        <input
          id="nom-recette"
          className="champ"
          autoFocus={!recette}
          placeholder="ex. Viande au four et patates douces"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <label className="etiquette" style={{ marginTop: 14 }}>
          À quel repas
        </label>
        <div className="grille2">
          {(Object.keys(NOMS) as MomentRepas[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`choix${moment === valeur ? ' actif' : ''}`}
              style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700 }}
              onClick={() => setMoment(valeur)}
            >
              {NOMS[valeur]}
            </button>
          ))}
        </div>

        <label className="etiquette" style={{ marginTop: 14 }}>
          Une image pour la reconnaître
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Choisir ${e}`}
              onClick={() => setEmoji(e)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                fontSize: 20,
                border: emoji === e ? '2px solid var(--argile)' : '1px solid var(--bord)',
                background: emoji === e ? 'var(--argile-pale)' : 'var(--champ-fond)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="ingredients">
          Ce qu'il faut — un ingrédient par ligne
        </label>
        <textarea
          id="ingredients"
          className="champ"
          rows={7}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          placeholder={'500 g de viande de bœuf\n2 patates douces\n3 pommes de terre\nsauce chimichurri\nune salade verte'}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <p className="doux mini" style={{ margin: '8px 0 0', lineHeight: 1.7 }}>
          Écrivez les quantités quand vous les connaissez : l'app reconnaît les aliments et
          calcule les calories toute seule.
        </p>

        <div className="grille2" style={{ marginTop: 14 }}>
          <div>
            <label className="etiquette" htmlFor="portions">
              Pour combien de personnes
            </label>
            <input
              id="portions"
              className="champ"
              inputMode="numeric"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="minutes-recette">
              Temps (minutes)
            </label>
            <input
              id="minutes-recette"
              className="champ"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ---------- l'estimation ---------- */}
      <div className="carte" style={{ background: 'var(--argile-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Une portion fait</div>
            <div className="chiffre" style={{ fontSize: 32 }}>
              {kcalRetenu}
              <span className="doux" style={{ fontSize: 15, fontWeight: 500 }}> kcal</span>
            </div>
          </div>
          <Symbole nom="flamme" taille={28} couleur="var(--argile)" />
        </div>

        {estimation === null ? (
          <p className="doux mini" style={{ margin: '8px 0 0' }}>
            Écrivez les ingrédients au-dessus pour obtenir une estimation.
          </p>
        ) : parPortion === null ? (
          <p className="doux mini" style={{ margin: '8px 0 0' }}>
            Aucun ingrédient reconnu. Notez les calories à la main ci-dessous.
          </p>
        ) : (
          <p className="doux mini" style={{ margin: '8px 0 0', lineHeight: 1.7 }}>
            {estimation.reconnus} ingrédient{estimation.reconnus > 1 ? 's' : ''} reconnu
            {estimation.reconnus > 1 ? 's' : ''} sur {estimation.sur}, divisés par{' '}
            {nombreDePortions} portion{nombreDePortions > 1 ? 's' : ''} · {parPortion.proteines} g
            de protéines · {parPortion.glucides} g de glucides · {parPortion.lipides} g de lipides
          </p>
        )}

        <label className="etiquette" htmlFor="kcal-recette" style={{ marginTop: 14 }}>
          Corriger les calories d'une portion
        </label>
        <input
          id="kcal-recette"
          className="champ"
          inputMode="numeric"
          placeholder={String(parPortion?.kcal ?? recette?.kcal ?? 0)}
          value={kcalCorrige ?? ''}
          onChange={(e) => {
            const valeur = e.target.value.trim()
            setKcalCorrige(valeur === '' ? null : Math.max(0, Number(valeur) || 0))
          }}
        />
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="etapes">
          Comment je fais (facultatif) — une étape par ligne
        </label>
        <textarea
          id="etapes"
          className="champ"
          rows={5}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          placeholder={'Four à 200 °C\nPatates douces et pommes de terre en morceaux, 40 min\nViande 25 min\nChimichurri au dernier moment'}
          value={etapes}
          onChange={(e) => setEtapes(e.target.value)}
        />
      </div>

      <div className="carte">
        <div className="kicker">La photo du plat (facultative)</div>
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
        {apercu || photoExistante ? (
          <>
            <img
              src={apercu ?? photoExistante ?? ''}
              alt=""
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
              onClick={() => champFichier.current?.click()}
            >
              Changer la photo
            </button>
          </>
        ) : (
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => champFichier.current?.click()}
          >
            ◎ Prendre une photo du plat
          </button>
        )}
      </div>

      <button
        type="button"
        className="bouton"
        disabled={nom.trim().length === 0}
        onClick={() => void enregistrer()}
      >
        {recette ? 'Enregistrer les changements' : 'Garder cette recette'}
      </button>
    </div>
  )
}

function Bloc({ valeur, legende }: { valeur: string; legende: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div className="chiffre" style={{ fontSize: 18 }}>
        {valeur}
      </div>
      <div className="doux mini">{legende}</div>
    </div>
  )
}
