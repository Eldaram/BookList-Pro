# BookList Pro

Application React Native destinee aux libraires des Comptoirs du Livre. La cible initiale est le navigateur avec Expo, puis iOS et Android depuis la meme base de code.

## Etat du projet

Lots 1 a 3 livres (cahier de lecture, notes et coups de coeur, fiche enrichie), lot 4 entame (connexion et session). Le detail par lot figure dans le resume ci-dessous.

## Resume des travaux autour de la presentation du 11/09 a 14h20

### Avant la presentation (gel du perimetre fonctionnel)

- **Lot 1** : liste paginee du fonds avec defilement infini, fiche detaillee, creation, modification, suppression avec confirmation et annulation pendant cinq secondes, statut lu / non lu.
- **Lot 2** : notes de lecture (ajout, suppression, horodatage), coups de coeur avec mise a jour optimiste, recherche et filtres cote serveur avec anti-rebond, cellules memoisees (aucun rendu superflu).
- **Lot 3** : note par etoiles, couvertures (image locale, URL externe, repli aux initiales du titre), remplacement de couverture avec redimensionnement, enrichissement OpenLibrary (nombre d'editions, couverture de secours) avec cache persistant, espacement des requetes, deduplication et degradation silencieuse, theme clair/sombre, interface bilingue FR/EN.
- **Lot 4 (entame)** : ecran de connexion, deconnexion, session persistee.
- **Livrables** : ADR 001 a 003, `docs/PERFORMANCE.md` avec mesures avant/apres, tests unitaires et d'integration reorganises (`unit/` par couche, `integration/`), video de demonstration du cache OpenLibrary, `IA.md`.

### Apres la presentation (aucune fonctionnalite nouvelle)

- Revue de code globale du depot et traitement des remarques (PR #44).
- Stabilisation de la CI (gestion de la cle FreeImageHost, durcissement de l'envoi de couverture).
- Centralisation de la configuration OpenLibrary (URLs, timeout, espacement, TTL) dans `services/config.ts` : plus aucune URL en dur dans les modules.

## Prerequis

- Node.js 20 ou une version plus recente
- npm

## Installation et lancement

Depuis le dossier `BookList` :

```bash
npm install
npm run web
```

Expo affiche ensuite l'adresse locale de l'application dans le terminal, habituellement `http://localhost:8081`.

## API locale

L'API fournie est dans le dossier voisin `../api-books-v2`.

Dans un second terminal :

```bash
cd ../api-books-v2
npm install
npm run seed:small
npm start
```

L'API est alors disponible sur `http://localhost:3000`. Elle n'est pas encore consommee par l'ecran temporaire.

## Commandes utiles

| Commande           | Role                                                   |
| ------------------ | ------------------------------------------------------ |
| `npm run web`      | Lance l'application dans le navigateur.                |
| `npm start`        | Lance Expo et permet de choisir une cible.             |
| `npx tsc --noEmit` | Verifie le typage TypeScript sans generer de fichiers. |

## Architecture

| Dossier       | Responsabilite                                |
| ------------- | --------------------------------------------- |
| `app/`        | Routes et navigation Expo Router.             |
| `components/` | Interface reutilisable, sans appel HTTP.      |
| `features/`   | Cas d'usage par domaine, par exemple `books`. |
| `hooks/`      | Logique reutilisable.                         |
| `services/`   | API, stockage et services de plateforme.      |
| `domain/`     | Types et regles metier pures.                 |
| `theme/`      | Tokens de style partages.                     |

Les choix d'architecture sont documentes dans [docs/ADR.md](docs/ADR.md).

## Regles importantes

- TypeScript est en mode strict.
- Aucun `fetch` ni URL d'API dans `app/` ou `components/`.
- Les reponses de l'API seront validees avec Zod avant leur utilisation.
- Les couleurs, espacements et tailles de texte partages sont centralises dans `theme/tokens.ts`.

## Contribution

Lire [CONTRIBUTING.md](CONTRIBUTING.md) avant de commencer une fonctionnalite.
