<script setup lang="ts">
/**
 * Bouton pilule discret de la maquette : fond `surface-card`, rayon
 * total, libellé 14/20.
 */
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="bg-surface-card text-label text-primary inline-flex w-fit items-center gap-1 rounded-full px-3 py-2 font-medium transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
  >
    <slot />
  </button>
</template>
