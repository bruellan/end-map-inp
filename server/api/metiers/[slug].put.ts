import { z } from 'zod'
import { metierUpdateSchema } from '#shared/schemas/metier'
import { saveMetier } from '../../utils/metier-repository'

/**
 * PUT /api/metiers/:slug — enregistre une révision depuis l'éditeur.
 *
 * Le corps est validé contre le même schéma que celui qui type
 * l'affichage : impossible d'enregistrer un contenu que la page ne
 * saurait pas rendre.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const body = await readBody(event)
  const parsed = metierUpdateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Contenu invalide',
      data: z.treeifyError(parsed.error),
    })
  }

  return saveMetier(slug, parsed.data)
})
