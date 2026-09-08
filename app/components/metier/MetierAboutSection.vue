<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'about'> }>()

/** Un libellé vide signifie « texte déjà affiché en entier ». */
const isExpandable = computed(() => props.section.expandLabel.length > 0)
const isExpanded = ref(false)
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <div class="mt-8 flex flex-col gap-3">
      <p
        class="text-body text-secondary ease-drawer transition-[max-height] duration-300"
        :class="isExpandable && !isExpanded && 'line-clamp-3'"
      >
        {{ section.body }}
      </p>

      <BasePill v-if="isExpandable" @click="isExpanded = !isExpanded">
        <span aria-hidden="true">{{ isExpanded ? '⌃' : '⌄' }}</span>
        {{ isExpanded ? 'Réduire' : section.expandLabel }}
      </BasePill>
    </div>
  </MetierSectionShell>
</template>
