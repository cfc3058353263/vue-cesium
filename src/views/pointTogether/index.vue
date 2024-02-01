<template>
    <div class="app-main">
        <div id="cesiumContainer">
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import { cartesian3_to_lng_lat } from '@/components/utils/utils'
import { pointTogether } from '@/components/Together/together'
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
        selectionIndicator: false
    });
    // 相机飞入点
    viewer.value.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(-73.97198, 40.7761, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-45),
            // 翻滚角
            roll: 0.0,
        },
    });
    pointTogether(viewer.value)

    var handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    handler.setInputAction(async function (event: any) {
        const pick = viewer.value.scene.pick(event.position)
        const cartesain3: Cesium.Cartesian3 = viewer.value.scene.camera.pickEllipsoid(event.position);
        const lngLat = cartesian3_to_lng_lat(cartesain3)
        // console.log(lngLat)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // screenHandleClick()
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
    }
}
</style>
  