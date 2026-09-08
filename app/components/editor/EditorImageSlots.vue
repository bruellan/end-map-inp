<script setup lang="ts">
/**
 * Liste d'emplacements d'images à positions fixes.
 *
 * Le stockage garde une liste compacte, l'éditeur montre un nombre fixe
 * de champs. Ce composant fait la conversion : un emplacement vide se
 * lit comme une chaîne vide, et les trous sont retirés à l'écriture
 * pour ne pas enregistrer d'URL fantômes.
 *
 * Sert au collage du bloc de fin comme aux visuels de l'encart quiz —
 * même contrat, seul le nombre d'emplacements change.
 */
const model = defineModel<string[]>({ required: true })

const props = defineProps<{ count: number; label: string; hint?: string }>()

function slotAt(index: number) {
  return computed({
    get: () => model.value[index] ?? '',
    set: (value: string) => {
      const next = Array.from({ length: props.count }, (_, i) =>
        i === index ? value : (model.value[i] ?? ''),
      )
      model.value = next.filter(Boolean)
    },
  })
}

const slots = computed(() => Array.from({ length: props.count }, (_, index) => slotAt(index)))
</script>

<template>
  <BaseField :label="label" :hint="hint">
    <div class="grid gap-2 sm:grid-cols-2">
      <div v-for="(slot, index) in slots" :key="index" class="flex items-center gap-2">
        <span class="text-tertiary w-5 shrink-0 text-right text-xs">{{ index + 1 }}</span>
        <BaseInput v-model="slot.value" :placeholder="`/images/…`" />
      </div>
    </div>
  </BaseField>
</template>
