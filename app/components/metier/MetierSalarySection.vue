<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'salary'> }>()

const formatter = computed(
  () =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: props.section.currency,
      maximumFractionDigits: 0,
    }),
)

const periodLabel = computed(() => (props.section.period === 'month' ? 'par mois' : 'par an'))

/**
 * Les barres sont proportionnelles au salaire le plus élevé de la
 * section, pour que la progression entre niveaux se lise d'un coup
 * d'œil.
 */
const scale = computed(() => Math.max(...props.section.levels.map((level) => level.max), 1))
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <ul class="space-y-4">
      <li v-for="(level, index) in section.levels" :key="level.id">
        <div class="mb-1.5 flex items-baseline justify-between gap-3">
          <span class="text-primary text-sm font-medium">{{ level.label }}</span>
          <span class="text-primary text-sm font-semibold">
            {{ formatter.format(level.min) }} – {{ formatter.format(level.max) }}
          </span>
        </div>

        <div class="bg-surface-overlay-5 h-2 overflow-hidden rounded-full">
          <div
            class="salary-bar bg-actions-primary h-full rounded-full"
            :style="{ width: `${(level.max / scale) * 100}%`, animationDelay: `${index * 120}ms` }"
          />
        </div>
      </li>
    </ul>

    <p class="text-tertiary mt-4 text-xs">Salaire brut {{ periodLabel }}, à temps plein.</p>
  </MetierSectionShell>
</template>

<style scoped>
/**
 * Le remplissage se déclenche sur l'état de révélation posé par
 * RevealOnScroll, pas au chargement de la page : les barres se
 * remplissent au moment où le lycéen arrive sur la section.
 *
 * En `scaleX` plutôt qu'en `width` — la largeur finale est déjà dans
 * le style inline, et une transition n'anime que ce qui change.
 */
.salary-bar {
  transform-origin: left;
}

[data-reveal='done'] .salary-bar {
  animation: var(--animate-bar-fill);
}
</style>
