# Où on en est

*Dernière mise à jour : samedi 13 septembre 2026, 23 h.*

## Ce qui est fait et ne bougera plus

- **La base Supabase est montée.** Organisation **Maison**, projet **Sweet Home**,
  région Sydney. Le schéma a été collé et accepté (« Success. No rows
  returned ») : les neuf tables sont là, verrouillées.
- **Le compte de Maru existe** (Authentication → Users), créé avec
  « Auto Confirm » : elle peut entrer sans passer par un courriel.
- **Le code est à jour et poussé.** L'app s'appelle *Sweet Home*, elle pardonne
  une adresse de serveur mal collée, et l'écran d'entrée dit où chercher quand
  la connexion échoue.

## Ce qui reste

**Une seule chose : fabriquer et publier la version à jour.**

Ce qui est en ligne date de 22 h 34 : il porte encore le nom « Fare » et
l'ancienne adresse de serveur, d'où le message *Invalid path specified in
request URL* à la connexion. Le correctif est écrit et poussé — il n'attend
qu'une reconstruction.

### Pourquoi ça coince

**Netlify a suspendu les reconstructions** jusqu'au prochain cycle de
facturation (« Sodi is now running on operational credits »). Les sites
publiés restent en ligne, mais on ne peut plus en fabriquer de nouveaux.

### Les deux sorties

**1. Vercel** — le compte existe déjà (Sodi's App y est), le dépôt contient
déjà `vercel.json`. Reste à autoriser Vercel sur l'organisation GitHub
`mahana-app`, importer le dépôt, poser les deux variables et déployer.
*Tentative du 13/09 au soir interrompue par une erreur 500 de GitHub.*

**2. Attendre** que Netlify redémarre, puis :
`Deploys → Trigger deploy → Deploy project without cache`.

### Les deux variables, dans les deux cas

```
VITE_SUPABASE_URL       = l'adresse du projet Supabase
VITE_SUPABASE_ANON_KEY  = la clé « publishable » (sb_publishable_…)
```

L'adresse n'a plus besoin d'être parfaite : l'app retire elle-même un
`/rest/v1` ou une barre oblique de trop. Ne jamais utiliser la clé
`sb_secret_…`.

## Ensuite, quand l'app s'ouvrira

1. Réinstaller le raccourci sur le téléphone (l'ancien garde le nom et
   l'icône de Mahana, figés au jour de l'installation) : appui long →
   Désinstaller, puis rouvrir l'adresse dans Chrome → Installer
   l'application.
2. Créer les comptes de Will, de la sœur de Will et de Manahiti
   (Authentication → Users → Add user, « Auto Confirm » coché).
3. Renseigner la maisonnée dans l'app : les prénoms, la part de chaque foyer
   dans les charges, ce que chacun verse dans la caisse.

## Ce qui n'est pas encore construit

Maru en a demandé davantage. Dans l'ordre prévu :

- **La maison face au temps** — El Niño, cyclone, tsunami : qui fait quoi
  physiquement, le kit d'urgence, les numéros.
- **Les enfants** — Manahiti, Mia et Eva : qui récupère qui, les horaires, le
  relais quand quelqu'un ne peut pas.
- **Les sorties et les voyages** — Moorea, camping, montagne, restaurant.
- **Les idées** — chacun propose, tout le monde vote.

Et deux choses qu'il faut lui demander : le prénom de la sœur de Will, et si
son fils s'appelle bien Manahiti lui aussi (pour le distinguer de son
beau-frère dans l'app).
