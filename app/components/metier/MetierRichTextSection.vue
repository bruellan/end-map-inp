<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'richText'> }>()

/**
 * Le corps est du texte brut saisi dans l'éditeur. On le découpe sur
 * les lignes vides pour en faire des paragraphes, plutôt que d'injecter
 * du HTML : pas de `v-html`, donc pas de surface XSS ouverte par
 * l'éditeur.
 */
const paragraphs = computed(() =>
  props.section.body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean),
)
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <div class="space-y-3">
      <p v-for="(paragraph, index) in paragraphs" :key="index" class="text-secondary text-base">
        {{ paragraph }}
      </p>
    </div>
  </MetierSectionShell>
</template>
