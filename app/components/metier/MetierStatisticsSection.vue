<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'statistics'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <ul class="grid grid-cols-2 gap-4">
      <li v-for="item in section.items" :key="item.id" class="flex flex-col gap-3">
        <BaseEmoji :name="item.icon" />
        <div>
          <p class="text-subheading text-primary font-semibold">{{ item.value }}</p>
          <p class="text-body text-tertiary font-medium">{{ item.label }}</p>
        </div>
      </li>
    </ul>
  </MetierSectionShell>
</template>
