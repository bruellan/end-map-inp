import type { Component } from 'vue'
import type { SectionType } from '#shared/schemas/metier'
import {
  EditorRichTextFields,
  EditorSalaryFields,
  EditorStudiesFields,
  EditorOutletsFields,
  EditorTestimonialsFields,
} from '#components'

/**
 * Pendant côté édition de `sectionComponents`.
 *
 * Deux registres exhaustifs sur le même `SectionType` : une nouvelle
 * section doit savoir s'afficher *et* s'éditer, sinon le projet ne
 * compile pas. C'est ce qui empêche qu'une section devienne
 * non-modifiable par l'équipe éditoriale sans que personne ne s'en
 * aperçoive.
 */
export const sectionEditorComponents: Record<SectionType, Component> = {
  richText: EditorRichTextFields,
  salary: EditorSalaryFields,
  studies: EditorStudiesFields,
  outlets: EditorOutletsFields,
  testimonials: EditorTestimonialsFields,
}
