/* Le premier lancement : trois questions, et l'app est prête.
   Rien n'est définitif — tout se change ensuite dans les réglages. */

import { useState } from 'react'
import { useApp } from '../lib/etat'
import { PLANS } from '../lib/jeune'

export default function Bienvenue() {
  const { etat, reglerLes, demarrer } = useApp()
  const [etape, setEtape] = useState(0)
  const [prenom, setPrenom] = useState(etat.reglages.prenom)
  const [plan, setPlan] = useState(etat.reglages.plan)
  const [butEau, setButEau] = useState(etat.reglages.butEau)

  const planChoisi = PLANS.find((p) => p.id === plan) ?? PLANS[2]

  function terminer() {
    reglerLes({
      prenom: prenom.trim(),
      plan: planChoisi.id,
      objectifHeures: planChoisi.jeune,
      butEau,
    })
    demarrer()
  }

  return (
    <div className="page" style={{ paddingTop: 40 }}>
      {etape === 0 && (
        <>
          <div style={{ fontSize: 46, marginBottom: 10 }}>🌅</div>
          <h1 style={{ fontSize: 30, lineHeight: 1.15, marginBottom: 8 }}>
            Mahana
            <br />
            jeûne intermittent
          </h1>
          <p className="doux" style={{ marginTop: 0, marginBottom: 26 }}>
            Un minuteur, un verre d'eau, un poids noté de temps en temps. Tout reste dans ce
            téléphone : pas de compte, rien qui part sur internet.
          </p>
          <label className="etiquette" htmlFor="prenom">
            Comment vous appeler ?
          </label>
          <input
            id="prenom"
            className="champ"
            value={prenom}
            placeholder="Votre prénom"
            onChange={(e) => setPrenom(e.target.value)}
          />
          <div style={{ height: 22 }} />
          <button type="button" className="bouton" onClick={() => setEtape(1)}>
            Continuer
          </button>
        </>
      )}

      {etape === 1 && (
        <>
          <div className="kicker">Étape 2 sur 3</div>
          <h1 style={{ fontSize: 26, margin: '6px 0 6px' }}>Quel rythme ?</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Le premier chiffre, ce sont les heures sans manger. Le second, la fenêtre pendant
            laquelle on mange. En cas de doute : 16 : 8.
          </p>
          <div className="grille-plans" style={{ margin: '16px 0 22px' }}>
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`choix${p.id === plan ? ' actif' : ''}`}
                onClick={() => setPlan(p.id)}
              >
                <b>{p.nom}</b>
                <span>{p.pourQui}</span>
              </button>
            ))}
          </div>
          <button type="button" className="bouton" onClick={() => setEtape(2)}>
            Continuer
          </button>
          <div style={{ height: 10 }} />
          <button type="button" className="bouton-fin" onClick={() => setEtape(0)}>
            Retour
          </button>
        </>
      )}

      {etape === 2 && (
        <>
          <div className="kicker">Étape 3 sur 3</div>
          <h1 style={{ fontSize: 26, margin: '6px 0 6px' }}>Et l'eau ?</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Boire pendant le jeûne ne le casse pas — au contraire, c'est ce qui le rend tenable.
            Combien de verres viser par jour ?
          </p>
          <div
            className="carte"
            style={{ margin: '18px 0 22px', display: 'flex', alignItems: 'center', gap: 18 }}
          >
            <button
              type="button"
              className="bouton-fin"
              style={{ fontSize: 22, padding: '4px 16px' }}
              onClick={() => setButEau(Math.max(1, butEau - 1))}
            >
              −
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="chiffre" style={{ fontSize: 40 }}>
                {butEau}
              </div>
              <div className="doux">verres · {butEau * etat.reglages.verreMl} ml</div>
            </div>
            <button
              type="button"
              className="bouton-fin"
              style={{ fontSize: 22, padding: '4px 16px' }}
              onClick={() => setButEau(Math.min(20, butEau + 1))}
            >
              +
            </button>
          </div>
          <button type="button" className="bouton" onClick={terminer}>
            C'est parti
          </button>
          <div style={{ height: 10 }} />
          <button type="button" className="bouton-fin" onClick={() => setEtape(1)}>
            Retour
          </button>
        </>
      )}
    </div>
  )
}
