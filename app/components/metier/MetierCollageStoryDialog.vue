<script setup lang="ts">
import type { CollageStory } from '#shared/schemas/metier'

/**
 * Récit ouvert au clic sur une pièce du collage.
 *
 * S'appuie sur l'élément `<dialog>` natif plutôt que sur un calque
 * maison : le piège de focus, la fermeture par Échap et la couche
 * supérieure viennent gratuitement, et sont difficiles à reproduire
 * correctement à la main.
 */
const story = defineModel<CollageStory | null>({ required: true })

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(story, (value) => {
  const el = dialog.value
  if (!el) return
  if (value) el.showModal()
  else if (el.open) el.close()
})

/** `close` couvre aussi Échap et la fermeture par le navigateur. */
const onClose = () => (story.value = null)

/**
 * Un clic sur le fond ferme. On compare la cible au dialog lui-même :
 * la zone hors contenu appartient au dialog, pas à ses enfants.
 */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) story.value = null
}
</script>

<template>
  <dialog
    ref="dialog"
    class="story-dialog bg-surface-light m-0 h-dvh max-h-none w-full max-w-none p-0"
    @close="onClose"
    @click="onClick"
  >
    <article v-if="story" class="flex h-full flex-col">
      <div class="brand-gradient relative flex h-[45%] shrink-0 items-center justify-center">
        <img :src="story.image" alt="" class="max-h-[70%] max-w-[70%] object-contain" />

        <button
          type="button"
          aria-label="Fermer"
          class="bg-surface-light/80 text-primary absolute top-4 right-4 flex size-10 items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-150 ease-out active:scale-90"
          @click="story = null"
        >
          <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="flex flex-col gap-3 overflow-y-auto px-6 py-8">
        <h2 class="text-heading text-primary font-semibold">{{ story.title }}</h2>
        <p class="text-body text-secondary">{{ story.body }}</p>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.story-dialog::backdrop {
  background: rgb(24 25 29 / 0.6);
}

.story-dialog[open] {
  animation: var(--animate-slide-up-mobile);
}

.story-dialog[open]::backdrop {
  animation: var(--animate-overlay-show);
}
</style>
