import type { Metier, MetierUpdate } from '#shared/schemas/metier'

/**
 * Lecture d'une page métier.
 *
 * `useFetch` rend la donnée au SSR puis l'hydrate : la page métier est
 * lisible sans attendre le JS, ce qui compte pour un lycéen en 4G.
 *
 * Aucun composant d'affichage n'appelle l'API directement — ils
 * reçoivent leur contenu en props. C'est la frontière entre ce qui
 * orchestre la donnée et ce qui la montre.
 */
export function useMetier(slug: MaybeRefOrGetter<string>) {
  return useFetch<Metier>(() => `/api/metiers/${toValue(slug)}`, {
    key: () => `metier:${toValue(slug)}`,
  })
}

/**
 * Écriture depuis l'éditeur.
 *
 * Expose l'état d'enregistrement pour que l'UI puisse le refléter sans
 * le recalculer de son côté.
 */
export function useMetierMutation(slug: MaybeRefOrGetter<string>) {
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const savedAt = ref<string | null>(null)

  async function save(update: MetierUpdate): Promise<Metier | null> {
    isSaving.value = true
    error.value = null

    try {
      const saved = await $fetch<Metier>(`/api/metiers/${toValue(slug)}`, {
        method: 'PUT',
        body: update,
      })

      savedAt.value = saved.updatedAt
      // La page métier lit la même clé de cache : elle reflète l'édition
      // sans rechargement.
      await refreshNuxtData(`metier:${toValue(slug)}`)

      return saved
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Enregistrement impossible'
      return null
    } finally {
      isSaving.value = false
    }
  }

  return { save, isSaving: readonly(isSaving), error: readonly(error), savedAt: readonly(savedAt) }
}
