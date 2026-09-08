<script setup lang="ts">
import type { MetierHero } from '#shared/schemas/metier'

defineProps<{ hero: MetierHero }>()
</script>

<template>
  <header class="bg-surface-soft-warm relative overflow-hidden px-5 pt-10 pb-8">
    <!--
      Le hero est au-dessus de la ligne de flottaison : il s'anime au
      montage plutôt qu'au scroll. `both` dans la keyframe porte l'état
      initial, donc pas de masquage préalable ni de flash.
    -->
    <p class="animate-fade-in-up text-5xl" aria-hidden="true">{{ hero.emoji }}</p>

    <h1
      class="animate-fade-in-up text-heading-lg text-primary mt-3 leading-tight font-bold tracking-tight"
      style="animation-delay: 80ms"
    >
      {{ hero.title }}
    </h1>

    <p class="animate-fade-in-up text-secondary mt-2 text-base" style="animation-delay: 160ms">
      {{ hero.tagline }}
    </p>

    <img
      v-if="hero.coverUrl"
      :src="hero.coverUrl"
      alt=""
      class="animate-fade-in-up mt-6 aspect-video w-full rounded-md object-cover"
      style="animation-delay: 240ms"
    />
  </header>
</template>
