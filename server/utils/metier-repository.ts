import { z } from 'zod'
import { metierSchema, type Metier, type MetierUpdate } from '#shared/schemas/metier'
import { seedMetiers } from '../data/seed'

/**
 * Accès au stockage des pages métier.
 *
 * Seul point du serveur qui lit et écrit du contenu : les routes d'API
 * ne font que valider l'entrée et déléguer ici. Elles ignorent où la
 * donnée est rangée.
 *
 * Le stockage passe par `useStorage` (unstorage, fourni par Nitro).
 * Le driver est déclaré dans nuxt.config.ts — passer du système de
 * fichiers à Redis ou Vercel KV est un changement de configuration,
 * pas de code.
 */

const storage = () => useStorage<Metier>('metiers')

const keyFor = (slug: string) => `${slug}.json`

/**
 * Première lecture : on recopie le contenu de départ dans le stockage.
 * Ensuite c'est la version éditée qui fait foi — le seed ne réécrit
 * jamais par-dessus le travail de l'équipe.
 */
async function ensureSeeded(slug: string): Promise<void> {
  if (await storage().hasItem(keyFor(slug))) return

  const seed = seedMetiers[slug]
  if (!seed) return

  await storage().setItem(keyFor(slug), seed)
}

export async function findMetier(slug: string): Promise<Metier | null> {
  await ensureSeeded(slug)

  const raw = await storage().getItem(keyFor(slug))
  if (!raw) return null

  /**
   * Le contenu vient d'un stockage externe : on le revalide au lieu de
   * lui faire confiance. Un fichier édité à la main ou un schéma qui a
   * évolué depuis la dernière écriture doit échouer ici, bruyamment,
   * plutôt que de casser le rendu plus loin.
   */
  const parsed = metierSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 500,
      statusMessage: `Contenu stocké invalide pour « ${slug} »`,
      data: z.treeifyError(parsed.error),
    })
  }

  return parsed.data
}

export async function listMetierSlugs(): Promise<string[]> {
  const stored = await storage().getKeys()
  const slugs = new Set([
    ...stored.map((key) => key.replace(/\.json$/, '')),
    ...Object.keys(seedMetiers),
  ])
  return [...slugs].sort()
}

/**
 * Écrit une révision. `slug` vient de l'URL et `updatedAt` est posé
 * ici : le client ne peut ni déplacer une page ni antidater une
 * révision.
 */
export async function saveMetier(slug: string, update: MetierUpdate): Promise<Metier> {
  const existing = await findMetier(slug)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: `Métier « ${slug} » introuvable` })
  }

  const next: Metier = { ...update, slug, updatedAt: new Date().toISOString() }

  await storage().setItem(keyFor(slug), next)
  return next
}
