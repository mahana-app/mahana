# Mahana — jeûne intermittent

Une petite application de jeûne intermittent, dans l'esprit de Fastic :
un minuteur en anneau, les étapes que traverse le corps, l'eau du jour,
le poids, une série de jours et des défis.

Application personnelle et indépendante : elle n'a **aucun rapport** avec
Sodi's App — son propre dépôt, sa propre mise en ligne, aucune base de
données partagée, aucun compte commun.

## Ce qu'elle sait faire

| Écran | Ce qu'on y fait |
|---|---|
| **Jeûne** | Lancer le minuteur, voir le temps écoulé et ce qu'il reste, corriger l'heure du dernier repas, terminer. La carte « ce qui se passe » suit les étapes : digestion → réserves de sucre → combustion des graisses → cétose → autophagie. |
| **Eau** | Cocher les verres bus, voir les sept derniers jours. |
| **Corps** | Noter le poids (une pesée par jour), voir la courbe, l'écart au départ, l'objectif, l'IMC. |
| **Journal** | La série de jours d'affilée, le calendrier des cinq dernières semaines, les statistiques et les défis obtenus. |
| **Réglages** | Le rythme (12:12 → 23:1), l'objectif d'eau, le poids visé, la sauvegarde. |

## Où sont les données

**Dans le téléphone, nulle part ailleurs.** Pas de compte, pas de serveur,
pas de base de données : tout est rangé dans le `localStorage` du navigateur,
sous la clé `mahana.v1`.

La conséquence à connaître : vider les données du navigateur, ou changer de
téléphone, efface le suivi. D'où le bouton **« Exporter mes données »** dans
les réglages, qui enregistre un fichier `mahana-2026-08-27.json` — et
« Importer une sauvegarde » pour le relire ailleurs.

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
public/                    icônes, manifeste PWA, service worker (mode hors ligne)
src/
  theme.css                toutes les couleurs et tous les styles, clair et sombre
  App.tsx                  l'aiguillage entre les cinq écrans
  lib/
    stockage.ts            ce qui est retenu, et comment c'est rangé
    etat.tsx               l'état partagé + l'horloge du minuteur
    jeune.ts               rythmes, étapes du corps, séries, défis
    dates.ts               les formats de date et de durée
  composants/              l'anneau, l'en-tête, la barre du bas, les icônes
  ecrans/                  Bienvenue, Jeûne, Eau, Corps, Journal, Réglages
```

## La mettre en ligne

1. https://vercel.com → **Add New… → Project** → importer le dépôt `mahana`.
2. Ne rien changer : **Root Directory** reste la racine, le framework **Vite**
   est détecté tout seul, et il n'y a **aucune variable d'environnement** à
   remplir puisqu'il n'y a pas de base de données.
3. **Deploy**, puis ouvrir l'adresse sur le téléphone et
   « Ajouter à l'écran d'accueil » : elle s'installe comme une vraie appli et
   fonctionne sans réseau.

Chaque poussée sur `main` remet l'app en ligne toute seule.

## Ce que l'app n'est pas

Les étapes affichées pendant le jeûne sont des repères de vulgarisation, pas
un avis médical. Le jeûne est déconseillé en cas de grossesse, d'allaitement,
de diabète, de troubles alimentaires ou de traitement en cours.
