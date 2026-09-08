<script setup lang="ts">
/**
 * Éditeur de page métier.
 *
 * Orchestration seulement : charge le contenu, confie l'état
 * d'édition à `useMetierDraft` et distribue chaque section à sa carte.
 * Aucune logique de contenu ici.
 */

definePageMeta({ layout: 'editor' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: source, error: loadError } = await useMetier(slug)

if (loadError.value) {
  throw createError({
    statusCode: loadError.value.statusCode ?? 500,
    statusMessage: loadError.value.statusMessage ?? 'Page métier indisponible',
    fatal: true,
  })
}

const { draft, isDirty, isSaving, error, reset, moveSection, toggleVisibility, save } =
  useMetierDraft(slug, source)

/** Avertit avant de perdre des modifications non enregistrées. */
onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?')
})

useSeoMeta({ title: () => `Éditeur — ${draft.value?.hero.title ?? slug.value}` })
</script>

<template>
  <div v-if="draft" class="mx-auto max-w-3xl px-4 py-6">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-primary text-xl font-bold">Éditeur</h1>
        <NuxtLink
          :to="`/metiers/${slug}`"
          class="text-tertiary text-sm underline underline-offset-4"
        >
          Voir la page métier
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <Transition name="fade">
          <span v-if="isDirty" class="text-warning-subtle text-xs font-medium">
            Modifications non enregistrées
          </span>
        </Transition>
        <BaseButton variant="ghost" :disabled="!isDirty || isSaving" @click="reset">
          Annuler
        </BaseButton>
        <BaseButton :disabled="!isDirty || isSaving" @click="save">
          {{ isSaving ? 'Enregistrement…' : 'Enregistrer' }}
        </BaseButton>
      </div>
    </header>

    <Transition name="slide-up">
      <p
        v-if="error"
        class="bg-error-surface text-error-subtle mb-4 rounded-sm px-3 py-2 text-sm"
        role="alert"
      >
        {{ error }}
      </p>
    </Transition>

    <section class="border-border-light mb-6 space-y-4 rounded-md border p-4">
      <h2 class="text-primary text-sm font-bold">En-tête</h2>
      <div class="grid gap-3 sm:grid-cols-[5rem_1fr]">
        <BaseField v-slot="{ id }" label="Emoji">
          <BaseInput :id="id" v-model="draft.hero.emoji" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Titre">
          <BaseInput :id="id" v-model="draft.hero.title" />
        </BaseField>
      </div>
      <BaseField v-slot="{ id }" label="Accroche">
        <BaseTextarea :id="id" v-model="draft.hero.tagline" :rows="2" />
      </BaseField>
      <BaseField
        v-slot="{ id }"
        label="Image de couverture"
        hint="URL, ou vide pour ne rien afficher."
      >
        <BaseInput :id="id" v-model="draft.hero.coverUrl" type="url" placeholder="https://…" />
      </BaseField>
    </section>

    <h2 class="text-primary mb-3 text-sm font-bold">
      Sections
      <span class="text-tertiary font-normal">({{ draft.sections.length }})</span>
    </h2>

    <TransitionGroup name="section-list" tag="div" class="relative space-y-3">
      <EditorSectionCard
        v-for="(section, index) in draft.sections"
        :key="section.id"
        v-model="draft.sections[index]!"
        :can-move-up="index > 0"
        :can-move-down="index < draft.sections.length - 1"
        @move="moveSection(section.id, $event)"
        @toggle-visibility="toggleVisibility(section.id)"
      />
    </TransitionGroup>
  </div>
</template>
