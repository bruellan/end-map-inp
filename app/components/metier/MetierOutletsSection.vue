<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'outlets'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <ul class="grid grid-cols-2 gap-3">
      <li
        v-for="item in section.items"
        :key="item.id"
        class="bg-surface-soft-warm rounded-md p-4 transition-transform duration-200 ease-out active:scale-[0.98]"
      >
        <span class="text-2xl" aria-hidden="true">{{ item.icon }}</span>
        <p class="text-primary mt-2 text-sm font-semibold">{{ item.label }}</p>
        <p class="text-tertiary mt-1 text-xs">{{ item.description }}</p>
      </li>
    </ul>
  </MetierSectionShell>
</template>
