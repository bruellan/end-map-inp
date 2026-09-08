import type { Component } from 'vue'
import type { SectionType } from '#shared/schemas/metier'
import {
  MetierCardsSection,
  MetierAboutSection,
  MetierStatisticsSection,
  MetierFaqSection,
  MetierProsConsSection,
  MetierQuizCtaSection,
  MetierTipsSection,
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
  metierCards: MetierCardsSection,
  about: MetierAboutSection,
  statistics: MetierStatisticsSection,
  faq: MetierFaqSection,
  prosCons: MetierProsConsSection,
  quizCta: MetierQuizCtaSection,
  tips: MetierTipsSection,
}

/**
 * Libellés affichés dans l'éditeur.
 *
 * Même contrainte d'exhaustivité : une nouvelle section doit être
 * nommée pour l'équipe éditoriale, pas seulement pour le code.
 */
export const sectionTypeLabels: Record<SectionType, string> = {
  metierCards: 'Cartes métier',
  about: 'À propos',
  statistics: 'Chiffres clés',
  faq: 'Questions fréquentes',
  prosCons: 'Pour et contre',
  quizCta: 'Encart quiz',
  tips: 'Conseils',
}
