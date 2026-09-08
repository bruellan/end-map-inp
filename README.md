# Page métier — test technique Product Engineer, Edumapper

Page métier mobile et éditeur de contenu, en Nuxt 4 / Vue 3 / TypeScript strict /
Tailwind v4.

| Route            | Rôle                                   |
| ---------------- | -------------------------------------- |
| `/`              | Liste des pages disponibles            |
| `/metiers/:slug` | Page métier, format mobile (402px)     |
| `/:slug/editor`  | Éditeur, atteint directement par l'URL |

Exemple : `/metiers/hotellerie-restauration-tourisme`.

## Lancer

```bash
bun install
bun run dev
```

Puis http://localhost:3000. `npm install && npm run dev` fonctionne à l'identique —
rien dans le projet ne dépend de Bun.

| Commande            |                              |
| ------------------- | ---------------------------- |
| `bun run dev`       | Serveur de développement     |
| `bun run build`     | Build de production          |
| `bun run typecheck` | `vue-tsc`, TypeScript strict |
| `bun run lint`      | ESLint                       |
| `bun run format`    | Prettier                     |

> **`typecheck` exige Node dans le `PATH`.** Lancé sous Bun seul, `vue-tsc` sort en
> succès après n'avoir vérifié que les fichiers `.ts` : le plugin de langage Vue ne
> s'accroche pas et les 38 fichiers `.vue` sont ignorés en silence. Un vert qui ne vérifie
> rien étant pire qu'un rouge, la commande n'est fiable qu'avec Node disponible.

## Choix techniques

### Le contenu est une liste de sections typées, pas une page

Le brief demande que la page tienne à 15 sections. Tout part de là.

Une page est une liste ordonnée de sections hétérogènes, décrite par une union
discriminée Zod sur le champ `type` (`shared/schemas/metier.ts`). Deux registres
associent chaque variante à un composant — un pour l'affichage, un pour l'édition :

```
app/components/metier/sectionRegistry.ts        type → composant de rendu
app/components/editor/sectionEditorRegistry.ts  type → composant de champs
```

Tous deux sont typés `Record<SectionType, Component>`. Ajouter une variante à l'union
sans l'enregistrer dans les deux **ne compile pas** :

```
sectionRegistry.ts(24,14): error TS2741: Property 'faq' is missing in type
'{ metierCards: any; about: any; … }' but required in type 'Record<"metierCards" | …>'
```

Une section ne peut donc pas devenir invisible ou non-modifiable par oubli. Ajouter la
15e, concrètement : un membre dans l'union, un composant d'affichage, un composant de
champs, un libellé. Ni la page ni l'éditeur ne changent.

**L'alternative écartée** : un modèle plat avec des champs optionnels
(`salaire?`, `temoignages?`…). Plus rapide à écrire, mais chaque section ajoutée
alourdit un objet que tout le monde doit connaître, et rien n'empêche un contenu
incohérent. Ici, une variante ne peut exister qu'entièrement formée.

Ce choix a été mis à l'épreuve : le contenu a d'abord été modélisé sur une hypothèse
fausse (fiche métier unique — salaire, études, débouchés). Le Figma montrait une page
filière. Les six variantes ont été remplacées sans toucher aux pages, aux composables,
au repository ni aux routes d'API.

### Zod comme source de vérité unique

Les types TypeScript sont **inférés** du schéma (`z.infer`), jamais écrits à la main.
Le même schéma valide ce que l'éditeur envoie et ce que le stockage renvoie.

La revalidation en lecture peut sembler redondante : elle ne l'est pas. Le JSON sur
disque est éditable à la main et survit aux évolutions du schéma. Mieux vaut une 500
explicite qu'un rendu cassé à mi-page — c'est d'ailleurs elle qui a rattrapé un vrai
défaut, `z.url()` refusant les chemins servis par l'app (`/images/fork.png`).

**L'alternative écartée** : des interfaces TypeScript et une validation manuelle aux
frontières. Les deux dérivent dès la première évolution, et la dérive ne se voit qu'au
runtime.

### Ce qui orchestre la donnée, séparé de ce qui l'affiche

- `server/utils/metier-repository.ts` — **seul** point qui lit et écrit du contenu.
  Les routes d'API valident et délèguent ; elles ignorent où la donnée est rangée.
- `app/composables/useMetier.ts`, `useMetierDraft.ts` — récupération, brouillon, suivi
  des modifications, réordonnancement, enregistrement.
- `app/components/**` — reçoivent leur contenu en props. **Aucun composant d'affichage
  n'appelle l'API.**

### Stockage : fichiers via unstorage

Driver `fs` d'`unstorage`, fourni par Nitro, monté sur `./.data/metiers`.

La donnée survit au rechargement et au redémarrage, les deux écrans la partagent
réellement, et il n'y a aucun service à provisionner. Changer de backend (Redis,
Vercel KV, S3) est une ligne dans `nuxt.config.ts` — le repository ne bouge pas.

**L'alternative écartée** : `localStorage`. Plus rapide à mettre en place, mais la
donnée n'est pas partagée entre appareils et le SSR ne peut pas la lire — la page
métier perdrait son rendu serveur, ce qui compte pour un lycéen en 4G.

**Les limites, assumées** : pas de gestion de concurrence (deux enregistrements
simultanés, le dernier gagne), et incompatible avec un système de fichiers en lecture
seule. Le contenu de départ est recopié à la première lecture puis plus jamais : le
seed ne réécrit pas par-dessus le travail de l'équipe. Pour repartir de zéro,
supprimer `.data/`.

### Design system : relevé sur le Figma et sur leur build

Deux sources, dans cet ordre. Le **Figma** via son API REST pour tout ce qui est
mesurable — espacements, rayons, rotations, et une échelle typographique aux
interlignes plus serrés que ceux d'Edumapper. Le **build de production
d'edumapper.com** pour le reste : couleurs, ombres, courbes, keyframes, sous leurs
noms d'origine, pour qu'un composant écrit ici se recolle chez eux sans renommage.

### Animations : Vue natif et CSS, aucune librairie

edumapper.com n'embarque aucune librairie d'animation. Ce projet non plus.

`<Transition>` et `<TransitionGroup>` pour les entrées, sorties et réordonnancements —
le déplacement d'une section dans l'éditeur utilise le FLIP natif. Les accordéons
animent `grid-template-rows` de `0fr` à `1fr`, donc sans mesurer de hauteur en JS. Le
scroll-reveal passe par `IntersectionObserver` (VueUse), la seule chose que Vue ne
fournit pas ; l'animation reste une keyframe CSS.

La mécanique d'en-tête utilise les **animations pilotées par le défilement**
(`animation-timeline: scroll()`) : le contenu suit le doigt, puis se bloque sous le
titre pendant que le panneau finit sa montée. En `transform`, jamais en `margin` —
redimensionner le document à chaque image alors que la longueur de défilement dépend
de cette hauteur ne se stabiliserait pas. Un `@supports` couvre les navigateurs sans
l'API : le titre y redevient solidaire de la page, moins joli mais rien n'est masqué.

**L'alternative écartée** : GSAP + ScrollTrigger, ou du JavaScript sur l'événement
`scroll`. Le premier ajoute une dépendance lourde pour un effet que le CSS sait faire
seul ; le second recalcule à chaque image sur le thread principal, ce qui se voit sur
mobile.

Deux détails invisibles mais qui comptent : le masquage avant révélation est
conditionné à une classe `.js` posée avant le premier rendu, donc la page reste
lisible sans JavaScript ; et `prefers-reduced-motion` est neutralisé par une seule
règle globale — possible précisément parce que tout passe par CSS.

### Emoji : les Fluent 3D de Microsoft, servis sans copie

La maquette utilise les Fluent Emoji **3D**, qui n'existent qu'en bitmap. Les jeux SVG
d'Iconify sont des variantes plates, visiblement différentes.

On utilise `@lobehub/assets-emoji` : 1605 WebP, **zéro dépendance**. Nitro le monte
directement depuis `node_modules` (`nitro.publicAssets`) — rien à versionner, rien à
resynchroniser, et seul ce dossier part dans le build.

**L'alternative écartée** : `@lobehub/fluent-emoji`, qui aurait tiré React 19,
react-dom, lucide-react et antd-style dans un projet Vue. C'est une bibliothèque de
composants React ; on ne garde que les assets qu'elle enveloppe.

### Où s'arrête le contenu, où commence la composition

Les illustrations du collage ont des positions et des rotations précises
(`x=-59 y=585 rot=7°`…). Le contenu ne dit que **quelles** images ; **où** elles vont
est une constante du composant.

**L'alternative écartée** : tout mettre dans le contenu. Le schéma deviendrait un
moteur de mise en page, et l'équipe éditoriale saisirait des degrés dans un CMS.

La limite est explicite : douze emplacements, d'où le `.max(12)` au schéma plutôt
qu'un silence à l'affichage. Une pièce peut en revanche porter un titre et un texte —
elle devient alors cliquable et ouvre un récit en plein écran, dans un `<dialog>`
natif dont on hérite le piège de focus, la fermeture par Échap et la couche
supérieure.

## Ce qui n'est pas fait

- **Les animations du Drive.** Le dossier n'a pas été fourni en local ; les animations
  reprennent les keyframes et les courbes du build d'edumapper.com. Cohérent avec leur
  design system, mais ce n'est pas la référence demandée.
- **Deux pictogrammes** ne sont pas les bons : celui de l'onglet « Les plus » et celui
  du bouton « Lire la suite ». Ils font 16 à 24px dans la maquette et n'ont pas pu être
  identifiés dans l'export.
- **La composition des cartes est simplifiée.** La maquette superpose jusqu'à trois
  éléments par carte ; le composant en rend deux, une photo et un objet.
- **Pas de tests automatisés.** Les parcours ont été vérifiés à la main, par API et sur
  le HTML rendu.
- **Le comportement au défilement n'a pas été observé en exécution.** L'environnement
  de vérification utilisé ici ne sait pas piloter le défilement, et les captures
  headless n'évaluent ni `IntersectionObserver` ni `requestAnimationFrame`. La
  géométrie et les états ont été mesurés, le mouvement non. C'est la première chose à
  regarder dans un vrai navigateur.
- L'éditeur permet de modifier, réordonner et masquer une section, mais **pas d'en
  créer ni d'en supprimer**.

## Avec deux jours de plus

1. **Tests** : Vitest sur le schéma et `useMetierDraft` (réordonnancement, détection de
   modifications), un test de composant par section, un Playwright sur le cycle
   édition → page — qui couvrirait au passage tout le comportement au défilement resté
   non vérifié.
2. **Ajout et suppression de sections** dans l'éditeur, glisser-déposer en complément
   des flèches, annuler/rétablir, aperçu mobile côte à côte.
3. **Écriture concurrente** : comparer `updatedAt` à l'enregistrement et refuser un
   écrasement silencieux, puis un historique des révisions — `unstorage` le rend
   simple, une clé par version.
4. **Finir la fidélité** : les deux pictogrammes, la composition complète des cartes,
   et les animations une fois les références disponibles.
5. **Contenu riche** : les textes sont du brut, sans `v-html`, donc pas de XSS ouverte
   par l'éditeur. Pour du gras et des liens il faudra un format structuré et un rendu
   par nœud, pas du HTML libre.
