<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'about'>>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <BaseField v-slot="{ id }" label="Texte">
      <BaseTextarea :id="id" v-model="section.body" :rows="6" />
    </BaseField>
    <BaseField
      v-slot="{ id }"
      label="Libellé du bouton"
      hint="Vide : le texte s’affiche en entier, sans repli."
    >
      <BaseInput :id="id" v-model="section.expandLabel" placeholder="Lire la suite" />
    </BaseField>
  </div>
</template>
