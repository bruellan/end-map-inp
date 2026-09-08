import { z } from 'zod'

/**
 * Modèle de contenu d'une page métier.
 *
 * Zod est la source de vérité unique : les types TypeScript en sont
 * inférés (`z.infer`), et le même schéma valide ce qu'écrit l'éditeur
 * côté serveur. Pas de type déclaré à la main qui pourrait diverger du
 * runtime.
 *
 * Une page est une liste ordonnée de sections hétérogènes. Chaque
 * variante est un membre d'une union discriminée sur `type`, ce qui
 * donne deux garanties :
 *
 *   1. le narrowing TypeScript est exhaustif — oublier de gérer une
 *      variante est une erreur de compilation, pas un bug au runtime ;
 *   2. ajouter la 15e section, c'est ajouter un membre ici, un composant
 *      d'affichage et un composant d'édition. Ni la page ni l'éditeur ne
 *      changent.
 *
 * Les variantes correspondent aux blocs de la maquette Figma
 * « PE - Test » (node 1-262).
 */

/* ── Briques réutilisées ──────────────────────────────────────────── */

/**
 * Référence d'image : URL absolue (`https://…`) ou chemin servi par
 * l'application (`/images/…`). La chaîne vide signifie « aucune image »,
 * et non « champ manquant » — c'est un état valide que l'éditeur produit
 * en vidant le champ.
 */
const imageRefSchema = z.union([
  z.url(),
  z.string().regex(/^\/[^\s]*$/, 'Chemin absolu depuis la racine du site'),
  z.literal(''),
])

/* ── Enveloppe commune ────────────────────────────────────────────── */

/**
 * Champs portés par toutes les sections.
 *
 * `id` est stable et généré à la création : il sert de clé de rendu, de
 * cible pour le réordonnancement et d'ancre de navigation. On ne se sert
 * jamais de l'index dans le tableau, qui change dès qu'on réordonne.
 */
const sectionBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  /** Permet à l'équipe de retirer une section sans perdre son contenu. */
  visible: z.boolean(),
  /**
   * Trait pleine largeur sous la section. Dans la maquette il ne suit
   * pas toutes les sections — c'est un choix éditorial, donc un champ,
   * pas une règle de mise en page.
   */
  separatorAfter: z.boolean(),
})

/* ── Variantes de section ─────────────────────────────────────────── */

/** Grille de cartes métier (bloc « Sections » de la maquette). */
const metierCardsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('metierCards'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string(),
      imageUrl: imageRefSchema,
    }),
  ),
})

/** Texte de présentation repliable (bloc « À propos »). */
const aboutSectionSchema = sectionBaseSchema.extend({
  type: z.literal('about'),
  body: z.string(),
  /** Libellé du bouton de dépliage. Vide = texte affiché en entier. */
  expandLabel: z.string(),
})

/** Chiffres clés en grille (bloc « Statistics »). */
const statisticsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('statistics'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      /** Déjà formaté : « 2 000 € », « 1,3 million ». */
      value: z.string(),
      label: z.string(),
      icon: z.string(),
    }),
  ),
})

/** Questions fréquentes en accordéon (bloc « Bon à savoir »). */
const faqSectionSchema = sectionBaseSchema.extend({
  type: z.literal('faq'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      question: z.string(),
      answer: z.string(),
      icon: z.string(),
    }),
  ),
})

/** Onglets pour et contre (bloc « Le métier sans filtre »). */
const prosConsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('prosCons'),
  tabs: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string(),
      icon: z.string(),
      entries: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string(),
          body: z.string(),
        }),
      ),
    }),
  ),
})

/** Encart d'appel à l'action (bloc « Quiz »). */
const quizCtaSectionSchema = sectionBaseSchema.extend({
  type: z.literal('quizCta'),
  subtitle: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  /**
   * Visuels décoratifs disposés autour de l'encart. Le contenu décide
   * *quelles* images ; leur placement est fixé par le composant, parce
   * que c'est une composition graphique, pas une donnée éditoriale.
   * Au-delà de quatre, les suivantes sont ignorées à l'affichage.
   */
  decorations: z.array(imageRefSchema).max(4),
})

/* ── Union & page ─────────────────────────────────────────────────── */

export const sectionSchema = z.discriminatedUnion('type', [
  metierCardsSectionSchema,
  aboutSectionSchema,
  statisticsSectionSchema,
  faqSectionSchema,
  prosConsSectionSchema,
  quizCtaSectionSchema,
])

/** En-tête de la page, hors liste de sections car toujours présent. */
export const metierHeroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
})

export const metierSchema = z.object({
  /** Identifiant d'URL : /metiers/{slug}. */
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug en minuscules, mots séparés par des tirets'),
  hero: metierHeroSchema,
  sections: z.array(sectionSchema),
  /** Horodatage ISO de la dernière écriture par l'éditeur. */
  updatedAt: z.string().datetime(),
})

/* ── Types inférés ────────────────────────────────────────────────── */

export type Section = z.infer<typeof sectionSchema>
export type SectionType = Section['type']
export type MetierHero = z.infer<typeof metierHeroSchema>
export type Metier = z.infer<typeof metierSchema>

/** Extrait la variante correspondant à un `type` donné. */
export type SectionOfType<T extends SectionType> = Extract<Section, { type: T }>

/* ── Payload d'écriture ───────────────────────────────────────────── */

/**
 * Ce que l'éditeur envoie au serveur. `slug` vient de l'URL et
 * `updatedAt` est posé par le serveur : les accepter du client
 * permettrait de réécrire une autre page ou d'antidater une révision.
 */
export const metierUpdateSchema = metierSchema.omit({ slug: true, updatedAt: true })

export type MetierUpdate = z.infer<typeof metierUpdateSchema>
