<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'prosCons'> }>()

const activeId = ref(props.section.tabs[0]?.id ?? '')

/**
 * Si l'éditeur supprime l'onglet actif, on retombe sur le premier
 * plutôt que d'afficher un panneau vide.
 */
watch(
  () => props.section.tabs,
  (tabs) => {
    if (!tabs.some((tab) => tab.id === activeId.value)) activeId.value = tabs[0]?.id ?? ''
  },
)

const activeTab = computed(() => props.section.tabs.find((tab) => tab.id === activeId.value))
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <div class="mt-6 flex flex-col gap-4">
      <div role="tablist" class="flex">
        <button
          v-for="tab in section.tabs"
          :key="tab.id"
          role="tab"
          type="button"
          :aria-selected="activeId === tab.id"
          :aria-controls="`tab-panel-${tab.id}`"
          class="text-body text-primary flex flex-1 items-center justify-center gap-1 rounded-md p-3 font-semibold transition-colors duration-200 ease-out"
          :class="activeId === tab.id ? 'bg-surface-card' : 'bg-transparent'"
          @click="activeId = tab.id"
        >
          <BaseEmoji :name="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <div :id="`tab-panel-${activeId}`" role="tabpanel" class="flex flex-col">
        <!--
          Chaque carte se révèle pour elle-même avec un décalage croissant :
          elles viennent se poser une à une en colonne au lieu d'apparaître
          d'un bloc. `RevealOnScroll` déclenche au scroll et le keyframe
          `fadeInUp` est en `both`, donc une carte reste masquée jusqu'à ce
          que son délai s'écoule. La clé préfixée par l'onglet actif remonte
          les cartes au changement d'onglet, ce qui rejoue la cascade.

          Chevauchement de 8px entre les cartes (`itemSpacing: -8` dans la
          maquette) : `-mt-2` sur toutes sauf la première, et un z-index
          décroissant pour que la carte du dessus reste au-dessus.
        -->
        <RevealOnScroll
          v-for="(entry, index) in activeTab?.entries ?? []"
          :key="`${activeId}-${entry.id}`"
          as="article"
          :delay="index * 90"
          class="bg-surface-light shadow-s relative flex flex-col gap-2 rounded-lg p-6"
          :class="index > 0 && '-mt-2'"
          :style="{ zIndex: (activeTab?.entries.length ?? 0) - index }"
        >
          <h3 class="text-subheading text-primary font-semibold">{{ entry.title }}</h3>
          <p class="text-body text-tertiary font-medium">{{ entry.body }}</p>
        </RevealOnScroll>

        <p v-if="!activeTab?.entries.length" class="text-body text-tertiary">
          Rien à afficher pour l’instant.
        </p>
      </div>
    </div>
  </MetierSectionShell>
</template>
