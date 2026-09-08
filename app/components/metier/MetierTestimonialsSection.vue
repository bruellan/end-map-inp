<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'testimonials'> }>()
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <!--
      Carrousel en scroll natif avec accroche : pas de librairie, pas de
      gestion de gestes en JS. Le pouce fait le travail, le navigateur
      gère l'inertie et l'accessibilité clavier.
      Marges négatives + padding pour que les cartes affleurent le bord
      de l'écran sans casser la gouttière de la page.
    -->
    <ul
      class="-mx-5 flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-5 pb-1"
      tabindex="0"
    >
      <li
        v-for="item in section.items"
        :key="item.id"
        class="bg-surface-light-accented w-[78%] shrink-0 snap-start rounded-md p-4"
      >
        <!-- <figcaption> doit être enfant direct d'un <figure>. -->
        <figure>
          <blockquote class="text-secondary text-sm">« {{ item.quote }} »</blockquote>
          <figcaption class="mt-3 flex items-center gap-2.5">
            <img
              v-if="item.avatarUrl"
              :src="item.avatarUrl"
              alt=""
              class="size-9 rounded-full object-cover"
              loading="lazy"
            />
            <span
              v-else
              class="bg-surface-dark text-invert-primary flex size-9 items-center justify-center rounded-full text-sm font-semibold"
              aria-hidden="true"
            >
              {{ item.author.charAt(0) }}
            </span>
            <span>
              <span class="text-primary block text-sm font-semibold">{{ item.author }}</span>
              <span class="text-tertiary block text-xs">{{ item.role }}</span>
            </span>
          </figcaption>
        </figure>
      </li>
    </ul>
  </MetierSectionShell>
</template>
