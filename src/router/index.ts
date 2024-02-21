import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */
declare module 'vue-router' {
    interface RouteMeta {
        hidden?: boolean;
        title?: string;
        icon?: string;
        elSvgIcon?: string;
        permissions?: string[];
    }
    interface _RouteRecordBase {
        hidden?: boolean;
        parentPath?: string;
        permissions?: string[];
    }
    interface _RouteLocationBase {
        title?: string;
    }
}

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
    {
        path: '',
        component: Layout,
        redirect: '/index',
        children: [
            {
                path: '/index',
                component: () => import('@/views/index/index.vue'),
                name: 'Index',
                meta: { title: '首页', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawBillboard',
        component: Layout,
        redirect: '/drawBillboard',
        children: [
            {
                path: '/drawBillboard',
                component: () => import('@/views/drawBillboard/index.vue'),
                name: 'DrawBillboard',
                meta: { title: '添加标注', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawLine',
        component: Layout,
        redirect: '/drawLine',
        children: [
            {
                path: '/drawLine',
                component: () => import('@/views/drawLine/index.vue'),
                name: 'DrawLine',
                meta: { title: '绘制线', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawPolyGon',
        component: Layout,
        redirect: '/drawPolyGon',
        children: [
            {
                path: '/drawPolyGon',
                component: () => import('@/views/drawPolyGon/index.vue'),
                name: 'DrawPolyGon',
                meta: { title: '绘制面', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawCircle',
        component: Layout,
        redirect: '/drawCircle',
        children: [
            {
                path: '/drawCircle',
                component: () => import('@/views/drawCircle/index.vue'),
                name: 'DrawCircle',
                meta: { title: '绘制圆', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawRectangle',
        component: Layout,
        redirect: '/drawCirdrawRectanglecle',
        children: [
            {
                path: '/drawRectangle',
                component: () => import('@/views/drawRectangle/index.vue'),
                name: 'DrawRectangle',
                meta: { title: '绘制矩形', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/model',
        component: Layout,
        redirect: '/model',
        children: [
            {
                path: '/model',
                component: () => import('@/views/model/index.vue'),
                name: 'Model',
                meta: { title: '模型', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/track',
        component: Layout,
        redirect: '/track',
        children: [
            {
                path: '/track',
                component: () => import('@/views/track/index.vue'),
                name: 'Track',
                meta: { title: '轨迹回放', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/imageMap',
        component: Layout,
        redirect: '/imageMap',
        children: [
            {
                path: '/imageMap',
                component: () => import('@/views/imageMap/index.vue'),
                name: 'ImageMap',
                meta: { title: '影像图', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/heatMap',
        component: Layout,
        redirect: '/heatMap',
        children: [
            {
                path: '/heatMap',
                component: () => import('@/views/heatMap/index.vue'),
                name: 'HeatMap',
                meta: { title: '热力图', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/pointTogether',
        component: Layout,
        redirect: '/pointTogether',
        children: [
            {
                path: '/pointTogether',
                component: () => import('@/views/pointTogether/index.vue'),
                name: 'PointTogether',
                meta: { title: '点聚合', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/three',
        component: Layout,
        redirect: '/three',
        children: [
            {
                path: '/three',
                component: () => import('@/views/three/index.vue'),
                name: 'three',
                meta: { title: '3d模型', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/primitive',
        component: Layout,
        redirect: '/primitive',
        children: [
            {
                path: '/primitive',
                component: () => import('@/views/primitive/index.vue'),
                name: 'primitive',
                meta: { title: 'primitive', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/ol-cesium',
        component: Layout,
        redirect: '/ol-cesium',
        children: [
            {
                path: '/ol-cesium',
                component: () => import('@/views/ol-cesium/index.vue'),
                name: 'ol-cesium',
                meta: { title: 'ol二维三维', icon: 'dashboard', affix: true },
            },
        ],
    },
    {
        path: '/drawWall',
        component: Layout,
        redirect: '/drawWall',
        children: [
            {
                path: '/drawWall',
                component: () => import('@/views/drawWall/index.vue'),
                name: 'drawWall',
                meta: { title: '立体墙', icon: 'dashboard', affix: true },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
});

export default router;
