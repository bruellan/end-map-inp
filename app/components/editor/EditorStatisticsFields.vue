<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'statistics'>>({ required: true })

const createStat = () => ({
  id: createId('stat'),
  value: '',
  label: '',
  icon: 'bar-chart',
})
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter un chiffre"
    :create-item="createStat"
  >
    <EditorIconField v-model="item.icon" />
    <BaseField v-slot="{ id }" label="Valeur" hint="Déjà formatée : « 2 000 € », « 1,3 million ».">
      <BaseInput :id="id" v-model="item.value" placeholder="2 000 €" />
    </BaseField>
    <BaseField v-slot="{ id }" label="Légende">
      <BaseInput :id="id" v-model="item.label" placeholder="salaire médian en début de carrière" />
    </BaseField>
  </EditorRepeater>
</template>
