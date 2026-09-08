<script setup lang="ts">
import type { SectionOfType } from '#shared/schemas/metier'

defineProps<{ section: SectionOfType<'faq'> }>()

/**
 * Accordéon exclusif : ouvrir une question referme la précédente.
 * `null` = tout replié, l'état de départ dans la maquette.
 */
const openId = ref<string | null>(null)

const toggle = (id: string) => {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <MetierSectionShell :id="section.id" :title="section.title">
    <ul class="mt-6 flex flex-col gap-3">
      <li v-for="item in section.items" :key="item.id" class="bg-surface-card rounded-md">
        <h3>
          <button
            type="button"
            class="flex w-full items-start gap-2 p-6 text-left"
            :aria-expanded="openId === item.id"
            :aria-controls="`faq-panel-${item.id}`"
            @click="toggle(item.id)"
          >
            <span class="shrink-0 text-2xl leading-[25px]" aria-hidden="true">{{ item.icon }}</span>
            <span class="text-subheading text-primary flex-1 font-semibold whitespace-pre-line">
              {{ item.question }}
            </span>
            <span
              class="text-icon-subtle-default ease-drawer shrink-0 transition-transform duration-300"
              :class="openId === item.id && 'rotate-180'"
              aria-hidden="true"
            >
              ⌄
            </span>
          </button>
        </h3>

        <!-- `collapse` anime grid-template-rows de 0fr à 1fr : la hauteur
             réelle du panneau n'a jamais besoin d'être mesurée en JS. -->
        <Transition name="collapse">
          <div v-show="openId === item.id" :id="`faq-panel-${item.id}`" class="grid">
            <div class="overflow-hidden">
              <p class="text-body text-secondary px-6 pb-6">
                {{ item.answer || 'Réponse à rédiger.' }}
              </p>
            </div>
          </div>
        </Transition>
      </li>
    </ul>
  </MetierSectionShell>
</template>
