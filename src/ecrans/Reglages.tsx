/* Les réglages, et surtout : la sauvegarde.
   Tout vit dans le navigateur du téléphone — vider les données du navigateur,
   changer de téléphone, et le suivi disparaît. D'où le fichier à exporter. */

import { useRef } from 'react'
import Entete from '../composants/Entete'
import { clefJour } from '../lib/dates'
import { useApp } from '../lib/etat'
import { PLANS } from '../lib/jeune'
import { NIVEAUX, OBJECTIFS, objectifCalories, depenseJournaliere, poidsActuel } from '../lib/profil'
import type { Etat, Niveau, Objectif, Sexe } from '../lib/stockage'

export default function EcranReglages({ fermer }: { fermer: () => void }) {
  const { etat, reglerLe, remplacerTout, toutEffacer } = useApp()
  const profil = etat.profil
  const champFichier = useRef<HTMLInputElement>(null)
  const poids = poidsActuel(etat)
  const depense = poids !== null ? depenseJournaliere(profil, poids) : null
  const kcal = objectifCalories(etat)

  function exporter() {
    const fichier = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' })
    const adresse = URL.createObjectURL(fichier)
    const lien = document.createElement('a')
    lien.href = adresse
    lien.download = `mahana-${clefJour()}.json`
    lien.click()
    URL.revokeObjectURL(adresse)
  }

  async function importer(fichier: File) {
    try {
      const lu = JSON.parse(await fichier.text()) as Etat
      if (typeof lu !== 'object' || lu === null || !Array.isArray(lu.jeunes)) {
        throw new Error('fichier inattendu')
      }
      if (confirm('Remplacer le suivi actuel par le contenu de ce fichier ?')) remplacerTout(lu)
    } catch {
      alert("Ce fichier n'est pas une sauvegarde Mahana.")
    }
  }

  const nombreOuNull = (valeur: string) => {
    const n = Number(valeur.replace(',', '.'))
    return valeur === '' || !Number.isFinite(n) ? null : n
  }

  return (
    <div className="page">
      <Entete kicker="Mahana" titre="Réglages" retour={fermer} />

      <div className="carte">
        <div className="kicker">Moi</div>
        <label className="etiquette" style={{ marginTop: 10 }} htmlFor="prenom">
          Prénom
        </label>
        <input
          id="prenom"
          className="champ"
          value={profil.prenom}
          placeholder="Votre prénom"
          onChange={(e) => reglerLe({ prenom: e.target.value })}
        />
        <div className="grille2" style={{ marginTop: 12 }}>
          {(['F', 'H'] as Sexe[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`choix${profil.sexe === valeur ? ' actif' : ''}`}
              onClick={() => reglerLe({ sexe: valeur })}
            >
              <b>{valeur === 'F' ? 'Femme' : 'Homme'}</b>
            </button>
          ))}
        </div>
        <div className="grille2" style={{ marginTop: 12 }}>
          <div>
            <label className="etiquette" htmlFor="age">
              Âge
            </label>
            <input
              id="age"
              className="champ"
              inputMode="numeric"
              value={profil.age ?? ''}
              onChange={(e) => reglerLe({ age: nombreOuNull(e.target.value) })}
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="taille">
              Taille (cm)
            </label>
            <input
              id="taille"
              className="champ"
              inputMode="numeric"
              value={profil.tailleCm ?? ''}
              onChange={(e) => reglerLe({ tailleCm: nombreOuNull(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="carte">
        <div className="kicker">Objectif</div>
        <label className="etiquette" style={{ marginTop: 10 }} htmlFor="poids-but">
          Poids visé (kg)
        </label>
        <input
          id="poids-but"
          className="champ"
          inputMode="decimal"
          placeholder="ex. 65"
          value={profil.poidsBut ?? ''}
          onChange={(e) => reglerLe({ poidsBut: nombreOuNull(e.target.value) })}
        />

        <label className="etiquette" style={{ marginTop: 14 }}>
          À quel rythme
        </label>
        <div style={{ display: 'grid', gap: 8 }}>
          {OBJECTIFS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`choix${profil.objectif === o.id ? ' actif' : ''}`}
              onClick={() => reglerLe({ objectif: o.id as Objectif })}
            >
              <b>{o.nom}</b>
              <span>{o.detail}</span>
            </button>
          ))}
        </div>

        <label className="etiquette" style={{ marginTop: 14 }}>
          Mes journées, hors sport
        </label>
        <div style={{ display: 'grid', gap: 8 }}>
          {NIVEAUX.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`choix${profil.niveau === n.id ? ' actif' : ''}`}
              onClick={() => reglerLe({ niveau: n.id as Niveau })}
            >
              <b>{n.nom}</b>
              <span>{n.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="carte" style={{ background: 'var(--menthe-pale)' }}>
        <div className="kicker">Ce que ça donne</div>
        <div className="ligne-liste" style={{ borderColor: 'rgba(29,47,56,.1)' }}>
          <span className="doux">Dépense d'une journée</span>
          <span className="chiffre">{depense ? `${depense} kcal` : '—'}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Objectif à manger</span>
          <span className="chiffre">{kcal ? `${kcal} kcal` : '—'}</span>
        </div>
        <label className="etiquette" style={{ marginTop: 12 }} htmlFor="kcal-manuel">
          Fixer l'objectif à la main (laisser vide pour le calcul automatique)
        </label>
        <input
          id="kcal-manuel"
          className="champ"
          inputMode="numeric"
          placeholder="calculé"
          value={profil.kcalManuel ?? ''}
          onChange={(e) => reglerLe({ kcalManuel: nombreOuNull(e.target.value) })}
        />
      </div>

      <div className="carte">
        <div className="kicker">Jeûne</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`choix${plan.id === profil.planJeune ? ' actif' : ''}`}
              onClick={() =>
                reglerLe({ planJeune: plan.id, objectifJeuneHeures: plan.jeune })
              }
            >
              <b>{plan.nom}</b>
              <span>{plan.pourQui}</span>
            </button>
          ))}
        </div>
        <label className="etiquette" style={{ marginTop: 14 }} htmlFor="objectif-jeune">
          Objectif, en heures
        </label>
        <input
          id="objectif-jeune"
          className="champ"
          type="number"
          min={1}
          max={72}
          value={profil.objectifJeuneHeures}
          onChange={(e) =>
            reglerLe({
              objectifJeuneHeures: Math.min(72, Math.max(1, Number(e.target.value) || 1)),
            })
          }
        />
        <p className="doux mini" style={{ margin: '8px 0 0' }}>
          Le changement s'applique aux prochains jeûnes : celui qui est en cours garde l'objectif
          fixé au départ.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Chaque jour</div>
        <div className="grille2" style={{ marginTop: 10 }}>
          <div>
            <label className="etiquette" htmlFor="but-eau">
              Verres d'eau
            </label>
            <input
              id="but-eau"
              className="champ"
              type="number"
              min={1}
              max={30}
              value={profil.butEau}
              onChange={(e) =>
                reglerLe({ butEau: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })
              }
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="verre">
              Un verre (ml)
            </label>
            <input
              id="verre"
              className="champ"
              type="number"
              min={50}
              max={1500}
              step={50}
              value={profil.verreMl}
              onChange={(e) =>
                reglerLe({ verreMl: Math.min(1500, Math.max(50, Number(e.target.value) || 250)) })
              }
            />
          </div>
        </div>
        <div className="grille2" style={{ marginTop: 12 }}>
          <div>
            <label className="etiquette" htmlFor="but-pas">
              Pas
            </label>
            <input
              id="but-pas"
              className="champ"
              type="number"
              min={1000}
              step={500}
              value={profil.butPas}
              onChange={(e) =>
                reglerLe({ butPas: Math.max(1000, Number(e.target.value) || 8000) })
              }
            />
          </div>
          <div>
            <label className="etiquette" htmlFor="but-sommeil">
              Sommeil (heures)
            </label>
            <input
              id="but-sommeil"
              className="champ"
              type="number"
              min={4}
              max={12}
              step={0.5}
              value={profil.butSommeilMin / 60}
              onChange={(e) =>
                reglerLe({ butSommeilMin: Math.round((Number(e.target.value) || 8) * 60) })
              }
            />
          </div>
        </div>
        <p className="doux mini" style={{ margin: '10px 0 0' }}>
          Objectif d'eau : {(profil.butEau * profil.verreMl).toLocaleString('fr-FR')} ml par jour.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Sauvegarde</div>
        <p className="doux" style={{ marginTop: 6 }}>
          Le suivi est gardé dans ce téléphone, et nulle part ailleurs. Pour le mettre à l'abri, ou
          passer sur un autre appareil, exportez le fichier de temps en temps.
        </p>
        <button type="button" className="bouton" onClick={exporter}>
          Exporter mes données
        </button>
        <div style={{ height: 10 }} />
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%' }}
          onClick={() => champFichier.current?.click()}
        >
          Importer une sauvegarde
        </button>
        <input
          ref={champFichier}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const fichier = e.target.files?.[0]
            if (fichier) void importer(fichier)
            e.target.value = ''
          }}
        />
      </div>

      <div className="carte">
        <div className="kicker">À savoir</div>
        <p className="doux" style={{ marginTop: 6, marginBottom: 0 }}>
          Les calories, les étapes du jeûne et les dépenses affichées sont des <b>estimations</b> :
          des repères pour se situer, pas des mesures. Le vrai juge, c'est la courbe de poids sur
          trois semaines. Le jeûne et les régimes restrictifs sont déconseillés en cas de
          grossesse, d'allaitement, de diabète, de troubles alimentaires ou de traitement en
          cours — dans le doute, demander à un médecin.
        </p>
      </div>

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', color: 'var(--corail)' }}
        onClick={() => {
          if (confirm('Tout effacer : jeûnes, repas, séances, pesées, défis et réglages. Sûr ?')) {
            toutEffacer()
          }
        }}
      >
        Tout effacer
      </button>
    </div>
  )
}
