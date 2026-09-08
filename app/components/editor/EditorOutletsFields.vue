<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'outlets'>>({ required: true })

const createOutlet = () => ({ id: createId('out'), label: '', description: '', icon: '✨' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter un débouché"
    :create-item="createOutlet"
  >
    <div class="grid grid-cols-4 gap-3">
      <BaseField v-slot="{ id }" label="Icône">
        <BaseInput :id="id" v-model="item.icon" placeholder="🎨" />
      </BaseField>
      <div class="col-span-3">
        <BaseField v-slot="{ id }" label="Intitulé">
          <BaseInput :id="id" v-model="item.label" placeholder="Développeur front-end" />
        </BaseField>
      </div>
    </div>
    <BaseField v-slot="{ id }" label="Description">
      <BaseInput :id="id" v-model="item.description" />
    </BaseField>
  </EditorRepeater>
</template>
