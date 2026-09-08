# Page métier — test technique Product Engineer, Edumapper

Page métier mobile + éditeur de contenu, en Nuxt 4 / Vue 3 / TypeScript strict / Tailwind v4.

| Route            | Rôle                        |
| ---------------- | --------------------------- |
| `/`              | Liste des pages disponibles |
| `/metiers/:slug` | Page métier, format mobile  |
| `/:slug/editor`  | Éditeur de contenu          |

Exemple : `/metiers/hotellerie-restauration-tourisme` et
`/hotellerie-restauration-tourisme/editor`.

## Lancer

```bash
bun install
bun run dev
```

Puis http://localhost:3000.

Autres commandes :

```bash
bun run typecheck   # vue-tsc, TypeScript strict
bun run lint        # ESLint
bun run build       # build de production
```

> **`typecheck` exige Node dans le PATH.** Bun suffit pour tout le reste, mais
> `vue-tsc` lancé sous Bun **ignore silencieusement les fichiers `.vue`** : il sort
> en succès après n'avoir vérifié que les `.ts`. Détaillé plus bas — c'est un piège
> coûteux. `npm install && npm run dev` fonctionne à l'identique.

## État de la livraison

À lire en premier — ce qui est fait, ce qui ne l'est pas.

**Fait**

- Les 7 blocs de la maquette : barre de navigation, cartes métier, à propos,
  chiffres clés, questions fréquentes, pour/contre, encart quiz, carrousel de
  conseils. Textes, espacements, couleurs et typographie relevés sur le Figma via
  l'API REST, pas estimés à l'œil.
- Architecture de contenu extensible, page rendue au SSR, éditeur complet
  (textes, champs, ordre, visibilité, séparateurs), persistance, validation
  bout en bout.
- Rendu comparé à la maquette par capture headless, section par section.

**Pas fait**

- **Quatre détails ne correspondent pas encore.** Les photos des cartes « Gestion
  Hôtelière » et « Service & Accueil » sont des suppositions : l'export Figma livre
  31 visuels sans indiquer lequel va où, et le cadre photo est vide dans le fichier
  que l'API renvoie. Le pictogramme de l'onglet « Les plus » et celui du bouton
  « Lire la suite » n'ont pas pu être identifiés non plus. Enfin le bandeau
  illustré en bas de page (collage dégradé) n'est pas repris.
- **La composition des cartes est simplifiée.** La maquette superpose jusqu'à trois
  éléments par carte (vignette photo + un ou deux objets, chacun avec sa rotation) ;
  le composant en rend deux, une photo et un objet.
- **Les animations ne sont pas celles du Drive.** Le dossier n'a pas été fourni en
  local. Elles reprennent les keyframes et les courbes du build de production
  d'edumapper.com — cohérent avec leur design system, mais ce n'est pas la référence
  demandée.
- Deux contenus manquent parce qu'ils ne sont pas dans la maquette : les réponses
  des accordéons (repliés dans le Figma) et l'onglet « Les moins » (vide). Les
  champs existent et sont éditables.
- Pas de tests automatisés. Les parcours ont été vérifiés à la main.

## Choix techniques

### Le modèle de contenu avant tout le reste

Le brief demande que la page tienne à 15 sections. Tout part de là.

Une page est une **liste ordonnée de sections hétérogènes**, décrite par une union
discriminée Zod sur le champ `type` (`shared/schemas/metier.ts`). Deux registres
exhaustifs associent chaque variante à un composant :

| Registre  | Fichier                                          | Rôle                         |
| --------- | ------------------------------------------------ | ---------------------------- |
| Affichage | `app/components/metier/sectionRegistry.ts`       | `type` → composant de rendu  |
| Édition   | `app/components/editor/sectionEditorRegistry.ts` | `type` → composant de champs |

Les deux sont typés `Record<SectionType, Component>`. Ajouter une variante à l'union
sans l'enregistrer dans les deux **ne compile pas** :

```
sectionRegistry.ts(24,14): error TS2741: Property 'faq' is missing in type
'{ metierCards: any; about: any; ... }' but required in type 'Record<"metierCards" | ...>'
```

Vérifié en cassant volontairement le registre, pas supposé. Une section ne peut donc
pas devenir invisible ou non-éditable par oubli.

Ajouter la 15e section, concrètement : un membre dans l'union, un composant
d'affichage, un composant de champs, un libellé. Ni `pages/metiers/[slug].vue` ni
`pages/[slug]/editor.vue` ne changent — ils itèrent sur la liste et délèguent.

**Ce choix a été mis à l'épreuve en cours de route.** Le contenu a d'abord été
modélisé sur une hypothèse fausse (une fiche métier unique : salaire, études,
débouchés, témoignages). Le Figma montrait autre chose : une page filière avec
cartes, accordéons et onglets. Les six variantes ont été remplacées sans toucher aux
pages, aux composables, au repository ni aux routes d'API. C'est exactement ce que
l'architecture devait permettre.

### Zod comme source de vérité unique

Les types TypeScript sont **inférés** du schéma (`z.infer`), jamais écrits à la main.
Le même schéma valide ce que l'éditeur envoie et ce que le stockage renvoie.

La revalidation en lecture peut sembler redondante — elle ne l'est pas : le JSON sur
disque est éditable à la main et survit aux évolutions du schéma. Mieux vaut une 500
explicite qu'un rendu cassé à mi-page.

### Séparation données / affichage

- `server/utils/metier-repository.ts` — **seul** point qui lit et écrit du contenu.
  Les routes d'API valident et délèguent ; elles ignorent où la donnée est rangée.
- `app/composables/useMetier.ts`, `useMetierDraft.ts` — récupération, brouillon,
  suivi des modifications, réordonnancement, enregistrement.
- `app/components/**` — reçoivent leur contenu en props. **Aucun composant
  d'affichage n'appelle l'API.**

### Stockage : fichiers via unstorage

Driver `fs` de `unstorage` (fourni par Nitro), monté sur `./.data/metiers`.

**Pourquoi** : la donnée survit au rechargement et au redémarrage, les deux écrans la
partagent réellement, et il n'y a aucun service à provisionner. `localStorage` aurait
été plus rapide mais la donnée ne serait pas partagée entre appareils et le SSR ne
pourrait pas la lire — la page perdrait son rendu serveur, ce qui compte pour un
lycéen en 4G.

**Le compromis** : passer à Redis, Vercel KV ou S3 est un changement de configuration,
pas de code. En l'état ce n'est pas concurrent-safe (deux enregistrements simultanés,
le dernier gagne) et ça ne marche pas sur un système de fichiers en lecture seule.

Le contenu de départ est recopié dans le stockage à la première lecture, puis plus
jamais : le seed ne réécrit pas par-dessus le travail de l'équipe. Pour repartir de
zéro, supprimer `.data/`.

### Où s'arrête le contenu, où commence la composition

La maquette place les visuels décoratifs de l'encart quiz à des coordonnées et des
rotations précises (`x=-39 y=53 rot=30°`…). Deux façons de le modéliser :

- tout mettre dans le contenu — chaque image porte sa position et sa rotation. Le
  schéma devient un moteur de mise en page, et l'équipe éditoriale se retrouve à
  saisir des degrés dans un CMS.
- ne mettre dans le contenu que **quelles** images, et fixer **où** elles vont dans
  le composant.

C'est la seconde qui est retenue : `decorations: string[]` avec `.max(4)`, et une
constante `SLOTS` côté composant. Même logique pour l'inclinaison alternée des
aperçus vidéo dans les cartes métier, déduite du rang et non stockée.

La limite est assumée : une cinquième image décorative n'aurait pas de place définie,
d'où le `.max(4)` dans le schéma plutôt qu'un silence à l'affichage.

### Emoji : Fluent 3D, servis sans copie

La maquette utilise les Fluent Emoji **3D** de Microsoft. Ils n'existent qu'en
bitmap — les jeux SVG d'Iconify (`fluent-emoji`, `-flat`, `-high-contrast`) sont des
variantes plates, visiblement différentes.

Le paquet `@lobehub/fluent-emoji` aurait tiré React 19, react-dom, lucide-react et
antd-style dans un projet Vue : c'est une bibliothèque de composants React. On
utilise `@lobehub/assets-emoji`, le paquet d'assets qu'elle enveloppe — 1605 WebP,
**zéro dépendance**.

Il n'est pas recopié dans `public/` : Nitro le monte directement depuis
`node_modules` (`nitro.publicAssets`). Rien à versionner, rien à resynchroniser, et
seul ce dossier part dans le build. Le chemin est obtenu par résolution du paquet,
pas en dur — un chemin relatif serait résolu depuis `srcDir` (`app/`), et un chemin
figé casserait avec le hoisting de pnpm.

Le contenu stocke le nom CLDR (`money-bag`), et l'éditeur affiche l'aperçu à côté du
champ : un nom inconnu se voit immédiatement, sans ouvrir la page.

### Design system

Deux sources, dans cet ordre :

1. **Le Figma**, pour tout ce qui est mesurable — page 402, gouttière 16, hero en
   retrait supplémentaire de 24, séparateurs pleine largeur (430), grille de cartes
   à 2 colonnes, rayons 8/16/24/32, et une échelle typographique aux interlignes plus
   serrés que ceux d'Edumapper (24/30 contre 24/32, 16/22 contre 16/24). Ces tokens
   sont nommés séparément dans `theme.css` pour ne pas écraser les leurs.
2. **Le build de production d'edumapper.com** pour le reste : couleurs, ombres,
   courbes, keyframes, sous leurs noms d'origine. Un composant écrit ici se recolle
   dans leur codebase sans renommage. Police DM Sans, self-hostée par `@nuxt/fonts` —
   leur mécanisme exact.

### Animations : rien d'autre que Vue et CSS

edumapper.com n'embarque aucune librairie d'animation. Ce projet non plus.

- `<Transition>` / `<TransitionGroup>` pour les entrées, sorties et réordonnancements.
  Le déplacement d'une section dans l'éditeur utilise l'animation **FLIP** native de
  `<TransitionGroup>` : Vue mesure les positions avant/après et anime le delta.
- Les accordéons et le repli de champs animent `grid-template-rows` de `0fr` à `1fr` :
  la hauteur réelle du panneau n'a jamais besoin d'être mesurée en JS.
- `RevealOnScroll` (IntersectionObserver via VueUse) pour le scroll-reveal — la seule
  chose que Vue ne fournit pas nativement. L'animation reste une keyframe CSS.

Deux détails qui ne se voient pas mais qui comptent :

- Le masquage avant révélation est conditionné à une classe `.js` posée en `<head>`
  avant le premier rendu. Sans JavaScript, ou avant hydratation, la page reste
  lisible au lieu d'afficher du vide.
- `prefers-reduced-motion` est neutralisé par une seule règle globale — possible
  précisément parce que tout passe par CSS.

### Le piège vue-tsc / Bun

Node n'était pas dans le PATH au démarrage. Sous Bun seul, `bun run typecheck`
**sortait en succès sans vérifier un seul fichier `.vue`** : le plugin de langage Vue
ne s'accroche pas, `vue-tsc --listFiles` ne remontait que 5 fichiers `.ts` sur 34.
Une erreur grossière injectée dans un composant passait inaperçue.

Avec Node dans le PATH : 29 `.vue` vérifiés, et une vraie erreur trouvée
immédiatement — `useFetch` rend `Ref<T | undefined>` là où `useMetierDraft` attendait
`Ref<T | null>`.

C'est noté ici parce qu'un vert qui ne vérifie rien est pire qu'un rouge.

## Ce qui a été vérifié

À la main, via l'API et le HTML rendu :

- `typecheck` (0 erreur, 29 `.vue` inclus) et `lint` passent, et restent verts après
  `format` — Prettier et ESLint ne se contredisent pas.
- Les sections sont dans le HTML **rendu au serveur**, pas seulement après
  hydratation : 3 titres, 3 séparateurs, les 4 chiffres clés, aucun warning SSR.
- Cycle complet : modification du titre, réordonnancement, masquage d'une section →
  `PUT` 200 → la page reflète les trois changements → persisté sur disque.
- Payload invalide → 422 avec le détail des champs fautifs. Slug inconnu → 404 sur
  l'API comme sur la page.
- La validation a attrapé une vraie erreur en cours de route : les chemins d'images
  servis par l'app (`/images/fork.png`) ne passent pas `z.url()`, qui exige une URL
  absolue. D'où `imageRefSchema`, qui accepte les deux formes.
- Exhaustivité des registres → erreur de compilation (test destructif, cf. plus haut).

## Avec deux jours de plus

Dans cet ordre.

1. **Confirmer les quatre détails non identifiés** (deux photos de cartes, deux
   pictogrammes) et reprendre le bandeau illustré de fin de page.
2. **Les animations du Drive**, une fois les références disponibles.
3. **Tests** : Vitest sur le schéma et `useMetierDraft` (réordonnancement, détection
   de modifications), un test de composant par section, un Playwright sur le cycle
   édition → page.
4. **Éditeur** : ajout et suppression de sections (aujourd'hui on modifie, réordonne
   et masque, mais on ne crée pas), glisser-déposer en complément des flèches,
   annuler/rétablir, aperçu mobile côte à côte.
5. **Robustesse** : écriture optimiste-concurrente (comparer `updatedAt` à
   l'enregistrement, refuser un écrasement), et historique des révisions —
   `unstorage` le rend simple, une clé par version.
6. **Contenu** : les textes sont du brut, sans `v-html`, donc pas de XSS ouverte par
   l'éditeur. Pour du gras et des liens il faudra un format structuré et un rendu par
   nœud, pas du HTML libre.
