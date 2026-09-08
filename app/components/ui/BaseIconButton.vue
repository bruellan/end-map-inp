<script setup lang="ts">
/** Bouton carré pour les actions d'icône. `label` alimente aria-label. */
defineProps<{ label: string; disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="text-icon-subtle-default hover:bg-actions-secondary hover:text-icon-subtle-active flex size-8 items-center justify-center rounded-sm transition-all duration-150 ease-out active:scale-90 disabled:pointer-events-none disabled:opacity-30"
  >
    <slot />
  </button>
</template>
