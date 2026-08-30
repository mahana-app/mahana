/* « Moi » : où en est le corps, et la porte d'entrée vers les suivis qui ne
   méritent pas un onglet à eux — le poids, le jeûne, l'eau, les pas. */

import { useState } from 'react'
import Entete from '../composants/Entete'
import { IconeFleche, IconePartage } from '../composants/Icones'
import Symbole from '../composants/Symbole'
import type { NomSymbole } from '../composants/Symbole'
import { useApp } from '../lib/etat'
import { bilan, serie, serieLaPlusLongue } from '../lib/jeune'
import type { Vue } from '../lib/navigation'
import { imc, lectureImc, objectifCalories, poidsActuel } from '../lib/profil'
import { nombreFr } from '../lib/formats'

export default function Moi({ ouvrir, fermer }: { ouvrir: (vue: Vue) => void; fermer: () => void }) {
  const { etat } = useApp()
  const [copie, setCopie] = useState(false)
  const profil = etat.profil
  const poids = poidsActuel(etat)
  const depart = etat.pesees[0]?.poids ?? null
  const ecart = poids !== null && depart !== null ? poids - depart : null
  const valeurImc = poids !== null && profil.tailleCm ? imc(poids, profil.tailleCm) : null
  const kcal = objectifCalories(etat)
  const chiffres = bilan(etat)
  const defisReussis = etat.defisFinis.filter((d) => d.reussis === 7).length

  async function partager() {
    const lien = window.location.origin
    const texte = `Je suis sur Mahana pour le jeûne, les repas et le sport. Rejoins-moi : ${lien}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mahana', text: texte, url: lien })
        return
      }
      await navigator.clipboard.writeText(lien)
      setCopie(true)
      setTimeout(() => setCopie(false), 2500)
    } catch {
      /* partage annulé : rien à faire */
    }
  }

  return (
    <div className="page">
      <Entete
        kicker={profil.prenom || 'Mon suivi'}
        titre="Moi"
        retour={fermer}
        ouvrirReglages={() => ouvrir({ nom: 'reglages' })}
      />

      <div className="carte">
        <div className="rangee" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="kicker">Poids</div>
            <div>
              <span className="chiffre" style={{ fontSize: 36 }}>
                {poids !== null ? poids.toLocaleString('fr-FR', { minimumFractionDigits: 1 }) : '—'}
              </span>
              <span className="doux" style={{ fontWeight: 700 }}> kg</span>
            </div>
          </div>
          {ecart !== null && etat.pesees.length > 1 && (
            <div style={{ textAlign: 'right' }}>
              <div
                className="chiffre"
                style={{ fontSize: 19, color: ecart <= 0 ? 'var(--argile-fonce)' : 'var(--miel)' }}
              >
                {ecart > 0 ? '+' : ''}
                {nombreFr(ecart, 1)} kg
              </div>
              <div className="doux mini">depuis le début</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {profil.poidsBut !== null && poids !== null && (
            <span className="pilule menthe">
              {nombreFr(Math.abs(poids - profil.poidsBut), 1)} kg
              {poids > profil.poidsBut ? ' avant l’objectif' : ' sous l’objectif'}
            </span>
          )}
          {valeurImc !== null && (
            <span className="pilule">
              IMC {nombreFr(valeurImc, 1)} · {lectureImc(valeurImc)}
            </span>
          )}
          {kcal !== null && <span className="pilule ambre">{kcal} kcal par jour</span>}
        </div>
      </div>

      <div className="grille2">
        <Lien icone="poids" fond="var(--miel-pale)" couleur="var(--miel)" nom="Mon poids" onClick={() => ouvrir({ nom: 'corps' })} />
        <Lien icone="sport" fond="var(--canard-pale)" couleur="var(--canard)" nom="Mes séances" onClick={() => ouvrir({ nom: 'sport' })} />
        <Lien icone="eau" fond="var(--canard-pale)" couleur="var(--canard)" nom="Mon eau" onClick={() => ouvrir({ nom: 'eau' })} />
        <Lien icone="pas" fond="var(--olive-pale)" couleur="var(--olive)" nom="Pas et sommeil" onClick={() => ouvrir({ nom: 'activite' })} />
        <Lien icone="defi" fond="var(--argile-pale)" couleur="var(--argile)" nom="Défis et habitudes" onClick={() => ouvrir({ nom: 'defis' })} />
        <Lien icone="recette" fond="var(--miel-pale)" couleur="var(--miel)" nom="Les recettes" onClick={() => ouvrir({ nom: 'recettes' })} />
        <Lien icone="lecon" fond="var(--olive-pale)" couleur="var(--olive)" nom="Les leçons" onClick={() => ouvrir({ nom: 'lecons' })} />
        <Lien icone="renouveau" fond="var(--piste)" couleur="var(--doux)" nom="Réglages" onClick={() => ouvrir({ nom: 'reglages' })} />
      </div>

      <div className="titre-section">Depuis le début</div>
      <div className="carte">
        <div className="ligne-liste">
          <span className="doux">Série de jeûne en cours</span>
          <span className="chiffre">{serie(etat)} j</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Meilleure série</span>
          <span className="chiffre">{serieLaPlusLongue(etat)} j</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Jeûnes terminés</span>
          <span className="chiffre">{chiffres.termines}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Séances de sport</span>
          <span className="chiffre">{etat.seances.length}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Défis tenus jusqu'au bout</span>
          <span className="chiffre">{defisReussis}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Repas notés</span>
          <span className="chiffre">{etat.repas.length}</span>
        </div>
        <div className="ligne-liste">
          <span className="doux">Leçons lues</span>
          <span className="chiffre">{etat.leconsLues.length}</span>
        </div>
      </div>

      <button type="button" className="bouton" onClick={partager}>
        <IconePartage /> {copie ? 'Lien copié ✓' : "Partager l'app"}
      </button>
      <p className="doux mini" style={{ textAlign: 'center', margin: '10px 4px 0' }}>
        Chacune installe Mahana de son côté et garde son suivi chez elle : rien n'est partagé
        entre vos téléphones.
      </p>
    </div>
  )
}

function Lien({
  icone,
  fond,
  couleur,
  nom,
  onClick,
}: {
  icone: NomSymbole
  fond: string
  couleur: string
  nom: string
  onClick: () => void
}) {
  return (
    <button type="button" className="tuile" onClick={onClick}>
      <span className="rond" style={{ background: fond, color: couleur }}>
        <Symbole nom={icone} taille={19} />
      </span>
      <span style={{ flex: 1 }}>{nom}</span>
      <IconeFleche taille={16} />
    </button>
  )
}
