<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'quizCta'> }>()

/**
 * Placement des quatre visuels décoratifs, relevé sur la maquette et
 * exprimé en pourcentages du bloc (370x254) pour rester proportionnel.
 *
 * Largeur *et* hauteur sont imposées : les PNG exportés n'ont pas le
 * ratio des cadres Figma (le `fork` fait 110x600 pour un cadre de
 * 105x153). Ne fixer que la largeur les étirerait sur toute la hauteur
 * du bloc. `object-contain` fait tenir l'objet dans la boîte sans le
 * déformer ni le rogner.
 *
 * C'est une constante de présentation : le contenu ne fournit que les
 * URL, dans l'ordre. Une cinquième image n'aurait pas de place définie,
 * d'où le `.max(4)` côté schéma.
 */
const SLOTS = [
  { left: '3.8%', top: '-5.5%', width: '20.8%', height: '36.2%', rotate: '165deg' },
  { left: '78.6%', top: '-8.7%', width: '35.1%', height: '51.2%', rotate: '135deg' },
  { left: '91.4%', top: '33.9%', width: '23.8%', height: '34.6%', rotate: '-15deg' },
  { left: '-10.5%', top: '20.9%', width: '28.4%', height: '60.2%', rotate: '30deg' },
] as const
</script>

<template>
  <RevealOnScroll :id="section.id" as="section" class="scroll-mt-4">
    <div class="bg-surface-soft-warm relative isolate overflow-hidden rounded-lg px-4 pt-12 pb-4">
      <img
        v-for="(url, index) in section.decorations.slice(0, SLOTS.length)"
        :key="url + index"
        :src="url"
        alt=""
        aria-hidden="true"
        loading="lazy"
        class="pointer-events-none absolute -z-10 object-contain"
        :style="{
          left: SLOTS[index]!.left,
          top: SLOTS[index]!.top,
          width: SLOTS[index]!.width,
          height: SLOTS[index]!.height,
          transform: `rotate(${SLOTS[index]!.rotate})`,
        }"
      />

      <div class="flex flex-col items-center gap-10 text-center">
        <div class="flex flex-col gap-3">
          <p class="text-heading text-primary font-semibold whitespace-pre-line">
            {{ section.title }}
          </p>
          <p class="text-body text-tertiary font-medium">{{ section.subtitle }}</p>
        </div>

        <NuxtLink
          :to="section.ctaHref"
          class="bg-actions-primary text-subheading text-invert-primary flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-medium transition-all duration-150 ease-out active:scale-[0.98]"
        >
          {{ section.ctaLabel }}
        </NuxtLink>
      </div>
    </div>
  </RevealOnScroll>
</template>
