<script setup lang="ts">
import type { MetierHero } from '#shared/schemas/metier'
import { COLLAGE_ASPECT } from './collageLayout'

const props = defineProps<{ hero: MetierHero }>()

/**
 * Séquence d'ouverture.
 *
 * Trois temps, entièrement en CSS : le dégradé occupe l'écran, les
 * illustrations montent une à une, puis l'ensemble se dézoome pendant
 * que l'en-tête se replie à sa hauteur définitive — ce qui fait remonter
 * le panneau de contenu sous lui.
 *
 * Pas de minuteur JavaScript : les `animation-delay` suffisent, et le
 * navigateur les met en pause tout seul si l'onglet passe en
 * arrière-plan. `prefers-reduced-motion` neutralise l'ensemble par la
 * règle globale, et l'en-tête s'affiche directement dans son état final.
 *
 * Le composant rend deux racines : le fond et le bloc de titre doivent
 * être frères du panneau de contenu pour s'intercaler correctement dans
 * l'empilement (voir assets/css/hero.css).
 */
const COLLAGE_START = 250

/**
 * L'en-tête ne stocke que des URL : ses illustrations sont purement
 * décoratives, contrairement à celles du bloc de fin qui peuvent porter
 * un récit. On les convertit ici plutôt que d'élargir le contrat du
 * composant de collage à deux formes d'entrée.
 */
const pieces = computed(() =>
  props.hero.collage.map((image, index) => ({
    id: `hero-collage-${index}`,
    image,
    title: '',
    body: '',
  })),
)
</script>

<template>
  <!-- Fond : dégradé et collage, sous le panneau de contenu. -->
  <div class="hero-backdrop brand-gradient isolate">
    <!--
      Le plateau se dézoome d'un bloc. Le facteur correspond au rapport
      entre la hauteur plein écran du départ et la hauteur définitive :
      à l'arrivée, l'échelle vaut exactement 1 et rien n'est déformé.
    -->
    <div class="hero-stage absolute inset-x-0 bottom-0">
      <div
        class="relative left-[-13%] w-[126%]"
        :style="{ aspectRatio: COLLAGE_ASPECT }"
        aria-hidden="true"
      >
        <MetierCollage :pieces="pieces" :delay-offset="COLLAGE_START" />
      </div>
    </div>
  </div>

  <!-- Titre : au-dessus du panneau, il reste lisible en haut. -->
  <header class="hero-title relative flex flex-col items-center gap-2 px-6 pt-24 text-center">
    <p v-if="hero.eyebrow" class="text-label text-tertiary font-medium">{{ hero.eyebrow }}</p>
    <h1 class="text-display text-primary font-semibold whitespace-pre-line">
      {{ hero.title }}
    </h1>
  </header>
</template>

<style scoped>
/* 100 / 62 : le plateau couvre l'écran au départ, vaut 1 à l'arrivée. */
.hero-stage {
  transform-origin: bottom center;
  animation: heroDezoom 0.9s var(--ease-drawer) 1.9s both;
}

@keyframes heroDezoom {
  from {
    transform: scale(1.613);
  }
  to {
    transform: scale(1);
  }
}

/**
 * Entrée des illustrations : elles montent depuis le bas du cadre en
 * s'écartant vers leur propre bord.
 *
 * `:deep()` est nécessaire : elles sont rendues par MetierCollage, qui a
 * plusieurs racines et ne reçoit donc pas l'identifiant de scope du
 * parent.
 */
.hero-stage :deep(.collage-item) {
  animation: collageRise 0.9s var(--ease-drawer) both;
  animation-delay: var(--delay);
}
</style>
