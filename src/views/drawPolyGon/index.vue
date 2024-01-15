<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-button type="primary" size="small" @click="drawPolygon()">开始绘制</el-button>
        </div>
        <el-drawer v-model="drawer" title="I am the title" :with-header="false" :modal="false" modal-class="drawerModal">
            <!-- <el-form ref="ruleFormRef" :model="form" status-icon label-width="120px" class="demo-ruleForm">
                <el-form-item label="实体名称" prop="name">
                    <el-input v-model="form.name" autocomplete="off" @change="handleChangeName" />
                </el-form-item>
                <el-form-item label="实体高度" prop="height">
                    <el-input-number v-model="form.height" :min="0" :max="1000" size="small" controls-position="right"
                        @change="handleChangeHeight" /> 米
                </el-form-item>
                <el-form-item label="离地高度" prop="height">
                    <el-input-number v-model="form.height" :min="0" :max="1000"  size="small" controls-position="right" @change="handleChangeHeight" /> 米
                </el-form-item>
                <el-form-item label="是否隐藏" prop="show">
                    <el-switch v-model="form.show" @change="handleChangeShow" />
                </el-form-item>
                <el-form-item label="实体颜色" prop="color">
                    <el-color-picker v-model="form.color" show-alpha @change="handleChangeColor" color-format="hex" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存</el-button>
                    <el-button @click="">重置</el-button>
                </el-form-item>
            </el-form> -->

        </el-drawer>
    </div>
</template>
   
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref, reactive, toRefs } from "vue";
import { PolyGon } from '@/components/PolyGon/PolyGon.ts';
import cache from '@/plugins/cache.ts'
const { local } = cache

const data = reactive({
    activeName: 'first',// 标签状态
})
const { activeName } = toRefs(data)

// 当前组件的实例
const cesiumContainer = ref()
// 创建Cesium Viewer
const viewer = ref()
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
    });
    // 相机飞入点
    viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-73.97198, 40.77610, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // 视角
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
        },
    });
};
const drawer = ref()
// polyGon实例
let polyGon: any
// 绘制多边形
const drawPolygon = () => {
    polyGon.draw()
}

// // 修改名称
// const handleChangeName = () => {
//     polyGon.setName()
// }
// // 修改高度
// const handleChangeHeight = () => {
//     polyGon.drawPolyhedron()
// }
// //  修改颜色
// const handleChangeColor = () => {
//     polyGon.setColor()
// }
// // 显示隐藏
// const handleChangeShow = () => {
//     polyGon.setShow()
// }
// // 保存
// const handleSubmit = () => {
//     polyGon.save()
// }
onMounted(async () => {
    initMap()
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    // viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    // viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 监听cesiumContainer的鼠标事件
    const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)

    // 创建polyGon
    polyGon = new PolyGon(viewer.value, handle)
    polyGon.handlerLeftClick()
    polyGon.handlerMouseMove()
    polyGon.handerRightClick()
    if(local.getJSON('polygon')){
        const data =  JSON.parse(local.getJSON('polygon'))
        data && polyGon.drawDatapolygon(data)
    }
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
<style>
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