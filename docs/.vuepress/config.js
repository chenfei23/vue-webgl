module.exports = {
  base: process.argv[4] || '/',
  locales: {
    // 每个语言对象的键(key)，是语言的访问路径。
    // 然而，一种特例是将 '/' 作为默认语言的访问路径。
    '/': {
      lang: 'zh-CN',
      title: 'Vue-iClient3D-WebGL',
      description: 'Vue-iClient3D-WebGL'
    }
    // '/en/': {
    //   lang: 'en-US', // 这个值会被设置在 <html> 的 lang 属性上
    //   title: 'Vue-iClient3D-WebGL',
    //   description: 'Vue-iClient3D-WebGL'
    // }
  },
  dest: process.argv[5],
  title: 'vue components by supermap',
  description: 'vue components',
  themeConfig: {
    lastUpdated: '最后更新时间',
    activeHeaderLinks: true,
    repo: 'SuperMap/vue-iclient',
    locales: {
      '/': {
        label: '简体中文',
        selectText: '选择语言',
        nav: [
          // {
          //   text: '指南',
          //   link: '/zh/guide/'
          // },
          {
            text: '组件',
            link: '/zh/api/'
          }
        ],
        sidebar: {
          '/zh/api/': [{
              title: '开发指南',
              collapsable: false,
              // children: ['guide/installation', 'guide/quick-start', 'guide/i18n', 'guide/custom-theme']
              children: ['guide/installation', 'guide/quick-start']
            },
            {
              title: '组件',
              collapsable: false,
              children: [{
                  title: '分析组件',
                  collapsable: false,
                  children: [
                    '3DAnalysis/Measure',
                    '3DAnalysis/ViewShed',
                    '3DAnalysis/Profile3D',
                    '3DAnalysis/ShadowQuery',
                    '3DAnalysis/SightLine',
                    '3DAnalysis/SkyLine',
                    '3DAnalysis/OnLineAnalysis',
                    '3DAnalysis/backLineAnalysis',
                    '3DAnalysis/limitHeightAnalysis',
                    '3DAnalysis/GeologicBodyOperation',                    

                  ]
                }
              ]
            }
          ]
        }
      },
      '/en/': {
        label: 'English',
        selectText: 'Languages'
      }
    }
  }
};
