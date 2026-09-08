// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Le schéma Zod porte déjà les noms de sections ; les composants de
    // rendu portent le même nom qu'elles (RichText, Salary…), volontairement
    // sur un seul mot.
    'vue/multi-word-component-names': 'off',

    // Prettier fait autorité sur le formatage. Sans ça, `prettier --write`
    // et `eslint --fix` se réécrivent mutuellement les balises auto-fermantes.
    'vue/html-self-closing': 'off',
  },
})
