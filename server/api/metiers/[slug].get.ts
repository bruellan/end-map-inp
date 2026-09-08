import { findMetier } from '../../utils/metier-repository'

/** GET /api/metiers/:slug — contenu publié d'une page métier. */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const metier = await findMetier(slug)
  if (!metier) {
    throw createError({ statusCode: 404, statusMessage: `Métier « ${slug} » introuvable` })
  }

  return metier
})
