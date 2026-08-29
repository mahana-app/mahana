/* Les réglages, et surtout : la sauvegarde.
   Tout vit dans le navigateur du téléphone — vider les données du navigateur,
   changer de téléphone, et le suivi disparaît. D'où le fichier à exporter. */

import { useRef } from 'react'
import { IconeRetour } from '../composants/Icones'
import { clefJour } from '../lib/dates'
import { useApp } from '../lib/etat'
import { PLANS } from '../lib/jeune'
import type { Etat } from '../lib/stockage'

export default function EcranReglages({ fermer }: { fermer: () => void }) {
  const { etat, reglerLes, remplacerTout, toutEffacer } = useApp()
  const reglages = etat.reglages
  const champFichier = useRef<HTMLInputElement>(null)

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

  return (
    <div className="page">
      <header className="entete">
        <button
          type="button"
          className="rond-entete"
          aria-label="Retour"
          onClick={fermer}
          style={{ marginRight: 4 }}
        >
          <IconeRetour />
        </button>
        <div style={{ flex: 1 }}>
          <div className="bonjour">Mahana</div>
          <h1>Réglages</h1>
        </div>
      </header>

      <div className="carte">
        <label className="etiquette" htmlFor="prenom">
          Prénom
        </label>
        <input
          id="prenom"
          className="champ"
          value={reglages.prenom}
          placeholder="Votre prénom"
          onChange={(e) => reglerLes({ prenom: e.target.value })}
        />
      </div>

      <div className="carte">
        <div className="kicker">Rythme de jeûne</div>
        <div className="grille-plans" style={{ marginTop: 10 }}>
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`choix${plan.id === reglages.plan ? ' actif' : ''}`}
              onClick={() => reglerLes({ plan: plan.id, objectifHeures: plan.jeune })}
            >
              <b>{plan.nom}</b>
              <span>{plan.pourQui}</span>
            </button>
          ))}
        </div>
        <label className="etiquette" htmlFor="objectif" style={{ marginTop: 16 }}>
          Objectif, en heures
        </label>
        <input
          id="objectif"
          className="champ"
          type="number"
          min={1}
          max={72}
          value={reglages.objectifHeures}
          onChange={(e) =>
            reglerLes({ objectifHeures: Math.min(72, Math.max(1, Number(e.target.value) || 1)) })
          }
        />
        <p className="doux" style={{ margin: '8px 0 0' }}>
          Le changement s'applique aux prochains jeûnes : celui qui est en cours garde
          l'objectif fixé au départ.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Eau</div>
        <label className="etiquette" htmlFor="but-eau" style={{ marginTop: 10 }}>
          Verres par jour
        </label>
        <input
          id="but-eau"
          className="champ"
          type="number"
          min={1}
          max={30}
          value={reglages.butEau}
          onChange={(e) => reglerLes({ butEau: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })}
        />
        <label className="etiquette" htmlFor="verre" style={{ marginTop: 12 }}>
          Contenance d'un verre (ml)
        </label>
        <input
          id="verre"
          className="champ"
          type="number"
          min={50}
          max={1500}
          step={50}
          value={reglages.verreMl}
          onChange={(e) =>
            reglerLes({ verreMl: Math.min(1500, Math.max(50, Number(e.target.value) || 250)) })
          }
        />
        <p className="doux" style={{ margin: '8px 0 0' }}>
          Objectif du jour : {(reglages.butEau * reglages.verreMl).toLocaleString('fr-FR')} ml.
        </p>
      </div>

      <div className="carte">
        <div className="kicker">Corps</div>
        <label className="etiquette" htmlFor="poids-but" style={{ marginTop: 10 }}>
          Poids visé (kg) — facultatif
        </label>
        <input
          id="poids-but"
          className="champ"
          inputMode="decimal"
          value={reglages.poidsBut ?? ''}
          placeholder="ex. 65"
          onChange={(e) => {
            const valeur = Number(e.target.value.replace(',', '.'))
            reglerLes({ poidsBut: e.target.value === '' || !Number.isFinite(valeur) ? null : valeur })
          }}
        />
        <label className="etiquette" htmlFor="taille" style={{ marginTop: 12 }}>
          Taille (cm) — pour calculer l'IMC
        </label>
        <input
          id="taille"
          className="champ"
          inputMode="numeric"
          value={reglages.tailleCm ?? ''}
          placeholder="ex. 168"
          onChange={(e) => {
            const valeur = Number(e.target.value)
            reglerLes({ tailleCm: e.target.value === '' || !Number.isFinite(valeur) ? null : valeur })
          }}
        />
      </div>

      <div className="carte">
        <div className="kicker">Sauvegarde</div>
        <p className="doux" style={{ marginTop: 6 }}>
          Le suivi est gardé dans ce téléphone, et nulle part ailleurs. Pour le mettre à l'abri,
          ou passer sur un autre appareil, exportez le fichier de temps en temps.
        </p>
        <button type="button" className="bouton" onClick={exporter}>
          Exporter mes données
        </button>
        <div style={{ height: 10 }} />
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', justifyContent: 'center' }}
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
          Les étapes affichées pendant le jeûne (digestion, graisses, cétose, autophagie) sont des
          repères de vulgarisation, pas un avis médical : chaque corps a son rythme. Le jeûne est
          déconseillé en cas de grossesse, d'allaitement, de diabète, de troubles alimentaires ou
          de traitement en cours — dans le doute, demander à un médecin.
        </p>
      </div>

      <button
        type="button"
        className="bouton-fin"
        style={{ width: '100%', justifyContent: 'center', color: 'var(--corail)' }}
        onClick={() => {
          if (confirm('Tout effacer : jeûnes, eau, pesées et réglages. Sûr ?')) toutEffacer()
        }}
      >
        Tout effacer
      </button>
    </div>
  )
}
