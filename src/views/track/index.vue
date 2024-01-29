<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw">
            <el-button type="primary" @click="playback">轨迹回放</el-button>
            <el-button type="primary" @click="setPerspective(0)">第一视角</el-button>
            <el-button type="primary" @click="setPerspective(1)">跟随视角</el-button>
            <el-button type="primary" @click="setPerspective(2)">上帝视角</el-button>
            <el-button type="primary" @click="setPerspective(3)">自由视角</el-button>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { Track } from "@/components/Track/Track";
import { Model } from "@/components/Model/Model";
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
    });
    viewer.value.scene.debugShowFramesPerSecound = true;
    //创建DataSource
    var datasource = new Cesium.CustomDataSource("enetiestestdata");
    viewer.value.dataSources.add(datasource);
};

const playback = async () => {
    const lnglat = [
        [113.06395692918217, 22.646103761101813, 7.893947268275958],
        [113.06220403380105, 22.64630175872956, 5.208961613755903],
        [113.0621002073448, 22.64578025897571, 5.405481321397263],
        [113.06256240798237, 22.645717154355566, 6.089849200475163],
    ];
    const clampedCartesians = await track.createRoute(lnglat, 10);
    await track.craterAnimation(
        clampedCartesians,
        "http://127.0.0.1:8888/model/xiaofangche.gltf"
    );
};

const setPerspective = (value: number) => {
    track.perspective = value;
};

let track: Track;
let model = ref();
let tileset = ref<Cesium.Cesium3DTileset>();
onMounted(async () => {
    initMap();
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    track = new Track(viewer.value, handler);
    track.handlerLeftClick();
    model.value = new Model(viewer.value, handler);
    tileset.value = await model.value.add3dTileset(
        "http://127.0.0.1:8888/model/b3dm/tileset.json"
    );
    model.value.changeHeight(tileset.value, -65);
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