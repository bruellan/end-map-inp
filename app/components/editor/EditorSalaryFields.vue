<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'salary'>>({ required: true })

const createLevel = () => ({ id: createId('lvl'), label: '', min: 0, max: 0 })
</script>

<template>
  <div class="space-y-4">
    <BaseField v-slot="{ id }" label="Période">
      <select
        :id="id"
        v-model="section.period"
        class="border-border-light bg-surface-light text-primary focus:border-actions-primary w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
      >
        <option value="month">Par mois</option>
        <option value="year">Par an</option>
      </select>
    </BaseField>

    <EditorRepeater
      v-slot="{ item }"
      v-model="section.levels"
      add-label="Ajouter un niveau"
      :create-item="createLevel"
    >
      <BaseField v-slot="{ id }" label="Niveau">
        <BaseInput :id="id" v-model="item.label" placeholder="Débutant" />
      </BaseField>
      <div class="grid grid-cols-2 gap-3">
        <BaseField v-slot="{ id }" label="Minimum">
          <BaseInput :id="id" v-model.number="item.min" type="number" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Maximum">
          <BaseInput :id="id" v-model.number="item.max" type="number" />
        </BaseField>
      </div>
    </EditorRepeater>
  </div>
</template>
