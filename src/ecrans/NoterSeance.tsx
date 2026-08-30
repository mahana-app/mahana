/* Noter une séance faite ailleurs : une vidéo suivie sur YouTube, une séance
   à la salle, un cours. On met le nom, la durée, ce qui a travaillé — et les
   calories se proposent toutes seules, quitte à les corriger. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import Symbole from '../composants/Symbole'
import { clefJour } from '../lib/dates'
import { useApp } from '../lib/etat'
import { poidsActuel } from '../lib/profil'
import type { Intensite } from '../lib/sport'
import { FAMILLES, INTENSITES, PARTIES_CORPS, caloriesEstimees, prochainJour } from '../lib/sport'
import type { CategorieSport } from '../lib/stockage'

const CATEGORIES: Array<{ id: CategorieSport; nom: string }> = [
  ...FAMILLES.map((f) => ({ id: f.id as CategorieSport, nom: f.nom })),
  { id: 'exterieur', nom: 'Dehors' },
]

export default function NoterSeance({
  programmeId,
  numeroJour,
  fermer,
}: {
  programmeId?: string
  numeroJour?: number
  fermer: () => void
}) {
  const { etat, noterSeance } = useApp()
  const poids = poidsActuel(etat) ?? 70
  const programme = etat.programmes.find((p) => p.id === programmeId) ?? null
  const jour = numeroJour ?? (programme ? prochainJour(programme.id, etat.seances) : undefined)

  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState<CategorieSport>(programme?.categorie ?? 'muscu')
  const [minutes, setMinutes] = useState('30')
  const [intensite, setIntensite] = useState<Intensite>('moderee')
  const [parties, setParties] = useState<string[]>([])
  const [kcalManuel, setKcalManuel] = useState('')
  const [date, setDate] = useState(clefJour())

  const duree = Math.max(0, Number(minutes) || 0)
  const estimation = caloriesEstimees(categorie, intensite, duree, poids)
  const kcal = kcalManuel === '' ? estimation : Math.max(0, Number(kcalManuel) || 0)

  const basculerPartie = (partie: string) =>
    setParties((liste) =>
      liste.includes(partie) ? liste.filter((p) => p !== partie) : [...liste, partie],
    )

  function enregistrer() {
    const titre = nom.trim() || (jour ? `Jour ${jour}` : 'Séance')
    noterSeance({
      categorie,
      nom: programme && jour ? `Jour ${jour} · ${titre}` : titre,
      minutes: duree,
      kcal,
      jour: date,
      parties: parties.length ? parties : undefined,
      programmeId: programme?.id,
      numeroJour: programme ? jour : undefined,
    })
    fermer()
  }

  return (
    <div className="page">
      <Entete
        kicker={programme ? `${programme.nom} · jour ${jour}` : 'Sport'}
        titre="Noter une séance"
        retour={fermer}
      />

      <div className="carte">
        <label className="etiquette" htmlFor="nom-seance">
          {programme ? 'Le nom de la vidéo ou de la séance' : 'Qu’avez-vous fait ?'}
        </label>
        <input
          id="nom-seance"
          className="champ"
          autoFocus
          placeholder={programme ? 'ex. Full body strength' : 'ex. Pilates abdos, 30 min'}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        {programme && (
          <p className="doux mini" style={{ margin: '8px 0 0' }}>
            Elle sera enregistrée sous « Jour {jour} · {nom.trim() || '…'} ».
          </p>
        )}
      </div>

      {!programme && (
        <div className="carte">
          <div className="kicker">Quel sport</div>
          <div className="grille2" style={{ marginTop: 10 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`choix${categorie === c.id ? ' actif' : ''}`}
                style={{ padding: '11px 12px' }}
                onClick={() => setCategorie(c.id)}
              >
                <b style={{ fontSize: 16 }}>{c.nom}</b>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="carte">
        <label className="etiquette" htmlFor="duree">
          Combien de temps (minutes)
        </label>
        <input
          id="duree"
          className="champ"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[15, 20, 30, 40, 45, 60].map((v) => (
            <button key={v} type="button" className="pilule" onClick={() => setMinutes(String(v))}>
              {v} min
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Ce qui a travaillé</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {PARTIES_CORPS.map((partie) => {
            const choisie = parties.includes(partie)
            return (
              <button
                key={partie}
                type="button"
                className="pilule"
                style={
                  choisie
                    ? { background: 'var(--argile)', color: '#fdfaf5', fontWeight: 600 }
                    : undefined
                }
                onClick={() => basculerPartie(partie)}
              >
                {partie}
              </button>
            )
          })}
        </div>
      </div>

      <div className="carte">
        <div className="kicker">L'effort</div>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {INTENSITES.map((i) => (
            <button
              key={i.id}
              type="button"
              className={`choix${intensite === i.id ? ' actif' : ''}`}
              onClick={() => setIntensite(i.id)}
            >
              <b>{i.nom}</b>
              <span>{i.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="carte" style={{ background: 'var(--argile-pale)' }}>
        <div className="rangee">
          <div>
            <div className="kicker">Calories brûlées</div>
            <div className="chiffre" style={{ fontSize: 30 }}>
              {kcal}
              <span className="doux" style={{ fontSize: 15, fontWeight: 500 }}> kcal</span>
            </div>
          </div>
          <Symbole nom="flamme" taille={30} couleur="var(--argile)" />
        </div>
        <label className="etiquette" style={{ marginTop: 12 }} htmlFor="kcal">
          Corriger à la main (laisser vide pour l'estimation)
        </label>
        <input
          id="kcal"
          className="champ"
          inputMode="numeric"
          placeholder={String(estimation)}
          value={kcalManuel}
          onChange={(e) => setKcalManuel(e.target.value)}
        />
        <p className="doux mini" style={{ margin: '8px 0 0' }}>
          Estimé avec votre poids ({poids} kg), la durée et l'effort. Si votre montre affiche autre
          chose, c'est elle qui a raison.
        </p>
      </div>

      <div className="carte">
        <label className="etiquette" htmlFor="jour-seance">
          Quand
        </label>
        <input
          id="jour-seance"
          type="date"
          className="champ"
          value={date}
          max={clefJour()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button type="button" className="bouton" disabled={duree <= 0} onClick={enregistrer}>
        Enregistrer la séance
      </button>
    </div>
  )
}
