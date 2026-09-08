# Conventions du projet

## SEO — titres et descriptions de page

Calqué sur la convention observée sur edumapper.com.

- **Séparateur** : point médian `·` (jamais `—` ni `|`), avec la marque
  `Edumapper` en **suffixe**.
- **Gabarit centralisé** : le suffixe `· Edumapper` est ajouté par le
  `titleTemplate` global dans `app/app.vue`. Chaque page ne déclare que sa
  partie spécifique via `useSeoMeta({ title })` — ne jamais recoder
  `… — Edumapper` à la main dans une page.
  - Ex. page listant les métiers → `title: 'Métiers'` → rendu
    `Métiers · Edumapper`.
  - Ex. éditeur → `title: 'Éditeur · Choix du métier'`.
  - Une page sans titre retombe sur `Edumapper · L'orientation post-bac,
facilement`.
- **Longueur** : titre ≤ ~60 caractères, description ≤ ~155.
- **Descriptions** : une phrase, **tutoiement**, **verbe d'action en tête**
  (« Découvre… », « Explore… »), sujet de la page, puis mention de la marque
  (« … avec Edumapper. » / « … grâce à Edumapper. »).
- **`og:*`** : valeurs par défaut statiques et partagées, définies une fois
  dans `app/app.vue`. Une page peut les surcharger si elle a mieux à dire.

## Commentaires

D'après les bonnes pratiques de
https://daily.dev/blog/10-code-commenting-best-practices-for-developers.

1. **Expliquer le « pourquoi », pas le « quoi »** : le code dit déjà ce
   qu'il fait ; le commentaire donne l'intention, le contexte, l'arbitrage.
2. **Pas de redondance** : ne pas paraphraser une ligne évidente. Si le
   commentaire répète le code, le supprimer ou renommer le code.
3. **Rester concis** : court et ciblé, pas de pavé narratif.
4. **Clarifier ce qui est complexe** : découper une logique non triviale ou
   un choix d'implémentation non évident.
5. **Documenter les hypothèses** : préconditions, invariants, cas limites,
   effets de bord attendus.
6. **Garder les commentaires à jour** : un commentaire faux est pire que pas
   de commentaire — le corriger avec le code qu'il décrit.
7. **Docstrings pour l'API publique** : composables, fonctions et modules
   exposés portent un bloc de doc décrivant rôle, entrées/sorties.
8. **Rester cohérent** : même style, même ton (français, ici), même format
   que le reste du fichier et du dépôt.
