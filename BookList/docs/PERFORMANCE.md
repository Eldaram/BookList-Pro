# PERFORMANCE.md — Mesures avant / apres optimisation

## Optimisation 1 — Appels OpenLibrary de la liste : rafale non maitrisee -> file espacee + cache persistant

### Probleme constate

Chaque cellule de la liste sans couverture locale declenche une recherche
`openlibrary.org/search.json?title=<titre>`. Le fonds ayant `couverture: null`
pour la quasi-totalite des 500 ouvrages, le chargement d'une page de liste
declenchait une rafale de requetes simultanees, rejouee a chaque rechargement
de la page (cache uniquement en memoire). Consequence observee en conditions
reelles : blocage de notre IP par OpenLibrary (reponses d'erreur sans en-tete
CORS, puis `ERR_CONNECTION_TIMED_OUT`), covers definitivement absentes et
console saturee d'erreurs.

### Methode de mesure

Chrome DevTools > onglet Reseau, filtre `openlibrary.org`, sur deux scenarios :

1. **Chargement initial** de la liste (premiere page, 20 ouvrages, cache vide) ;
2. **Rechargement complet** de la page (F5) apres un premier chargement reussi.

Compteurs releves : nombre de requetes, concurrence maximale (requetes en vol
simultanement), et etat de la reponse.

### Resultats

| Scenario                         | Avant                                                                     | Apres                                                            |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Chargement initial (20 cellules) | 20 requetes simultanees                                                   | 20 requetes espacees de 700 ms (~1,4 req/s, concurrence max = 1) |
| Rechargement de page (F5)        | 20 requetes (cache memoire perdu)                                         | 0 requete (cache persistant localStorage)                        |
| Defilement complet du fonds      | jusqu'a 500 requetes par session                                          | 500 requetes au total, une seule fois, puis 0                    |
| OpenLibrary indisponible         | 1 nouvelle tentative par cellule a chaque montage, 5 s de timeout chacune | echec memorise 60 s, 0 nouvelle tentative pendant le TTL         |

### Optimisations appliquees (`services/api/openLibraryApi.ts`)

- **File d'espacement** : 700 ms minimum entre deux appels reseau, quelle que
  soit l'origine (liste, fiche, formulaaire) — sous le seuil de limitation de
  debit d'OpenLibrary.
- **Cache persistant** : enrichissements sauvegardes dans localStorage via
  l'abstraction `secureStorage`, valides par Zod a la restauration. Un titre
  resolu ne genere plus jamais de requete, meme apres rechargement.
- **Deduplication en vol** : une seule promesse par titre partagee entre
  appelants simultanes.
- **Cache negatif** : echec memorise 60 s avant nouvelle tentative
  (indisponibilite passagere, degradation silencieuse conservee).

## Optimisation 2 — Rendu de la liste : memoisation des cellules

### Methode de mesure

React DevTools > Profiler, enregistrement pendant la frappe de 6 caracteres
dans la barre de recherche, liste de 20 cellules affichee. Compteur releve :
nombre de rendus de `BookCell` par frappe.

### Resultats

| Scenario                                | Sans memo            | Avec `memo(BookCell)`        |
| --------------------------------------- | -------------------- | ---------------------------- |
| Frappe d'un caractere dans la recherche | 20 rendus de cellule | 0 rendu de cellule           |
| Toggle favori sur une cellule           | 20 rendus            | 1 rendu (la cellule touchee) |

`BookCell` est enveloppe dans `React.memo` et recoit des callbacks stables :
la frappe dans la recherche (anti-rebond 300 ms) ne re-rend plus la grille,
conformement a l'exigence « aucun rendu superflu » du lot 2.
