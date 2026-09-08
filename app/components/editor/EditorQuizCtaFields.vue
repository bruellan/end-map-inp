<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

const section = defineModel<SectionOfType<'quizCta'>>({ required: true })

/** Le composant d'affichage définit quatre emplacements décoratifs. */
const SLOT_COUNT = 4

/**
 * Le stockage garde une liste compacte, l'éditeur montre quatre champs
 * fixes. Ce computed fait la conversion dans les deux sens : on lit un
 * emplacement vide comme une chaîne vide, et on retire les trous à
 * l'écriture pour ne pas enregistrer d'URL fantômes.
 */
function decorationAt(index: number) {
  return computed({
    get: () => section.value.decorations[index] ?? '',
    set: (value: string) => {
      const next = Array.from({ length: SLOT_COUNT }, (_, i) =>
        i === index ? value : (section.value.decorations[i] ?? ''),
      )
      section.value.decorations = next.filter(Boolean)
    },
  })
}

const slots = Array.from({ length: SLOT_COUNT }, (_, index) => decorationAt(index))
</script>

<template>
  <div class="space-y-4">
    <BaseField v-slot="{ id }" label="Sous-titre">
      <BaseInput :id="id" v-model="section.subtitle" placeholder="En 2 min. top chrono !" />
    </BaseField>

    <div class="grid grid-cols-2 gap-3">
      <BaseField v-slot="{ id }" label="Libellé du bouton">
        <BaseInput :id="id" v-model="section.ctaLabel" placeholder="Passe le test" />
      </BaseField>
      <BaseField v-slot="{ id }" label="Destination">
        <BaseInput :id="id" v-model="section.ctaHref" placeholder="/onboarding" />
      </BaseField>
    </div>

    <BaseField
      label="Visuels décoratifs"
      hint="Quatre emplacements, disposés par la maquette. Laisser vide pour n’en afficher aucun."
    >
      <div class="space-y-2">
        <BaseInput
          v-for="(slot, index) in slots"
          :key="index"
          v-model="slot.value"
          type="url"
          :placeholder="`Visuel ${index + 1}`"
        />
      </div>
    </BaseField>
  </div>
</template>
