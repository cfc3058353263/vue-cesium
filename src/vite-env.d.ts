/// <reference types="vite/client" />
/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    import coordtransform from 'coordtransform'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  interface ImportMetaEnv {
      readonly VITE_APP_TITLE: string;
      readonly VITE_APP_BASE_API: string;
      // 更多环境变量...
  }
  
  interface ImportMeta {
      readonly env: ImportMetaEnv;
  }
  