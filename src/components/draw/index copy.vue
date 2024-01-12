<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane label="绘制点" name="first">
                    <el-button type="primary" size="small" @click="drawPoint()">开始绘制</el-button>
                </el-tab-pane>
                <el-tab-pane label="绘制线" name="second"></el-tab-pane>
                <el-tab-pane label="绘制多边形" name="third">
                    <el-button type="primary" size="small" @click="drawPolygon()">开始绘制</el-button>
                </el-tab-pane>
            </el-tabs>
        </div>
        <el-drawer v-model="drawer" title="I am the title" :with-header="false" :modal="false" modal-class="drawerModal">
            <el-form ref="">

            </el-form>
            <!-- <el-form ref="ruleFormRef" :model="form" status-icon :rules="rules" label-width="120px" class="demo-ruleForm">
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
import { editPolyGonFunC, drawer, form } from './component/draw/drawPolyGon.ts';
import { editPointFunC } from './component/draw/drawPoint.ts';
import { edit3dTilesetFunC } from './component/model/set3dTileset.ts';
import cache from '../../plugins/cache.ts'
const { local } = cache

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
// edit3dTileset实例
let edit3dTileset: any
// 绘制点
let editPoint:any
const drawPoint = () =>{
    editPoint.draw()
}
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
    // viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 监听cesiumContainer的鼠标事件
    const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)
    // 创建editPoint
    editPoint = new editPointFunC(viewer.value, handle)
    // 创建editPolygon
    editPolygon = new editPolyGonFunC(viewer.value, handle)
    editPolygon.handlerLeftClick()
    editPolygon.handlerMouseMove()
    editPolygon.handerRightClick()
    if(local.getJSON('polygon')){
        const data =  JSON.parse(local.getJSON('polygon'))
        data && editPolygon.drawDatapolygon(data)
    }
    // 创建edit3dTileset
    // edit3dTileset = new edit3dTilesetFunC(viewer.value, handle)
    // const tileset = await edit3dTileset.add3dTileset('http://127.0.0.1:8888/b3dm/tileset.json')
    // await edit3dTileset.changeHeight(34, tileset)
    // edit3dTileset.handlerLeftClick()
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