<script setup lang="ts">
/**
 * Barre de navigation de la page métier : retour et partage.
 *
 * Le partage passe par l'API Web Share, native sur mobile. Sur les
 * navigateurs qui ne l'exposent pas, on retombe sur la copie du lien —
 * plutôt que de masquer le bouton, ce qui déplacerait la mise en page
 * selon le navigateur.
 */
const emit = defineEmits<{ shared: [] }>()

const feedback = ref<string | null>(null)

async function share() {
  const url = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      feedback.value = 'Lien copié'
      setTimeout(() => (feedback.value = null), 2000)
    }
    emit('shared')
  } catch {
    // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
  }
}
</script>

<template>
  <div class="relative flex items-center justify-between px-4 py-3">
    <button
      type="button"
      aria-label="Revenir en arrière"
      class="bg-surface-card text-primary flex size-10 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90"
      @click="$router.back()"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
        <path
          d="M15 19l-7-7 7-7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <button
      type="button"
      aria-label="Partager cette page"
      class="bg-surface-card text-primary flex size-10 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90"
      @click="share"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
        <path
          d="M12 16V4m0 0L8 8m4-4l4 4M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="zoom">
      <p
        v-if="feedback"
        role="status"
        class="bg-surface-dark text-label text-invert-primary absolute top-full right-4 rounded-sm px-3 py-1.5"
      >
        {{ feedback }}
      </p>
    </Transition>
  </div>
</template>
