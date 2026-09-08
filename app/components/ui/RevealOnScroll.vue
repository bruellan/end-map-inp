<script setup lang="ts">
/**
 * Révèle son contenu quand il entre dans le viewport.
 *
 * C'est la seule brique d'animation que Vue ne fournit pas nativement :
 * <Transition> gère les entrées et sorties liées au DOM, pas celles
 * liées au scroll. On s'appuie sur IntersectionObserver via VueUse
 * plutôt que sur un moteur d'animation — l'animation elle-même reste
 * une keyframe CSS du thème Edumapper.
 *
 * Le masquage passe par `data-reveal="pending"`, dont la règle CSS est
 * préfixée par `.js` : le HTML rendu au SSR est lisible avant
 * hydratation et le reste si le JavaScript échoue.
 *
 * L'observation s'arrête au premier déclenchement — une section déjà
 * révélée ne rejoue pas quand on remonte.
 */

const props = withDefaults(
  defineProps<{
    /** Classe d'animation appliquée à l'entrée dans le viewport. */
    animation?: string
    /** Décalage en ms, pour cascader plusieurs éléments voisins. */
    delay?: number
    /** Proportion visible avant déclenchement. */
    threshold?: number
    /** Élément rendu, pour ne pas casser la sémantique du parent. */
    as?: string
  }>(),
  {
    animation: 'animate-fade-in-up',
    delay: 0,
    threshold: 0.15,
    as: 'div',
  },
)

const root = useTemplateRef<HTMLElement>('root')
const revealed = ref(false)

const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    revealed.value = true
    stop()
  },
  { threshold: props.threshold },
)
</script>

<template>
  <component
    :is="as"
    ref="root"
    :data-reveal="revealed ? 'done' : 'pending'"
    :class="revealed && animation"
    :style="{ animationDelay: delay ? `${delay}ms` : undefined }"
  >
    <slot />
  </component>
</template>
