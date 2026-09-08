<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'metierCards'>>({ required: true })

const createCard = () => ({ id: createId('card'), label: '', imageUrl: '' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter une carte"
    :create-item="createCard"
  >
    <BaseField v-slot="{ id }" label="Intitulé" hint="Les retours à la ligne sont conservés.">
      <BaseTextarea
        :id="id"
        v-model="item.label"
        :rows="2"
        placeholder="Restauration&#10;& Cuisine"
      />
    </BaseField>
    <BaseField v-slot="{ id }" label="Image">
      <BaseInput :id="id" v-model="item.imageUrl" type="url" placeholder="https://…" />
    </BaseField>
  </EditorRepeater>
</template>
