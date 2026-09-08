<script setup lang="ts">
import type { CollageStory } from '#shared/schemas/metier'
import { COLLAGE_SLOTS } from './collageLayout'

/**
 * Collage illustré de la maquette.
 *
 * Ne porte que le placement : quand les illustrations s'animent est
 * décidé par le parent, via une règle CSS qui cible `.collage-item`.
 * L'en-tête les fait entrer sur une ligne de temps, le bloc de fin au
 * moment où l'on arrive dessus — même composition, deux déclencheurs.
 *
 * Une pièce porteuse d'un titre devient un bouton : le parent décide de
 * ce qu'il en fait. Les autres restent décoratives, donc invisibles à un
 * lecteur d'écran.
 */
const props = defineProps<{
  pieces: readonly CollageStory[]
  /** Décalage ajouté à chaque `--delay`, pour caler sur la ligne de temps du parent. */
  delayOffset?: number
}>()

const emit = defineEmits<{ open: [CollageStory] }>()

/**
 * Les illustrations montent depuis le bas du cadre, chacune décalée vers
 * son propre bord : celles de gauche sortent d'en bas à gauche, celles
 * du milieu tout droit, celles de droite d'en bas à droite. L'écart
 * horizontal se déduit de la distance au centre, donc le mouvement suit
 * la composition au lieu d'être arbitraire.
 */
const items = computed(() =>
  COLLAGE_SLOTS.map((slot, index) => {
    const piece = props.pieces[index]
    const centreOffset = (slot.left + slot.width / 2 - 50) / 50 // -1 (gauche) → 1 (droite)
    return {
      piece,
      style: {
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
        height: `${slot.height}%`,
        zIndex: slot.z,
        '--rot': `${slot.rotate}deg`,
        '--from-x': `${(centreOffset * 45).toFixed(0)}%`,
        // Les pièces du fond entrent en premier, celles du premier plan
        // ensuite : le collage se compose sous les yeux.
        '--delay': `${(props.delayOffset ?? 0) + slot.z * 45}ms`,
      },
    }
  }).filter((entry): entry is typeof entry & { piece: CollageStory } =>
    Boolean(entry.piece?.image),
  ),
)
</script>

<template>
  <template v-for="entry in items" :key="entry.piece.id">
    <!--
      Une pièce avec un titre s'ouvre ; sans titre elle n'est qu'un décor.
      Deux rendus distincts plutôt qu'un bouton désactivé : un décor ne
      doit pas exister pour la navigation au clavier.
    -->
    <button
      v-if="entry.piece.title"
      type="button"
      class="collage-item pointer-events-auto absolute cursor-pointer transition-transform duration-200 ease-out active:scale-95"
      :style="entry.style"
      :aria-label="`En savoir plus : ${entry.piece.title}`"
      @click="emit('open', entry.piece)"
    >
      <img :src="entry.piece.image" alt="" class="size-full object-contain" loading="lazy" />
    </button>

    <img
      v-else
      :src="entry.piece.image"
      alt=""
      aria-hidden="true"
      loading="lazy"
      class="collage-item absolute object-contain"
      :style="entry.style"
    />
  </template>
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
