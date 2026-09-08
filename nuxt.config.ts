import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

/**
 * Résolution du paquet plutôt qu'un chemin en dur vers node_modules :
 * un chemin relatif serait résolu depuis `srcDir` (`app/`), et un chemin
 * codé en dur casserait avec le hoisting de pnpm ou Yarn PnP.
 */
const emojiAssetsDir = join(
  dirname(createRequire(import.meta.url).resolve('@lobehub/assets-emoji/package.json')),
  'assets',
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  /**
   * Sans `pathPrefix: false`, Nuxt nomme les composants d'après leur
   * dossier : `metier/MetierHero.vue` deviendrait `MetierMetierHero`.
   * Les noms de fichiers portent déjà leur domaine, on garde le nom tel
   * quel.
   */
  components: [{ path: '~/components', pathPrefix: false }],

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  typescript: {
    strict: true,
    // Le typecheck tourne via `bun run typecheck` et en CI plutôt qu'à
    // chaque HMR, pour garder le dev réactif.
    typeCheck: false,
  },

  future: { compatibilityVersion: 4 },

  /**
   * Stockage du contenu édité.
   *
   * Driver `fs` : la donnée survit au rechargement et au redémarrage du
   * serveur, sans service externe à provisionner. Pour un déploiement
   * réel on remplace le driver ici (Redis, Vercel KV, S3…) — le
   * repository ne change pas.
   */
  nitro: {
    storage: {
      metiers: { driver: 'fs', base: './.data/metiers' },
    },

    /**
     * Fluent Emoji 3D (Microsoft), servis depuis le paquet d'assets.
     *
     * `@lobehub/assets-emoji` est un paquet d'images pur — 1605 WebP,
     * zéro dépendance. On le monte tel quel au lieu de recopier les
     * fichiers : rien à versionner, rien à resynchroniser, et le build
     * n'embarque que ce dossier.
     *
     * Le paquet React `@lobehub/fluent-emoji` aurait tiré React 19,
     * react-dom, lucide-react et antd-style dans un projet Vue.
     */
    publicAssets: [
      {
        dir: emojiAssetsDir,
        baseURL: '/emoji',
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
  },

  // Tailwind v4 s'installe en plugin Vite, sans postcss.config.
  vite: {
    plugins: [tailwindcss()],
  },

  fonts: {
    // @nuxt/fonts télécharge et self-host DM Sans — c'est exactement le
    // mécanisme utilisé par edumapper.com (leurs woff2 sont servis
    // depuis /_fonts/).
    families: [{ name: 'DM Sans', provider: 'google', weights: [400, 500, 600, 700] }],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        // La page métier est mobile-only : pas de zoom-out possible.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          /**
           * Marque le document avant le premier rendu. Les éléments en
           * attente de scroll-reveal ne sont masqués que sous `.js` :
           * sans JavaScript, ou avant hydratation, la page reste lisible
           * au lieu d'afficher du vide.
           */
          innerHTML: "document.documentElement.classList.add('js')",
          tagPosition: 'head',
        },
      ],
    },
  },
})
