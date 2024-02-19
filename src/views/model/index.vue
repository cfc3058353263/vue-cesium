<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw">
            <el-button type="primary" size="small" @click="loadModel">模型加载</el-button>
            <el-button type="primary" size="small" @click="showModel">{{
                visible ? '模型显示' : '模型隐藏'
            }}</el-button>
            <el-button type="primary" size="small" @click="openDraw()">开始绘制</el-button>
            <el-button type="primary" size="small" @click="openEdit()">开启编辑</el-button>
        </div>
        <modelDrawer ref="drawerModel" :tileset="tileset" :model="model"></modelDrawer>
        <polygonDrawer ref="drawerPolygon"></polygonDrawer>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import { Model } from '@/components/Model/Model';
import { Polygon } from '@/components/Polygon/polyg';
import modelDrawer from './components/modelDrawer.vue';
import polygonDrawer from './components/polygonDrawer.vue';

// 当前组件的实例
const cesiumContainer = ref();
// 创建Cesium Viewer
const viewer = ref();
// 初始化地图
const initMap = async () => {
    viewer.value = new Cesium.Viewer('cesiumContainer', {
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        // 添加地形服务
        terrain: Cesium.Terrain.fromWorldTerrain(),
    });
    viewer.value.scene.debugShowFramesPerSecound = true;
    viewer.value.scene.moon.show = false;
    viewer.value.scene.fog.enabled = false;
    viewer.value.scene.sun.show = false;
    viewer.value.scene.skyBox.show = false;
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    // viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 相机飞入点
    viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-75.60217330403601, 40.04102882709425, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // 视角
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
        },
    });
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
};
// 绘制线
const openDraw = () => {
    polygon.draw();
};
// 编辑线
let drawerPolygon = ref();
const openEdit = () => {
    polygon.handlerLeftClickCallBack = drawerPolygon.value.handlePolygonClick;
    polygon.edit();
};
// 模型隐藏
const visible = ref(false);
const showModel = () => {
    visible.value = !visible.value;
    model.value.changeModelVisibility(tileset.value, visible.value);
};

let model = ref();
let tileset = ref<Cesium.Cesium3DTileset>();
let polygon: Polygon;
let drawerModel = ref();
// 模型加载
const loadModel = async () => {
    tileset.value = await model.value.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json');
    model.value.handlerLeftClick();
    model.value.handlerMouseMove();
    model.value.handlerLeftClickCallBack = drawerModel.value.handleModelClick;
    // model.value.addTilesetModel()
};
onMounted(async () => {
    initMap();
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    model.value = new Model(viewer.value, handler);
    polygon = new Polygon(viewer.value, handler);
});
</script>
  
<style lang="scss" scoped>
#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;
        left: 30px;
        top: 30px;
    }
}
</style>