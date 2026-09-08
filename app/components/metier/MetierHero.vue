<script setup lang="ts">
import type { MetierHero } from '#shared/schemas/metier'

defineProps<{ hero: MetierHero }>()
</script>

<template>
  <!--
    Retrait supplémentaire de 24 par rapport au reste du contenu : dans
    la maquette le titre est à 40 du bord, les autres blocs à 16.
    Le hero est au-dessus de la ligne de flottaison, il s'anime au
    montage plutôt qu'au scroll — `both` dans la keyframe porte l'état
    initial, donc pas de masquage préalable ni de flash.
  -->
  <header class="flex flex-col gap-4 px-6">
    <h1 class="animate-fade-in-up text-display text-primary font-semibold whitespace-pre-line">
      {{ hero.title }}
    </h1>
    <p
      class="animate-fade-in-up text-body text-secondary font-medium whitespace-pre-line"
      style="animation-delay: 90ms"
    >
      {{ hero.subtitle }}
    </p>
  </header>
</template>
