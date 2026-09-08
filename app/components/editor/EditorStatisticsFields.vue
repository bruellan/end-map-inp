<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'statistics'>>({ required: true })

const createStat = () => ({ id: createId('stat'), value: '', label: '', icon: '📊' })
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter un chiffre"
    :create-item="createStat"
  >
    <div class="grid grid-cols-4 gap-3">
      <BaseField v-slot="{ id }" label="Icône">
        <BaseInput :id="id" v-model="item.icon" />
      </BaseField>
      <div class="col-span-3">
        <BaseField
          v-slot="{ id }"
          label="Valeur"
          hint="Déjà formatée : « 2 000 € », « 1,3 million »."
        >
          <BaseInput :id="id" v-model="item.value" placeholder="2 000 €" />
        </BaseField>
      </div>
    </div>
    <BaseField v-slot="{ id }" label="Légende">
      <BaseInput :id="id" v-model="item.label" placeholder="salaire médian en début de carrière" />
    </BaseField>
  </EditorRepeater>
</template>
