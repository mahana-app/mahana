# Sweet Home · la maison

L'application de la maison, pour les deux foyers qui y vivent : les **LAI AH
CHE** et les **LENOIR**. Les charges, la caisse commune des courses, et ce
qu'on doit à la roulotte.

Elle a remplacé *Mahana* (le suivi de poids) à la même adresse. L'ancienne app
n'est pas perdue : elle reste dans l'historique du dépôt, jusqu'au commit
« Mes recettes et mes séances, écrites par moi ».

*Le dossier et le paquet s'appellent encore `fare` — « la maison » en tahitien,
le nom du projet avant que Maru choisisse celui affiché sur l'écran. Rien à
corriger : ce n'est qu'un nom de dossier.*

## Les quatre onglets

| | |
|---|---|
| **Maison** | Tout d'un coup d'œil : qui doit quoi entre les foyers, ce qu'il reste dans la caisse, ce qu'on doit à la roulotte, et les factures en attente. |
| **Charges** | Électricité, eau, internet, impôts, déchets. Mois par mois. |
| **Caisse** | Les cotisations de chaque foyer et les courses achetées en gros. |
| **Roulotte** | Ce que chaque foyer a pris à manger, à rembourser en fin de mois. |

Le **+** au milieu note n'importe laquelle de ces quatre choses sans avoir à
chercher le bon écran.

## Les charges : payer et rembourser sont deux choses différentes

C'est la règle qui a façonné cet écran. À la maison, c'est presque toujours
**un seul foyer qui règle le fournisseur**, et l'autre lui rend sa part
ensuite. L'app suit donc les deux séparément :

1. La facture est saisie : 24 600 F d'électricité pour septembre. Le partage
   est proposé d'après les parts de la maison (50/50 par défaut) et se corrige
   à la main quand cette facture-là se partage autrement.
2. Quelqu'un paie le fournisseur : on note **qui a avancé**.
3. L'autre foyer rend sa part — en une fois, ou en plusieurs.

Une facture n'est **soldée** que quand les deux sont faits. Une facture payée
dont la part n'a pas été rendue reste en attente : c'est exactement là que les
oublis arrivent.

Les parts sont **figées au moment de la saisie**. Changer la répartition de la
maison en janvier ne touche pas aux factures de décembre — sinon des comptes
déjà soldés se remettraient à bouger tout seuls.

## La caisse commune

Chacun fait ses courses de son côté, mais certaines choses s'achètent en gros
pour toute la maison : le poulet, la viande, les légumes, le riz, le lait, le
pain de mie. Chaque foyer verse une somme au début du mois, et c'est avec cet
argent-là qu'on achète.

Deux chiffres suffisent : **ce qui a été versé**, **ce qui a été dépensé**. La
différence, c'est ce qu'il reste. Si la caisse passe en négatif, l'app le dit
franchement : quelqu'un a payé de sa poche sans le noter.

Une cotisation *notée* et une cotisation *versée* ne sont pas la même chose —
l'app distingue les deux, sinon la caisse a l'air pleine alors qu'elle est vide.

## L'ardoise de la roulotte

Quand quelqu'un de la maison prend à manger à la roulotte, ce n'est pas un
cadeau : c'est du stock et de la caisse en moins pour l'entreprise. On le note
au moment où ça arrive — deux touches — et en fin de mois chaque foyer
rembourse son total.

Sans ça, la caisse de la roulotte ne tombe jamais juste et personne ne sait
dire pourquoi.

## Mode essai, et mode partagé

L'application n'a de sens que **partagée** : quand Maru note la facture
d'électricité, il faut que Manahiti la voie sur son téléphone. Les données sont
donc sur un serveur, contrairement à Mahana qui ne quittait jamais le téléphone.

Tant que le serveur n'est pas branché, l'app tourne en **mode essai** : tout
reste dans le navigateur, personne d'autre ne voit rien, et un bandeau le dit
en haut de l'écran. C'est fait pour regarder à quoi ça ressemble avant de
monter quoi que ce soit.

### Un seul code pour toute la maison

Quatre comptes avec quatre mots de passe, c'était la bonne façon de faire sur
le papier — et la mauvaise dans cette maison : personne ne les aurait retenus,
et Maru serait devenue le service d'assistance de sa propre famille. Un code
partagé qu'on se dit une fois vaut mieux qu'un système parfait dont tout le
monde se détourne.

Techniquement, la maison a **un seul compte** chez Supabase. Son adresse est
écrite dans l'app (`COMPTE_MAISON`, dans `src/ecrans/Connexion.tsx`) et
personne n'a à la connaître ; le code que l'on tape à l'entrée est le **mot de
passe** de ce compte. La serrure est donc exactement celle d'un vrai compte —
c'est seulement la clé qui est partagée, comme celle de la porte d'entrée.

Pour créer ou changer le code : Supabase → **Authentication → Users**, sur le
compte `maison@sweet-home.pf`. Six caractères minimum.

### Et une fois entré, « qui es-tu ? »

Posée une seule fois, à la première ouverture, la réponse reste dans ce
téléphone-là. **Ce n'est pas une sécurité** — le code a déjà fait ce travail.
C'est ce qui permet à l'app de dire bonjour par le prénom, et de cocher
d'avance qui est allé faire les courses ou chercher à manger à la roulotte.

Ça se change dans **Maisonnée → Ce téléphone → Ce n'est pas moi**.

### Les ados n'ont qu'un écran

Mia et Manahiti prennent à manger à la roulotte comme tout le monde, et c'est
à eux de le noter — personne d'autre ne sait ce qu'ils ont pris. Mais les
factures, les cotisations et les comptes entre les deux familles ne les
regardent pas.

Quand la personne identifiée sur ce téléphone est marquée **Enfant**, l'app
n'affiche donc **que** l'écran de la roulotte : deux champs, un bouton, et le
total de son mois. Pas d'onglets, pas de charges.

⚠️ **C'est une convenance, pas une serrure.** Le code de la maison est le même
pour tout le monde ; rien n'empêche de répondre « Maru » à la question « qui
es-tu ? ». Séparer pour de bon demanderait un code par personne — ce que la
maison a justement écarté. L'écran des ados range les choses, il ne les
verrouille pas.

Deux réglages, deux questions différentes, dans **Maisonnée** :

| Réglage | Ce qu'il décide |
|---|---|
| **A l'app / Sans app** | Apparaît-il dans « qui es-tu ? ». Eva a quatre ans : sans app. |
| **Adulte / Enfant** | Voit-il toute la maison, ou seulement l'écran de la roulotte. |

### Brancher le serveur

1. Sur [supabase.com](https://supabase.com), créer un projet — gratuit.
   **Un nouveau projet**, séparé de celui de la roulotte.
2. Ouvrir **SQL Editor**, coller **tout** le contenu de `supabase/schema.sql`,
   et lancer. Le fichier peut être recollé autant de fois qu'on veut.
3. Dans **Authentication → Users → Add user → Create new user**, créer
   **un seul** compte, celui de la maison :
   - adresse : `maison@sweet-home.pf` — **exactement celle-là**, elle est
     écrite dans l'app
   - mot de passe : le code de la maison, six caractères minimum
   - cocher **Auto Confirm User**, sinon personne ne pourra entrer

   Pas d'inscription depuis l'app, exprès : on n'ouvre pas les comptes de deux
   familles à qui tomberait sur l'adresse.
4. Dans **Project Settings → API**, relever l'**URL** et la clé **anon public**.
5. Sur Netlify (ou Vercel), ajouter deux variables d'environnement :

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

6. Redéployer. Le bandeau « mode essai » disparaît, l'app demande le mot de
   passe, et les deux foyers voient enfin la même chose.

La clé « anon » est dans la page : ce n'est **pas** un secret, et ce n'est pas
elle qui protège les données. La vraie barrière, c'est la politique du schéma :
il faut un compte pour lire ou écrire quoi que ce soit.

## Ce qui reste à faire

Maru en a demandé bien plus que ce qui est là. Dans l'ordre prévu :

- **La maison face au temps** — El Niño, cyclone, tsunami : qui fait quoi
  physiquement (les volets, l'eau, le groupe électrogène, la voiture), le kit
  d'urgence, les numéros. Préparé au calme, pas la veille.
- **Les enfants** — Manahiti, Mia et Eva : qui récupère qui et quel jour, les
  horaires, les activités, et le relais quand quelqu'un ne peut pas.
- **Les sorties et les voyages** — Moorea, camping, marche en montagne,
  restaurant : qui vient, qui apporte quoi, le budget, la liste des affaires.
- **Les idées** — chacun propose, tout le monde vote. Pour que rien ne se
  perde dans les conversations.

## Travailler dessus

```bash
npm install
npm run dev                     # le serveur de développement
npm run build                   # tsc -b && vite build — doit passer
npm run lint                    # oxlint
npm run icones                  # refabrique le logo et les icônes
./supabase/verifier_schema.sh   # le schéma se rejoue-t-il sans erreur ?
```

## Les fichiers

```
src/
  lib/
    types.ts          le modèle : foyers, membres, charges, caisse, ardoise
    base.ts           où vivent les données — serveur ou mode essai
    maison.tsx        l'état partagé par tous les écrans
    argent.ts         les francs, les mois, et tous les calculs
    navigation.ts     les écrans qui s'ouvrent par-dessus les onglets
  composants/         en-tête, onglets, symboles, bandeaux
  ecrans/             un fichier par écran
  theme.css           toutes les couleurs, en variables
supabase/
  schema.sql          la base, à recoller en entier dans Supabase
  verifier_schema.sh  monte une base jetable et rejoue le schéma trois fois
outils/icones.mjs     fabrique le logo en PNG, sans dépendance
```
