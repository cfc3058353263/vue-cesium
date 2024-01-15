<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw">
            <el-button type="primary" size="small" @click="loadModel">模型加载</el-button>
            <el-button type="primary" size="small" @click="drawLine()">开始绘制</el-button>
            <el-button type="primary" size="small" @click="editLine()">开启编辑</el-button>
            <el-button type="primary" size="small" @click="stopLine()">结束编辑</el-button>
            <!-- <el-button type="primary" @click="edit">开启编辑</el-button> -->
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { Model } from '@/components/Model/Model.ts'
import { Line } from '@/components/Line/Line.ts';
import { DataSource } from '@/components/DataSource/DataSource.ts';
// 当前组件的实例
const cesiumContainer = ref();
// 创建Cesium Viewer
const viewer = ref();
// 初始化地图
const initMap = async () => {
    viewer.value = new Cesium.Viewer("cesiumContainer", {
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
// 绘制线
let line: any
// 绘制线
const drawLine = () => {
    line.draw()
}
// 编辑线
const editLine = () => {
    line.edit()
}
// 结束编辑
const stopLine = () => {
    line.endEdit()
}


let model: Model
// 模型加载
const loadModel = async () => {
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    const tileset = await model.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json')
    await model.changeHeight(158, tileset)
    await model.setModelScale(tileset, 1.4)
    model.handlerLeftClick()
}
onMounted(async () => {
    initMap();
    const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)
    model = new Model(viewer.value, handle)
    line = new Line(viewer.value, handle)
    const dataSource = new DataSource(viewer.value, handle)
    dataSource.CzmlDataSource()
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