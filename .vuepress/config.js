const generateSidebar = require('./generateSidebar');
const name = 'React-Guidebook';

const setPrefix = (base, route) => `${base}/${route}`;

module.exports = {
  base: `/${name}/`,
  head: [['link', { rel: 'icon', href: 'favicon.ico' }]],
  title: 'React-Guidebook',
  port: 8010,
  themeConfig: {
    repo: 'tsejx/React-Guidebook',
    logo: '/favicon.png',
    search: true,
    searchMaxSuggestions: 15,
    serviceWorker: {
      updatePopup: {
        message: '新内容已准备就绪',
        buttonText: '刷新',
      },
    },
    sidebar: [
      {
        title: '基本概念',
        collapsable: false,
        children: ['react', 'jsx', 'props', 'state', 'lifecycle', 'component', 'react-dom'].map(r =>
          setPrefix('concept', r)
        ),
      },
      {
        title: '核心架构',
        collapsable: false,
        children: ['fiber', 'virtual-dom', 'diffing-algorithm'].map(r => setPrefix('core', r)),
      },
      {
        title: '运行机制',
        collapsable: false,
        children: [
          'set-state',
          'render',
          'refs',
          'portals',
          'context',
          'render-props',
          'high-order-component',
          'handling-events',
          'synthetic-event',
          'hooks',
        ].map(r => setPrefix('mechanism', r)),
      },
      {
        title: '功能扩展',
        collapsable: false,
        children: [
          'clone-element',
          'is-valid-element',
          'pure-component',
          'fragment',
          'children',
          'forward-ref',
          'force-update',
          'suspense',
          'memo',
          'lazy',
        ].map(r => setPrefix('feature', r)),
      },
      {
        title: '生态',
        collapsable: false,
        children: [
          ...[
            {
              title: '路由管理',
              collapsable: false,
              children: ['spa-routing', 'react-router'].map(r => setPrefix('ecosystem/routing', r)),
            },
            {
              title: '数据管理',
              collapsable: false,
              children: ['flux', 'redux', 'react-redux', 'redux-saga', 'redux-thunk'].map(r =>
                setPrefix('ecosystem/redux', r)
              ),
            },
            {
              title: '类型检测',
              collapsable: false,
              children: generateSidebar('ecosystem/type'),
            },
          ],
        ],
      },
    ],
    sidebarDepth: 2,
    lastUpdated: '最近更新时间',
  },

  vueThemes: {
    links: {
      github: 'https://github.com/tsejx/React-Guidebook',
    },
  },
};
