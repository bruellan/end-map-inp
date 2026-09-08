<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

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

/**
 * Emplacements du collage, relevés sur la maquette.
 *
 * Exprimés dans le repère du groupe d'images (542x402), pas dans celui
 * du bloc : la couche qui les porte reproduit ce ratio exact, donc les
 * pourcentages tombent juste quelle que soit la largeur d'écran.
 *
 * `z` est explicite : l'empilement voulu ne suit ni l'ordre du DOM ni
 * celui du fichier Figma. Plus la valeur est haute, plus l'élément est
 * au premier plan.
 */
const COLLAGE = [
  { left: 0.0, top: 4.0, width: 43.2, height: 82.6, rotate: 7, z: 1 },
  { left: 41.9, top: 33.8, width: 6.3, height: 8.7, rotate: -41, z: 6 },
  // L'export « Oui chef » est vertical, texte de bas en haut : les 90°
  // le redressent, les -15° restants reprennent l'inclinaison de la
  // maquette. Sa boîte est donc haute et étroite — c'est la rotation qui
  // la rend large à l'écran.
  { left: 8.0, top: 1.9, width: 11.4, height: 23.6, rotate: 75, z: 8 },
  { left: 10.5, top: 51.7, width: 25.8, height: 32.1, rotate: -9, z: 9 },
  { left: 20.8, top: 40.0, width: 28.0, height: 46.0, rotate: 21, z: 2 },
  { left: 72.0, top: 16.7, width: 27.3, height: 40.8, rotate: 145, z: 3 },
  { left: 58.1, top: 27.6, width: 37.5, height: 44.5, rotate: -12, z: 4 },
  // L'export de l'herbe est déjà dans le bon sens : appliquer les 174°
  // relevés la retournerait. On garde l'inclinaison, pas le retournement.
  { left: 62.2, top: 35.6, width: 37.8, height: 64.4, rotate: -6, z: 5 },
  { left: 47.2, top: 26.6, width: 26.4, height: 34.3, rotate: 0, z: 7 },
  { left: 39.5, top: 56.5, width: 20.8, height: 39.3, rotate: 0, z: 10 },
  { left: 55.4, top: 51.2, width: 13.5, height: 29.4, rotate: 0, z: 12 },
  { left: 79.5, top: 0.0, width: 17.9, height: 24.1, rotate: -15, z: 11 },
] as const

/**
 * Les illustrations montent depuis le bas du cadre, chacune décalée vers
 * son propre bord : celles de gauche sortent d'en bas à gauche, celles
 * du milieu tout droit, celles de droite d'en bas à droite. L'écart
 * horizontal se déduit de la distance au centre, donc le mouvement suit
 * la composition au lieu d'être arbitraire.
 */
const collageSlots = computed(() =>
  COLLAGE.map((slot, index) => {
    const centreOffset = (slot.left + slot.width / 2 - 50) / 50 // -1 (gauche) → 1 (droite)
    return {
      slot,
      url: props.section.collage[index] ?? '',
      fromX: `${(centreOffset * 45).toFixed(0)}%`,
      // Les pièces du fond entrent en premier, celles du premier plan
      // ensuite : le collage se compose sous les yeux.
      delay: `${slot.z * 45}ms`,
    }
  }).filter((entry) => entry.url),
)
</script>

<template>
  <RevealOnScroll :id="section.id" as="section" class="scroll-mt-4">
    <!--
      Le bloc déborde la gouttière de la page : dégradé pleine largeur,
      d'où `-mx-4`. Le bord supérieur arrondi prolonge le blanc du
      contenu au-dessus, comme dans la maquette.
    -->
    <div class="tips-backdrop relative -mx-4 overflow-hidden pt-28 pb-[72%]">
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
        class="collage-layer pointer-events-none absolute bottom-0 left-[-13.7%] aspect-[542/402] w-[126%] translate-y-[22.6%]"
        aria-hidden="true"
      >
        <img
          v-for="(entry, index) in collageSlots"
          :key="`${entry.url}-${index}`"
          :src="entry.url"
          alt=""
          loading="lazy"
          class="collage-item absolute object-contain"
          :style="{
            left: `${entry.slot.left}%`,
            top: `${entry.slot.top}%`,
            width: `${entry.slot.width}%`,
            height: `${entry.slot.height}%`,
            zIndex: entry.slot.z,
            '--rot': `${entry.slot.rotate}deg`,
            '--from-x': entry.fromX,
            '--delay': entry.delay,
          }"
        />
      </RevealOnScroll>
    </div>
  </RevealOnScroll>
</template>

<style scoped>
/**
 * Dégradé de fond, repris tel quel de la maquette : trois halos
 * radiaux — orange à gauche, rose à droite, bleu en bas — sur le beige
 * de la marque.
 */
.tips-backdrop {
  background:
    radial-gradient(
      77.21% 35.76% at -19.77% 40.24%,
      rgb(255 107 54 / 0.31) 0%,
      rgb(255 107 54 / 0) 100%
    ),
    radial-gradient(
      75.52% 34.71% at 113.26% 69.37%,
      rgb(245 119 213 / 0.5) 0%,
      rgb(245 119 213 / 0) 100%
    ),
    radial-gradient(
      65.81% 30.48% at 0% 97.69%,
      rgb(143 191 255 / 0.6) 0%,
      rgb(143 191 255 / 0) 100%
    ),
    var(--color-surface-soft-warm);
}

/**
 * Entrée du collage, déclenchée par l'état posé par RevealOnScroll : les
 * illustrations montent depuis le bas du cadre en s'écartant vers leur
 * bord. La rotation passe par une variable pour rester présente aux deux
 * bouts de la keyframe — sinon l'animation l'écraserait.
 */
.collage-item {
  transform: rotate(var(--rot));
}

.collage-layer[data-reveal='done'] .collage-item {
  animation: collageRise 0.9s var(--ease-drawer) both;
  animation-delay: var(--delay);
}

@keyframes collageRise {
  from {
    opacity: 0;
    transform: translate(var(--from-x), 120%) rotate(var(--rot));
  }
  to {
    opacity: 1;
    transform: translate(0, 0) rotate(var(--rot));
  }
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
