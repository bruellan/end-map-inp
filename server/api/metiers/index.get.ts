import { listMetierSlugs } from '../../utils/metier-repository'

/** GET /api/metiers — slugs disponibles, utilisé par la page d'accueil. */
export default defineEventHandler(async () => ({ slugs: await listMetierSlugs() }))
