<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'statistics'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <!-- 16 horizontal, 32 vertical : voir la remarque des cartes métier. -->
    <ul class="grid grid-cols-2 gap-x-4 gap-y-8">
      <li v-for="item in section.items" :key="item.id" class="flex flex-col gap-3">
        <BaseEmoji :name="item.icon" />
        <div>
          <p class="text-subheading text-primary font-semibold">{{ item.value }}</p>
          <!-- Les retours à la ligne viennent du contenu : la maquette les fixe,
               et le calage automatique ne tombe pas au même endroit. -->
          <p class="text-body text-tertiary font-medium whitespace-pre-line">{{ item.label }}</p>
        </div>
      </li>
    </ul>
  </MetierSectionShell>
</template>
