<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const props = defineProps<{ section: SectionOfType<'tips'> }>()

const activeIndex = ref(0)

/** Durée d'affichage d'un conseil avant passage au suivant. */
const AUTOPLAY_MS = 5000

/** L'éditeur peut retirer le conseil affiché : on revient au premier. */
watch(
  () => props.section.items.length,
  (length) => {
    if (activeIndex.value >= length) activeIndex.value = 0
  },
)

const activeTip = computed(() => props.section.items[activeIndex.value])

function goTo(index: number) {
  const total = props.section.items.length
  if (!total) return
  // Modulo positif : passer avant le premier ramène au dernier.
  activeIndex.value = ((index % total) + total) % total
  restart()
}

/**
 * Défilement automatique.
 *
 * Mis en pause dès que l'utilisateur touche la carte ou donne le focus
 * au clavier : un carrousel qui bouge pendant qu'on le lit est une gêne,
 * et une cible qui se dérobe sous le doigt en est une autre.
 * Il ne démarre pas du tout si l'utilisateur a demandé à réduire les
 * animations.
 */
const card = useTemplateRef<HTMLElement>('card')
const reducedMotion = usePreferredReducedMotion()
const paused = ref(false)

const { pause, resume } = useIntervalFn(() => goTo(activeIndex.value + 1), AUTOPLAY_MS, {
  immediate: false,
})

/** Redémarre le compte à rebours — et l'animation de la barre, qui suit `runId`. */
const runId = ref(0)
function restart() {
  runId.value += 1
  pause()
  if (!paused.value && !isStatic.value) resume()
}

const isStatic = computed(() => reducedMotion.value === 'reduce' || props.section.items.length < 2)

watch([paused, isStatic], () => (paused.value || isStatic.value ? pause() : resume()))
onMounted(() => {
  if (!isStatic.value) resume()
})

const { direction, isSwiping } = useSwipe(card, { threshold: 40 })
watch(isSwiping, (swiping, wasSwiping) => {
  if (swiping || !wasSwiping) return
  if (direction.value === 'left') goTo(activeIndex.value + 1)
  if (direction.value === 'right') goTo(activeIndex.value - 1)
})

/**
 * Emplacements du collage, relevés sur la maquette.
 *
 * Exprimés dans le repère du groupe d'images (542x402), pas dans celui
 * du bloc : la couche qui les porte reproduit ce ratio exact, donc les
 * pourcentages tombent juste quelle que soit la largeur d'écran. Les
 * calculer sur la hauteur du bloc les écrasait, puisque notre bloc est
 * plus court que celui de la maquette.
 *
 * Largeur et hauteur sont toutes deux imposées : les PNG exportés n'ont
 * pas le ratio des cadres Figma. `object-contain` fait tenir l'objet
 * sans le déformer.
 */
const COLLAGE = [
  { left: '0.0%', top: '4.0%', width: '43.2%', height: '82.6%', rotate: '7deg' },
  { left: '41.9%', top: '33.8%', width: '6.3%', height: '8.7%', rotate: '-41deg' },
  { left: '7.2%', top: '6.0%', width: '17.5%', height: '15.4%', rotate: '15deg' },
  { left: '10.5%', top: '51.7%', width: '25.8%', height: '32.1%', rotate: '-9deg' },
  { left: '20.8%', top: '40.0%', width: '28.0%', height: '46.0%', rotate: '21deg' },
  { left: '72.0%', top: '16.7%', width: '27.3%', height: '40.8%', rotate: '145deg' },
  { left: '58.1%', top: '27.6%', width: '37.5%', height: '44.5%', rotate: '-12deg' },
  // L'export de l'herbe est déjà dans le bon sens : appliquer les 174°
  // relevés la retournerait. On garde l'inclinaison, pas le retournement.
  { left: '62.2%', top: '35.6%', width: '37.8%', height: '64.4%', rotate: '-6deg' },
  { left: '47.2%', top: '26.6%', width: '26.4%', height: '34.3%', rotate: '0deg' },
  { left: '39.5%', top: '56.5%', width: '20.8%', height: '39.3%', rotate: '0deg' },
  { left: '55.4%', top: '51.2%', width: '13.5%', height: '29.4%', rotate: '0deg' },
  { left: '79.5%', top: '0.0%', width: '17.9%', height: '24.1%', rotate: '-15deg' },
] as const

/**
 * Figma liste les enfants du premier plan vers l'arrière, alors qu'en
 * DOM c'est le dernier élément qui passe devant. D'où le `zIndex`
 * décroissant : sans lui l'herbe recouvrirait le personnage qu'elle doit
 * encadrer.
 */
const collageSlots = computed(() =>
  COLLAGE.map((slot, index) => ({
    slot,
    url: props.section.collage[index] ?? '',
    zIndex: COLLAGE.length - index,
  })).filter((entry) => entry.url),
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
        la carte active. Purement visuel, donc `aria-hidden` — un lecteur
        d'écran n'a rien à y lire.
      -->
      <div
        ref="card"
        class="relative mt-10 flex touch-pan-y justify-center px-6"
        role="group"
        aria-roledescription="carrousel"
        @pointerenter="paused = true"
        @pointerleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
      >
        <span
          class="bg-surface-light/70 absolute top-0 h-[85%] w-[72%] -rotate-6 rounded-lg"
          aria-hidden="true"
        />
        <span
          class="bg-surface-light/70 absolute top-0 h-[85%] w-[72%] rotate-6 rounded-lg"
          aria-hidden="true"
        />

        <Transition name="zoom" mode="out-in">
          <article
            :key="activeTip?.id"
            class="bg-surface-light shadow-s relative flex w-[65%] flex-col items-center gap-6 rounded-lg px-6 py-10 text-center"
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
        que remplit une barre sur la durée d'affichage. `runId` en clé
        force le remontage à chaque changement, ce qui rejoue l'animation
        depuis zéro — plus fiable que de la réinitialiser à la main.
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
          @click="goTo(index)"
        >
          <span
            v-if="activeIndex === index"
            :key="runId"
            class="bg-surface-dark block h-full w-full origin-left rounded-full"
            :style="
              isStatic || paused
                ? { transform: 'scaleX(1)' }
                : {
                    animation: `var(--animate-progress-fill)`,
                    animationDuration: `${AUTOPLAY_MS}ms`,
                  }
            "
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
      <div
        class="pointer-events-none absolute bottom-0 left-[-13.7%] aspect-[542/402] w-[126%] translate-y-[22.6%]"
        aria-hidden="true"
      >
        <img
          v-for="(entry, index) in collageSlots"
          :key="`${entry.url}-${index}`"
          :src="entry.url"
          alt=""
          loading="lazy"
          class="absolute object-contain"
          :style="{
            left: entry.slot.left,
            top: entry.slot.top,
            width: entry.slot.width,
            height: entry.slot.height,
            zIndex: entry.zIndex,
            transform: `rotate(${entry.slot.rotate})`,
          }"
        />
      </div>
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
</style>
