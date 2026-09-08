<script setup lang="ts">
/**
 * Bouton du design system Edumapper.
 *
 * `active:scale` plutôt qu'un état `:hover` marqué : la cible est le
 * mobile, où le survol n'existe pas.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)

const variants = {
  primary: 'bg-actions-primary text-invert-primary hover:bg-actions-primary-hover',
  secondary: 'bg-actions-secondary text-primary hover:bg-actions-secondary-hover',
  ghost: 'text-tertiary hover:bg-actions-secondary',
} as const
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
    :class="variants[variant]"
  >
    <slot />
  </button>
</template>
