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
        <!-- La maquette place ici un pictogramme 16px que je n'ai pas pu
             identifier depuis l'export ; un chevron porte l'affordance
             sans inventer une icône. -->
        <svg
          viewBox="0 0 16 16"
          class="size-4 transition-transform duration-200 ease-out"
          :class="isExpanded && 'rotate-180'"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ isExpanded ? 'Réduire' : section.expandLabel }}
      </BasePill>
    </div>
  </MetierSectionShell>
</template>
