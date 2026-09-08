/**
 * Placement du collage illustré, relevé sur la maquette.
 *
 * Exprimé dans le repère du groupe d'images (542x402) et non dans celui
 * du bloc qui l'accueille, dont la hauteur varie : la couche porteuse
 * reproduit ce ratio, donc les pourcentages tombent juste quelle que
 * soit la largeur d'écran.
 *
 * `z` est explicite : l'empilement voulu ne suit ni l'ordre du DOM ni
 * celui du fichier Figma. Plus la valeur est haute, plus l'élément est
 * au premier plan.
 *
 * Dans un module à part et non dans le composant : l'éditeur a besoin du
 * nombre d'emplacements pour afficher le bon nombre de champs.
 */
export const COLLAGE_SLOTS = [
  { left: 0.0, top: 4.0, width: 43.2, height: 82.6, rotate: 7, z: 1 },
  { left: 41.9, top: 33.8, width: 6.3, height: 8.7, rotate: -41, z: 6 },
  // L'export « Oui chef » est vertical, texte de bas en haut : les 90°
  // le redressent, les -15° restants reprennent l'inclinaison de la
  // maquette. Sa boîte est donc haute et étroite — c'est la rotation qui
  // la rend large à l'écran.
  { left: 8.0, top: 1.9, width: 11.4, height: 23.6, rotate: 75, z: 8 },
  { left: 10.5, top: 51.7, width: 25.8, height: 32.1, rotate: -9, z: 9 },
  { left: 20.8, top: 40.0, width: 28.0, height: 46.0, rotate: 21, z: 2 },
  { left: 72.0, top: 16.7, width: 27.3, height: 40.8, rotate: 145, z: 3 },
  { left: 58.1, top: 27.6, width: 37.5, height: 44.5, rotate: -12, z: 4 },
  // L'export de l'herbe est déjà dans le bon sens : appliquer les 174°
  // relevés la retournerait. On garde l'inclinaison, pas le retournement.
  { left: 62.2, top: 35.6, width: 37.8, height: 64.4, rotate: -6, z: 5 },
  { left: 47.2, top: 26.6, width: 26.4, height: 34.3, rotate: 0, z: 7 },
  { left: 39.5, top: 56.5, width: 20.8, height: 39.3, rotate: 0, z: 10 },
  { left: 55.4, top: 51.2, width: 13.5, height: 29.4, rotate: 0, z: 12 },
  { left: 79.5, top: 0.0, width: 17.9, height: 24.1, rotate: -15, z: 11 },
] as const

export const COLLAGE_SLOT_COUNT = COLLAGE_SLOTS.length

/** Ratio du groupe d'images, que la couche porteuse doit reproduire. */
export const COLLAGE_ASPECT = '542 / 402'
