# Mahana — consignes de travail

Application personnelle de **perte de poids** : jeûne intermittent, repas et
calories, sport, pas, sommeil, défis hebdomadaires. React + TypeScript + Vite,
en PWA, mise en ligne sur Netlify.

**Cette application est seule au monde.** Elle ne partage rien avec aucun autre
projet : pas de base commune, pas de compte commun, pas de code recopié depuis
un autre dépôt. Si une autre application appartient à la même personne, elle
reste étrangère à celle-ci.

## Les règles

- **Tout est en français** — noms de composants, de fonctions, de variables,
  commentaires. L'utilisatrice est non-technique et lit le code.
- Les commentaires expliquent **le pourquoi**, pas la syntaxe.
- **Aucune donnée ne sort du téléphone.** Tout tient dans le `localStorage`
  (clé `mahana.v1`, voir `src/lib/stockage.ts`). Pas de compte, pas de serveur,
  pas de mouchard — la seule exception est la police Google chargée par
  `index.html`. Si une synchronisation est ajoutée un jour, ce sera un choix
  explicite de l'utilisatrice.
- **Mobile d'abord** : tout se consulte sur un téléphone, à une main.
- Le style tient dans un seul fichier, `src/theme.css` : des variables CSS et
  des classes utilitaires. Pas de bibliothèque de composants.
- **Deux thèmes, un seul jeu de variables.** Toutes les couleurs vivent dans
  `src/theme.css`. Les noms sont des **rôles**, pas des teintes : `--argile`
  est l'accent principal, `--olive` le vert de la réussite, `--canard` le bleu
  frais, `--miel` l'ambre des avertissements. Le thème « argile » (clair,
  terre cuite, serif *Cormorant Garamond*) et le thème « néon » (fond noir,
  cyan et vert électriques, grotesque *Space Grotesk*) leur donnent d'autres
  valeurs, jamais d'autres emplois.
- **Aucune couleur en dur, nulle part.** Pas dans un `.tsx`, pas dans une
  donnée de `src/lib/*.ts` (recettes, défis, habitudes portent des
  `var(--…)`). Un `#f5ebdc` oublié reste clair quand tout passe au noir — et
  ça ne se voit que sur l'autre thème. Le contrôle :

  ```bash
  grep -rn "#[0-9a-fA-F]\{3,6\}" src --include=*.ts --include=*.tsx
  ```

  Seules exceptions légitimes : `theme.css` lui-même et la couleur de la barre
  du téléphone dans `etat.tsx`.
- **Texte posé sur une couleur : `var(--sur-accent)`**, jamais du blanc. En
  clair c'est un crème ; en néon un bleu très sombre, parce qu'un aplat cyan
  ne porte pas du blanc. Pour l'onglet ou la pilule sélectionnés, la paire
  `--actif-fond` / `--actif-texte`.
- Le choix se garde dans `profil.theme` et se pose sur
  `document.documentElement.dataset.theme`. Une vignette d'aperçu porte son
  propre `data-theme` : elle est peinte avec les vraies variables du thème
  qu'elle propose (`ChoixTheme.tsx`).
- **Les symboles sont dessinés au trait**, dans `composants/Symbole.tsx`, tous
  dans le même esprit que le logo — un cercle, une courbe, rien de plus.
  Pas d'emoji pour la structure de l'app (titres, cartes, onglets, étapes) :
  les emoji ne restent que dans le contenu, là où ils sont expressifs (défis,
  habitudes, recettes, aliments).
- **Le logo** est le soleil au-dessus de l'eau : *mahana*, c'est le soleil et
  le jour ; la vague, c'est ici. Il se refabrique avec `npm run icones`.
- **Aucune promesse médicale.** Les calories, les étapes du jeûne et les
  dépenses sont des estimations : le dire, et garder l'avertissement des
  réglages.
- **Ne pas inventer de capacité que le web n'a pas.** Un site ne compte pas les
  pas en arrière-plan et ne suit pas le GPS écran éteint : l'app le dit
  franchement plutôt que de faire semblant.

## La date d'objectif

`src/lib/objectif.ts` calcule quand le poids visé sera atteint. Deux règles à
ne pas casser :

- **Toujours afficher l'hypothèse avec la date.** Une date sans son rythme
  (mesuré sur les pesées, ou promis par le déficit) est une promesse, pas une
  information. Le rythme mesuré l'emporte dès qu'il existe.
- **Ne jamais inventer de date quand le poids stagne.** La fonction renvoie
  `situation: 'stagne'` et l'écran le dit franchement. Un chiffre inventé est
  la meilleure façon de faire abandonner.

Le rythme réel vient d'une droite des moindres carrés sur les pesées du dernier
mois, jamais d'un simple « dernière moins première » : une pesée un lendemain
de fête ferait basculer le résultat.

## Ce qui est écrit par l'utilisatrice

Deux carnets lui appartiennent, à côté de ceux fournis avec l'app :
`etat.mesRecettes` et `etat.mesSeances`. Règle commune : **ce qu'elle a écrit
passe devant ce qui est fourni** — ses recettes en premier onglet et en
« recette du jour », ses séances en tête de leur famille. Le catalogue ne sert
plus qu'à dépanner celle qui débute.

- Les calories d'une recette ne se saisissent pas : `analyse.ts` lit les
  ingrédients et le total se divise par les portions. Le champ de correction
  existe toujours — une estimation qu'on ne peut pas corriger ne vaut rien.
- La durée d'une séance ne se saisit pas non plus : elle se calcule des
  exercices, par la même fonction (`versSeance`) que celle qui la fait jouer.
  Une durée déclarée et des exercices qui ne collent pas, c'est la porte
  ouverte aux calories fantaisistes.
- `seanceAJouer(id, miennes)` sert au lecteur : il ne doit pas savoir d'où
  vient la séance.

## Le parseur d'ingrédients (`analyse.ts`)

Trois pièges déjà payés, à ne pas réintroduire :

- **Les ligatures ne se décomposent pas** comme les accents. Sans le
  remplacement `œ → oe` dans `simplifier`, « bœuf » et « boeuf » restent deux
  mots différents et 500 g de viande disparaissent du calcul.
- **Un nom court ne doit pas gagner sur un nom long.** Le score croise la
  précision (le nom est-il couvert par le fragment) et la couverture (le
  fragment est-il couvert par le nom) : sans ça, « 3 pommes de terre » trouve
  « Pomme », parfaite sur son unique mot.
- **Le pluriel se joue sur une lettre** : `racine()` retire un `s` final. La
  distance d'édition ne peut pas s'en charger — elle refuse les mots de moins
  de cinq lettres, sinon « pain » trouverait « pané ».

Le banc d'essai est vite remonté : compiler `analyse.ts` et `aliments.ts` avec
`npx tsc --ignoreConfig`, puis appeler `analyser()` sur quelques phrases.
Toujours y garder la phrase du sandwich (507 kcal) comme témoin.

## Les photos des repas

Elles ne tiennent pas dans le `localStorage` — une seule photo pèse plus que
tout le suivi d'une année. Elles vont dans la réserve d'images du navigateur
(IndexedDB, base `mahana-photos`, voir `src/lib/photos.ts`), réduites à
900 pixels et compressées en JPEG : ~60 ko pièce. Elles restent dans le
téléphone comme le reste, et **l'export JSON ne les contient pas**.

Une photo est toujours facultative, et elle part avec la ligne de repas qu'on
supprime — sinon la réserve se remplit d'assiettes oubliées.

**L'estimation des calories d'après une photo ne se devine pas.** Aucun code
qui tourne dans le téléphone ne reconnaît un plat sur une image ; il faudrait
envoyer la photo à un serveur d'intelligence artificielle, ce que la règle
ci-dessus interdit. À la place, `src/lib/estimation.ts` pose trois questions —
le type de plat, la portion, la préparation — et donne une **fourchette**
honnête, toujours corrigeable à la main. Ne pas remplacer ça par un chiffre
qui aurait l'air deviné.

## Le modèle de données

Tout est décrit dans `src/lib/stockage.ts`. Une sauvegarde ancienne doit
toujours pouvoir être relue : `lireEtat()` recolle sur l'état vide et reprend
les versions précédentes (`reprendreV1`). **Ne jamais casser cette reprise** —
c'est le seul filet de l'utilisatrice.

## Avant de pousser

```bash
npm run build   # tsc -b && vite build — doit passer
npm run lint    # oxlint
```

`noUnusedLocals` est actif : un import qui traîne fait échouer le build.

Messages de commit en français, à l'indicatif, décrivant l'effet pour celle
qui utilise l'app plutôt que le détail technique.
