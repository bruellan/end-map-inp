<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'richText'>>({ required: true })
</script>

<template>
  <BaseField v-slot="{ id }" label="Contenu" hint="Une ligne vide sépare deux paragraphes.">
    <BaseTextarea :id="id" v-model="section.body" :rows="8" />
  </BaseField>
</template>
