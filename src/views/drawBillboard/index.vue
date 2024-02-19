<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-button type="primary" size="small" @click="drawBillboard()">添加标注</el-button>
        </div>
    </div>
</template>
   
<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref, reactive, toRefs } from 'vue';
import { Billboard } from '@/components/Billboard/Billboard';
import { Model } from '@/components/Model/models';

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
        terrain: Cesium.Terrain.fromWorldTerrain(),
    });
    // 相机飞入点
    viewer.value.camera.setView({
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
const drawer = ref();

// 添加标注
let billboard: any;

// 添加标注
const drawBillboard = () => {
    billboard.draw();
};
let model: Model;
onMounted(async () => {
    initMap();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 监听cesiumContainer的鼠标事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    billboard = new Billboard(viewer.value, handler);
    // 模型添加
    model = new Model(viewer.value, handler);
    model.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json');
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