<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'tips'>>({ required: true })

const createTip = () => ({ id: createId('tip'), icon: 'pushpin', body: '' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter un conseil"
    :create-item="createTip"
  >
    <EditorIconField v-model="item.icon" />
    <BaseField v-slot="{ id }" label="Conseil">
      <BaseTextarea :id="id" v-model="item.body" :rows="3" />
    </BaseField>
  </EditorRepeater>
</template>
