<script setup lang="ts">
import type { MetierHero } from '#shared/schemas/metier'
import { COLLAGE_ASPECT } from './collageLayout'

defineProps<{ hero: MetierHero }>()

/**
 * Séquence d'ouverture.
 *
 * Trois temps, entièrement en CSS : le dégradé occupe l'écran, les
 * illustrations montent une à une, puis l'ensemble se dézoome pendant
 * que l'en-tête se replie à sa hauteur définitive — ce qui fait remonter
 * le contenu de la page sous lui. Le titre n'apparaît qu'après.
 *
 * Pas de minuteur JavaScript : les `animation-delay` suffisent, et le
 * navigateur les met en pause tout seul si l'onglet passe en arrière-plan.
 * `prefers-reduced-motion` neutralise l'ensemble par la règle globale, et
 * l'en-tête s'affiche directement dans son état final.
 */
const COLLAGE_START = 250
</script>

<template>
  <header class="hero brand-gradient relative isolate overflow-hidden">
    <!--
      Le plateau porte le collage et se dézoome d'un bloc. Le facteur
      correspond au rapport entre la hauteur plein écran du départ et la
      hauteur définitive de l'en-tête : à l'arrivée, l'échelle vaut
      exactement 1 et rien n'est déformé.
    -->
    <div class="hero-stage absolute inset-x-0 bottom-0">
      <div
        class="relative left-[-13%] w-[126%]"
        :style="{ aspectRatio: COLLAGE_ASPECT }"
        aria-hidden="true"
      >
        <MetierCollage :images="hero.collage" :delay-offset="COLLAGE_START" />
      </div>
    </div>

    <div class="hero-text relative z-10 flex flex-col items-center gap-2 px-6 pt-24 text-center">
      <p v-if="hero.eyebrow" class="text-label text-tertiary font-medium">{{ hero.eyebrow }}</p>
      <h1 class="text-display text-primary font-semibold whitespace-pre-line">
        {{ hero.title }}
      </h1>
    </div>
  </header>
</template>

<style scoped>
/**
 * L'en-tête part plein écran et se replie. Animer la hauteur n'est pas
 * gratuit, mais c'est précisément ce repli qui fait remonter la page
 * sous lui — l'effet demandé. Un seul élément, une seule fois.
 */
.hero {
  height: 62dvh;
  min-height: 380px;
  animation: heroCollapse 0.9s var(--ease-drawer) 1.9s both;
}

/* 100 / 62 : le plateau couvre l'écran au départ, vaut 1 à l'arrivée. */
.hero-stage {
  transform-origin: bottom center;
  animation: heroDezoom 0.9s var(--ease-drawer) 1.9s both;
}

.hero-text {
  animation: heroTitle 0.6s var(--ease-drawer) 2.5s both;
}

@keyframes heroCollapse {
  from {
    height: 100dvh;
  }
  to {
    height: 62dvh;
  }
}

@keyframes heroDezoom {
  from {
    transform: scale(1.613);
  }
  to {
    transform: scale(1);
  }
}

@keyframes heroTitle {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
