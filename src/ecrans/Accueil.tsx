/* L'écran d'accueil : la journée entière, carte par carte, et chaque geste
   à une touche. C'est l'écran qu'on ouvre vingt fois par jour — il doit
   répondre sans qu'on ait à chercher. */

import JaugeDemi from '../composants/JaugeDemi'
import Symbole from '../composants/Symbole'
import type { NomSymbole } from '../composants/Symbole'
import { IconeFleche } from '../composants/Icones'
import type { Onglet } from '../composants/BarreOnglets'
import { clefJour, duree, heuresMinutes, initialeJour, jourCourt, septDerniersJours } from '../lib/dates'
import { defiParId, joursTenus, jourValide } from '../lib/defis'
import { totauxDuJour, useApp, useHorloge } from '../lib/etat'
import { nombreFr } from '../lib/formats'
import { habitudeParId, jourNumeroHabitude } from '../lib/habitudes'
import { dureeMs, jeuneEnCours, serie } from '../lib/jeune'
import { prochaineLecon } from '../lib/lecons'
import type { Vue } from '../lib/navigation'
import { delaiEnMots, projection } from '../lib/objectif'
import { objectifCalories, objectifMacros } from '../lib/profil'
import { couleurDuMoment, ideeDuJour } from '../lib/recettes'
import { scoreDuJour } from '../lib/score'
import type { MomentRepas } from '../lib/stockage'

const REPAS: Array<{
  id: MomentRepas
  nom: string
  icone: NomSymbole
  fond: string
  couleur: string
}> = [
  { id: 'petit-dejeuner', nom: 'Petit-déjeuner', icone: 'petit-dejeuner', fond: 'var(--miel-pale)', couleur: 'var(--miel)' },
  { id: 'dejeuner', nom: 'Déjeuner', icone: 'dejeuner', fond: 'var(--olive-pale)', couleur: 'var(--olive)' },
  { id: 'diner', nom: 'Dîner', icone: 'diner', fond: 'var(--canard-pale)', couleur: 'var(--canard)' },
  { id: 'encas', nom: 'En-cas', icone: 'encas', fond: 'var(--argile-pale)', couleur: 'var(--argile)' },
]

export default function Accueil({
  ouvrir,
  allerA,
}: {
  ouvrir: (vue: Vue) => void
  allerA: (onglet: Onglet) => void
}) {
  const { etat, ajouterVerres, cocherJour, cocherHabitude } = useApp()
  const objectifPoids = projection(etat)
  const maintenant = useHorloge()
  const aujourdhui = clefJour()
  const totaux = totauxDuJour(etat, aujourdhui)
  const but = objectifCalories(etat)
  const macros = but ? objectifMacros(but) : null
  const enCours = jeuneEnCours(etat)
  const jours = serie(etat)
  const score = scoreDuJour(etat, aujourdhui)
  const defi = etat.defiEnCours ? defiParId(etat.defiEnCours.defiId) : null
  const habitude = etat.habitudeEnCours ? habitudeParId(etat.habitudeEnCours.habitudeId) : null
  // L'idée du jour : ses propres recettes d'abord, et un dîner en fin
  // d'après-midi — c'est là qu'on se demande quoi préparer.
  const idee = ideeDuJour(etat, aujourdhui, new Date().getHours())
  const recette = idee.recette
  const lecon = prochaineLecon(etat.leconsLues)
  const nuit = etat.nuits.find((n) => n.jour === aujourdhui)

  const bonus = etat.profil.ajouterKcalBrulees ? totaux.kcalBrulees : 0
  const restantes = but ? but - totaux.kcalMangees + bonus : null

  const semaine = septDerniersJours().map(({ date, clef }) => ({
    date,
    clef,
    minutes: etat.seances.filter((s) => s.jour === clef).reduce((t, s) => t + s.minutes, 0),
  }))

  const prenom = etat.profil.prenom
  const heure = new Date(maintenant).getHours()
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="page">
      {/* le bandeau du haut : profil, calories brûlées, score */}
      <header className="entete">
        <button
          type="button"
          onClick={() => ouvrir({ nom: 'moi' })}
          aria-label="Mon profil"
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            border: '2px solid var(--argile)',
            background: 'var(--creme)',
            color: 'var(--argile)',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <Symbole nom="soleil" taille={24} epaisseur={1.8} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bonjour">{salut}</div>
          <h1 style={{ fontSize: 20 }}>{prenom || 'Votre journée'}</h1>
        </div>
        <span className="pilule corail">
          <Symbole nom="flamme" taille={14} /> {totaux.kcalBrulees}
        </span>
        <button
          type="button"
          className="pilule menthe"
          style={{ border: 0 }}
          onClick={() => allerA('progres')}
        >
          <Symbole nom="score" taille={14} /> {score.total}
        </button>
      </header>

      {/* les calories du jour */}
      <div className="carte">
        <div className="rangee" style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Symbole nom="flamme" taille={19} couleur="var(--argile)" /> Calories
          </h2>
          <button type="button" className="pilule" onClick={() => allerA('repas')}>
            Détail
          </button>
        </div>

        <JaugeDemi
          part={but ? totaux.kcalMangees / but : 0}
          centre={restantes !== null ? String(Math.max(0, restantes)) : '—'}
          legendeCentre="kcal restantes"
          gauche={String(totaux.kcalMangees)}
          legendeGauche="Consommé"
          droite={String(totaux.kcalBrulees)}
          legendeDroite="Brûlé"
        />

        {macros && (
          <div className="grille3" style={{ marginTop: 10 }}>
            <Macro nom="Glucides" valeur={totaux.glucides} but={macros.glucides} couleur="var(--miel)" />
            <Macro nom="Protéines" valeur={totaux.proteines} but={macros.proteines} couleur="var(--olive)" />
            <Macro nom="Lipides" valeur={totaux.lipides} but={macros.lipides} couleur="var(--argile)" />
          </div>
        )}

        <div className="grille2" style={{ marginTop: 14 }}>
          {REPAS.map((repas) => (
            <button
              key={repas.id}
              type="button"
              className="tuile"
              style={{ boxShadow: 'none', background: repas.fond, padding: '10px 12px' }}
              onClick={() => ouvrir({ nom: 'ajout', moment: repas.id })}
            >
              <Symbole nom={repas.icone} taille={18} couleur={repas.couleur} />
              <span style={{ flex: 1, fontSize: 13 }}>{repas.nom}</span>
              <span style={{ fontWeight: 600, color: repas.couleur }}>+</span>
            </button>
          ))}
        </div>
      </div>

      {/* eau et pas, côte à côte */}
      <div className="grille2">
        <div className="carte" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Symbole nom="eau" taille={17} couleur="var(--canard)" /> Eau
          </h2>
          <div className="chiffre" style={{ fontSize: 26, marginTop: 6 }}>
            {totaux.verres}
            <span className="doux" style={{ fontSize: 14, fontWeight: 700 }}>
              {' '}
              / {etat.profil.butEau}
            </span>
          </div>
          <div className="doux mini" style={{ marginBottom: 10 }}>
            {totaux.verres >= etat.profil.butEau
              ? 'Objectif atteint 🎉'
              : `${(totaux.verres * etat.profil.verreMl).toLocaleString('fr-FR')} ml bus`}
          </div>
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%' }}
            onClick={() => ajouterVerres(1)}
          >
            + Un verre
          </button>
        </div>

        <div className="carte" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Symbole nom="pas" taille={17} couleur="var(--miel)" /> Pas
          </h2>
          <div className="chiffre" style={{ fontSize: 26, marginTop: 6 }}>
            {totaux.pas.toLocaleString('fr-FR')}
          </div>
          <div className="doux mini" style={{ marginBottom: 10 }}>
            {totaux.pas >= etat.profil.butPas
              ? 'Objectif atteint 🎉'
              : `sur ${etat.profil.butPas.toLocaleString('fr-FR')}`}
          </div>
          <button
            type="button"
            className="bouton-fin"
            style={{ width: '100%' }}
            onClick={() => ouvrir({ nom: 'activite' })}
          >
            Noter mes pas
          </button>
        </div>
      </div>

      {/* le jeûne */}
      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left', marginTop: 14 }}
        onClick={() => allerA('jeune')}
      >
        <div className="rangee">
          <div>
            <div className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Symbole nom="jeune" taille={13} /> Minuteur de jeûne
            </div>
            {enCours ? (
              <>
                <div className="chiffre" style={{ fontSize: 25 }}>
                  {duree(dureeMs(enCours, maintenant))}
                </div>
                <div className="doux mini">sur {enCours.objectifHeures} h visées</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  Prochain jeûne à {etat.profil.heureJeune}
                </div>
                <div className="doux mini">Toucher pour démarrer ou décaler</div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {jours > 0 && (
              <span className="pilule corail">
                <Symbole nom="flamme" taille={13} /> {jours} j
              </span>
            )}
            <IconeFleche />
          </div>
        </div>
      </button>

      {/* l'objectif de poids : la question qu'on se pose chaque matin */}
      {(objectifPoids.situation === 'en-route' || objectifPoids.situation === 'stagne' || objectifPoids.situation === 'atteint') && (
        <button
          type="button"
          className="carte"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => ouvrir({ nom: 'corps' })}
        >
          <div className="rangee">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Symbole nom="poids" taille={13} /> Objectif de poids
              </div>
              {objectifPoids.situation === 'atteint' ? (
                <div style={{ fontSize: 17, fontWeight: 700 }}>Vous y êtes 🎉</div>
              ) : (
                <>
                  <div className="chiffre" style={{ fontSize: 25 }}>
                    {nombreFr(objectifPoids.reste, 1)}
                    <span className="doux" style={{ fontSize: 14, fontWeight: 500 }}> kg à perdre</span>
                  </div>
                  <div className="doux mini">
                    {objectifPoids.situation === 'stagne'
                      ? 'Le poids ne descend pas en ce moment'
                      : objectifPoids.tropLoin
                        ? 'Plus de trois ans à ce rythme'
                        : `${delaiEnMots(objectifPoids.jours ?? 0)}, vers le ${jourCourt(objectifPoids.date as Date)}`}
                  </div>
                </>
              )}
              {objectifPoids.part !== null && objectifPoids.situation !== 'atteint' && (
                <div className="barre" style={{ height: 5, marginTop: 8 }}>
                  <i style={{ width: `${Math.round(objectifPoids.part * 100)}%`, background: 'var(--argile)' }} />
                </div>
              )}
            </div>
            <IconeFleche />
          </div>
        </button>
      )}

      {/* le défi de la semaine */}
      {etat.defiEnCours && defi ? (
        <div className="carte">
          <div className="rangee">
            <div style={{ minWidth: 0 }}>
              <div className="kicker">Défi de la semaine</div>
              <div style={{ fontWeight: 700 }}>
                {defi.emoji} {defi.nom}
              </div>
              <div className="doux mini">{joursTenus(etat)} jours tenus sur 7</div>
            </div>
            <button
              type="button"
              className={jourValide(etat, aujourdhui) ? 'bouton-fin' : 'bouton'}
              style={{ width: 'auto', padding: '10px 16px', flex: '0 0 auto' }}
              onClick={() => cocherJour(aujourdhui)}
            >
              {jourValide(etat, aujourdhui) ? '✅' : 'Cocher'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="carte"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => ouvrir({ nom: 'defis' })}
        >
          <div className="rangee">
            <div>
              <div className="kicker">Défis</div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Symbole nom="defi" taille={17} couleur="var(--argile)" /> Choisir un défi pour la semaine
              </div>
              <div className="doux mini">Une règle simple, sept jours</div>
            </div>
            <IconeFleche />
          </div>
        </button>
      )}

      {/* l'habitude en cours */}
      {etat.habitudeEnCours && habitude && (
        <div className="carte">
          <div className="rangee">
            <div style={{ minWidth: 0 }}>
              <div className="kicker">Habitude · jour {jourNumeroHabitude(etat.habitudeEnCours.debut)} sur 21</div>
              <div style={{ fontWeight: 700 }}>
                {habitude.emoji} {habitude.nom}
              </div>
            </div>
            <button
              type="button"
              className={
                etat.habitudeEnCours.coches.includes(aujourdhui) ? 'bouton-fin' : 'bouton'
              }
              style={{ width: 'auto', padding: '10px 16px', flex: '0 0 auto' }}
              onClick={() => cocherHabitude(aujourdhui)}
            >
              {etat.habitudeEnCours.coches.includes(aujourdhui) ? '✅' : 'Cocher'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {Array.from({ length: 21 }, (_, i) => i).map((i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background:
                    i < etat.habitudeEnCours!.coches.length ? habitude.couleur : 'var(--piste)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* l'entraînement */}
      <div className="carte">
        <div className="rangee" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Symbole nom="sport" taille={13} /> Entraînement
            </div>
            <div className="chiffre" style={{ fontSize: 26 }}>
              {totaux.minutesSport} min
            </div>
            <div className="doux mini">aujourd'hui · 30 min conseillées</div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {semaine.map(({ date, clef, minutes }) => (
              <div key={clef} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 16,
                    height: 34,
                    borderRadius: 6,
                    background: minutes ? 'var(--degrade-argile)' : 'var(--piste)',
                  }}
                />
                <div style={{ fontSize: 9, marginTop: 3, color: 'var(--estompe)', fontWeight: 700 }}>
                  {initialeJour(date)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="bouton-fin"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => ouvrir({ nom: 'sport' })}
        >
          + Commencer une séance
        </button>
      </div>

      {/* sommeil et score */}
      <div className="grille2">
        <button
          type="button"
          className="carte"
          style={{ marginBottom: 0, border: 0, textAlign: 'left' }}
          onClick={() => ouvrir({ nom: 'activite' })}
        >
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Symbole nom="sommeil" taille={17} couleur="var(--sauge)" /> Sommeil
          </h2>
          {nuit ? (
            <>
              <div className="chiffre" style={{ fontSize: 22, marginTop: 6 }}>
                {heuresMinutes(nuit.minutes)}
              </div>
              <div className="doux mini">
                {nuit.coucher} → {nuit.lever}
              </div>
            </>
          ) : (
            <p className="doux mini" style={{ margin: '8px 0 0' }}>
              Rien de noté — bien dormi cette nuit ?
            </p>
          )}
        </button>

        <button
          type="button"
          className="carte"
          style={{ marginBottom: 0, border: 0, textAlign: 'left' }}
          onClick={() => allerA('progres')}
        >
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Symbole nom="score" taille={17} couleur="var(--argile)" /> Score
          </h2>
          <div className="chiffre" style={{ fontSize: 22, marginTop: 6 }}>
            {score.total}
            <span className="doux" style={{ fontSize: 13, fontWeight: 700 }}> / 100</span>
          </div>
          <div className="doux mini">
            {score.parties.filter((p) => !p.restant).length} objectifs sur 6
          </div>
        </button>
      </div>

      {/* la recette du jour */}
      <button
        type="button"
        className="carte"
        style={{ width: '100%', border: 0, textAlign: 'left', marginTop: 14 }}
        onClick={() =>
          ouvrir(idee.mienne ? { nom: 'ma-recette', id: recette.id } : { nom: 'recette', id: recette.id })
        }
      >
        <div className="rangee">
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: idee.mienne ? couleurDuMoment(idee.recette.moment) : idee.recette.couleur,
              display: 'grid',
              placeItems: 'center',
              fontSize: 25,
              flex: '0 0 auto',
            }}
          >
            {recette.emoji}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kicker">{idee.mienne ? 'Ma recette du jour' : 'Recette du jour'}</div>
            <div style={{ fontWeight: 700 }}>{recette.nom}</div>
            <div className="doux mini">
              {recette.kcal} kcal · {recette.minutes} min
            </div>
          </div>
          <IconeFleche />
        </div>
      </button>

      {/* la leçon suivante */}
      {lecon && (
        <button
          type="button"
          className="carte"
          style={{ width: '100%', border: 0, textAlign: 'left' }}
          onClick={() => ouvrir({ nom: 'lecon', id: lecon.id })}
        >
          <div className="rangee">
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'var(--olive-pale)',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
              }}
            >
              <Symbole nom="lecon" taille={24} couleur="var(--olive)" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="kicker">Comprendre · {lecon.minutes} min</div>
              <div style={{ fontWeight: 700 }}>{lecon.titre}</div>
              <div className="doux mini">{lecon.chapo}</div>
            </div>
            <IconeFleche />
          </div>
        </button>
      )}
    </div>
  )
}

function Macro({
  nom,
  valeur,
  but,
  couleur,
}: {
  nom: string
  valeur: number
  but: number
  couleur: string
}) {
  return (
    <div>
      <div className="doux mini" style={{ fontWeight: 700 }}>
        {nom}
      </div>
      <div className="chiffre" style={{ fontSize: 15 }}>
        {valeur}
        <span className="doux" style={{ fontSize: 11, fontWeight: 600 }}> / {but} g</span>
      </div>
      <div className="barre" style={{ height: 5, marginTop: 4 }}>
        <i style={{ width: `${Math.min(100, (valeur / but) * 100)}%`, background: couleur }} />
      </div>
    </div>
  )
}
