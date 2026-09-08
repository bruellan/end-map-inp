<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'testimonials'>>({ required: true })

const createTestimonial = () => ({
  id: createId('tem'),
  author: '',
  role: '',
  quote: '',
  avatarUrl: '',
})
</script>

<template>
  <EditorRepeater
    v-slot="{ item }"
    v-model="section.items"
    add-label="Ajouter un témoignage"
    :create-item="createTestimonial"
  >
    <div class="grid grid-cols-2 gap-3">
      <BaseField v-slot="{ id }" label="Prénom">
        <BaseInput :id="id" v-model="item.author" placeholder="Lucie" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Rôle">
        <BaseInput :id="id" v-model="item.role" placeholder="Développeuse, 26 ans" />
      </BaseField>
    </div>
    <BaseField v-slot="{ id }" label="Témoignage">
      <BaseTextarea :id="id" v-model="item.quote" :rows="3" />
    </BaseField>
    <BaseField v-slot="{ id }" label="Photo" hint="URL d'image, ou vide pour afficher l'initiale.">
      <BaseInput :id="id" v-model="item.avatarUrl" type="url" placeholder="https://…" />
    </BaseField>
  </EditorRepeater>
</template>
