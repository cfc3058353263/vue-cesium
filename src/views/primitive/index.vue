<template>
    <div class="app-main">
        <div id="cesiumContainer">
            <div class="draw">
                <el-button type="primary" @click="addDiffusionCircle">{{ dynamicState ? '添加扩散源' : '移除扩散源' }}</el-button>
                <el-button type="primary" @click="connectGeo">合并多个集合图形</el-button>
                <el-button type="primary" @click="connectGeometryInstances">一个集合图形被多次引用合并</el-button>
                <el-button type="primary" @click="setGeoInstance">修改集合图形样式</el-button>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { cartesian3_to_lng_lat } from '@/components/utils/utils'
import { createDynamicCircleStage, connectGeometry, geometryInstancesAddGeo, setGeometryInstanceStyle } from '@/components/Primitive/primitive'
// 创建Cesium Viewer
let viewer: Cesium.Viewer;
// 初始化地图
const initMap = async () => {
    viewer = new Cesium.Viewer("cesiumContainer", {
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
        terrain: Cesium.Terrain.fromWorldTerrain()
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
    handler.setInputAction(async function (event: any) {
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
// 添加扩散源
const dynamicState = ref(true)
let dynamicCircle: Cesium.PostProcessStage;
const addDiffusionCircle = () => {
    if (dynamicState.value) {
        var lng = 116.39121137414092
        var lat = 39.90778348948195
        var cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(lng), Cesium.Math.toRadians(lat), 0)
        var scanColor = new Cesium.Color(1.0, 0.0, 0.0, 1)
        // 创建自定义的 PostProcessStage
        dynamicCircle = createDynamicCircleStage(viewer, cartographicCenter, 500, scanColor, 2000)
        // 添加进场景
        viewer.scene.postProcessStages.add(dynamicCircle)
        dynamicState.value = false
    } else {
        viewer.scene.postProcessStages.remove(dynamicCircle)
        dynamicState.value = true
    }
}

// 合并多个集合图形
const connectGeo = () => {
    connectGeometry(viewer)
}

// 一个集合图形被多次引用合并
const connectGeometryInstances = () => {
    geometryInstancesAddGeo(viewer)
}

// 修改集合图形样式
const setGeoInstance = () => {
    setGeometryInstanceStyle(viewer)
}
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
  