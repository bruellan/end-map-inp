import type { Metier } from '#shared/schemas/metier'

/**
 * Contenu de départ.
 *
 * Typé `satisfies Metier` : une divergence avec le schéma casse la
 * compilation plutôt que d'attendre le premier appel d'API. Recopié
 * dans le stockage à la première lecture, puis plus jamais relu.
 *
 * TODO(figma) : la copie est provisoire, à aligner sur la maquette.
 */

const developpeurWeb = {
  slug: 'developpeur-web',
  hero: {
    title: 'Développeur web',
    tagline:
      'Il conçoit, code et fait vivre les sites et applications que tu utilises tous les jours.',
    emoji: '💻',
    coverUrl: '',
  },
  sections: [
    {
      id: 'sec-description',
      type: 'richText',
      title: 'En quoi consiste ce métier ?',
      visible: true,
      body: "Le développeur web traduit un besoin en code. Il construit l'interface que voit l'utilisateur, la logique qui tourne derrière, et s'assure que l'ensemble reste rapide et fiable.\n\nAu quotidien, il échange beaucoup : avec les designers pour caler les écrans, avec les chefs de produit pour arbitrer ce qui part en priorité, avec les autres développeurs pendant les relectures de code.",
    },
    {
      id: 'sec-etudes',
      type: 'studies',
      title: 'Quelles études pour y arriver ?',
      visible: true,
      steps: [
        {
          id: 'step-bac2',
          level: 'Bac +2',
          label: 'BTS SIO ou BUT Informatique',
          description:
            'La voie la plus courte vers un premier poste. Beaucoup de pratique, un stage long, et la possibilité de poursuivre en licence pro.',
        },
        {
          id: 'step-bac3',
          level: 'Bac +3',
          label: 'Licence Informatique ou Bachelor',
          description:
            "Plus de théorie — algorithmique, bases de données, réseaux. Ouvre la porte au master et aux écoles d'ingénieurs en admission parallèle.",
        },
        {
          id: 'step-bac5',
          level: 'Bac +5',
          label: "Master ou école d'ingénieurs",
          description:
            "Le passage attendu pour les postes d'architecte ou de lead. Souvent en alternance, ce qui compte double à l'embauche.",
        },
      ],
    },
    {
      id: 'sec-salaire',
      type: 'salary',
      title: 'Combien ça gagne ?',
      visible: true,
      currency: 'EUR',
      period: 'month',
      levels: [
        { id: 'lvl-junior', label: 'Débutant', min: 2400, max: 3000 },
        { id: 'lvl-confirme', label: 'Confirmé', min: 3200, max: 4200 },
        { id: 'lvl-senior', label: 'Senior', min: 4500, max: 6000 },
      ],
    },
    {
      id: 'sec-debouches',
      type: 'outlets',
      title: 'Quels débouchés ?',
      visible: true,
      items: [
        {
          id: 'out-frontend',
          label: 'Développeur front-end',
          description: "Tout ce que l'utilisateur voit et manipule.",
          icon: '🎨',
        },
        {
          id: 'out-backend',
          label: 'Développeur back-end',
          description: 'Les serveurs, les données, les API.',
          icon: '⚙️',
        },
        {
          id: 'out-mobile',
          label: 'Développeur mobile',
          description: 'Les applications iOS et Android.',
          icon: '📱',
        },
        {
          id: 'out-lead',
          label: 'Lead technique',
          description: "Encadre une équipe et tranche les choix d'architecture.",
          icon: '🧭',
        },
      ],
    },
    {
      id: 'sec-temoignages',
      type: 'testimonials',
      title: 'Ils en parlent mieux que nous',
      visible: true,
      items: [
        {
          id: 'tem-lucie',
          author: 'Lucie',
          role: 'Développeuse front-end, 26 ans',
          quote:
            "J'ai commencé par un BTS sans savoir coder. Ce qui m'a fait rester, c'est de voir en direct ce que je construisais.",
          avatarUrl: '',
        },
        {
          id: 'tem-karim',
          author: 'Karim',
          role: 'Lead technique, 31 ans',
          quote:
            'On imagine un métier solitaire. En réalité je passe la moitié de mes journées à discuter avec les autres.',
          avatarUrl: '',
        },
      ],
    },
  ],
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies Metier

/** Indexé par slug pour que le repository résolve en O(1). */
export const seedMetiers: Record<string, Metier> = {
  [developpeurWeb.slug]: developpeurWeb,
}
