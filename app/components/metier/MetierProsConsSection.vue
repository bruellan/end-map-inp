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

/**
 * Léger basculement alterné, pour que les cartes aient l'air posées en
 * pile plutôt qu'alignées au cordeau. Le motif se répète : quel que soit
 * le nombre d'entrées, deux voisines penchent en sens opposés.
 */
const TILTS = [-2, 1.5, -1.5, 2]
const tilt = (index: number) => TILTS[index % TILTS.length]
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
          Chaque carte « pop » pour elle-même, une à une : `RevealOnScroll`
          déclenche au scroll et le keyframe `pop` est en `both`, donc une
          carte reste masquée jusqu'à ce que son délai s'écoule. Le décalage
          croissant les fait jaillir dans l'ordre. La clé préfixée par
          l'onglet actif remonte les cartes au changement d'onglet, ce qui
          rejoue la cascade.

          Chevauchement de 8px (`-mt-2` sauf la première) et z-index
          croissant : la dernière arrivée recouvre les précédentes, comme des
          cartes qu'on empile.

          Le wrapper porte l'apparition (le `scale` du keyframe) et
          l'empilement ; la rotation vit sur l'`<article>` interne, sinon le
          `transform` du keyframe l'écraserait (et `fill-mode: both` la
          garderait écrasée une fois posée).
        -->
        <RevealOnScroll
          v-for="(entry, index) in activeTab?.entries ?? []"
          :key="`${activeId}-${entry.id}`"
          animation="animate-pop"
          :delay="index * 140"
          class="relative"
          :class="index > 0 && '-mt-2'"
          :style="{ zIndex: index }"
        >
          <article
            class="bg-surface-light border-surface-light-accented shadow-card flex flex-col gap-2 rounded-lg border p-6"
            :style="{ transform: `rotate(${tilt(index)}deg)` }"
          >
            <h3 class="text-subheading text-primary font-semibold">{{ entry.title }}</h3>
            <p class="text-body text-tertiary font-medium">{{ entry.body }}</p>
          </article>
        </RevealOnScroll>

        <p v-if="!activeTab?.entries.length" class="text-body text-tertiary">
          Rien à afficher pour l’instant.
        </p>
      </div>
    </div>
  </MetierSectionShell>
</template>
