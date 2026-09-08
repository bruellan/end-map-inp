<script setup lang="ts">
import type { CollageStory } from '#shared/schemas/metier'

/**
 * Récit ouvert au clic sur une pièce du collage.
 *
 * S'appuie sur l'élément `<dialog>` natif : le piège de focus, la couche
 * supérieure et l'inertie du fond viennent gratuitement. On garde la main
 * sur la fermeture (Échap, clic hors contenu, croix) pour l'animer — le
 * `.close()` natif, lui, retirerait le dialog d'un coup.
 *
 * Mise en scène de la maquette : le fond reste la page, simplement floutée
 * (`backdrop-filter` sur le `::backdrop`), et la découpe se présente comme
 * un sticker cerné de blanc qui fait deux tours sur lui-même à l'ouverture
 * avant de se poser bien droit.
 */
const story = defineModel<CollageStory | null>({ required: true })

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

/**
 * Fermeture en deux temps : on joue d'abord l'animation de sortie, puis
 * `animationend` vide le modèle, ce qui déclenche le `close()` natif.
 */
const closing = ref(false)

watch(story, (value) => {
  const el = dialog.value
  if (!el) return
  if (value) {
    closing.value = false
    if (!el.open) el.showModal()
  } else if (el.open) {
    el.close()
  }
})

function requestClose() {
  if (closing.value) return
  closing.value = true
}

function onAnimationEnd() {
  if (!closing.value) return
  closing.value = false
  story.value = null
}

/** `close` couvre la fermeture native (par sécurité) et remet le modèle à plat. */
const onClose = () => (story.value = null)
</script>

<template>
  <dialog
    ref="dialog"
    class="story-dialog mx-auto my-0 h-dvh max-h-none w-full max-w-[402px] overflow-hidden bg-transparent p-0"
    :class="closing ? 'is-closing' : 'is-opening'"
    @close="onClose"
    @cancel.prevent="requestClose"
    @animationend.self="onAnimationEnd"
    @click.self="requestClose"
  >
    <!-- Un clic sur cette zone (hors texte et sticker) ferme le dialog. -->
    <article v-if="story" class="relative flex h-full w-full flex-col" @click="requestClose">
      <!-- Croix, en haut à gauche. -->
      <button
        type="button"
        aria-label="Fermer"
        class="bg-surface-light/85 text-primary absolute top-5 left-4 z-10 flex size-11 items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-150 ease-out active:scale-90"
        @click="requestClose"
      >
        <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <div class="flex flex-1 flex-col items-center justify-center gap-10 overflow-y-auto px-8 py-20">
        <!-- Sticker : cadre blanc épousant la découpe. Protégé du clic-pour-fermer. -->
        <div class="w-[62%] max-w-[240px] shrink-0" @click.stop>
          <img :src="story.image" alt="" draggable="false" class="sticker-cut block h-auto w-full" />
        </div>

        <!-- Texte : protégé du clic-pour-fermer. -->
        <div class="flex flex-col gap-6 text-center" @click.stop>
          <h2 class="text-invert-primary text-heading-lg font-bold">{{ story.title }}</h2>
          <p v-if="story.body" class="text-invert-primary text-body font-medium">{{ story.body }}</p>
        </div>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
/**
 * Contour « sticker » : un liseré blanc de 3px qui épouse la silhouette
 * détourée, obtenu en empilant des ombres portées nettes dans huit
 * directions (les diagonales bouchent les coins que les quatre axes
 * laisseraient dégarnis). Une dernière ombre douce détache le sticker du
 * fond. Un `border` donnerait un carré ; ceci suit la découpe.
 *
 * À l'ouverture, un tour sur l'axe vertical puis retour à l'endroit :
 * l'`ease-drawer` décélère fort en fin de course, si bien qu'il file au
 * départ et se pose en douceur.
 */
.sticker-cut {
  filter: drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff)
    drop-shadow(0 -3px 0 #fff) drop-shadow(2px 2px 0 #fff) drop-shadow(-2px 2px 0 #fff)
    drop-shadow(2px -2px 0 #fff) drop-shadow(-2px -2px 0 #fff)
    drop-shadow(0 10px 14px rgb(0 0 0 / 0.25));
  animation: stickerSpinIn 3s var(--ease-drawer) both;
}

@keyframes stickerSpinIn {
  from {
    transform: perspective(900px) rotateY(360deg);
  }
  to {
    transform: perspective(900px) rotateY(0deg);
  }
}

/* Le fond reste la page, simplement floutée et légèrement assombrie. */
.story-dialog::backdrop {
  background: rgb(24 25 29 / 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Apparition au centre (zoom), pas de glissement depuis le bas. */
.story-dialog.is-opening {
  animation: var(--animate-appear-zoom-in);
}
.story-dialog.is-opening::backdrop {
  animation: var(--animate-overlay-show);
}

/* Fermeture symétrique. */
.story-dialog.is-closing {
  animation: var(--animate-disappear-zoom-out);
}
.story-dialog.is-closing::backdrop {
  animation: overlayShow 0.2s var(--ease-drawer) reverse both;
}
</style>
