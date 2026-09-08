<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'studies'>>({ required: true })

const createStep = () => ({ id: createId('step'), level: '', label: '', description: '' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.steps"
    add-label="Ajouter une étape"
    :create-item="createStep"
  >
    <div class="grid grid-cols-3 gap-3">
      <BaseField v-slot="{ id }" label="Niveau">
        <BaseInput :id="id" v-model="item.level" placeholder="Bac +3" />
      </BaseField>
      <div class="col-span-2">
        <BaseField v-slot="{ id }" label="Intitulé">
          <BaseInput :id="id" v-model="item.label" placeholder="Licence Informatique" />
        </BaseField>
      </div>
    </div>
    <BaseField v-slot="{ id }" label="Description">
      <BaseTextarea :id="id" v-model="item.description" :rows="2" />
    </BaseField>
  </EditorRepeater>
</template>
