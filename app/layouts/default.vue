<script setup lang="ts">
/**
 * Layout par défaut.
 *
 * La page métier est mobile-only. La maquette fait 402 de large : on
 * contraint à cette valeur et on centre sur grand écran plutôt que
 * d'étirer une mise en page qui n'a pas été pensée pour.
 */
</script>

<template>
  <div class="bg-surface-light-accented min-h-dvh">
    <div class="bg-surface-light mx-auto min-h-dvh w-full max-w-[402px] overflow-hidden">
      <slot />
    </div>
  </div>
</template>
