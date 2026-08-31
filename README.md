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
| **Repas** | Le bandeau de la semaine, la jauge *consommé · restantes · brûlé*, les macros, et les quatre repas avec **l'objectif de calories réparti** entre eux. On ajoute un aliment à la fois, on **décrit le repas en une phrase**, ou on le **photographie** et l'app estime. Plus l'accès aux recettes. |
| **Jeûne** | Le plan (12:12 → 23:1), le **jeûne programmé à une heure**, l'anneau avec les étapes du corps posées tout autour, la correction de l'heure de début, l'**ajout d'un jeûne oublié**, l'historique et les recettes pour rompre le jeûne. |
| **Progrès** | Le **score du jour sur 100** et ce qu'il reste à faire pour le remplir, la série, l'**IMC sur sa règle colorée**, puis le poids, les calories, les heures de jeûne, les pas et le sport — par **semaine, mois ou année**. |
| **Le bouton +** | Au centre de la barre : noter un repas, boire un verre, démarrer ou terminer le jeûne, lancer une séance, sortir marcher, noter son poids, ses pas ou sa nuit. |

Le reste s'ouvre depuis l'accueil ou depuis « Moi » (l'avatar en haut à
gauche) : les **séances de sport**, les **défis et habitudes**, les
**recettes**, les **leçons**, l'eau, le poids, les pas et le sommeil, et les
réglages.

## Le sport

Trois façons de s'y prendre :

**Les séances guidées** — cardio, pilates, musculation, jiu-jitsu : seize
séances menées exercice par exercice, avec minuteur de série et de repos, la
consigne de chaque mouvement et les calories estimées.

Le jiu-jitsu se pratique au club, à deux : ce que l'app propose, ce sont les
séances qu'on fait **seule entre deux entraînements** — les déplacements au sol
(crevette, pont, relevé technique), les hanches et la garde, la préparation
physique du tapis, et des rounds à vide pour le cardio. Le cours du soir, lui,
se note comme n'importe quelle autre séance.

**Mes séances** — dans chaque famille, on monte la sienne : le circuit de la
salle, l'enchaînement du coach, les cinq exercices du mardi. Chaque exercice
porte ses séries, ses répétitions **ou** sa durée, son repos et sa consigne. La
durée totale et les calories se calculent toutes seules à partir de là — jamais
saisies à la main, sinon elles ne voudraient plus rien dire. Une fois écrite, la
séance se joue exactement comme celles du catalogue, avec ses minuteurs.

**Les séances notées à la main** — une vidéo suivie sur YouTube, un cours, la
salle. On met le nom, la durée, ce qui a travaillé (corps entier, fessiers,
abdos…) et l'effort ; les calories se calculent toutes seules à partir du
poids, quitte à les corriger.

**Les programmes suivis** — un défi de vingt-huit jours en vidéo, un plan de
salle, un cours hebdomadaire. Le programme porte son nom, son sport, son
nombre de jours, le lien des vidéos et avec qui on le suit. Chaque séance est
enregistrée sous « Jour 5 · Glute + Abs », et **l'avancement se compte en
séances faites, pas en jours de calendrier** : sauter un jour ne fait pas
perdre sa place.

Et les **sorties dehors** suivies au GPS : marche, course, vélo, randonnée,
avec distance, allure et calories en direct.

## Mes recettes : ce que je cuisine vraiment

Le carnet de recettes toutes faites donne des idées ; celui-ci donne les
siennes. On écrit ce qu'on a préparé — surtout les dîners, c'est là qu'on
manque d'idées — et l'accueil vient piocher dedans.

On écrit les ingrédients comme on les dirait, un par ligne :

> 500 g de viande de bœuf · 2 patates douces · 3 pommes de terre ·
> sauce chimichurri · une salade verte · 2 cuillères d'huile d'olive

L'app reconnaît chacun, additionne, **divise par le nombre de portions** et
annonce les calories d'une portion — corrigeables à la main. On peut ajouter la
marche à suivre, une photo du plat, et mettre la recette dans sa journée d'une
touche.

Sur l'accueil, la **recette du jour** devient « ma recette du jour » dès qu'on
en a écrit une. À partir du milieu de l'après-midi, elle montre un dîner : c'est
à ce moment-là qu'on se demande quoi préparer ce soir.

## Décrire un repas en une phrase

Plutôt que d'ajouter les aliments un par un, on écrit :

> « un sandwich avec 2 pains de mie complets, 80 g de poulet pané, un peu de
> salade, carotte râpée, tomate, beurre d'olive et du chimichurri »

L'app découpe la phrase, reconnaît chaque aliment dans sa base, comprend les
quantités (« 80 g », « 2 pains », « un peu de », « une poignée », « un bol »)
et propose une portion quand rien n'est précisé. Le résultat s'affiche
ingrédient par ingrédient, **avec le morceau de phrase d'origine**, et tout se
corrige : la quantité, l'aliment reconnu, les lignes à retirer.

Un plat composé peut être **gardé** pour être ajouté d'une touche la fois
suivante.

Le code de l'analyse est dans `src/lib/analyse.ts`. Rien ne part sur internet :
la reconnaissance se fait dans le téléphone, contre la base d'aliments.

## Photographier un repas

On prend la photo de l'assiette, on répond à trois questions — **qu'est-ce que
c'était** (assiette complète, plat en sauce, bol, sandwich, salade, soupe,
petit-déjeuner, en-cas, boisson), **quelle portion** et **quelle préparation**
— et l'app donne une estimation avec sa fourchette : « 1 370 kcal, sans doute
entre 1 100 et 1 640 ». Le chiffre se corrige à la main quand on le connaît.

Il faut être clair sur ce point : **l'app ne lit pas la photo**. Reconnaître un
plat sur une image demande d'envoyer la photo à un serveur d'intelligence
artificielle, et ici rien ne quitte le téléphone. La photo sert de souvenir des
portions ; l'estimation vient des réponses. C'est moins magique et beaucoup
plus honnête qu'un chiffre inventé.

Les photos sont réduites et gardées dans la réserve d'images du navigateur
(`src/lib/photos.ts`) : elles ne partent nulle part, et une vignette apparaît
devant chaque repas dans la liste du jour — on la touche pour la voir en grand.
Une photo peut aussi être jointe à un repas décrit en une phrase.

## Dans combien de temps j'atteins mon objectif

C'est la question qu'on se pose en descendant de la balance, et l'app y répond
sur l'accueil, sous la courbe de poids, et en détail dans **Mon poids** :

> **Il reste 6,4 kg** · 36 % du chemin fait
> **Vers le lun. 14 déc.** — dans 4 mois, 107 jours
> Au rythme de vos pesées : −0,42 kg par semaine, mesurés sur 5 pesées et 28 jours.

Deux rythmes servent au calcul, et l'app dit toujours lequel elle utilise :

- **le rythme prévu**, celui du déficit de calories choisi (un kilo de graisse
  vaut environ 7 700 kcal). Disponible dès le premier jour, mais c'est une
  promesse sur le papier ;
- **le rythme réel**, la pente des pesées du dernier mois, calculée par une
  droite des moindres carrés — une pesée bizarre ne fait pas basculer le
  résultat. Il prend le relais dès qu'il y a trois pesées sur au moins dix
  jours, et c'est le seul qui compte.

Quand le poids stagne, l'app le dit et ne donne **aucune date** — inventer un
chiffre serait la meilleure façon de faire abandonner. Elle rappelle aussi que
c'est une ligne droite tracée à travers la vraie vie : il y a des paliers, des
semaines sans rien, des semaines à deux kilos. Et elle prévient quand le rythme
dépasse un kilo par semaine, ou quand l'objectif de poids descend sous un IMC
de 18,5.

## Deux habillages

Le même app, deux allures — le choix se fait au premier lancement et se change
à tout moment dans les réglages, sans toucher à aucune donnée :

- **Argile** — sable, crème, terre cuite, olive et canard, titres en serif
  (*Cormorant Garamond*). Doux et clair, l'habillage d'origine.
- **Néon** — fond noir, cyan et vert électriques, jaune et bleu, titres en
  grotesque (*Space Grotesk*). Franc et sportif.

Les deux vignettes du sélecteur portent chacune leur propre `data-theme` :
l'aperçu est peint avec les vraies couleurs du thème qu'il propose, pas avec
une image. Ce qu'on voit est exactement ce qu'on aura.

Techniquement, toutes les couleurs de l'app passent par une variable CSS de
`src/theme.css`, y compris celles des recettes et des défis. Les noms sont des
rôles — `--argile` est l'accent principal, `--olive` le vert de la réussite —
et chaque thème leur donne d'autres valeurs, jamais d'autres emplois.

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
