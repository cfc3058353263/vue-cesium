<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw">
            <el-button type="primary" @click="playback">轨迹回放</el-button>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { Track } from "@/components/Track/Track.ts"
import { Model } from "@/components/Model/Model.ts"
// 当前组件的实例
const cesiumContainer = ref();
// 创建Cesium Viewer
const viewer = ref();
// 初始化地图
const initMap = async () => {
    viewer.value = new Cesium.Viewer("cesiumContainer", {
        //搜索框
        geocoder: false,
        //home键
        homeButton: false,
        // 动画控件
        animation: false,
        //全屏按钮
        fullscreenButton: false,
        //场景模式选择器
        sceneModePicker: false,
        //时间轴
        timeline: false,
        //导航提示
        navigationHelpButton: false,
        //地图选择器
        baseLayerPicker: false,
        // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        //     url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        //     maximumLevel: 18,
        //     minimumLevel: 1,
        //     credit: 'Amap'
        // })),
    });
    viewer.value.scene.debugShowFramesPerSecound = true;
    //创建DataSource
    var datasource = new Cesium.CustomDataSource("enetiestestdata");
    viewer.value.dataSources.add(datasource)
    // 相机飞入点
    // viewer.value.camera.setView({
    //     // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
    //     destination: Cesium.Cartesian3.fromDegrees(-73.97198, 40.7761, 2000),
    //     orientation: {
    //         // 指向
    //         heading: Cesium.Math.toRadians(0.0),
    //         // 视角
    //         pitch: Cesium.Math.toRadians(-90),
    //         roll: 0.0,
    //     },
    // });
};

const playback = ()=>{
    track.sampleHeights();
}

let track: Track
let model = ref();
let tileset = ref<Cesium.Cesium3DTileset>();
onMounted(async () => {
    initMap();
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)
    track = new Track(viewer.value, handler)
    track.handlerLeftClick()
    // track.craterDataSource()
    model.value = new Model(viewer.value, handler)
    tileset.value = await model.value.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json')
    model.value.changeHeight(tileset.value, -65)

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