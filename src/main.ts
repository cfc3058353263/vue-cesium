import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router';
import '@/assets/styles/index.scss'; // global css

/**引入cesium */
import * as Cesium from "cesium";
import "cesium/Source/Widgets/widgets.css";
const app = createApp(App)

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMmNlM2FiZS0yODg5LTRlNGMtYjdlNS1jZDhkZGQ1NTg1NjEiLCJpZCI6MTE1NTU2LCJpYXQiOjE2NjkwMTY5MzN9.7ebJtPCp8kTWTtlREiyTD5d2JLgUBn71k_7UtrJCwQE";
app.config.globalProperties.$Cesium = Cesium;

app.use(router);
app.use(ElementPlus)
app.mount('#app')