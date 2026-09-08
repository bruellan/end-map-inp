import type { Component } from 'vue'
import type { SectionType } from '#shared/schemas/metier'
import {
  MetierRichTextSection,
  MetierSalarySection,
  MetierStudiesSection,
  MetierOutletsSection,
  MetierTestimonialsSection,
} from '#components'

/**
 * Associe chaque variante de section à son composant d'affichage.
 *
 * Le type `Record<SectionType, Component>` est ce qui rend l'ensemble
 * extensible sans risque : ajouter un membre à l'union du schéma sans
 * l'enregistrer ici ne compile pas. Impossible d'avoir une section
 * stockée que la page ne sait pas rendre.
 *
 * Les composants viennent de `#components`, l'alias que Nuxt génère
 * pour ses composants auto-importés : les types suivent, et on évite un
 * shim `*.vue` global qui écraserait le typage des props partout.
 */
export const sectionComponents: Record<SectionType, Component> = {
  richText: MetierRichTextSection,
  salary: MetierSalarySection,
  studies: MetierStudiesSection,
  outlets: MetierOutletsSection,
  testimonials: MetierTestimonialsSection,
}

/**
 * Libellés affichés dans l'éditeur.
 *
 * Même contrainte d'exhaustivité : une nouvelle section doit être
 * nommée pour l'équipe éditoriale, pas seulement pour le code.
 */
export const sectionTypeLabels: Record<SectionType, string> = {
  richText: 'Texte libre',
  salary: 'Salaire',
  studies: 'Études',
  outlets: 'Débouchés',
  testimonials: 'Témoignages',
}
