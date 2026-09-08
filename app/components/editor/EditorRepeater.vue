<script setup lang="ts" generic="T extends { id: string }">
/**
 * Liste éditable d'éléments homogènes (niveaux de salaire, étapes
 * d'études, témoignages…).
 *
 * Générique sur `T` : le slot rend l'élément avec son type exact, sans
 * cast. Mutualise l'ajout, la suppression et l'animation de liste pour
 * que chaque éditeur de section ne décrive que ses champs.
 */
const items = defineModel<T[]>({ required: true })

const props = defineProps<{
  addLabel: string
  /** Fabrique l'élément vide ajouté en fin de liste. */
  createItem: () => T
  /** Empêche de vider complètement la liste si la section l'exige. */
  minItems?: number
}>()

const canRemove = computed(() => items.value.length > (props.minItems ?? 0))

function add() {
  items.value = [...items.value, props.createItem()]
}

function remove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="space-y-3">
    <TransitionGroup name="section-list" tag="div" class="relative space-y-3">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="border-border-light bg-surface-light rounded-sm border p-3"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-tertiary text-xs font-semibold">#{{ index + 1 }}</span>
          <BaseIconButton
            label="Supprimer cet élément"
            :disabled="!canRemove"
            @click="remove(item.id)"
          >
            <span aria-hidden="true">✕</span>
          </BaseIconButton>
        </div>

        <div class="space-y-3">
          <slot :item="item" :index="index" />
        </div>
      </div>
    </TransitionGroup>

    <BaseButton variant="secondary" @click="add">+ {{ addLabel }}</BaseButton>
  </div>
</template>
