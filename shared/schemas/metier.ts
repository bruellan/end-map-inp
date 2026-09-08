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
 */

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
})

/* ── Variantes de section ─────────────────────────────────────────── */

/** Texte libre. Utilisé pour « En quoi consiste ce métier ? ». */
const richTextSectionSchema = sectionBaseSchema.extend({
  type: z.literal('richText'),
  body: z.string(),
})

/** Fourchettes de rémunération par niveau d'expérience. */
const salarySectionSchema = sectionBaseSchema.extend({
  type: z.literal('salary'),
  currency: z.string(),
  period: z.enum(['month', 'year']),
  levels: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string(),
      min: z.number().int().nonnegative(),
      max: z.number().int().nonnegative(),
    }),
  ),
})

/** Parcours de formation, du bac au diplôme visé. */
const studiesSectionSchema = sectionBaseSchema.extend({
  type: z.literal('studies'),
  steps: z.array(
    z.object({
      id: z.string().min(1),
      /** Niveau visé, p. ex. « Bac +5 ». */
      level: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
})

/** Débouchés : secteurs ou postes accessibles. */
const outletsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('outlets'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string(),
      description: z.string(),
      /** Emoji, aligné sur l'iconographie 3D d'Edumapper. */
      icon: z.string(),
    }),
  ),
})

/** Témoignages de professionnels en poste. */
const testimonialsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('testimonials'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      author: z.string(),
      role: z.string(),
      quote: z.string(),
      avatarUrl: z.string().url().or(z.literal('')),
    }),
  ),
})

/* ── Union & page ─────────────────────────────────────────────────── */

export const sectionSchema = z.discriminatedUnion('type', [
  richTextSectionSchema,
  salarySectionSchema,
  studiesSectionSchema,
  outletsSectionSchema,
  testimonialsSectionSchema,
])

/** En-tête de la page, hors liste de sections car toujours présent. */
export const metierHeroSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  emoji: z.string(),
  coverUrl: z.string().url().or(z.literal('')),
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
