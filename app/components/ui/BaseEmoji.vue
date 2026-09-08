<script setup lang="ts">
/**
 * Pictogramme Fluent Emoji 3D (Microsoft).
 *
 * `name` est le nom CLDR en kebab-case du catalogue — `money-bag`,
 * `graduation-cap`. Les fichiers sont servis depuis
 * `@lobehub/assets-emoji`, monté sur `/emoji` par Nitro.
 *
 * Décoratif par défaut : `alt` vide et `aria-hidden`, parce que le sens
 * est toujours porté par le texte voisin. Passer `label` quand
 * l'illustration porte l'information à elle seule.
 */
const props = withDefaults(defineProps<{ name: string; size?: string; label?: string }>(), {
  size: 'size-6',
  label: '',
})

const src = computed(() => (props.name ? `/emoji/${props.name}.webp` : null))
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="label"
    :aria-hidden="label ? undefined : true"
    :class="size"
    class="object-contain"
    loading="lazy"
    decoding="async"
  />
</template>
