import tailwindcss from '@tailwindcss/vite'

const appBaseURL = process.env.NUXT_APP_BASE_URL || '/teamgrid/'
const appBasePath = appBaseURL.replace(/\/$/, '')
const isDevApp = appBasePath.endsWith('-dev')

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  app: {
    baseURL: appBaseURL,
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: `${appBasePath}/${isDevApp ? 'favicon-dev.ico' : 'favicon.ico'}`,
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: `${appBasePath}/${isDevApp ? 'apple-touch-icon-dev.png' : 'apple-touch-icon.png'}`,
        },
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: isDevApp ? 'TeamGrid Dev' : 'TeamGrid' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/eslint', '@nuxt/ui'],

  i18n: {
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
    },
    strategy: 'no_prefix',
    experimental: {
      localeDetector: './localeDetector.ts',
    },
    vueI18n: './i18n.config.ts',
  },

  compatibilityDate: '2025-01-15',
})
