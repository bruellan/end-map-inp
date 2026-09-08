<script setup lang="ts">
import type { Section } from '#shared/schemas/metier'
import { sectionEditorComponents } from './sectionEditorRegistry'
import { sectionTypeLabels } from '~/components/metier/sectionRegistry'

/**
 * Une section dans l'éditeur : en-tête d'actions et champs repliables.
 *
 * Le composant ne connaît pas les champs de la section qu'il porte —
 * il les résout dans le registre d'édition, comme la page métier le
 * fait pour l'affichage.
 */
const section = defineModel<Section>({ required: true })

defineProps<{ canMoveUp: boolean; canMoveDown: boolean }>()

const emit = defineEmits<{ move: [-1 | 1]; toggleVisibility: [] }>()

const isOpen = ref(false)
</script>

<template>
  <article
    class="border-border-light bg-surface-light overflow-hidden rounded-md border transition-opacity duration-200"
    :class="!section.visible && 'opacity-55'"
  >
    <header class="flex items-center gap-1 p-3">
      <div class="flex flex-col">
        <BaseIconButton label="Monter la section" :disabled="!canMoveUp" @click="emit('move', -1)">
          <span aria-hidden="true">↑</span>
        </BaseIconButton>
        <BaseIconButton
          label="Descendre la section"
          :disabled="!canMoveDown"
          @click="emit('move', 1)"
        >
          <span aria-hidden="true">↓</span>
        </BaseIconButton>
      </div>

      <button
        type="button"
        class="min-w-0 flex-1 text-left"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span class="text-tertiary block text-xs font-medium">
          {{ sectionTypeLabels[section.type] }}
        </span>
        <span class="text-primary block truncate text-sm font-semibold">
          {{ section.title || 'Sans titre' }}
        </span>
      </button>

      <BaseIconButton
        :label="section.visible ? 'Masquer la section' : 'Afficher la section'"
        @click="emit('toggleVisibility')"
      >
        <span aria-hidden="true">{{ section.visible ? '👁' : '🚫' }}</span>
      </BaseIconButton>

      <BaseIconButton
        :label="isOpen ? 'Replier les champs' : 'Déplier les champs'"
        @click="isOpen = !isOpen"
      >
        <span
          class="ease-drawer inline-block transition-transform duration-200"
          :class="isOpen && 'rotate-180'"
          aria-hidden="true"
        >
          ▾
        </span>
      </BaseIconButton>
    </header>

    <!--
      `collapse` anime grid-template-rows de 0fr à 1fr : le repli suit
      la hauteur réelle du contenu sans qu'on ait à la mesurer en JS.
    -->
    <Transition name="collapse">
      <div v-show="isOpen" class="grid">
        <div class="overflow-hidden">
          <div class="border-border-light space-y-4 border-t p-3">
            <BaseField v-slot="{ id }" label="Titre de la section">
              <BaseInput :id="id" v-model="section.title" />
            </BaseField>

            <component :is="sectionEditorComponents[section.type]" v-model="section" />
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>
