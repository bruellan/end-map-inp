<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'metierCards'>>({ required: true })

const createCard = () => ({ id: createId('card'), label: '', photoUrl: '', stickerUrl: '' })
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
    <div class="grid grid-cols-2 gap-3">
      <BaseField v-slot="{ id }" label="Photo" hint="Cadrée dans la vignette blanche.">
        <BaseInput :id="id" v-model="item.photoUrl" placeholder="/images/…" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Objet 3D" hint="Détouré, débordant à droite.">
        <BaseInput :id="id" v-model="item.stickerUrl" placeholder="/images/…" />
      </BaseField>
    </div>
  </EditorRepeater>
</template>
