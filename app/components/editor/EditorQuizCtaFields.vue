<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'quizCta'>>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <BaseField v-slot="{ id }" label="Sous-titre">
      <BaseInput :id="id" v-model="section.subtitle" placeholder="En 2 min. top chrono !" />
    </BaseField>

    <div class="grid grid-cols-2 gap-3">
      <BaseField v-slot="{ id }" label="Libellé du bouton">
        <BaseInput :id="id" v-model="section.ctaLabel" placeholder="Passe le test" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Destination">
        <BaseInput :id="id" v-model="section.ctaHref" placeholder="/onboarding" />
      </BaseField>
    </div>

    <EditorImageSlots
      v-model="section.decorations"
      :count="4"
      label="Visuels décoratifs"
      hint="Quatre emplacements, disposés par la maquette."
    />
  </div>
</template>
