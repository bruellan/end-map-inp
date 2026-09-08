<script setup lang="ts">
import type { SectionType } from '#shared/schemas/metier'
import { sectionComponents } from '~/components/metier/sectionRegistry'

/**
 * Page métier.
 *
 * Elle ne connaît aucune section en particulier : elle lit le contenu,
 * filtre ce qui est masqué et délègue chaque élément au composant que
 * le registre associe à son `type`. Ajouter une section ne modifie pas
 * ce fichier.
 */

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: metier, error } = await useMetier(slug)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    message: error.value.message ?? 'Page métier indisponible',
    fatal: true,
  })
}

const visibleSections = computed(() => metier.value?.sections.filter((s) => s.visible) ?? [])

/**
 * Certaines sections sont conçues pour toucher le bas de la page — le
 * bloc de fin porte un dégradé et un collage qui doivent affleurer le
 * bord. Quand l'une d'elles termine la page, on retire la respiration
 * finale, qui laisserait sinon une bande blanche sous l'illustration.
 */
const BLEEDS_TO_BOTTOM: ReadonlySet<SectionType> = new Set<SectionType>(['tips'])

/**
 * La barre d'actions n'apparaît qu'une fois le panneau blanc remonté
 * jusqu'en haut : avant, elle se superposerait au titre.
 *
 * Une sentinelle placée en tête du panneau sert de repère — on regarde
 * si elle est passée au-dessus du bord haut, plutôt que de comparer une
 * position de défilement à une hauteur d'en-tête qu'il faudrait mesurer.
 */
const panelTop = useTemplateRef<HTMLElement>('panelTop')
const showTopBar = ref(false)
useIntersectionObserver(
  panelTop,
  ([entry]) => {
    if (entry) showTopBar.value = entry.boundingClientRect.top <= 0
  },
  { threshold: 0 },
)

const endsFlush = computed(() => {
  const last = visibleSections.value.at(-1)
  return last ? BLEEDS_TO_BOTTOM.has(last.type) && !last.separatorAfter : false
})

// Le suffixe « · Edumapper » est ajouté par le gabarit global (app.vue) ;
// on ne fournit ici que la partie spécifique à la fiche.
useSeoMeta({
  title: () => metier.value?.hero.title,
  description: () => metier.value?.hero.subtitle,
})
</script>

<template>
  <article v-if="metier" class="relative" :class="endsFlush ? 'pb-0' : 'pb-18'">
    <!--
      L'en-tête rend deux calques frères — fond et titre — qui encadrent
      le panneau dans l'empilement : le panneau recouvre le collage en
      remontant mais passe sous le titre, qui reste en haut.
      Les hauteurs sont partagées dans assets/css/hero.css.
    -->
    <MetierHero :hero="metier.hero" />

    <div class="hero-panel bg-surface-light rounded-t-xl">
      <!--
        Sentinelle en tête du panneau : elle dit quand celui-ci atteint le
        haut de l'écran. Attachée au panneau plutôt qu'à une position
        calculée, pour ne pas dupliquer la hauteur de l'en-tête.
      -->
      <div ref="panelTop" class="h-px" aria-hidden="true" />

      <!--
        TransitionGroup, et pas un simple v-for : quand l'éditeur
        réordonne ou masque une section, les voisines glissent à leur
        nouvelle position au lieu de sauter. L'animation FLIP est calculée
        par Vue, on ne fournit que les classes (voir transitions.css).
      -->
      <TransitionGroup name="section-list" tag="div" class="flex flex-col gap-10 pt-12">
        <div v-for="section in visibleSections" :key="section.id" class="px-4">
          <component :is="sectionComponents[section.type]" :section="section" />

          <!-- Le trait déborde la gouttière : pleine largeur dans la
               maquette, d'où les marges négatives. -->
          <hr
            v-if="section.separatorAfter"
            class="bg-surface-overlay-5 -mx-4 mt-10 h-0.5 border-0"
          />
        </div>
      </TransitionGroup>
    </div>

    <!--
      La barre d'actions ne paraît qu'une fois le panneau remonté : avant,
      elle se superposerait au titre. En `fixed`, donc contrainte à la
      largeur de la maquette comme le reste de la page.
    -->
    <Transition name="fade">
      <div
        v-if="showTopBar"
        class="bg-surface-light/80 fixed inset-x-0 top-0 z-30 mx-auto max-w-[402px] backdrop-blur-sm"
      >
        <MetierTopBar />
      </div>
    </Transition>
  </article>
</template>
