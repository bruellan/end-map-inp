<script setup lang="ts">
/**
 * Champ de formulaire : label associé, aide et gouttière.
 *
 * Le contrôle est passé en slot plutôt qu'imposé, pour que le même
 * habillage serve un input, un textarea ou un groupe de boutons.
 */
defineProps<{ label: string; hint?: string }>()

const id = useId()
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="text-secondary block text-xs font-semibold">{{ label }}</label>
    <slot :id="id" />
    <p v-if="hint" class="text-tertiary text-xs">{{ hint }}</p>
  </div>
</template>
