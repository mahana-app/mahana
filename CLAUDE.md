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
- **La charte est « bien-être »** : fonds sable et crème, accent **argile**
  (terre cuite), plus **olive**, **canard**, **sauge** et **miel**. Les titres
  et les chiffres sont en serif (*Cormorant Garamond*), le texte en *Jost*.
  Rien de criard : l'app s'ouvre le matin et le soir, elle doit apaiser.
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
