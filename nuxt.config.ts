/** @type {import('nuxt').NuxtConfig} */
export default {
  // Docus preset
  extends: ['@nuxt-themes/docus'],

  // Base URL for GitHub Pages subdomain deployment
  app: {
    baseURL: '/hermes-agent-curriculum/',
    head: {
      title: 'Hermes Agent Architecture Course',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A comprehensive, step-by-step curriculum to understand the Hermes Agent codebase from NousResearch.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/hermes-agent-curriculum/favicon.ico' }
      ]
    }
  },

  // Nitro configuration for GitHub Pages
  nitro: {
    baseURL: '/hermes-agent-curriculum/',
    prerender: {
      failOnError: false
    },
    // Output to dist folder for GitHub Actions
    output: {
      dir: 'dist'
    }
  },

  // Docus configuration
  docus: {
    title: 'Hermes Agent Architecture Course',
    description: 'Learn how Hermes Agent works under the hood - from core loop to tools, gateway, memory, and advanced features.',
    image: 'https://briancaffey.github.io/hermes-agent-curriculum/og-image.png',

    // Navigation sidebar
    aside: {
      level: 0,
      collapsed: false,
      exclude: []
    },

    // Footer
    footer: {
      credits: 'Course by Brian Caffey'
    },

    // Social links
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/briancaffey/hermes-agent-curriculum' }
    ]
  },

  // Build configuration
  build: {
    transpile: ['@nuxt-themes/docus']
  }
}
