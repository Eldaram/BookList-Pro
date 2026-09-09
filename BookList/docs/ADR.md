# ADR 001 - Architecture en couches et par fonctionnalite

## Statut

Accepte - 09/09/2026

## Contexte

BookList Pro est une application React Native executee d'abord dans un navigateur avec Expo. Le lot 1 doit permettre de consulter une liste paginee de livres, afficher une fiche, creer, modifier et supprimer un livre.

L'API est externe. Elle impose la pagination, le filtrage et le tri cote serveur, retourne des erreurs `422` par champ et peut etre indisponible. Le contrat de qualite impose des le lot 1 TypeScript strict, une validation runtime des reponses avec Zod, TanStack Query pour l'etat serveur, et React Hook Form avec Zod pour les formulaires. Aucun `fetch` ni URL ne peut apparaitre dans `app/` ou `components/`.

L'architecture doit egalement preparer sans reecriture l'authentification, le cache persistant, la file de mutations, la synchronisation idempotente et les conflits du lot 4.

## Options envisagees

1. Appeler l'API depuis les ecrans et conserver les livres dans un etat React local. Cette option ne respecte pas les contraintes et rend les erreurs, le cache et le hors ligne difficiles a gerer.
2. Organiser uniquement par technique (`screens/`, `api/`, `utils/`). Les cas d'usage livres seraient disperses sans proprietaire clair.
3. Separer les couches et regrouper les cas d'usage dans `features/books/`.

## Decision

Nous retenons l'option 3. L'arborescence initiale est :

```text
app/
  _layout.tsx                 # fournisseurs globaux et ErrorBoundary
  index.tsx                 # route de liste
  (tabs)/
    books/[bookId].tsx          # route fiche
    books/form.tsx              # unique route de creation et modification
components/
  books/BookList.tsx #affiche la list la collection complête
  books/BookListItem.tsx #affiche un seul livre en détail
  books/BookForm.tsx          # unique formulaire de creation et modification
  books/DeleteBookDialog.tsx
  ui/                         # primitives visuelles reutilisables
features/
  books/bookKeys.ts           # cles TanStack Query
  books/bookQueries.ts        # useBooks et useBook
  books/bookMutations.ts      # useSaveBook et suppression
  books/bookFormSchema.ts     # schema Zod du formulaire
hooks/
  useDebouncedValue.ts        # lot 2
services/
  api/httpClient.ts           # seul endroit avec fetch, URL et timeout
  api/booksApi.ts             # operations HTTP des livres
  api/schemas.ts              # validation Zod des reponses
  network.ts                  # abstraction web/mobile, lot 4
  storage.ts                  # abstraction persistance, lot 4
domain/
  book.ts                     # types et regles pures
  errors.ts                   # erreurs applicatives discriminees
theme/
  tokens.ts
```

| Couche        | Responsabilite                                            | Dependances autorisees                |
| ------------- | --------------------------------------------------------- | ------------------------------------- |
| `app/`        | Routes, navigation et composition des ecrans              | `components/`, `features/`, `theme/`  |
| `components/` | Interface pure, callbacks, etats visuels et accessibilite | `domain/`, `theme/`                   |
| `features/`   | Cas d'usage et integration TanStack Query                 | `domain/`, `services/`                |
| `hooks/`      | Logique reutilisable non liee a une fonctionnalite        | `domain/` si necessaire               |
| `services/`   | HTTP, validation runtime, stockage et plateforme          | `domain/`                             |
| `domain/`     | Regles metier pures et types                              | aucune                                |
| `theme/`      | Tokens de design                                          | aucune dependance metier ou technique |

Les dependances inversees sont interdites. Un composant ne peut pas importer `services/`; `domain/` ne peut importer ni React ni Expo; `services/` ne peut pas importer `features/` ou `components/`.

### Flux d'enregistrement au lot 1

```text
app/books/form.tsx
  -> BookForm (components/books)
  -> useSaveBook (features/books)
  -> booksApi (services/api)
  -> httpClient (services/api)
  -> API
```

`books/form.tsx` recoit facultativement `bookId`. Sans identifiant, il affiche `BookForm` avec des valeurs vides et `useSaveBook` appelle `POST /books`. Avec un identifiant, il charge le livre, initialise le meme `BookForm` et `useSaveBook` appelle `PUT /books/:id`. L'utilisateur ne voit donc qu'un seul formulaire et les memes regles de validation s'appliquent dans les deux cas.

`BookForm` utilise React Hook Form et le schema Zod de `bookFormSchema.ts`. Il recoit les valeurs initiales, callbacks et erreurs a afficher, sans connaitre l'API. Une reponse `422` devient une `ErreurValidation` avec les erreurs par champ, ensuite associees au formulaire avec `setError`. La soumission est desactivee tant que la mutation est en cours.

`httpClient.ts` centralise l'URL de base, les en-tetes JSON, l'annulation et le delai d'expiration. Il traduit les echecs en `ErreurReseau`, `ErreurValidation`, `ErreurConflit` ou `ErreurAuth`. `booksApi.ts` valide toute reponse avant de fournir une donnee de domaine.

### Etat serveur et pagination

TanStack Query est la source de verite des donnees serveur. Les cles sont declarees dans `bookKeys.ts` :

```ts
["books", "list", filters][("books", "detail", bookId)];
```

`useBooks` transmet `page`, `limit`, filtres et tri a `GET /books`; il ne charge jamais les 500 livres pour filtrer localement. L'ecran presente un squelette au chargement initial, une erreur avec nouvel essai, un etat vide contextualise, puis la liste paginee. Le chargement de page suivante est distinct du chargement initial.

Apres creation, edition ou suppression reussie, `bookMutations.ts` invalide `['books', 'list']` et la fiche concerne. La suppression demande confirmation puis differe l'appel API de cinq secondes : l'utilisateur peut annuler pendant ce delai.

### Preparation du lot 4

Le lot 1 execute les mutations en ligne. Au lot 4, les memes mutations ecriront dans une file persistante derriere `services/storage.ts` hors connexion, puis `services/network.ts` declenchera la synchronisation. Les routes et composants garderont les memes hooks de `features/books/`.

L'intercepteur d'authentification sera ajoute a `httpClient.ts`, avec un fournisseur de jetons dans `services/`. Le jeton de rafraichissement ne sera jamais place dans un etat React.

## Consequences

### Positives

- Les composants se testent sans API ni cache reel.
- Les regles de domaine et la future resolution de conflits se testent sans React Native.
- Les ecrans restent minces et les appels reseau restent controles.
- Les exigences d'erreur, de pagination et de formulaire du lot 1 ont chacune un proprietaire precis.
- Le hors ligne et l'authentification n'imposeront pas de reecrire l'interface.

### Negatives

- Une operation simple traverse plusieurs fichiers et demande de respecter les imports.
- TanStack Query et React Hook Form doivent etre configures des le lot 1.
- Les abstractions `network.ts` et `storage.ts` seront introduites avant leur implementation complete.

### A revoir si

- Une autre solution d'etat serveur est retenue et justifiee par ecrit.
- La synchronisation exige de deplacer une regle de mutation dans `domain/` pour la tester de facon pure.
