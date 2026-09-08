<script setup lang="ts">
/**
 * Habillage commun aux sections : titre, ancre et révélation au scroll.
 *
 * Le rythme vertical vient du parent (`gap` sur la liste de sections),
 * pas d'ici : dans la maquette l'espacement dépend du voisinage, pas de
 * la section elle-même.
 */
defineProps<{ id: string; title?: string }>()
</script>

<template>
  <RevealOnScroll :id="id" as="section" class="scroll-mt-4">
    <h2 v-if="title" class="text-heading text-primary font-semibold">{{ title }}</h2>
    <slot />
  </RevealOnScroll>
</template>
