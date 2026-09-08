<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'tips'>>({ required: true })

const createTip = () => ({ id: createId('tip'), icon: 'pushpin', lead: '', body: '' })
</script>

<template>
  <div class="space-y-4">
    <EditorRepeater
      v-slot="{ item }"
      v-model="section.items"
      add-label="Ajouter un conseil"
      :create-item="createTip"
    >
      <EditorIconField v-model="item.icon" />
      <BaseField v-slot="{ id }" label="Amorce" hint="Mise en avant en gras, avant le corps.">
        <BaseInput :id="id" v-model="item.lead" placeholder="Développe ta culture du secteur :" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Conseil">
        <BaseTextarea :id="id" v-model="item.body" :rows="2" />
      </BaseField>
    </EditorRepeater>

    <EditorCollageStories v-model="section.collage" />
  </div>
</template>
