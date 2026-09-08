<script setup lang="ts">
import type { CollageStory } from '#shared/schemas/metier'
import { COLLAGE_SLOT_COUNT } from '~/components/metier/collageLayout'

/**
 * Pièces du collage, à emplacements fixes.
 *
 * Le stockage garde une liste compacte, l'éditeur montre un nombre fixe
 * de fiches — une par emplacement de la maquette. Une pièce sans image
 * est retirée à l'écriture, pour ne pas enregistrer d'entrées fantômes.
 *
 * Titre et texte sont facultatifs : les renseigner rend la pièce
 * cliquable côté page, et ouvre un récit en plein écran.
 */
const model = defineModel<CollageStory[]>({ required: true })

function pieceAt(index: number): CollageStory {
  return model.value[index] ?? { id: `story-${index + 1}`, image: '', title: '', body: '' }
}

function update(index: number, patch: Partial<CollageStory>) {
  const next = Array.from({ length: COLLAGE_SLOT_COUNT }, (_, i) => ({
    ...pieceAt(i),
    ...(i === index ? patch : {}),
  }))
  model.value = next.filter((piece) => piece.image)
}

const slots = computed(() =>
  Array.from({ length: COLLAGE_SLOT_COUNT }, (_, index) => ({ index, piece: pieceAt(index) })),
)
</script>

<template>
  <BaseField
    label="Collage illustré"
    hint="Positions et rotations fixées par la maquette. Un titre rend la pièce cliquable."
  >
    <div class="space-y-3">
      <div
        v-for="{ index, piece } in slots"
        :key="index"
        class="border-border-light space-y-2 rounded-sm border p-3"
      >
        <div class="flex items-center gap-2">
          <span class="text-tertiary w-5 shrink-0 text-right text-xs">{{ index + 1 }}</span>
          <BaseInput
            :model-value="piece.image"
            placeholder="/images/…"
            @update:model-value="update(index, { image: String($event) })"
          />
        </div>

        <!-- Les champs du récit n'apparaissent qu'une fois l'image posée :
             sans illustration, la pièce n'existe pas. -->
        <div v-if="piece.image" class="space-y-2 pl-7">
          <BaseInput
            :model-value="piece.title"
            placeholder="Titre du récit (facultatif)"
            @update:model-value="update(index, { title: String($event) })"
          />
          <BaseTextarea
            v-if="piece.title"
            :model-value="piece.body"
            :rows="3"
            placeholder="Texte du récit"
            @update:model-value="update(index, { body: $event })"
          />
        </div>
      </div>
    </div>
  </BaseField>
</template>
