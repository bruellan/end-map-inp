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
  description: () => metier.value?.hero.tagline,
})
</script>

<template>
  <article v-if="metier">
    <MetierHero :hero="metier.hero" />

    <!--
      TransitionGroup, et pas un simple v-for : quand l'éditeur
      réordonne ou masque une section, les voisines glissent à leur
      nouvelle position au lieu de sauter. L'animation FLIP est calculée
      par Vue, on ne fournit que les classes (voir transitions.css).
    -->
    <TransitionGroup name="section-list" tag="div" class="divide-border-light relative divide-y">
      <component
        :is="sectionComponents[section.type]"
        v-for="section in visibleSections"
        :key="section.id"
        :section="section"
      />
    </TransitionGroup>

    <footer class="px-5 py-8 text-center">
      <NuxtLink
        :to="`/${slug}/editor`"
        class="text-tertiary text-sm font-medium underline underline-offset-4"
      >
        Modifier cette page
      </NuxtLink>
    </footer>
  </article>
</template>
