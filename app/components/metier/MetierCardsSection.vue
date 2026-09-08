<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'metierCards'> }>()

/**
 * Dans la maquette, la vignette de chaque carte est inclinée
 * alternativement à -4° et +4°. La règle est visuelle, pas éditoriale :
 * elle se déduit du rang, elle n'a rien à faire dans le contenu.
 */
const photoTilt = (index: number) => (index % 2 === 0 ? -4 : 4)
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
          <!-- Vignette : 101x134 à (38, 28) dans un conteneur de 177x191,
               exprimée en pourcentages pour rester proportionnelle. -->
          <div
            class="bg-surface-light absolute top-[15%] left-[21%] h-[70%] w-[57%] overflow-hidden rounded-sm p-1.5 shadow-xs"
            :style="{ transform: `rotate(${photoTilt(index)}deg)` }"
          >
            <img
              v-if="item.photoUrl"
              :src="item.photoUrl"
              alt=""
              class="size-full rounded-xs object-cover"
              loading="lazy"
            />
          </div>

          <!--
            Objet 3D détouré, débordant à droite comme dans la maquette.
            Boîte de proportions fixes plutôt qu'une hauteur seule : les
            PNG exportés ont des ratios très différents (110x600 pour la
            fourchette, 337x600 pour la clé), et `object-contain` les fait
            tenir dans la même boîte sans qu'une carte ne se retrouve avec
            un objet deux fois plus grand qu'une autre.
          -->
          <img
            v-if="item.stickerUrl"
            :src="item.stickerUrl"
            alt=""
            aria-hidden="true"
            class="absolute top-1/2 right-0 h-[52%] w-[38%] translate-x-[14%] -translate-y-1/2 rotate-[16deg] object-contain drop-shadow-md"
            loading="lazy"
          />
        </div>

        <!-- `whitespace-pre-line` : les retours à la ligne du contenu
             sont voulus (la maquette casse « Restauration / & Cuisine »). -->
        <p class="text-body text-primary text-center font-semibold whitespace-pre-line">
          {{ item.label }}
        </p>
      </li>
    </ul>
  </MetierSectionShell>
</template>
