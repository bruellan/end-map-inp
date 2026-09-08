<script setup lang="ts">
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
    statusMessage: error.value.statusMessage ?? 'Page métier indisponible',
    fatal: true,
  })
}

const visibleSections = computed(() => metier.value?.sections.filter((s) => s.visible) ?? [])

useSeoMeta({
  title: () => (metier.value ? `${metier.value.hero.title} — Edumapper` : 'Edumapper'),
  description: () => metier.value?.hero.subtitle,
})
</script>

<template>
  <article v-if="metier" class="pt-8 pb-18">
    <MetierHero :hero="metier.hero" />

    <!--
      TransitionGroup, et pas un simple v-for : quand l'éditeur
      réordonne ou masque une section, les voisines glissent à leur
      nouvelle position au lieu de sauter. L'animation FLIP est calculée
      par Vue, on ne fournit que les classes (voir transitions.css).
    -->
    <TransitionGroup name="section-list" tag="div" class="relative flex flex-col gap-10 pt-12">
      <div v-for="section in visibleSections" :key="section.id" class="px-4">
        <component :is="sectionComponents[section.type]" :section="section" />

        <!-- Le trait déborde la gouttière : pleine largeur dans la
             maquette, d'où les marges négatives. -->
        <hr v-if="section.separatorAfter" class="bg-surface-overlay-5 -mx-4 mt-10 h-0.5 border-0" />
      </div>
    </TransitionGroup>

    <footer class="px-4 pt-12 text-center">
      <NuxtLink
        :to="`/${slug}/editor`"
        class="text-label text-tertiary font-medium underline underline-offset-4"
      >
        Modifier cette page
      </NuxtLink>
    </footer>
  </article>
</template>
