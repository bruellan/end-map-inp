import type { Metier } from '#shared/schemas/metier'

/**
 * Contenu de départ.
 *
 * Repris de la maquette Figma « PE - Test » (node 1-262) : les textes
 * sont ceux de la maquette, pas des placeholders. Ce qui manque encore
 * y est marqué explicitement — les réponses des accordéons sont
 * repliées dans le Figma, donc absentes.
 *
 * Typé `satisfies Metier` : une divergence avec le schéma casse la
 * compilation plutôt que d'attendre le premier appel d'API. Recopié
 * dans le stockage à la première lecture, puis plus jamais relu.
 */

const hotellerieRestaurationTourisme = {
  slug: 'hotellerie-restauration-tourisme',
  hero: {
    title: 'Hôtellerie,\nRestauration & Tourisme',
    subtitle: 'Et si ton métier c’était de rendre\nles gens heureux ?',
  },
  sections: [
    {
      id: 'sec-cards',
      type: 'metierCards',
      title: '',
      visible: true,
      separatorAfter: true,
      items: [
        { id: 'card-resto', label: 'Restauration\n& Cuisine', imageUrl: '' },
        { id: 'card-hotel', label: 'Gestion\nHôtelière', imageUrl: '' },
        { id: 'card-tourisme', label: 'Tourisme &\nExpérience voyageur', imageUrl: '' },
        { id: 'card-service', label: 'Service\n& Accueil', imageUrl: '' },
      ],
    },
    {
      id: 'sec-about',
      type: 'about',
      title: 'À propos',
      visible: true,
      separatorAfter: false,
      body: 'Une filière ouverte et accessible, où le savoir-faire, l’engagement et l’expérience pèsent autant que les diplômes : on peut y entrer par un CAP...',
      expandLabel: 'Lire la suite',
    },
    {
      id: 'sec-stats',
      type: 'statistics',
      title: '',
      visible: true,
      separatorAfter: true,
      items: [
        {
          id: 'stat-salaire',
          value: '2 000 €',
          label: 'salaire médian en début de carrière',
          icon: '💶',
        },
        { id: 'stat-postes', value: '319 000', label: 'postes à pourvoir en 2026', icon: '📈' },
        { id: 'stat-pros', value: '1,3 million', label: 'de professionnels en France', icon: '👥' },
        { id: 'stat-formations', value: '797', label: 'formations référencées', icon: '🎓' },
      ],
    },
    {
      id: 'sec-faq',
      type: 'faq',
      title: 'Bon à savoir',
      visible: true,
      separatorAfter: true,
      // Les réponses sont repliées dans la maquette : à remplir par
      // l'équipe éditoriale depuis l'éditeur.
      items: [
        { id: 'faq-bac', question: 'Bac général, techno ou pro ?', answer: '', icon: '🎓' },
        { id: 'faq-diplome', question: 'CAP, BTS ou Bachelor ?', answer: '', icon: '📜' },
        {
          id: 'faq-recrute',
          question: 'Le secteur recrute-t-il\nvraiment ?',
          answer: '',
          icon: '💼',
        },
        { id: 'faq-ia', question: 'Et par rapport à l’IA ?', answer: '', icon: '🤖' },
        {
          id: 'faq-parcoursup',
          question: 'Quelle est la différence avec l’estimateur de Parcoursup',
          answer: '',
          icon: '🧭',
        },
        { id: 'faq-donnees', question: 'Et mes données dans tout ça ?', answer: '', icon: '🔒' },
      ],
    },
    {
      id: 'sec-proscons',
      type: 'prosCons',
      title: 'Le métier sans filtre',
      visible: true,
      separatorAfter: false,
      tabs: [
        {
          id: 'tab-plus',
          label: 'Les plus',
          icon: '👍',
          entries: [
            {
              id: 'plus-ouvert',
              title: 'Un métier ouvert à tous',
              body: 'Le savoir-faire, l’engagement et l’expérience comptent autant que les diplômes. On peut commencer par un CAP et évoluer vers des responsabilités.',
            },
            {
              id: 'plus-evolution',
              title: 'De vraies perspectives d’évolution',
              body: 'Tu peux progresser rapidement, travailler partout dans le monde, rejoindre le luxe ou ouvrir ton propre établissement.',
            },
          ],
        },
        // L'onglet « Les moins » existe dans la maquette mais son
        // contenu n'y est pas visible : à saisir dans l'éditeur.
        { id: 'tab-moins', label: 'Les moins', icon: '👎', entries: [] },
      ],
    },
    {
      id: 'sec-quiz',
      type: 'quizCta',
      title: 'Quelle voie\nest faite pour toi ?',
      visible: true,
      separatorAfter: false,
      subtitle: 'En 2 min. top chrono !',
      ctaLabel: 'Passe le test',
      ctaHref: '/onboarding',
    },
  ],
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies Metier

/** Indexé par slug pour que le repository résolve en O(1). */
export const seedMetiers: Record<string, Metier> = {
  [hotellerieRestaurationTourisme.slug]: hotellerieRestaurationTourisme,
}
