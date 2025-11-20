// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    apiUrl: process.env.API_URL,
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@sidebase/nuxt-auth',
  ],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },

  // https://auth.sidebase.io/guide/local/quick-start
  auth: {
    globalAppMiddleware: true,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: {
          path: 'http://localhost:3000/api/users/me',
          method: 'get',
        },
      },
      token: {
        signInResponseTokenPointer: '/accessToken',
        maxAgeInSeconds: 31_536_000, // 1 year
      },
      pages: { login: '/login' },

      session: {
        dataType: {
          id: 'string',
          username: 'string',
          email: 'string',
          emailVerified: 'boolean',
          avatarUrl: 'string | null',
          role: 'number',
          createdAt: 'string',
          updatedAt: 'string | null',
        },
      },
    },
  },
});