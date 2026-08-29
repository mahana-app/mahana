# Mahana — consignes de travail

Application personnelle de **jeûne intermittent** (minuteur, eau, poids,
séries, défis), dans l'esprit de Fastic. React + TypeScript + Vite, en PWA.

**Aucun rapport avec Sodi's App** (l'application RH de la Roulotte SODI). Rien
ne doit être partagé entre les deux : pas de base commune, pas de compte
commun, pas de code recopié d'un dépôt à l'autre.

## Les règles

- **Tout est en français** — noms de composants, de fonctions, de variables,
  commentaires. L'utilisatrice est non-technique et lit le code.
- Les commentaires expliquent **le pourquoi**, pas la syntaxe.
- **Aucune donnée ne sort du téléphone.** Tout tient dans le `localStorage`
  (clé `mahana.v1`, voir `src/lib/stockage.ts`). Pas de compte, pas de serveur,
  pas de mouchard, pas d'appel réseau — la seule exception est la police
  Google chargée par `index.html`. Si un jour une synchronisation est ajoutée,
  ce sera un choix explicite de l'utilisatrice, dans son propre projet.
- **Mobile d'abord** : tout se consulte sur un téléphone, à une main.
- Le style tient dans un seul fichier, `src/theme.css` : des variables CSS,
  un thème clair et un thème sombre. Pas de bibliothèque de composants.
- Aucune promesse médicale : les étapes du corps sont des repères de
  vulgarisation, et l'avertissement des réglages doit rester.

## Avant de pousser

```bash
npm run build   # tsc -b && vite build — doit passer
npm run lint    # oxlint
```

`noUnusedLocals` est actif : un import qui traîne fait échouer le build.

Messages de commit en français, à l'indicatif, décrivant l'effet pour celle
qui utilise l'app plutôt que le détail technique.
