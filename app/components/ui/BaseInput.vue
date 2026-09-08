<script setup lang="ts">
/**
 * Input contrôlé. `defineModel` gère le v-model, y compris le
 * modificateur `.number` posé par l'appelant.
 */
const model = defineModel<string | number>({ required: true })

defineProps<{ id?: string; type?: string; placeholder?: string }>()
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    class="border-border-light bg-surface-light text-primary placeholder:text-placeholder focus:border-actions-primary w-full rounded-sm border px-3 py-2 text-sm transition-colors duration-150 focus:outline-none"
  />
</template>
