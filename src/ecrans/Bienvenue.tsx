/* Le premier lancement. Quelques questions — pas par curiosité : sans l'âge,
   la taille et le poids, impossible de calculer un objectif de calories qui
   veuille dire quelque chose. Tout se change ensuite dans les réglages. */

import { useState } from 'react'
import ChoixTheme from '../composants/ChoixTheme'
import { useApp } from '../lib/etat'
import { PLANS } from '../lib/jeune'
import { NIVEAUX, OBJECTIFS, objectifCalories } from '../lib/profil'
import type { Etat, Niveau, Objectif, Sexe } from '../lib/stockage'

export default function Bienvenue() {
  const { etat, reglerLe, noterPoids, demarrer } = useApp()
  const [etape, setEtape] = useState(0)
  const [prenom, setPrenom] = useState(etat.profil.prenom)
  const [sexe, setSexe] = useState<Sexe>(etat.profil.sexe)
  const [age, setAge] = useState(etat.profil.age ? String(etat.profil.age) : '')
  const [taille, setTaille] = useState(etat.profil.tailleCm ? String(etat.profil.tailleCm) : '')
  const [poids, setPoids] = useState('')
  const [poidsBut, setPoidsBut] = useState(
    etat.profil.poidsBut ? String(etat.profil.poidsBut) : '',
  )
  const [niveau, setNiveau] = useState<Niveau>(etat.profil.niveau)
  const [objectif, setObjectif] = useState<Objectif>(etat.profil.objectif)
  const [plan, setPlan] = useState(etat.profil.planJeune)

  const nombre = (texte: string) => Number(texte.replace(',', '.'))
  const planChoisi = PLANS.find((p) => p.id === plan) ?? PLANS[2]

  /* L'aperçu du récapitulatif : on simule l'état final pour montrer le
     vrai objectif de calories avant de valider. */
  const apercu: Etat = {
    ...etat,
    profil: {
      ...etat.profil,
      sexe,
      age: nombre(age) || null,
      tailleCm: nombre(taille) || null,
      niveau,
      objectif,
    },
    pesees: [{ jour: 'apercu', poids: nombre(poids) || 70 }],
  }
  const kcal = objectifCalories(apercu)

  function terminer() {
    reglerLe({
      prenom: prenom.trim(),
      sexe,
      age: nombre(age) || null,
      tailleCm: nombre(taille) || null,
      poidsBut: nombre(poidsBut) || null,
      niveau,
      objectif,
      planJeune: planChoisi.id,
      objectifJeuneHeures: planChoisi.jeune,
    })
    if (nombre(poids) > 0) noterPoids(Math.round(nombre(poids) * 10) / 10)
    demarrer()
  }

  return (
    <div className="page" style={{ paddingTop: 36 }}>
      {etape === 0 && (
        <>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🌅</div>
          <h1 style={{ fontSize: 30, lineHeight: 1.15, marginBottom: 8 }}>
            Mahana
            <br />
            <span style={{ color: 'var(--argile-fonce)' }}>votre parcours</span>
          </h1>
          <p className="doux" style={{ marginTop: 0, marginBottom: 24 }}>
            Le jeûne, les repas, le sport, les pas, le sommeil et un défi par semaine — dans une
            seule app. Tout reste dans ce téléphone : pas de compte, rien qui part sur internet.
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
          <div style={{ height: 20 }} />
          <Suivant retour={etape > 0 ? () => setEtape(etape - 1) : undefined} action={() => setEtape(1)} />
        </>
      )}

      {etape === 1 && (
        <>
          <div className="kicker">Étape 2 sur 5</div>
          <h1 style={{ fontSize: 25, margin: '6px 0 6px' }}>Un peu de vous</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Ces trois chiffres servent uniquement à calculer ce que votre corps dépense dans une
            journée. Ils ne sortent pas d'ici.
          </p>
          <div style={{ height: 12 }} />
          <label className="etiquette">Je suis</label>
          <div className="grille2" style={{ marginBottom: 14 }}>
            {(['F', 'H'] as Sexe[]).map((valeur) => (
              <button
                key={valeur}
                type="button"
                className={`choix${sexe === valeur ? ' actif' : ''}`}
                onClick={() => setSexe(valeur)}
              >
                <b>{valeur === 'F' ? 'Une femme' : 'Un homme'}</b>
              </button>
            ))}
          </div>
          <div className="grille2">
            <div>
              <label className="etiquette" htmlFor="age">
                Âge
              </label>
              <input
                id="age"
                className="champ"
                inputMode="numeric"
                placeholder="38"
                value={age}
                onChange={(e) => setAge(e.target.value)}
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
                placeholder="165"
                value={taille}
                onChange={(e) => setTaille(e.target.value)}
              />
            </div>
          </div>
          <div style={{ height: 20 }} />
          <Suivant retour={() => setEtape(etape - 1)} actif={nombre(age) > 0 && nombre(taille) > 0} action={() => setEtape(2)} />
        </>
      )}

      {etape === 2 && (
        <>
          <div className="kicker">Étape 3 sur 5</div>
          <h1 style={{ fontSize: 25, margin: '6px 0 6px' }}>Où vous en êtes</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Le poids d'aujourd'hui devient votre point de départ. La courbe partira de là.
          </p>
          <div style={{ height: 12 }} />
          <div className="grille2">
            <div>
              <label className="etiquette" htmlFor="poids">
                Poids aujourd'hui
              </label>
              <input
                id="poids"
                className="champ"
                inputMode="decimal"
                placeholder="72,5"
                value={poids}
                onChange={(e) => setPoids(e.target.value)}
              />
            </div>
            <div>
              <label className="etiquette" htmlFor="but">
                Poids visé
              </label>
              <input
                id="but"
                className="champ"
                inputMode="decimal"
                placeholder="65"
                value={poidsBut}
                onChange={(e) => setPoidsBut(e.target.value)}
              />
            </div>
          </div>
          <div style={{ height: 16 }} />
          <label className="etiquette">À quel rythme ?</label>
          <div style={{ display: 'grid', gap: 10 }}>
            {OBJECTIFS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`choix${objectif === o.id ? ' actif' : ''}`}
                onClick={() => setObjectif(o.id)}
              >
                <b>{o.nom}</b>
                <span>{o.detail}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 20 }} />
          <Suivant retour={() => setEtape(etape - 1)} actif={nombre(poids) > 0} action={() => setEtape(3)} />
        </>
      )}

      {etape === 3 && (
        <>
          <div className="kicker">Étape 4 sur 5</div>
          <h1 style={{ fontSize: 25, margin: '6px 0 6px' }}>Vos journées</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Hors sport : ce que vous bougez en travaillant et en vivant. Le sport noté dans l'app
            s'ajoute par-dessus.
          </p>
          <div style={{ display: 'grid', gap: 10, margin: '14px 0 0' }}>
            {NIVEAUX.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`choix${niveau === n.id ? ' actif' : ''}`}
                onClick={() => setNiveau(n.id)}
              >
                <b>{n.nom}</b>
                <span>{n.detail}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 20 }} />
          <Suivant retour={etape > 0 ? () => setEtape(etape - 1) : undefined} action={() => setEtape(4)} />
        </>
      )}

      {etape === 4 && (
        <>
          <div className="kicker">Étape 5 sur 5</div>
          <h1 style={{ fontSize: 25, margin: '6px 0 6px' }}>Votre rythme de jeûne</h1>
          <p className="doux" style={{ marginTop: 0 }}>
            Le premier chiffre, ce sont les heures sans manger. Le second, la fenêtre pendant
            laquelle on mange. En cas de doute : 16 : 8.
          </p>
          <div className="grille2" style={{ margin: '14px 0 18px' }}>
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

          <div className="carte" style={{ background: 'var(--olive-pale)' }}>
            <div className="kicker">Votre objectif du jour</div>
            <div className="rangee" style={{ marginTop: 6 }}>
              <div>
                <span className="chiffre" style={{ fontSize: 32 }}>
                  {kcal ?? '—'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--doux)' }}> kcal</span>
              </div>
              <span className="pilule menthe">{planChoisi.nom}</span>
            </div>
            <p className="doux mini" style={{ margin: '8px 0 0' }}>
              Calculé sur votre profil. Modifiable à tout moment, et recalculé à chaque pesée.
            </p>
          </div>

          {/* Le choix de l'habillage se fait tout de suite : c'est la première
              chose qu'on voit de l'app, autant que ce soit la bonne. */}
          <div className="carte">
            <div className="kicker">Et l'allure de l'app</div>
            <p className="doux mini" style={{ margin: '6px 0 0' }}>
              Ça se change quand vous voulez, dans les réglages.
            </p>
            <ChoixTheme />
          </div>

          <button type="button" className="bouton" onClick={terminer}>
            C'est parti
          </button>
          <div style={{ height: 10 }} />
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%' }}
            onClick={() => setEtape(3)}
          >
            Retour
          </button>
        </>
      )}
    </div>
  )
}

/** Le pied de page des étapes : continuer, et revenir en arrière. */
function Suivant({
  actif = true,
  action,
  retour,
}: {
  actif?: boolean
  action: () => void
  retour?: () => void
}) {
  return (
    <>
      <button type="button" className="bouton" disabled={!actif} onClick={action}>
        Continuer
      </button>
      {retour && (
        <>
          <div style={{ height: 10 }} />
          <button type="button" className="bouton-fin" style={{ width: '100%' }} onClick={retour}>
            Retour
          </button>
        </>
      )}
    </>
  )
}
