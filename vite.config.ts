import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium';//1.引入cesium
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins:
    [
      vue(),
      cesium(),//2.使用插件
      vueJsx()
    ],
  resolve: {
    alias: {
      // 设置路径
      "~": path.resolve(__dirname, "./"),
      // 设置别名
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8850,
    host: true,
    open: true,
    proxy: {
      // https://cn.vitejs.dev/config/#server-proxy 106.75.64.246:9081
      '/geoserver': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/geoserver/, ''),
      },
      '/gisserver': {
        target: 'https://services.arcgisonline.com', //接口域名
        changeOrigin: true, //是否跨域
        ws: true, //是否代理 websockets
        secure: true, //是否https接口
        rewrite: path => path.replace(/^\/gisserver/, ''),
      },
    },
  },
})