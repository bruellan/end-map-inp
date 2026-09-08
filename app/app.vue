<script setup lang="ts">
/**
 * Convention SEO (calquée sur edumapper.com) centralisée ici.
 *
 * - Séparateur point médian « · » et marque en suffixe : chaque page ne
 *   déclare que sa partie spécifique, le gabarit ajoute « · Edumapper ».
 *   Une page sans titre retombe sur la marque + son slogan, comme leur
 *   `og:title`. Le gabarit vit dans `app.vue` (et non `nuxt.config`, qui
 *   sérialise `head` en JSON et perdrait la fonction).
 * - `og:*` statiques et partagés sur tout le site, à l'image d'edumapper ;
 *   une page peut les surcharger si besoin.
 */
useHead({
  titleTemplate: (title) =>
    title ? `${title} · Edumapper` : "Edumapper · L'orientation post-bac, facilement",
})

useSeoMeta({
  description:
    "Edumapper t'aide à trouver ton orientation post-bac. Découvre les formations qui te correspondent vraiment.",
  ogSiteName: 'Edumapper',
  ogTitle: "Edumapper - L'orientation post-bac, facilement",
  ogDescription: 'Découvre les formations qui te correspondent vraiment grâce à Edumapper.',
  ogType: 'website',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
