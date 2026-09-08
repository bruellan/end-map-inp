<script setup lang="ts">
/**
 * Layout par défaut.
 *
 * La page métier est mobile-only : on contraint la largeur et on centre
 * sur les grands écrans plutôt que d'étirer une maquette pensée pour du
 * 390px de large.
 */
</script>

<template>
  <div class="bg-surface-light-accented min-h-dvh">
    <div class="bg-surface-light shadow-s mx-auto min-h-dvh w-full max-w-[430px]">
      <slot />
    </div>
  </div>
</template>
