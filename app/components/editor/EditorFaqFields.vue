<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'faq'>>({ required: true })

const createQuestion = () => ({
  id: createId('faq'),
  question: '',
  answer: '',
  icon: 'red-question-mark',
})
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter une question"
    :create-item="createQuestion"
  >
    <BaseField v-slot="{ id }" label="Question">
      <BaseInput :id="id" v-model="item.question" />
    </BaseField>
    <BaseField v-slot="{ id }" label="Réponse">
      <BaseTextarea :id="id" v-model="item.answer" :rows="3" />
    </BaseField>
  </EditorRepeater>
</template>
