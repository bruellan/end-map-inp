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

- **Deux pictogrammes ne sont pas les bons** : celui de l'onglet « Les plus » et
  celui du bouton « Lire la suite ». Ils font 16 à 24px dans la maquette et n'ont
  pas pu être identifiés dans l'export ; ce sont des approximations.
- **La composition des cartes est simplifiée.** La maquette superpose jusqu'à trois
  éléments par carte (vignette photo + un ou deux objets, chacun avec sa rotation) ;
  le composant en rend deux, une photo et un objet.
- Le carrousel de fin **avance mais ne se fait pas glisser à la souris** : le geste
  est capté au pointeur, donc au doigt et au trackpad, pas en cliquer-déposer.
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

### L'en-tête : trois calques et un défilement absorbé

L'en-tête n'est pas un bloc mais trois éléments qui s'intercalent dans l'empilement,
`fond (z 0) < panneau (z 10) < titre (z 20)`. C'est ce qui permet au panneau de
recouvrir le collage en remontant tout en passant sous le titre, qui reste lisible en
haut. Leurs hauteurs vivent ensemble dans `app/assets/css/hero.css` : trois éléments
répartis dans deux composants doivent s'accorder au pixel.

Le bloc de titre n'a pas de fond à lui : un fond opaque trancherait le collage net à
sa hauteur et recouvrirait le bord arrondi du panneau qui remonte. Il en gagne un,
porté par un pseudo-élément, seulement une fois le panneau arrivé en haut — quand le
titre passe au-dessus du contenu blanc et a besoin d'un fond pour rester lisible. Ce
fond cale son `background-size` sur la hauteur de l'en-tête, comme le calque du fond :
les deux étant ancrés en haut, ils se superposent exactement et la jointure ne se voit
pas.

Un piège à connaître avant de toucher au layout : `position: sticky` est neutralisé
par le moindre ancêtre en `overflow: hidden`, qui en fait un conteneur de défilement.
Le conteneur mobile et le `body` en avaient un, et l'en-tête remontait avec la page
sans que rien ne le signale. Les deux sont passés en `overflow: clip`, qui rogne sans
créer ce conteneur.

La remontée absorbe une partie du défilement : le contenu est translaté vers le bas
d'une hauteur de titre pendant que le bord du panneau, lui, monte jusqu'en haut. À
l'arrivée le panneau touche le bord de l'écran et le contenu s'arrête juste sous le
titre — translater de la course entière figerait le contenu et ouvrirait un vide de
cette hauteur. C'est une animation pilotée par le défilement
(`animation-timeline: scroll()`), en `transform` et non en `margin` — redimensionner
le document à chaque image alors que la longueur de défilement dépend de cette
hauteur ne se stabiliserait pas. Là où l'API n'existe pas, un `@supports` rend le
titre solidaire de la page : moins joli, mais rien n'est masqué.

### Les pièces du collage qui racontent quelque chose

Une pièce du collage de fin porte éventuellement un titre et un texte. Renseignés,
elle devient cliquable et ouvre un récit en plein écran ; laissés vides, elle reste
purement décorative. Ce sont deux rendus distincts et non un bouton désactivé : un
décor n'a rien à faire dans l'ordre de tabulation, et un lecteur d'écran ne doit pas
l'annoncer.

Le récit s'ouvre dans un `<dialog>` natif. Le piège de focus, la fermeture par Échap
et la couche supérieure viennent avec l'élément — les réimplémenter correctement à la
main coûte bien plus cher que de s'y plier.

L'en-tête, lui, ne stocke que des URL : ses illustrations sont décoratives par
nature. La conversion se fait dans le composant d'en-tête plutôt qu'en élargissant le
contrat du collage à deux formes d'entrée.

### Le bloc de fin, ou pourquoi les pourcentages mentent

Trois pièges s'y sont succédé, tous liés au repère de référence.

Les positions du collage étaient d'abord exprimées dans le repère du bloc entier
(430x932) alors que notre bloc est plus court : tout se retrouvait écrasé
verticalement. Elles sont maintenant exprimées dans le repère du **groupe
d'images** (542x402), reproduit à l'identique par une couche en `aspect-ratio` —
les pourcentages tombent juste quelle que soit la largeur d'écran.

Le débord vertical passait par `bottom: -22.6%`. En CSS, un pourcentage sur
`bottom` se calcule sur la hauteur du **conteneur**, pas de l'élément : la couche
descendait deux fois trop bas et la moitié du collage disparaissait. C'est
`translate-y` qui fait le travail, lui relatif à l'élément.

Enfin l'ordre de peinture : Figma liste les enfants du premier plan vers l'arrière,
le DOM fait l'inverse. Sans `zIndex` décroissant, l'herbe recouvrait le personnage
qu'elle doit encadrer.

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

Un relevé à refaire si vous reprenez le fichier : en auto-layout avec retour à la
ligne, Figma expose **deux** espacements — `itemSpacing` pour l'axe principal et
`counterAxisSpacing` pour l'autre. Ma première extraction n'a lu que le premier, et
les deux grilles se sont retrouvées avec 16px verticalement au lieu de 40 (cartes
métier) et 32 (chiffres clés).

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
- Le carrousel de fin avance seul toutes les 5 secondes, et le point actif _est_ la
  minuterie : une barre qui se remplit sur la durée. Le remontage est forcé par une
  clé plutôt que par une remise à zéro manuelle. Il se met en pause au survol, au
  toucher et au focus clavier, et ne démarre pas si `prefers-reduced-motion` est
  actif — un carrousel qui bouge pendant qu'on le lit est une gêne, et une cible
  qui se dérobe sous le doigt en est une autre.

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

## Ce que je n'ai pas pu vérifier

Les captures headless m'ont servi à comparer le rendu à la maquette, mais elles ont
deux angles morts qu'il faut connaître avant de se fier à ce document :

- **`--dump-dom` ne peint pas**, donc `IntersectionObserver` ne se déclenche jamais :
  tout ce qui dépend du scroll-reveal y apparaît figé sur `pending`. Seules les
  captures d'écran, qui forcent un rendu, disent la vérité sur ce point.
- **`--virtual-time-budget` supprime `requestAnimationFrame`**, dont dépend
  `<Transition>` pour passer de `-from` à `-to`. Les transitions Vue restent bloquées
  et l'élément sortant n'est jamais retiré. En navigateur réel le cycle se termine
  normalement, mais je n'ai pas pu l'observer ici.

Concrètement : le glissement entre cartes et le déclenchement de l'entrée du collage
sont corrects en lecture de code, pas vérifiés à l'exécution. À regarder en premier
dans un vrai navigateur.

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

1. **Confirmer les deux pictogrammes non identifiés** et compléter la composition
   des cartes métier.
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
