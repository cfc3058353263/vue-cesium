<template>
    <div ref="cesiumContainer" id="cesiumContainer">
        <div class="draw" type="card">
            <el-button type="primary" size="small" @click="drawLine()">开始绘制</el-button>
            <el-button type="primary" size="small" @click="editLineList()">开启编辑</el-button>
            <el-button type="primary" size="small" @click="endLine()">结束编辑</el-button>
            <el-button type="primary" size="small" @click="getLineData()">获取数据</el-button>
            <el-button type="primary" size="small" @click="createLine()">生成线</el-button>
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
import { Line } from '@/components/Line/Line';
import { lng_lat_to_cartesian3 } from '@/components/utils/utils';

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
         // 添加地形服务
         terrain: Cesium.Terrain.fromWorldTerrain()
    });
    // 相机飞入点
    viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-75.60217330403601, 40.04102882709425, 2000),
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
// 绘制线
let line: any
// 绘制线
const drawLine = () => {
    line.draw()
}
// 编辑线
const editLineList = () => {
    line.edit()
}
// 编辑线
const endLine = () => {
    line.endEdit()
}
// 编辑线
const getLineData = () => {
    line.getPointData()
}

// 生成线
const createLine = () => {
    const data = [
        [
            -73.9816825864532,
            40.778511751468606,
            0
        ],
        [
            -73.97943657283727,
            40.77468946511492,
            0
        ],
        [
            -73.96953070429011,
            40.7745341955651,
            0
        ],
        [
            -73.97207543186609,
            40.77793173546614,
            0
        ],
        [
            -73.97592444926329,
            40.77661377383851,
            0
        ]
    ]
    const cartesian3Arr = data.map(item => {
        return lng_lat_to_cartesian3(item[0], item[1], item[2])
    })
    line.drawLine('测试', cartesian3Arr)
}

onMounted(async () => {
    initMap()
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    // viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 监听cesiumContainer的鼠标事件
    const handle = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas)
    line = new Line(viewer.value, handle)

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
<style lang="scss" scoped>
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