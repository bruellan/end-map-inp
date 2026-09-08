/**
 * Identifiant stable pour un élément créé dans l'éditeur.
 *
 * Préfixé par domaine pour rester lisible dans le JSON stocké et dans
 * les outils de dev — un `id` doit se diagnostiquer à l'œil.
 */
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
