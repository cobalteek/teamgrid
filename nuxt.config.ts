import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint'
  ],

  i18n: {
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', name: 'Русский', file: 'ru.json'},
      { code: 'en', name: 'English', file: 'en.json'},
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
    },
    strategy: 'no_prefix',
    experimental: {
      localeDetector: './localeDetector.ts',
    },
    vueI18n: './i18n.config.ts'
  },

  compatibilityDate: '2025-01-15'
})
