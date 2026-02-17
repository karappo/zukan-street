// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'ストリートビュー図鑑',
      htmlAttrs: { lang: 'ja' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/css/variables.css'],
  runtimeConfig: {
    public: {
      googleMapsApiKey: '',
    },
  },
})
