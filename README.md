# Page métier — test technique Product Engineer, Edumapper

Page métier mobile + éditeur de contenu, en Nuxt 4 / Vue 3 / TypeScript strict / Tailwind v4.

| Route            | Rôle                          |
| ---------------- | ----------------------------- |
| `/`              | Liste des métiers disponibles |
| `/metiers/:slug` | Page métier, format mobile    |
| `/:slug/editor`  | Éditeur de contenu            |

Exemple : [`/metiers/developpeur-web`](http://localhost:3000/metiers/developpeur-web) et
[`/developpeur-web/editor`](http://localhost:3000/developpeur-web/editor).

## Lancer

```bash
bun install
bun run dev
```

Puis http://localhost:3000.

> Node n'était pas installé sur la machine de dev, seul Bun 1.4.2. Le projet n'a
> aucune dépendance à Bun : `npm install && npm run dev` fonctionne à l'identique.

Autres commandes :

```bash
bun run typecheck   # vue-tsc, TypeScript strict
bun run lint        # ESLint (config @nuxt/eslint)
bun run build       # build de production
```

## État de la livraison

À lire en premier — ce qui est fait, ce qui ne l'est pas.

**Fait**

- Architecture de contenu extensible, page métier rendue au SSR, éditeur complet
  (textes, champs, ordre, visibilité), persistance, validation bout en bout.
- Cinq sections : description, études, salaire, débouchés, témoignages.
- Design system Edumapper repris depuis leur build de production (voir plus bas).

**Pas fait**

- **La fidélité au Figma n'est pas faite.** Le fichier Figma renvoie un 403 sans
  authentification, et le dossier Drive des animations redirige vers la page de
  login Google. Les espacements, tailles et couleurs actuels viennent des tokens
  d'edumapper.com, pas de la maquette : c'est cohérent avec leur design system,
  mais ce n'est pas la maquette. C'est le premier écart à corriger, et c'est aussi
  le premier critère d'évaluation — autant le dire franchement.
- **Les animations ne sont pas celles du Drive.** Elles reprennent les keyframes et
  les courbes du build Edumapper, pas les références fournies.
- Le contenu de départ (`server/data/seed.ts`) est une copie provisoire écrite pour
  faire tourner les cinq sections, pas le contenu de la maquette.
- Pas de tests automatisés. Les parcours ont été vérifiés à la main (voir
  « Ce qui a été vérifié »).

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

Les deux sont typés `Record<SectionType, Component>`. Ajouter une section à l'union
sans l'enregistrer dans les deux **ne compile pas**. Une section ne peut donc pas
devenir invisible ou non-éditable par oubli.

Ajouter la 15e section, concrètement : un membre dans l'union, un composant
d'affichage, un composant de champs, un libellé. Ni `pages/metiers/[slug].vue` ni
`pages/[slug]/editor.vue` ne changent — ils itèrent sur la liste et délèguent.

### Zod comme source de vérité unique

Les types TypeScript sont **inférés** du schéma (`z.infer`), jamais écrits à la main.
Le même schéma valide ce que l'éditeur envoie et ce que le stockage renvoie. Un
contenu qui ne passe pas la validation ne peut pas atteindre le rendu.

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

`useMetierDraft` porte toute la logique d'édition : la page `editor.vue` ne fait
qu'orchestrer et rendre.

### Stockage : fichiers via unstorage

Driver `fs` de `unstorage` (fourni par Nitro), monté sur `./.data/metiers`
(`nuxt.config.ts`).

**Pourquoi** : la donnée survit au rechargement et au redémarrage, les deux écrans la
partagent réellement, et il n'y a aucun service à provisionner. `localStorage` aurait
été plus rapide mais la donnée ne serait pas partagée entre appareils et le SSR ne
pourrait pas la lire — la page métier perdrait son rendu serveur, ce qui compte pour
un lycéen en 4G.

**Le compromis** : passer le driver à Redis, Vercel KV ou S3 est un changement de
configuration, pas de code — le repository ne bouge pas. En l'état ce n'est en
revanche pas concurrent-safe (deux enregistrements simultanés, le dernier gagne) et
ça ne marche pas sur un système de fichiers en lecture seule.

Le contenu de départ est recopié dans le stockage à la première lecture, puis plus
jamais : le seed ne réécrit pas par-dessus le travail de l'équipe. Pour repartir de
zéro, supprimer `.data/`.

### Design system

Le Figma étant inaccessible, les tokens ont été relevés sur le **build de production
d'edumapper.com** (Nuxt + Tailwind v4, comme ici) : `app/assets/css/theme.css` reprend
leurs couleurs, rayons, ombres, échelle typographique et courbes d'animation sous
leurs noms d'origine. Un composant écrit ici se recolle dans leur codebase sans
renommage. Police : DM Sans, self-hostée par `@nuxt/fonts` — leur mécanisme exact.

### Animations : rien d'autre que Vue et CSS

edumapper.com n'embarque aucune librairie d'animation. Ce projet non plus.

- `<Transition>` / `<TransitionGroup>` pour les entrées, sorties et réordonnancements.
  Le déplacement d'une section dans l'éditeur utilise l'animation **FLIP** native de
  `<TransitionGroup>` : Vue mesure les positions avant/après et anime le delta.
- Les `@keyframes` d'Edumapper, exposées en tokens `--animate-*`.
- `RevealOnScroll` (IntersectionObserver via VueUse) pour le scroll-reveal — la seule
  chose que Vue ne fournit pas nativement. L'animation reste une keyframe CSS.

Deux détails qui ne se voient pas mais qui comptent :

- Le masquage avant révélation est conditionné à une classe `.js` posée en `<head>`
  avant le premier rendu. Sans JavaScript, ou avant hydratation, la page reste
  lisible au lieu d'afficher du vide.
- `prefers-reduced-motion` est neutralisé par une seule règle globale — possible
  précisément parce que tout passe par CSS.

## Ce qui a été vérifié

À la main, via l'API et le HTML rendu :

- `bun run typecheck` et `bun run lint` passent.
- Les 5 sections sont présentes dans le HTML **rendu au serveur** (pas seulement
  après hydratation).
- Cycle complet : modification du titre, réordonnancement, masquage d'une section →
  `PUT` 200 → la page reflète les trois changements → persisté sur disque.
- Payload invalide → 422 avec le détail des champs fautifs.
- Slug inconnu → 404 sur l'API comme sur la page.

## Avec deux jours de plus

Dans cet ordre.

1. **Reprendre la maquette au pixel**, une fois le Figma accessible, et caler les
   animations sur les références du Drive. C'est le vrai reste à faire.
2. **Tests** : Vitest sur le schéma et `useMetierDraft` (réordonnancement, détection
   de modifications), un test de composant par section, un Playwright sur le cycle
   édition → page.
3. **Éditeur** : ajout et suppression de sections (aujourd'hui on modifie, réordonne
   et masque, mais on ne crée pas), glisser-déposer en complément des flèches,
   annuler/rétablir, aperçu mobile côte à côte.
4. **Robustesse** : écriture optimiste-concurrente (comparer `updatedAt` à
   l'enregistrement, refuser un écrasement), et historique des révisions —
   `unstorage` le rend simple, une clé par version.
5. **Produit** : sommaire ancré sur les sections, partage, métier suivant en fin de
   page, `@nuxt/image` sur les couvertures et avatars.
6. **Contenu** : le champ `richText` est du texte brut découpé en paragraphes — pas de
   `v-html`, donc pas de XSS ouverte par l'éditeur. Pour du gras et des liens il
   faudra un format structuré et un rendu par nœud, pas du HTML libre.
