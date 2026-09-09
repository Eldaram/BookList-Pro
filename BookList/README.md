# BookList Pro

Application React Native destinee aux libraires des Comptoirs du Livre. La cible initiale est le navigateur avec Expo, puis iOS et Android depuis la meme base de code.

## Etat du projet

Le squelette Expo Router est en place. L'ecran d'accueil est `app/(tabs)/index.tsx` et affiche une page temporaire. Les cas d'usage du lot 1 seront ajoutes progressivement : liste paginee, fiche, creation, modification et suppression des livres.

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
