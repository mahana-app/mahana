# Mahana

Une application de perte de poids, complète et personnelle : le jeûne
intermittent, les repas et les calories, le sport, les pas, le sommeil, et un
défi par semaine. Tout dans un seul endroit, sur le téléphone.

Application indépendante : son propre dépôt, sa propre mise en ligne, aucune
base de données. Elle ne partage rien avec quoi que ce soit d'autre.

## Les cinq onglets

| Onglet | Ce qu'on y fait |
|---|---|
| **Accueil** | La journée en trois anneaux — calories, sport, pas —, ce qu'il reste à manger, le jeûne en cours, le défi de la semaine, le sport des sept derniers jours, et quatre gestes rapides. |
| **Sport** | Trois programmes (**cardio**, **pilates**, **musculation**), douze séances guidées exercice par exercice avec minuteur de série et de repos. Plus les **sorties dehors** suivies au GPS : distance, allure, calories. |
| **Repas** | Objectif de calories calculé sur le profil, répartition glucides / protéines / lipides, journal des quatre repas, base d'aliments — y compris les plats d'ici (uru, taro, fafa, poisson cru, chao men, firi firi…) — et saisie libre pour le reste. |
| **Défis** | Un défi par semaine, sept jours à cocher : sans sucre, sans féculents le soir, au lit avant 21 h, 10 000 pas, 2 litres d'eau… Certains se cochent tout seuls, avec ce que l'app sait déjà. Palmarès à la clé. |
| **Moi** | Le poids et sa courbe, l'IMC, le jeûne, l'eau, les pas et le sommeil, les totaux depuis le début, et le bouton pour partager l'app. |

## Comment les calories sont calculées

Formule de **Mifflin-St Jeor** : le métabolisme de base à partir du sexe, de
l'âge, de la taille et du poids ; multiplié par le niveau d'activité de la
journée ; moins le déficit choisi (250 g ou 500 g par semaine). Un plancher
empêche de descendre trop bas — 1 200 kcal chez la femme, 1 500 chez l'homme.

Les calories du sport viennent du **MET** de chaque séance (son coût
énergétique) multiplié par le poids et la durée. Pour les sorties dehors,
c'est la distance qui compte.

Tout cela reste une **estimation**. Le vrai juge, c'est la courbe de poids sur
trois semaines.

## Où sont les données

**Dans le téléphone, nulle part ailleurs.** Pas de compte, pas de serveur, pas
de base de données : tout est rangé dans le `localStorage` du navigateur, sous
la clé `mahana.v1`.

Vider les données du navigateur ou changer de téléphone efface le suivi. D'où
le bouton **« Exporter mes données »** dans les réglages, qui enregistre un
fichier `mahana-2026-08-30.json` — et « Importer une sauvegarde » pour le
relire ailleurs.

**Partager l'app**, c'est partager l'adresse : chacune l'installe de son côté
et garde son suivi chez elle. Rien ne circule entre les téléphones.

## Ce que l'app ne peut pas faire

**Compter les pas toute seule.** Aucun site web n'a le droit de lire le
podomètre en arrière-plan — c'est réservé aux applications installées depuis un
magasin. On note donc le chiffre relevé sur *Santé* (iPhone) ou *Google Fit*
(Android), et l'app s'en sert pour le reste.

**Suivre une sortie écran éteint.** Le GPS s'arrête quand le téléphone se
verrouille. L'app demande la permission de garder l'écran allumé pendant
l'effort, quand le navigateur l'autorise.

## Travailler dessus

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build — doit passer avant de pousser
npm run lint     # oxlint
npm run icones   # refabrique les icônes PNG (seulement si le logo change)
```

`noUnusedLocals` est actif : un import qui traîne fait échouer le build.

## Les fichiers

```
index.html                 titre, polices, couleur de la barre du téléphone
outils/icones.mjs          fabrique les PNG de l'icône, sans dépendance
public/                    icônes, manifeste PWA, service worker (hors ligne)
src/
  theme.css                toutes les couleurs et tous les styles
  App.tsx                  l'aiguillage entre les onglets et les écrans
  lib/
    stockage.ts            ce qui est retenu, et comment c'est rangé
    etat.tsx               l'état partagé, les actions, l'horloge
    profil.ts              métabolisme, dépense, objectif de calories, IMC
    aliments.ts            la base d'aliments et la recherche
    sport.ts               programmes, séances, exercices, calories
    defis.ts               les défis de la semaine et leur vérification
    gps.ts                 le suivi d'une sortie (haversine, filtrage)
    jeune.ts               rythmes, étapes du corps, séries
    dates.ts               formats de date et de durée
  composants/              anneaux, en-tête, barre du bas, icônes
  ecrans/                  Bienvenue, Accueil, Sport, Séance, Sortie, Repas,
                           AjoutAliment, Défis, Moi, Jeûne, Corps, Eau,
                           Activité, Réglages
```

## La mise en ligne

Le dépôt est relié à **Netlify** : chaque poussée sur `main` remet le site à
jour tout seul (construction `npm run build`, dossier `dist`). Rien à régler,
il n'y a pas de variable d'environnement.

## Avertissement

Les calories, les étapes du jeûne et les dépenses affichées sont des repères,
pas des mesures. Le jeûne et les régimes restrictifs sont déconseillés en cas
de grossesse, d'allaitement, de diabète, de troubles alimentaires ou de
traitement en cours.
