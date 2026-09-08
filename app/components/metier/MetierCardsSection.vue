<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'metierCards'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <!-- Grille 2 colonnes, gouttière 16 : quatre cartes de 177 dans les
         370 de contenu (maquette). -->
    <ul class="grid grid-cols-2 gap-4">
      <li v-for="(item, index) in section.items" :key="item.id" class="flex flex-col gap-3">
        <div
          class="bg-surface-card flex h-[191px] items-center justify-center overflow-hidden rounded-2xl transition-transform duration-200 ease-out active:scale-[0.98]"
          :style="{ animationDelay: `${index * 70}ms` }"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            class="size-full object-cover"
            loading="lazy"
          />
        </div>
        <!-- `whitespace-pre-line` : les retours à la ligne du contenu
             sont voulus (la maquette casse « Restauration / & Cuisine »). -->
        <p class="text-body text-primary font-semibold whitespace-pre-line">{{ item.label }}</p>
      </li>
    </ul>
  </MetierSectionShell>
</template>
