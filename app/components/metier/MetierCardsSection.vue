<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'metierCards'> }>()

/**
 * Dans la maquette, l'aperçu vidéo de chaque carte est incliné
 * alternativement à -4° et +4°. La règle est visuelle, pas éditoriale :
 * elle se déduit du rang, elle n'a rien à faire dans le contenu.
 */
const previewTilt = (index: number) => (index % 2 === 0 ? -4 : 4)
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <!-- Grille 2 colonnes, gouttière 16 : quatre cartes de 177 dans les
         370 de contenu (maquette). -->
    <ul class="grid grid-cols-2 gap-4">
      <li v-for="(item, index) in section.items" :key="item.id" class="flex flex-col gap-3">
        <div
          class="bg-surface-card relative h-[191px] overflow-hidden rounded-2xl transition-transform duration-200 ease-out active:scale-[0.98]"
        >
          <!-- Aperçu vidéo : 101x134 à (38, 28) dans un conteneur de
               177x191, exprimé en pourcentages pour rester proportionnel
               si la carte change de largeur. -->
          <div
            class="bg-surface-light absolute top-[15%] left-[21%] h-[70%] w-[57%] rounded-sm shadow-xs"
            :style="{ transform: `rotate(${previewTilt(index)}deg)` }"
            aria-hidden="true"
          />

          <!-- Objet 3D, débordant à droite comme dans la maquette. -->
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            class="absolute top-1/2 right-0 h-[62%] w-auto translate-x-[18%] -translate-y-1/2 rotate-[16deg] object-contain drop-shadow-md"
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
