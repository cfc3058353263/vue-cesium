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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZGE2ZGNhYi1kYmY0LTQ0MmEtYWJjMy1mYTk3NDUxYjg0NzIiLCJpZCI6MTY3NjUwLCJpYXQiOjE3MDU4ODQyMzV9.77aWENLVGoiX7OPLMIQeX_VZ5qUkaSRSeY4CDAbskqg";
app.config.globalProperties.$Cesium = Cesium;

app.use(router);
app.use(ElementPlus)
app.mount('#app')