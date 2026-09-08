<script setup lang="ts">
/**
 * Layout par défaut.
 *
 * La page métier est mobile-only. La maquette fait 402 de large : on
 * contraint à cette valeur et on centre sur grand écran plutôt que
 * d'étirer une mise en page qui n'a pas été pensée pour.
 *
 * `overflow-x: clip` et non `hidden` : `hidden` fait de l'élément un
 * conteneur de défilement, ce qui neutralise le `position: sticky` de
 * l'en-tête. `clip` rogne sans créer ce conteneur.
 */
</script>

<template>
  <div class="bg-surface-light-accented min-h-dvh">
    <div class="bg-surface-light mx-auto min-h-dvh w-full max-w-[402px] overflow-x-clip">
      <slot />
    </div>
  </div>
</template>
