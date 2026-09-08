<script setup lang="ts">
const { data } = await useFetch<{ slugs: string[] }>('/api/metiers')

useSeoMeta({ title: 'Métiers — Edumapper' })
</script>

<template>
  <div class="px-5 py-10">
    <h1 class="text-heading-lg text-primary font-bold tracking-tight">Métiers</h1>
    <p class="text-tertiary mt-1 text-sm">Choisis un métier pour découvrir la fiche.</p>

    <ul class="mt-6 space-y-2">
      <li v-for="slug in data?.slugs ?? []" :key="slug">
        <NuxtLink
          :to="`/metiers/${slug}`"
          class="bg-surface-soft-warm text-primary flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          {{ slug }}
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
