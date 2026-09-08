<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'studies'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <!-- Liste ordonnée : le parcours a un sens de lecture, la
         sémantique doit le porter autant que le visuel. -->
    <ol class="border-border-light relative space-y-5 border-l pl-6">
      <li
        v-for="(step, index) in section.steps"
        :key="step.id"
        class="relative"
        :style="{ animationDelay: `${index * 90}ms` }"
      >
        <span
          class="bg-actions-primary ring-surface-light absolute top-1.5 -left-[1.8125rem] size-2.5 rounded-full ring-4"
          aria-hidden="true"
        />
        <p class="text-tertiary text-xs font-semibold tracking-wide uppercase">{{ step.level }}</p>
        <p class="text-primary mt-0.5 text-base font-semibold">{{ step.label }}</p>
        <p class="text-secondary mt-1 text-sm">{{ step.description }}</p>
      </li>
    </ol>
  </MetierSectionShell>
</template>
