<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw">
            <el-button type="primary" @click="draw">开启绘制</el-button>
            <el-button type="primary" @click="edit">开启编辑</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import { rectangle } from '@/components/Rectangle/rectangle';
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
        // baseLayer: new Cesium.ImageryLayer(
        //     new Cesium.UrlTemplateImageryProvider({
        //         url: 'http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        //         minimumLevel: 1,
        //         maximumLevel: 18,
        //     })
        // ),
        // terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
        // terrainProvider:new Cesium.EllipsoidTerrainProvider(),
        // terrain: Cesium.Terrain.fromWorldTerrain(),
    });
    // 相机飞入点
    viewer.value.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(-73.97198, 40.7761, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // 视角
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
        },
    });
};
// 开启绘制
let drawCircle: rectangle;
const draw = () => {
    drawCircle.draw();
};
const edit = () => {
    drawCircle.edit();
};
onMounted(async () => {
    await initMap();
    // 高德地图
    viewer.value.imageryLayers.add(
        new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
                url: 'https://wprd01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
                minimumLevel: 1,
                maximumLevel: 18,
            })
        )
    );
    // 监听cesiumContainer的鼠标事件
    const handle = await new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    drawCircle = await new rectangle(viewer.value, handle);
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