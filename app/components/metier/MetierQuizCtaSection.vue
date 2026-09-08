<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'quizCta'> }>()
</script>

<template>
  <RevealOnScroll :id="section.id" as="section" class="scroll-mt-4">
    <div class="bg-surface-soft-warm flex flex-col gap-10 rounded-lg px-4 pt-12 pb-4">
      <div class="flex flex-col gap-3">
        <p class="text-heading text-primary font-semibold whitespace-pre-line">
          {{ section.title }}
        </p>
        <p class="text-body text-tertiary font-medium">{{ section.subtitle }}</p>
      </div>

      <NuxtLink
        :to="section.ctaHref"
        class="bg-actions-primary text-subheading text-invert-primary flex items-center justify-center gap-2 rounded-full px-6 py-4 font-medium transition-all duration-150 ease-out active:scale-[0.98]"
      >
        {{ section.ctaLabel }}
      </NuxtLink>
    </div>
  </RevealOnScroll>
</template>
