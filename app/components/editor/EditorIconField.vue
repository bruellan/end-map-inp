<script setup lang="ts">
/**
 * Champ icône avec aperçu en direct.
 *
 * Saisir « fluent-emoji:money-bag » à l'aveugle n'est pas tenable : le
 * rendu à côté du champ sert de validation immédiate. Un aperçu vide
 * signale un nom inconnu sans avoir à ouvrir la page.
 */
const model = defineModel<string>({ required: true })

const id = useId()
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="text-secondary block text-xs font-semibold">Icône</label>
    <div class="flex items-center gap-2">
      <span
        class="border-border-light flex size-9 shrink-0 items-center justify-center rounded-sm border"
      >
        <BaseEmoji :name="model" />
      </span>
      <BaseInput :id="id" v-model="model" placeholder="money-bag" />
    </div>
    <p class="text-tertiary text-xs">
      Nom Fluent Emoji en kebab-case.
      <a
        href="https://github.com/microsoft/fluentui-emoji"
        target="_blank"
        rel="noopener"
        class="underline underline-offset-2"
      >
        Voir le catalogue
      </a>
    </p>
  </div>
</template>
