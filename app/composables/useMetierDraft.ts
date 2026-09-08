import type { Metier, MetierUpdate, Section } from '#shared/schemas/metier'

/**
 * Brouillon d'édition d'une page métier.
 *
 * Porte toute la logique d'édition — clonage, suivi des modifications,
 * réordonnancement, enregistrement — pour que les composants de
 * l'éditeur ne fassent que rendre des champs et émettre des intentions.
 *
 * On travaille sur une copie profonde plutôt que sur la donnée servie
 * par `useFetch` : tant que l'équipe n'a pas enregistré, la page métier
 * continue d'afficher la version publiée.
 */
export function useMetierDraft(
  slug: MaybeRefOrGetter<string>,
  /** `useFetch` rend `undefined` avant résolution, `null` n'est jamais produit. */
  source: Ref<Metier | undefined>,
) {
  const { save: persist, isSaving, error } = useMetierMutation(slug)

  const draft = ref<Metier | null>(null)

  /** Sérialisation de référence, pour détecter les modifications. */
  const pristine = ref<string>('')

  watch(
    source,
    (metier) => {
      if (!metier) return
      draft.value = structuredClone(toRaw(metier))
      pristine.value = JSON.stringify(metier)
    },
    { immediate: true },
  )

  /**
   * Comparaison structurelle plutôt qu'un drapeau posé à chaque frappe :
   * revenir manuellement à la valeur d'origine doit désactiver le
   * bouton d'enregistrement.
   */
  const isDirty = computed(
    () => draft.value !== null && JSON.stringify(draft.value) !== pristine.value,
  )

  function reset() {
    if (!source.value) return
    draft.value = structuredClone(toRaw(source.value))
  }

  /**
   * Déplace une section d'un cran. Renvoie `false` si le mouvement sort
   * de la liste, ce qui permet à l'appelant de désactiver le bouton.
   */
  function moveSection(id: string, direction: -1 | 1): boolean {
    const sections = draft.value?.sections
    if (!sections) return false

    const from = sections.findIndex((section) => section.id === id)
    const to = from + direction
    if (from === -1 || to < 0 || to >= sections.length) return false

    const [moved] = sections.splice(from, 1) as [Section]
    sections.splice(to, 0, moved)
    return true
  }

  function toggleVisibility(id: string) {
    const section = draft.value?.sections.find((candidate) => candidate.id === id)
    if (section) section.visible = !section.visible
  }

  async function save() {
    if (!draft.value) return

    const payload: MetierUpdate = {
      hero: draft.value.hero,
      sections: draft.value.sections,
    }

    const saved = await persist(payload)
    if (saved) {
      // On réaligne le brouillon sur la réponse serveur pour que les deux
      // sérialisations coïncident : `JSON.stringify` est sensible à l'ordre
      // des clés, et la réponse du PUT ne le range pas comme la donnée servie
      // au GET. Sans ça, `isDirty` repasserait à `true` juste après un save.
      draft.value = structuredClone(saved)
      pristine.value = JSON.stringify(saved)
    }
  }

  return { draft, isDirty, isSaving, error, reset, moveSection, toggleVisibility, save }
}
