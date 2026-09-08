<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'faq'>>({ required: true })

const createQuestion = () => ({ id: createId('faq'), question: '', answer: '', icon: '❓' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter une question"
    :create-item="createQuestion"
  >
    <div class="grid grid-cols-4 gap-3">
      <BaseField v-slot="{ id }" label="Icône">
        <BaseInput :id="id" v-model="item.icon" />
      </BaseField>
      <div class="col-span-3">
        <BaseField v-slot="{ id }" label="Question">
          <BaseInput :id="id" v-model="item.question" />
        </BaseField>
      </div>
    </div>
    <BaseField v-slot="{ id }" label="Réponse">
      <BaseTextarea :id="id" v-model="item.answer" :rows="3" />
    </BaseField>
  </EditorRepeater>
</template>
