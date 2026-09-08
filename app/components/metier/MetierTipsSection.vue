<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'
import { COLLAGE_ASPECT } from './collageLayout'

const props = defineProps<{ section: SectionOfType<'tips'> }>()

/** Durée d'affichage d'un conseil avant passage au suivant. */
const AUTOPLAY_MS = 5000

/** Déplacement horizontal, en px, au-delà duquel on change de carte. */
const DRAG_THRESHOLD = 60

const activeIndex = ref(0)
const activeTip = computed(() => props.section.items[activeIndex.value])

/**
 * Sens du dernier changement. Détermine de quel côté la carte sortante
 * part et de quel côté l'entrante arrive.
 */
const slideTo = ref<'left' | 'right'>('left')
const transitionName = computed(() => `card-${slideTo.value}`)

/** L'éditeur peut retirer le conseil affiché : on revient au premier. */
watch(
  () => props.section.items.length,
  (length) => {
    if (activeIndex.value >= length) activeIndex.value = 0
  },
)

function goTo(index: number, towards: 'left' | 'right') {
  const total = props.section.items.length
  if (!total) return
  slideTo.value = towards
  // Modulo positif : passer avant le premier ramène au dernier.
  activeIndex.value = ((index % total) + total) % total
}

const next = () => goTo(activeIndex.value + 1, 'left')
const previous = () => goTo(activeIndex.value - 1, 'right')

/**
 * Défilement automatique.
 *
 * Il n'y a pas de minuteur JavaScript : c'est l'animation de la barre de
 * progression qui fait office d'horloge, et son `animationend` déclenche
 * le passage au conseil suivant. Une seule source de temps, donc rien à
 * resynchroniser — mettre l'animation en pause suspend aussi l'avance,
 * et la reprendre repart exactement d'où on s'était arrêté.
 */
const reducedMotion = usePreferredReducedMotion()
const isStatic = computed(() => reducedMotion.value === 'reduce' || props.section.items.length < 2)

/** Suspend l'avance : survol, doigt posé, ou focus clavier dans le bloc. */
const held = ref(false)
const dragging = ref(false)
const isPaused = computed(() => held.value || dragging.value)

/* ── Glisser à la souris comme au doigt ───────────────────────────── */

const card = useTemplateRef<HTMLElement>('card')
const dragX = ref(0)
let startX = 0

/**
 * Pointer Events plutôt que Touch Events : un seul jeu de gestionnaires
 * couvre le doigt, le stylet et la souris. `setPointerCapture` garde le
 * geste vivant même si le curseur quitte la carte en cours de route.
 */
function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || props.section.items.length < 2) return
  dragging.value = true
  startX = event.clientX
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  dragX.value = event.clientX - startX
}

function onPointerUp() {
  if (!dragging.value) return

  if (dragX.value <= -DRAG_THRESHOLD) next()
  else if (dragX.value >= DRAG_THRESHOLD) previous()

  // Remis à zéro avant de relâcher : la carte reprend sa place par la
  // transition CSS plutôt que d'un coup.
  dragX.value = 0
  dragging.value = false
}

/* ── Collage ──────────────────────────────────────────────────────── */
</script>

<template>
  <RevealOnScroll :id="section.id" as="section" class="scroll-mt-4">
    <!--
      Le bloc déborde la gouttière de la page : dégradé pleine largeur,
      d'où `-mx-4`. Le bord supérieur arrondi prolonge le blanc du
      contenu au-dessus, comme dans la maquette.
    -->
    <div class="brand-gradient relative -mx-4 overflow-hidden pt-28 pb-[72%]">
      <span class="bg-surface-light absolute inset-x-0 top-0 h-6 rounded-b-lg" aria-hidden="true" />

      <h2 class="text-heading text-primary px-6 text-center font-semibold whitespace-pre-line">
        {{ section.title }}
      </h2>

      <!--
        Pile de cartes : deux cartes décoratives inclinées à ±6° derrière
        la carte active. Purement visuel, donc `aria-hidden`.
      -->
      <div
        ref="card"
        class="relative mt-10 flex touch-pan-y justify-center px-6 select-none"
        role="group"
        aria-roledescription="carrousel"
        @pointerenter="held = true"
        @pointerleave="held = false"
        @focusin="held = true"
        @focusout="held = false"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <span
          class="bg-surface-light/70 absolute top-0 h-[260px] w-[72%] -rotate-6 rounded-lg"
          aria-hidden="true"
        />
        <span
          class="bg-surface-light/70 absolute top-0 h-[260px] w-[72%] rotate-6 rounded-lg"
          aria-hidden="true"
        />

        <Transition :name="transitionName">
          <article
            :key="activeTip?.id"
            class="bg-surface-light shadow-s relative flex h-[280px] w-[65%] cursor-grab flex-col items-center justify-center gap-6 rounded-lg px-6 text-center active:cursor-grabbing"
            :class="!dragging && 'ease-drawer transition-transform duration-300'"
            :style="{ transform: `translateX(${dragX}px)` }"
            :aria-label="`Conseil ${activeIndex + 1} sur ${section.items.length}`"
          >
            <BaseEmoji v-if="activeTip" :name="activeTip.icon" size="size-20" />
            <p class="text-body text-secondary">
              <strong class="text-primary font-semibold">{{ activeTip?.lead }}</strong>
              {{ activeTip?.body }}
            </p>
          </article>
        </Transition>
      </div>

      <!--
        Pagination et minuterie confondues : le point actif est une piste
        que remplit une barre sur la durée d'affichage, et c'est la fin de
        cette animation qui fait avancer le carrousel.
      -->
      <div v-if="section.items.length > 1" class="mt-8 flex items-center justify-center gap-1.5">
        <button
          v-for="(item, index) in section.items"
          :key="item.id"
          type="button"
          :aria-label="`Afficher le conseil ${index + 1}`"
          :aria-current="activeIndex === index"
          class="bg-surface-overlay-15 ease-drawer h-2 overflow-hidden rounded-full transition-all duration-300"
          :class="activeIndex === index ? 'w-6' : 'w-2'"
          @click="goTo(index, index > activeIndex ? 'left' : 'right')"
        >
          <span
            v-if="activeIndex === index"
            :key="activeIndex"
            class="bg-surface-dark block h-full w-full origin-left rounded-full"
            :style="
              isStatic
                ? { transform: 'scaleX(1)' }
                : {
                    animation: `var(--animate-progress-fill)`,
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }
            "
            @animationend="next"
          />
        </button>
      </div>

      <!--
        Couche de collage au ratio exact du groupe Figma (542x402),
        débordant de 13,7% à gauche et de 22,6% en bas — c'est ce
        débordement, rogné par `overflow-hidden`, qui donne l'impression
        que les illustrations sortent de la page.
        Le débord vertical passe par `translate-y` et non par `bottom` :
        un pourcentage sur `bottom` se calcule sur la hauteur du
        conteneur, pas sur celle de la couche.
      -->
      <!--
        Le collage a sa propre révélation, distincte de celle de la
        section : le bloc fait plus de deux écrans de haut, l'observateur
        de la section se déclenchait bien avant qu'on ait atteint les
        illustrations. On observe ici la couche elle-même, avec une marge
        négative en bas : elle doit être remontée d'un cinquième d'écran
        pour déclencher. Un seuil de proportion ne conviendrait pas — la
        couche est rognée par le `overflow: hidden` du bloc, sa part
        visible plafonne.
      -->
      <RevealOnScroll
        :threshold="0"
        root-margin="0px 0px -22% 0px"
        animation=""
        class="collage-layer pointer-events-none absolute bottom-0 left-[-13.7%] w-[126%] translate-y-[22.6%]"
        :style="{ aspectRatio: COLLAGE_ASPECT }"
        aria-hidden="true"
      >
        <MetierCollage :images="section.collage" />
      </RevealOnScroll>
    </div>
  </RevealOnScroll>
</template>

<style scoped>
/**
 * Entrée du collage, déclenchée par la révélation de la couche
 * elle-même (voir plus haut).
 *
 * `:deep()` est nécessaire : les images sont rendues par MetierCollage,
 * qui a plusieurs racines et ne reçoit donc pas l'identifiant de scope
 * du parent. Et la keyframe est globale, parce que l'en-tête s'en sert
 * aussi et que Vue renomme celles déclarées dans un style scopé.
 */
.collage-layer[data-reveal='done'] :deep(.collage-item) {
  animation: collageRise 0.9s var(--ease-drawer) both;
  animation-delay: var(--delay);
}

/**
 * Retour en place après un glissement trop court pour changer de carte.
 *
 * Déclaré comme une classe simple, et avant les classes de transition :
 * une règle plus spécifique (`article:not(...)`) écrasait leur
 * `transition`, et Vue ne recevait jamais le `transitionend` qui lui
 * signale la fin de la sortie — la carte sortante restait dans le DOM.
 */
.tip-card {
  transition: transform 0.3s var(--ease-drawer);
}

.tip-card.is-dragging {
  transition: none;
}

/**
 * Changement de carte.
 *
 * La sortante part sur le côté en pivotant légèrement, dans le sens du
 * geste. L'entrante, elle, ne vient jamais du côté opposé : elle monte
 * depuis l'arrière de la pile en grandissant, comme si elle était
 * dessous depuis le début. Son entrée est décalée pour que la place se
 * libère avant qu'elle n'arrive.
 */
.card-left-enter-active,
.card-right-enter-active {
  transition:
    opacity 0.4s var(--ease-drawer) 0.12s,
    transform 0.45s var(--ease-drawer) 0.12s;
}

.card-left-enter-from,
.card-right-enter-from {
  opacity: 0;
  transform: translateY(-22px) scale(0.88);
}

/* Sort du flux pour que l'entrante prenne sa place sans décaler la pile. */
.card-left-leave-active,
.card-right-leave-active {
  position: absolute;
  transition:
    opacity 0.32s var(--ease-in-quad),
    transform 0.32s var(--ease-in-quad);
}

.card-left-leave-to {
  opacity: 0;
  transform: translateX(-78%) rotate(-9deg);
}

.card-right-leave-to {
  opacity: 0;
  transform: translateX(78%) rotate(9deg);
}
</style>
