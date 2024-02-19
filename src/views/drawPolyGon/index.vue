<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-button type="primary" size="small" @click="drawPolygon()">开始绘制</el-button>
            <el-button type="primary" size="small" @click="editPolygon()">开启编辑</el-button>
            <!-- <el-button type="primary" size="small" @click="getPolygonInfo()">获取数据</el-button> -->
            <el-button type="primary" size="small" @click="addModel()">添加模型</el-button>
            <el-button type="primary" size="small" @click="changeModel()">选择模型</el-button>
        </div>
        <ModelDrawer v-model:drawer="modelDrawer" :tilesModel="tilesModel"></ModelDrawer>
        <PolygonDrawer v-model:drawer="polygonDrawer" :polygonEntity="polygonEntity" ref="drawerPolygon"></PolygonDrawer>
    </div>
</template>
   
<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref, reactive, toRefs } from 'vue';
import { Polygon } from '@/components/Polygon/Polygon';
import { Model } from '@/components/Model/models';
import ModelDrawer from './components/modelDrawer.vue';
import PolygonDrawer from './components/polygonDrawer.vue'

const data = reactive({
    activeName: 'first', // 标签状态
});
const { activeName } = toRefs(data);

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
        // terrain: Cesium.Terrain.fromWorldTerrain(),
    });
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
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
};
// polyGon实例
let polygon: any;
// 绘制多边形
const drawPolygon = () => {
    polygon.draw();
};
// 编辑多边形
const editPolygon = () => {
    polygon.edit();
};
// // 获取数据
// const getPolygonInfo = () => {
//     const data = polygon.getPolygonData();
//     console.log(data);
// };
let model: Model;
// 添加model
const addModel = () => {
    model.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json');
};
// 选择模型
const changeModel = () => {
    model.handlerLeftClick();
};

const modelDrawer = ref(false);
const polygonDrawer = ref(false);
// 模型实例
const tilesModel = ref();
// 点击获取模型信息
const getTilesModel = (Cesium3DTileset: Cesium.Cesium3DTileset) => {
    tilesModel.value = Cesium3DTileset;
    modelDrawer.value = true;
};
// 点击获取图形信息
// 图形实例
const polygonEntity = ref();
const getPolygon = (polygonInfo:Cesium.PolygonGraphics) => {
    const polyhedron = polygon.drawPolyhedron()
    polygonEntity.value = polyhedron
    polygonDrawer.value = true;
};

// 修改名称
const handleChangeName = () => {
    polygon.setName();
};
// 修改高度
const handleChangeHeight = () => {
    polygon.drawPolyhedron();
};
//  修改颜色
const handleChangeColor = () => {
    polygon.setColor();
};
// 显示隐藏
const handleChangeShow = () => {
    polygon.setShow();
};
// 保存
const handleSubmit = () => {
    polygon.save();
};
onMounted(async () => {
    initMap();
    // viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 监听cesiumContainer的鼠标事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    // 创建polyGon
    polygon = new Polygon(viewer.value, handler);
    // polygon.handlerLeftClickCallBack = getPolygon;
    // 创建model
    model = new Model(viewer.value, handler);
    model.handlerLeftClickCallBack = getTilesModel;
    model.handlerLeftClick();
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
        padding: 10px;
    }
}
</style>
<style lang="scss">
.drawerModal {
    width: 30%;
    inset: 0 0 0 70% !important;
    height: 100%;

    .el-drawer.ltr,
    .el-drawer.rtl {
        width: 100% !important;
    }
}
</style>