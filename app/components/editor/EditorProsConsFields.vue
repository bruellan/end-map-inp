<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'prosCons'>>({ required: true })

const createTab = () => ({
  id: createId('tab'),
  label: '',
  icon: 'thumbs-up',
  entries: [],
})
const createEntry = () => ({ id: createId('entry'), title: '', body: '' })
</script>

<template>
  <!-- Deux niveaux de répétition : des onglets, chacun contenant ses
       entrées. Le même composant sert aux deux. -->
  <EditorRepeater
    v-slot="{ item: tab }"
    v-model="section.tabs"
    add-label="Ajouter un onglet"
    :create-item="createTab"
    :min-items="1"
  >
    <EditorIconField v-model="tab.icon" />
    <BaseField v-slot="{ id }" label="Onglet">
      <BaseInput :id="id" v-model="tab.label" placeholder="Les plus" />
    </BaseField>

    <EditorRepeater
      v-slot="{ item: entry }"
      v-model="tab.entries"
      add-label="Ajouter un point"
      :create-item="createEntry"
    >
      <BaseField v-slot="{ id }" label="Titre">
        <BaseInput :id="id" v-model="entry.title" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Texte">
        <BaseTextarea :id="id" v-model="entry.body" :rows="3" />
      </BaseField>
    </EditorRepeater>
  </EditorRepeater>
</template>
