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

      <!--
        `mode="out-in"` : le panneau sortant s'efface avant l'entrée du
        suivant. Sans ça les deux se superposent pendant la transition et
        la hauteur du bloc sursaute.
      -->
      <Transition name="slide-up" mode="out-in">
        <div :id="`tab-panel-${activeId}`" :key="activeId" role="tabpanel">
          <!--
            Chevauchement de 8px entre les cartes (`itemSpacing: -8` dans
            la maquette). `-mt-2` sur toutes sauf la première, et un
            empilement inverse pour que la carte du dessus reste au-dessus.
          -->
          <article
            v-for="(entry, index) in activeTab?.entries ?? []"
            :key="entry.id"
            class="bg-surface-light shadow-s relative flex flex-col gap-2 rounded-lg p-6"
            :class="index > 0 && '-mt-2'"
            :style="{ zIndex: (activeTab?.entries.length ?? 0) - index }"
          >
            <h3 class="text-subheading text-primary font-semibold">{{ entry.title }}</h3>
            <p class="text-body text-tertiary font-medium">{{ entry.body }}</p>
          </article>

          <p v-if="!activeTab?.entries.length" class="text-body text-tertiary">
            Rien à afficher pour l’instant.
          </p>
        </div>
      </Transition>
    </div>
  </MetierSectionShell>
</template>
