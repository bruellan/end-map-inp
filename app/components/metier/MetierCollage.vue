<script setup lang="ts">
/**
 * Collage illustré de la maquette.
 *
 * Ne porte que le placement : quand les illustrations s'animent est
 * décidé par le parent, via une règle CSS qui cible `.collage-item`.
 * L'en-tête les fait entrer sur une ligne de temps, le bloc de fin au
 * moment où l'on arrive dessus — même composition, deux déclencheurs.
 */
import { COLLAGE_SLOTS } from './collageLayout'

const props = defineProps<{
  /** URL par emplacement, dans l'ordre. Un trou laisse l'emplacement libre. */
  images: readonly string[]
  /** Décalage ajouté à chaque `--delay`, pour caler sur la ligne de temps du parent. */
  delayOffset?: number
}>()

/**
 * Les illustrations montent depuis le bas du cadre, chacune décalée vers
 * son propre bord : celles de gauche sortent d'en bas à gauche, celles
 * du milieu tout droit, celles de droite d'en bas à droite. L'écart
 * horizontal se déduit de la distance au centre, donc le mouvement suit
 * la composition au lieu d'être arbitraire.
 */
const items = computed(() =>
  COLLAGE_SLOTS.map((slot, index) => {
    const centreOffset = (slot.left + slot.width / 2 - 50) / 50 // -1 (gauche) → 1 (droite)
    return {
      slot,
      url: props.images[index] ?? '',
      fromX: `${(centreOffset * 45).toFixed(0)}%`,
      // Les pièces du fond entrent en premier, celles du premier plan
      // ensuite : le collage se compose sous les yeux.
      delay: `${(props.delayOffset ?? 0) + slot.z * 45}ms`,
    }
  }).filter((entry) => entry.url),
)
</script>

<template>
  <img
    v-for="(entry, index) in items"
    :key="`${entry.url}-${index}`"
    :src="entry.url"
    alt=""
    loading="lazy"
    class="collage-item absolute object-contain"
    :style="{
      left: `${entry.slot.left}%`,
      top: `${entry.slot.top}%`,
      width: `${entry.slot.width}%`,
      height: `${entry.slot.height}%`,
      zIndex: entry.slot.z,
      '--rot': `${entry.slot.rotate}deg`,
      '--from-x': entry.fromX,
      '--delay': entry.delay,
    }"
  />
</template>

<style scoped>
/**
 * Inclinaison au repos. La rotation passe par une variable pour rester
 * présente aux deux bouts des keyframes d'entrée — sinon l'animation
 * l'écraserait. Le déclenchement, lui, appartient au parent.
 */
.collage-item {
  transform: rotate(var(--rot));
}
</style>
