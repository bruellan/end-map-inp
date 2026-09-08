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
        {
          id: 'card-resto',
          label: 'Restauration\n& Cuisine',
          photoUrl: '/images/the-bear.png',
          stickerUrl: '/images/fork.png',
        },
        {
          id: 'card-hotel',
          label: 'Gestion\nHôtelière',
          photoUrl: '/images/grand-hotel.png',
          stickerUrl: '/images/key.png',
        },
        {
          id: 'card-tourisme',
          label: 'Tourisme &\nExpérience voyageur',
          photoUrl: '/images/white-lotus.png',
          stickerUrl: '/images/plane-ticket.png',
        },
        {
          id: 'card-service',
          label: 'Service\n& Accueil',
          photoUrl: '/images/gabriel-emily-in-paris.png',
          stickerUrl: '/images/white-glove.png',
        },
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
          icon: 'money-bag',
        },
        {
          id: 'stat-postes',
          value: '319 000',
          label: 'postes à pourvoir en 2026',
          icon: 'chart-increasing',
        },
        {
          id: 'stat-pros',
          value: '1,3 million',
          label: 'de professionnels en France',
          icon: 'busts-in-silhouette',
        },
        {
          id: 'stat-formations',
          value: '797',
          label: 'formations référencées',
          icon: 'graduation-cap',
        },
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
      //
      // Le fichier Figma contient deux questions de plus (« Quelle est la
      // différence avec l'estimateur de Parcoursup » et « Et mes données
      // dans tout ça ? ») qui n'apparaissent pas sur le rendu de
      // référence. On s'aligne sur le rendu ; l'éditeur permet de les
      // rajouter.
      items: [
        { id: 'faq-bac', question: 'Bac général, techno ou pro ?', answer: '' },
        { id: 'faq-diplome', question: 'CAP, BTS ou Bachelor ?', answer: '' },
        { id: 'faq-recrute', question: 'Le secteur recrute-t-il\nvraiment ?', answer: '' },
        { id: 'faq-ia', question: 'Et par rapport à l’IA ?', answer: '' },
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
          icon: 'thumbs-up',
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
        { id: 'tab-moins', label: 'Les moins', icon: 'thumbs-down', entries: [] },
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
      decorations: [
        '/images/plane-ticket.png',
        '/images/key.png',
        '/images/stamp.png',
        '/images/fork.png',
      ],
    },
    {
      id: 'sec-tips',
      type: 'tips',
      title: 'Prends une longueur\nd’avance',
      visible: true,
      separatorAfter: false,
      items: [
        {
          id: 'tip-culture',
          icon: 'pushpin',
          body: 'Développe ta culture du secteur : nouvelles adresses, destinations, cultures étrangères...',
        },
        {
          id: 'tip-langues',
          icon: 'globe-showing-europe-africa',
          body: 'Travaille tes langues : l’anglais ouvre déjà la moitié des postes, une troisième langue fait la différence.',
        },
        {
          id: 'tip-terrain',
          icon: 'briefcase',
          body: 'Va sur le terrain dès que tu peux : un job d’été en salle ou en cuisine vaut tous les discours.',
        },
      ],
    },
  ],
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies Metier

/** Indexé par slug pour que le repository résolve en O(1). */
export const seedMetiers: Record<string, Metier> = {
  [hotellerieRestaurationTourisme.slug]: hotellerieRestaurationTourisme,
}
