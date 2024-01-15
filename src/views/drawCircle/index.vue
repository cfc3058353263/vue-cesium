<template>
  <div ref="cesiumContainer" id="cesiumContainer">
    <div class="draw">
        <el-button type="primary" @click="draw">开启绘制</el-button>
        <el-button type="primary" @click="edit">开启编辑</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { Circle } from "@/components/Circle/Circle.ts";
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
// 开启绘制
let drawCircle: Circle;
const draw = () => {
  drawCircle.draw();
};
const edit = () => {
  drawCircle.edit();
};
onMounted(async () => {
  initMap();
  // 监听cesiumContainer的鼠标事件
  const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
  drawCircle = new Circle(viewer.value, handle);
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