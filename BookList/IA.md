# IA.md — Usage de l'assistant IA

Fonctionnalite choisie : **enrichissement bibliographique OpenLibrary avec couverture de secours dans la liste, la fiche et le formulaire** (lot 3). Code genere puis corrige : `services/api/openLibraryApi.ts`, `hooks/useOpenLibrary.ts`, `components/books/BookCell.tsx`, `components/books/BookForm.tsx`.

## Le prompt exact

> « open library fonctionne mais la cover s'affiche que dans les détails et je la voulait dans la list aussi »

puis, pour le formulaire :

> « mes covers open library s'affiche pas dnas le form non plus »

L'IA a propose d'appeler le hook `useOpenLibrary` dans chaque cellule de la liste (uniquement si le livre n'a pas de couverture locale) et de passer `enrichment?.coverUrl` en `fallbackUri` au composant `BookCover`, en s'appuyant sur le cache et l'anti-rebond existants.

## Quatre defauts releves dans le resultat

### 1. `<button>` imbrique dans un `<button>` (DOM invalide, erreur d'hydratation)

La cellule entiere etait un `Pressable` avec `accessibilityRole="button"`, et le code genere y a laisse le `FavoriteButton` (lui-meme un bouton). Sur la cible web, cela produit un `<button>` dans un `<button>` : HTML invalide, erreur d'hydratation React, et surtout un piege d'accessibilite — le lecteur d'ecran ne peut pas distinguer « ouvrir la fiche » de « mettre en favori ».

**Correction** : le `FavoriteButton` est sorti du `Pressable` et positionne en overlay comme frere dans la cellule (`BookCell.tsx`). Deux boutons freres, deux actions distinctes au clavier et au lecteur d'ecran.

### 2. Aucune memorisation des echecs ni deduplication des appels en vol

Le cache genere ne memorisait que les succes. Quand OpenLibrary est injoignable (constate en boutique : `ERR_CONNECTION_TIMED_OUT`, puis blocage CORS par limitation de debit), chaque cellule refaisait sa requete a chaque montage : tempete de requetes vouees a l'echec, chacune attendant son timeout de 5 s, jusqu'a faire bloquer notre IP par OpenLibrary. Deux appels simultanes pour un meme titre partaient aussi en double, le cache n'etant rempli qu'apres la reponse.

**Correction** (`openLibraryApi.ts`) : les echecs sont memorises avec un TTL de 60 s (on retente ensuite, l'indisponibilite est passagere), et une map des promesses en vol garantit un seul appel reseau par titre a la fois. La degradation reste silencieuse : la fiche ne casse jamais, conformement au sujet.

### 3. Etat obsolete quand le titre change ou devient vide

Dans `useOpenLibrary`, l'effet genere faisait `if (!debouncedTitre) return;` : en vidant le champ titre du formulaire, l'enrichissement du titre precedent restait en memoire et l'apercu affichait la couverture d'un autre livre. Une premiere correction par `setEnrichment(null)` dans l'effet a ete rejetee par ESLint (`react-hooks/set-state-in-effect` : setState synchrone dans un effet = rendus en cascade).

**Correction** (`useOpenLibrary.ts`) : le resultat est memorise **avec le titre qui l'a produit**, et l'enrichissement est derive au rendu (`lastResult.titre === debouncedTitre ? … : null`). Aucun setState synchrone, et un titre vide ou change n'affiche jamais le resultat precedent, y compris pendant l'anti-rebond.

### 4. Defaut d'architecture : un appel OpenLibrary par cellule de liste

Le defaut le plus grave n'etait pas dans une ligne mais dans le placement de l'appel : l'IA a repondu litteralement a la demande (« la cover dans la liste aussi ») en mettant `useOpenLibrary` dans chaque `BookCell`. Consequence mesuree : ~20 requetes simultanees par page de liste (tout le fonds a `couverture: null`), jusqu'a 500 sur un defilement complet, rejouees a chaque rechargement (cache en memoire). OpenLibrary limite le debit par IP : notre adresse s'est fait bloquer (reponses sans en-tete CORS, puis timeouts), ce qu'on a d'abord pris pour une instabilite du site.

**Correction** (`coverServiceImpl.ts`, `BookCover.tsx`, `BookCell.tsx`) : la liste n'appelle plus jamais OpenLibrary. Le repli `/covers/<id>.svg` decrit par l'annexe du sujet s'est revele absent de l'API livree (404 systematique, signale au formateur) : le repli est donc entierement local — un placeholder aux initiales du titre, aux couleurs du theme, jamais d'image cassee et zero reseau. OpenLibrary est reserve a l'ouverture d'une fiche (ce que demande le lot 3) : au plus une requete par fiche, avec cache et anti-rebond. La lecon : l'IA optimise pour satisfaire la demande formulee, pas pour questionner son cout — c'etait a nous de reperer que la bonne reponse etait un repli local, pas un service externe.

## Ce que j'en retiens

Le code genere « marchait » en demo mais echouait sur les conditions reelles du terrain : reseau indisponible, limitation de debit, montages repetes de cellules, champ vide. Ces defauts d'ingenierie (DOM/a11y, absence de cache negatif et de deduplication, etat obsolete, appels externes non maitrises) sont invisibles tant qu'on ne teste pas en mode degrade — precisement le mode de la recette.
