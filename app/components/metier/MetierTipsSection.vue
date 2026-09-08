<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'tips'> }>()

/**
 * Carrousel en scroll natif avec accroche : pas de librairie, pas de
 * gestion de gestes en JS. Le pouce fait le travail, le navigateur gère
 * l'inertie, le clavier et l'accessibilité.
 *
 * Les points de pagination suivent le scroll réel plutôt qu'un index
 * maintenu à la main : impossible de désynchroniser l'indicateur du
 * contenu affiché.
 */
const track = useTemplateRef<HTMLElement>('track')
const { x } = useScroll(track, { behavior: 'smooth' })

const activeIndex = computed(() => {
  const el = track.value
  if (!el || props.section.items.length < 2) return 0
  const step = el.scrollWidth / props.section.items.length
  return step ? Math.round(x.value / step) : 0
})

function goTo(index: number) {
  const el = track.value
  if (!el) return
  x.value = (el.scrollWidth / props.section.items.length) * index
}
</script>

<template>
  <RevealOnScroll :id="section.id" as="section" class="scroll-mt-4">
    <div class="flex flex-col items-center gap-8">
      <h2 class="text-heading text-primary text-center font-semibold whitespace-pre-line">
        {{ section.title }}
      </h2>

      <!-- Marges négatives + padding : les cartes affleurent le bord de
           l'écran sans casser la gouttière de la page. -->
      <ul
        ref="track"
        class="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto px-4"
      >
        <li
          v-for="item in section.items"
          :key="item.id"
          class="bg-surface-light shadow-s flex w-[85%] shrink-0 snap-center flex-col items-center gap-4 rounded-lg p-6 text-center"
        >
          <BaseEmoji :name="item.icon" size="size-12" />
          <p class="text-body text-secondary font-medium">{{ item.body }}</p>
        </li>
      </ul>

      <div v-if="section.items.length > 1" class="flex gap-1.5">
        <button
          v-for="(item, index) in section.items"
          :key="item.id"
          type="button"
          :aria-label="`Aller au conseil ${index + 1}`"
          :aria-current="activeIndex === index"
          class="ease-drawer h-1.5 rounded-full transition-all duration-300"
          :class="activeIndex === index ? 'bg-actions-primary w-5' : 'bg-surface-overlay-15 w-1.5'"
          @click="goTo(index)"
        />
      </div>
    </div>
  </RevealOnScroll>
</template>
