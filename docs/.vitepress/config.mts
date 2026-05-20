import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AREAL-HR Docs",
  description: "Документация системы кадрового учета",
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  ],
  base: '/docs/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Инструкция администратора', link: '/admin-guide' },
      { text: 'Инструкция менеджера', link: '/manager-guide' },
      { text: 'Инструкция руководителя', link: '/hrDirector-guide' }
    ],

    sidebar: [
      {
        text: 'Документация',
        items: [
          { text: 'Инструкция администратора', link: '/admin-guide' },
          { text: 'Инструкция менеджера', link: '/manager-guide' },
          { text: 'Инструкция руководителя', link: '/hrDirector-guide' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
