<script setup lang="ts">
/**
 * Habillage commun à toutes les sections : titre, rythme vertical,
 * ancre de navigation et révélation au scroll.
 *
 * Chaque composant de section s'occupe de son contenu, jamais de son
 * espacement ni de son titre. C'est ce qui garantit qu'une page de 15
 * sections garde une verticalité régulière.
 */
defineProps<{ id: string; title: string }>()
</script>

<template>
  <RevealOnScroll :id="id" as="section" class="scroll-mt-16 px-5 py-8">
    <h2 class="text-primary mb-4 text-xl font-bold tracking-tight">{{ title }}</h2>
    <slot />
  </RevealOnScroll>
</template>
