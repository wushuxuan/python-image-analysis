import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8888/',
      pathRewrite: { '^/api': '' },
      changeOrigin: true
    },
    '/pay': {
      target: 'http://127.0.0.1:8889/',
      pathRewrite: { '^/pay': '' },
      changeOrigin: true
    },
  },
  routes: [
    { path: '/', component: '@/pages/home' },
    { path: '/index', component: '@/pages/index' },
    { path: '/file', component: '@/pages/file' },
    { path: '/choose', component: '@/pages/choose' },
    { path: '/charge', component: '@/pages/charge' },
  ],
});
