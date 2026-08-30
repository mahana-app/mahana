/* Chercher un aliment, régler la quantité, ajouter. Et pour tout ce que la
   base ne connaît pas : la saisie libre, avec les calories du paquet. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import type { Aliment } from '../lib/aliments'
import { ALIMENTS, CATEGORIES, chercherAliment, pour } from '../lib/aliments'
import { useApp } from '../lib/etat'
import type { MomentRepas } from '../lib/stockage'

const NOMS: Record<MomentRepas, string> = {
  'petit-dejeuner': 'au petit-déjeuner',
  dejeuner: 'au déjeuner',
  diner: 'au dîner',
  encas: 'aux en-cas',
}

export default function AjoutAliment({
  moment,
  fermer,
}: {
  moment: MomentRepas
  fermer: () => void
}) {
  const { ajouterRepas } = useApp()
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState(CATEGORIES[0])
  const [choisi, setChoisi] = useState<Aliment | null>(null)
  const [quantite, setQuantite] = useState('')
  const [libre, setLibre] = useState(false)
  const [nomLibre, setNomLibre] = useState('')
  const [kcalLibre, setKcalLibre] = useState('')

  const resultats = recherche
    ? chercherAliment(recherche)
    : ALIMENTS.filter((a) => a.categorie === categorie)

  function ajouterChoisi() {
    if (!choisi) return
    const q = Number(quantite.replace(',', '.')) || choisi.portion
    const valeurs = pour(choisi, q)
    ajouterRepas({ moment, nom: choisi.nom, quantite: q, unite: choisi.unite, ...valeurs })
    fermer()
  }

  function ajouterLibre() {
    const kcal = Number(kcalLibre.replace(',', '.'))
    if (!nomLibre.trim() || !Number.isFinite(kcal) || kcal <= 0) return
    ajouterRepas({
      moment,
      nom: nomLibre.trim(),
      quantite: 1,
      unite: 'portion',
      kcal: Math.round(kcal),
      glucides: 0,
      proteines: 0,
      lipides: 0,
    })
    fermer()
  }

  /* ---------- l'aliment choisi : on règle la quantité ---------- */
  if (choisi) {
    const q = Number(quantite.replace(',', '.')) || choisi.portion
    const valeurs = pour(choisi, q)
    return (
      <div className="page">
        <Entete kicker={choisi.categorie} titre={choisi.nom} retour={() => setChoisi(null)} />
        <div className="carte">
          <label className="etiquette" htmlFor="quantite">
            Quantité ({choisi.unite})
          </label>
          <input
            id="quantite"
            className="champ"
            inputMode="decimal"
            autoFocus
            placeholder={String(choisi.portion)}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[choisi.portion / 2, choisi.portion, choisi.portion * 1.5, choisi.portion * 2].map(
              (valeur) => (
                <button
                  key={valeur}
                  type="button"
                  className="pilule"
                  onClick={() => setQuantite(String(Math.round(valeur)))}
                >
                  {Math.round(valeur)} {choisi.unite}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="carte" style={{ background: 'var(--olive-pale)' }}>
          <div className="rangee">
            <div>
              <div className="kicker">Ça fait</div>
              <div className="chiffre" style={{ fontSize: 32 }}>
                {valeurs.kcal}
                <span style={{ fontSize: 16, color: 'var(--doux)' }}> kcal</span>
              </div>
            </div>
            <div className="doux mini" style={{ textAlign: 'right', lineHeight: 1.7 }}>
              {valeurs.glucides.toLocaleString('fr-FR')} g de glucides
              <br />
              {valeurs.proteines.toLocaleString('fr-FR')} g de protéines
              <br />
              {valeurs.lipides.toLocaleString('fr-FR')} g de lipides
            </div>
          </div>
        </div>

        <button type="button" className="bouton" onClick={ajouterChoisi}>
          Ajouter {NOMS[moment]}
        </button>
      </div>
    )
  }

  /* ---------- la recherche ---------- */
  return (
    <div className="page">
      <Entete kicker={`Ajouter ${NOMS[moment]}`} titre="Qu'avez-vous mangé ?" retour={fermer} />

      <input
        className="champ"
        placeholder="Chercher un aliment…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {!recherche && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className="pilule"
              style={
                categorie === c
                  ? { background: 'var(--encre)', color: '#fff', flex: '0 0 auto' }
                  : { flex: '0 0 auto' }
              }
              onClick={() => setCategorie(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="carte" style={{ marginTop: 12 }}>
        {resultats.length === 0 ? (
          <p className="vide">
            Rien trouvé.
            <br />
            Utilisez la saisie libre en bas de page.
          </p>
        ) : (
          resultats.map((aliment) => (
            <button
              key={aliment.nom}
              type="button"
              className="ligne-liste"
              style={{ width: '100%', border: 0, background: 'none', textAlign: 'left' }}
              onClick={() => {
                setChoisi(aliment)
                setQuantite(String(aliment.portion))
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{aliment.nom}</div>
                <div className="doux mini">
                  {aliment.kcal} kcal / 100 {aliment.unite} · portion {aliment.portion}{' '}
                  {aliment.unite}
                </div>
              </div>
              <span className="pilule menthe">+</span>
            </button>
          ))
        )}
      </div>

      {libre ? (
        <div className="carte">
          <div className="kicker">Saisie libre</div>
          <label className="etiquette" style={{ marginTop: 10 }} htmlFor="nom-libre">
            Ce que c'est
          </label>
          <input
            id="nom-libre"
            className="champ"
            placeholder="ex. part de gâteau de Mamie"
            value={nomLibre}
            onChange={(e) => setNomLibre(e.target.value)}
          />
          <label className="etiquette" style={{ marginTop: 10 }} htmlFor="kcal-libre">
            Calories
          </label>
          <input
            id="kcal-libre"
            className="champ"
            inputMode="numeric"
            placeholder="350"
            value={kcalLibre}
            onChange={(e) => setKcalLibre(e.target.value)}
          />
          <div style={{ height: 12 }} />
          <button type="button" className="bouton" onClick={ajouterLibre}>
            Ajouter
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%' }}
          onClick={() => setLibre(true)}
        >
          Ce n'est pas dans la liste
        </button>
      )}
    </div>
  )
}
