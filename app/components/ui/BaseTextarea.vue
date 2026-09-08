<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{ id?: string; rows?: number; placeholder?: string }>()
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :rows="rows ?? 4"
    :placeholder="placeholder"
    class="border-border-light bg-surface-light text-primary placeholder:text-placeholder focus:border-actions-primary w-full resize-y rounded-sm border px-3 py-2 text-sm transition-colors duration-150 focus:outline-none"
  />
</template>
