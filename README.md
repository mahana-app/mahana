# Mahana

Une application complète de perte de poids : le jeûne intermittent, les repas
et les calories, le sport, les pas, le sommeil, un score quotidien, des défis
d'une semaine, des habitudes de trois semaines, des recettes et des leçons.
Tout dans un seul endroit, sur le téléphone.

Application indépendante : son propre dépôt, sa propre mise en ligne, aucune
base de données. Elle ne partage rien avec quoi que ce soit d'autre.

## Les quatre onglets, et le bouton +

| | |
|---|---|
| **Accueil** | La journée entière : la jauge des calories avec les quatre repas à une touche, l'eau, les pas, le minuteur de jeûne, le défi de la semaine, l'habitude en cours, l'entraînement, le sommeil, le score, la recette du jour et la leçon suivante. |
| **Repas** | Le bandeau de la semaine, la jauge *consommé · restantes · brûlé*, les macros, et les quatre repas avec **l'objectif de calories réparti** entre eux. Plus l'accès aux recettes. |
| **Jeûne** | Le plan (12:12 → 23:1), le **jeûne programmé à une heure**, l'anneau avec les étapes du corps posées tout autour, la correction de l'heure de début, l'**ajout d'un jeûne oublié**, l'historique et les recettes pour rompre le jeûne. |
| **Progrès** | Le **score du jour sur 100** et ce qu'il reste à faire pour le remplir, la série, l'**IMC sur sa règle colorée**, puis le poids, les calories, les heures de jeûne, les pas et le sport — par **semaine, mois ou année**. |
| **Le bouton +** | Au centre de la barre : noter un repas, boire un verre, démarrer ou terminer le jeûne, lancer une séance, sortir marcher, noter son poids, ses pas ou sa nuit. |

Le reste s'ouvre depuis l'accueil ou depuis « Moi » (l'avatar en haut à
gauche) : les **séances de sport**, les **défis et habitudes**, les
**recettes**, les **leçons**, l'eau, le poids, les pas et le sommeil, et les
réglages.

## Le sport

Trois programmes — **cardio**, **pilates**, **musculation** — et douze séances
guidées, exercice par exercice, avec minuteur de série et de repos, la consigne
de chaque mouvement et les calories estimées.

Et les **sorties dehors** suivies au GPS : marche, course, vélo, randonnée,
avec distance, allure et calories en direct.

## Le score du jour

Une note sur 100, composée de six ingrédients : le jeûne (20), l'alimentation
(20), l'eau (15), les pas (15), le sommeil (15) et l'entraînement (15). L'écran
Progrès dit toujours **ce qu'il reste à faire** pour aller chercher les points
manquants — un chiffre qui ne dit pas quoi faire ne sert à rien.

## Comment les calories sont calculées

Formule de **Mifflin-St Jeor** : le métabolisme de base à partir du sexe, de
l'âge, de la taille et du poids ; multiplié par le niveau d'activité ; moins le
déficit choisi. Un plancher empêche de descendre trop bas — 1 200 kcal chez la
femme, 1 500 chez l'homme.

Les calories du sport viennent du **MET** de chaque séance multiplié par le
poids et la durée ; pour les sorties, c'est la distance qui compte.

Tout cela reste une **estimation**. Le vrai juge, c'est la courbe de poids sur
trois semaines.

## Où sont les données

**Dans le téléphone, nulle part ailleurs.** Pas de compte, pas de serveur, pas
de base de données : tout est rangé dans le `localStorage` du navigateur, sous
la clé `mahana.v1`.

Vider les données du navigateur ou changer de téléphone efface le suivi. D'où
le bouton **« Exporter mes données »** dans les réglages, et « Importer une
sauvegarde » pour le relire ailleurs.

**Partager l'app**, c'est partager l'adresse : chacune l'installe de son côté
et garde son suivi chez elle. Rien ne circule entre les téléphones.

## Ce que l'app ne peut pas faire

**Compter les pas toute seule.** Aucun site web n'a le droit de lire le
podomètre en arrière-plan — c'est réservé aux applications installées depuis un
magasin. On note donc le chiffre relevé sur *Santé* (iPhone) ou *Google Fit*
(Android). Pour la même raison, **aucune synchronisation** avec Health, Google
Fit ou Garmin n'est possible.

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
src/
  theme.css                couleurs et styles — la charte tient là-dedans
  App.tsx                  l'aiguillage : onglets, pile d'écrans, bouton +
  lib/
    stockage.ts            ce qui est retenu, et la reprise des versions
    etat.tsx               l'état partagé, les actions, l'horloge
    profil.ts              métabolisme, dépense, objectif de calories, IMC
    score.ts               le score du jour et ce qu'il reste à faire
    aliments.ts            la base d'aliments et la recherche
    recettes.ts            vingt-quatre recettes
    lecons.ts              sept leçons
    sport.ts               programmes, séances, exercices, calories
    defis.ts               les défis de sept jours
    habitudes.ts           les habitudes de vingt et un jours
    gps.ts                 le suivi d'une sortie
    jeune.ts               rythmes, étapes du corps, séries
    dates.ts, formats.ts   dates, durées, nombres à la française
  composants/              anneaux, jauge, bandeau de semaine, règle d'IMC,
                           barre d'onglets, feuille du +
  ecrans/                  Bienvenue, Accueil, Repas, Jeûne, Progrès, Sport,
                           Séance, Sortie, AjoutAliment, Recettes, Recette,
                           Défis, Leçons, Moi, Corps, Eau, Activité, Réglages
```

## La mise en ligne

Le dépôt est relié à **Netlify** : chaque poussée sur `main` remet le site à
jour tout seul (`npm run build`, dossier `dist`). Aucune variable
d'environnement.

## Avertissement

Les calories, les étapes du jeûne, le score et les dépenses affichées sont des
repères, pas des mesures. Le jeûne et les régimes restrictifs sont déconseillés
en cas de grossesse, d'allaitement, de diabète, de troubles alimentaires ou de
traitement en cours.
