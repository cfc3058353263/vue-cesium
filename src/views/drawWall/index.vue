<template>
    <div class="app-main">
        <div id="cesiumContainer">
            <div class="draw">
                <el-button type="primary" @click="drawWall">绘制动态墙</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import { createWall, addWall } from '@/components/Wall/wall';
// 创建Cesium Viewer
let viewer: Cesium.Viewer;
// 初始化地图
const initMap = async () => {
    viewer = new Cesium.Viewer('cesiumContainer', {
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
    // const terrain = new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromUrl('https://'))

    // 相机飞入点
    viewer.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(116.39121137414092, 39.90778348948195, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-90),
            // 翻滚角
            roll: 0.0,
        },
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(async function (event: any) {}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const drawWall = () => {
    createWall(viewer);
    // addWall(viewer)
};

onMounted(() => {
    initMap();
});
</script>

<style lang="scss" scoped>
#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;
        padding-left: 10px;
        padding-top: 10px;
    }
}
</style>
