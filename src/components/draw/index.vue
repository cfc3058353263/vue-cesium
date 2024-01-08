<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane label="点" name="first"></el-tab-pane>
                <el-tab-pane label="线" name="second"></el-tab-pane>
                <el-tab-pane label="面" name="third">
                    <el-button type="primary" size="small" @click="drawPolygon()">开始绘制</el-button>
                </el-tab-pane>
            </el-tabs>
        </div>
        <el-drawer v-model="drawer" title="I am the title" :with-header="false" :modal="false" modal-class="drawerModal">
            <el-form ref="ruleFormRef" :model="form" status-icon :rules="rules" label-width="120px" class="demo-ruleForm">
                <el-form-item label="实体名称" prop="name">
                    <el-input v-model="form.name" autocomplete="off" @change="handleChangeName" />
                </el-form-item>
                <el-form-item label="实体高度" prop="height">
                    <el-input-number v-model="form.height" :min="0" :max="1000" @change="handleChangeHeight" />
                </el-form-item>
                <el-form-item label="是否隐藏" prop="show">
                    <el-switch v-model="form.show" @change="handleChangeShow" />
                </el-form-item>
                <el-form-item label="实体颜色" prop="color">
                    <el-color-picker v-model="form.color" show-alpha @change="handleChangeColor" color-format="hex" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存</el-button>
                    <!-- <el-button @click="resetForm(ruleFormRef)">Reset</el-button> -->
                </el-form-item>
            </el-form>
        </el-drawer>
    </div>
</template>
   
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref, reactive, toRefs } from "vue";
import { editPolyGonFunC, drawer, form } from './component/draw.ts';

const data = reactive({
    activeName: 'first',// 标签状态
})
const { activeName } = toRefs(data)

const rules = reactive({
    name: [{ required: true, message: '请输入实体名称', trigger: 'blur' },],
    // checkPass: [{ validator: validatePass2, trigger: 'blur' }],
    // age: [{ validator: checkAge, trigger: 'blur' }],
})

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
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
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

// editPolygon实例
let editPolygon: any
// 绘制多边形
const drawPolygon = () => {
    editPolygon.draw()
}
// 修改名称
const handleChangeName = () => {
    editPolygon.setName()
}
// 修改高度
const handleChangeHeight = () => {
    editPolygon.drawPolyhedron()
}
//  修改颜色
const handleChangeColor = () => {
    editPolygon.setColor()
}
// 显示隐藏
const handleChangeShow = () => {
    editPolygon.setShow()
}
// 保存
const handleSubmit = () => {
    editPolygon.save()
}
onMounted(async () => {
    initMap()
    // 监听cesiumContainer的鼠标事件
    const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)
    // 创建editPolygon
    editPolygon = new editPolyGonFunC(viewer.value, handle)
    editPolygon.handlerLeftClick()
    editPolygon.handlerMouseMove()
    editPolygon.handerRightClick()
    const imageLayers = viewer.value.imageryLayers
    // imageLayers.remove(imageLayers.get(0))
    // // 高德
    // var gaodeImageryProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    //     maximumLevel: 18,
    //     minimumLevel: 1,
    //     credit: 'Amap'
    // })
    // imageLayers.addImageryProvider(gaodeImageryProvider);
    // 腾讯
    // var tencentImageryProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: "https://p2.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400",
    //     customTags: {
    //         sx: function (imageryProvider, x, y, level) { return x >> 4; },
    //         sy: function (imageryProvider, x, y, level) { return ((1 << level) - y) >> 4 }
    //     }
    // });
    // imageLayers.addImageryProvider(tencentImageryProvider);
    // 天地图
    // var tdtImageryProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: 'http://{s}.tianditu.com/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=7047525cefc9357438b08f9175efaa6b',
    //     subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    //     maximumLevel: 18,
    //     minimumLevel: 1,
    //     credit: 'Tianditu'
    // });
    // imageLayers.addImageryProvider(tdtImageryProvider);

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
        background-color: #fff;
        width: 500px;
        padding: 10px;

        .demo-tabs>.el-tabs__content {
            padding: 32px;
            color: #6b778c;
            font-size: 32px;
            font-weight: 600;
        }
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