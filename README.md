# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
# 需要一个不带后台的若依前端项目

###  geoserver安装部署
###  geoserver 接口服务查询
###  多边形绘制工具
###  不同级别下的地图图层展示
###  cesium图层引入

设置高度参数
是否可以编辑


### 编辑操作 
点击点可以进行拖住操作；
点击边，在边上生成一个可以进行拖住点，之后进行编辑

### 根据平面数据添加高度生成立体数据

### 保存/还原/删除
数据格式
{
   id:'',
   name: '',
   data: [],
   type: '',
   color: ''
}

[
    {
        "x": 1309517.3687710846,
        "y": -4642114.222481885,
        "z": 4159324.254014073
    },
    {
        "x": 1322930.2618680482,
        "y": -4652508.811422034,
        "z": 4143541.8261547
    },
    {
        "x": 1332093.879154647,
        "y": -4644769.549563497,
        "z": 4149246.2563269013
    }
]


### wmts 加载 / 倾斜摄影的加载

### 影像图添加根据不同级别显示不同分辨率的图层

### 倾斜摄影图层添加根据不同级别显示不同分辨率的图层


### 添加多个多边形且保存到
保存格式
```bash
[
    {
        id:'xxxxx-xxxx-xxxx', //标识
        name: '', //名称
        data: [], // 经纬度
        show: '', // 状态是否显示隐藏
        color: ', //多边形颜色，
        state: '', //是否是选中状态
    }
]
```
### 隐藏之后如何显示还原

### 拖拽，高亮，回显，保存

### 修改点击边添加编辑点，且重新绘制实体

### 使用步骤
1. 开始绘制面
2. 绘制完成后，右键结束绘制
3. 


### 开发
1. 区块添加
2. 路线/路线导航
4. 模型区块模型高亮显示
5. 圆形/椭圆
6. 不同级别显示不同分辨率的图层