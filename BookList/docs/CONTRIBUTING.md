# Contribuer a BookList Pro

## Avant de commencer

1. Creer une branche depuis la branche principale.
2. Utiliser un nom explicite : `feat/books-list`, `fix/form-validation` ou `docs/readme`.
3. Lire [docs/ADR.md](docs/ADR.md) pour respecter les frontieres entre les couches.

## Repartition des fichiers

- Une route Expo Router va dans `app/`.
- Un composant visuel va dans `components/`.
- Un hook lie a un cas d'usage va dans `features/`.
- Un appel HTTP va dans `services/api/`.
- Un type ou une regle metier pure va dans `domain/`.
- Une valeur de style reutilisable va dans `theme/tokens.ts`.

Ne pas importer `services/` depuis `components/`. Ne pas mettre `fetch` ni une URL d'API dans `app/` ou `components/`.

## Qualite attendue

Avant de proposer une modification, executer :

```bash
npx tsc --noEmit
```

Ajouter ou mettre a jour les tests des que la fonctionnalite dispose de logique metier, d'un composant ou d'un hook testable. Ne pas ajouter de `any`, de `@ts-ignore` non justifie, de `console.log` residuel ou de secret dans le depot.

## Commits et revue

Utiliser des commits petits, atomiques et avec un prefixe conventionnel :

```text
feat: add book list layout
fix: handle invalid publication year
test: cover book form validation
docs: document project setup
refactor: isolate API error mapping
```

Ouvrir une pull request avec :

- le but de la modification ;
- les fichiers ou comportements importants ;
- la commande de verification executee ;
- une capture pour tout changement visuel notable.

Une personne de l'equipe relit la pull request avant sa fusion.
