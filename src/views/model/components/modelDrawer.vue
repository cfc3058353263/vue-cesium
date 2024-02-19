<template>
    <el-drawer v-model="drawer" :modal="false" modal-class="drawerModal">
        <el-form ref="ruleFormRef" :model="form" status-icon label-width="120px" class="demo-ruleForm">
            <div class="zome">旋转:</div>
            <div class="item">
                <div class="title">X轴：</div>
                <el-input-number :min="-360" :max="360" v-model="form.rotateX" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="item">
                <div class="title">Y轴：</div>
                <el-input-number :min="-360" :max="360" v-model="form.rotateY" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="item">
                <div class="title">Z轴：</div>
                <el-input-number :min="-360" :max="360" v-model="form.rotateZ" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="zome">缩放：</div>
            <div class="item">
                <el-slider v-model="form.zome" size="small" @change="update3dtilesMaxtrix" show-input input-size="small" />
            </div>
            <div class="zome">离地高度：</div>
            <div class="item">
                <el-input-number :min="-360" :max="360" v-model="form.height" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="zome">经纬度：</div>
            <div class="title">经度：</div>
            <div class="item">
                <el-input-number style="width: 200px;" :precision="14" :step="0.00001" :min="-360" :max="360" v-model="form.lon" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="title">纬度：</div>
            <div class="item">
                <el-input-number style="width: 200px;" :precision="14" :step="0.00001" :min="-360" :max="360" v-model="form.lat" controls-position="right"
                    @change="update3dtilesMaxtrix" />
            </div>
            <div class="zome">透视度：</div>
            <div class="item">
                <el-input-number :precision="2" :step="0.1" :min="0" :max="1" v-model="form.opacity"
                    controls-position="right" @change="update3dtilesOpacity" />
            </div>
            <div class="zome">显示隐藏：</div>
            <div class="item">
                <el-switch v-model="form.visible" @change="update3dtilesVisible" />
            </div>
            <div class="zome">开启单体化模型</div>
            <div class="item">
                <el-switch v-model="form.tileseVisible" @change="tilesetModel" />
            </div>
        </el-form>
    </el-drawer>
</template>
<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import * as Cesium from "cesium";
import { Model } from '@/components/Model/Model.ts'
import cache from '@/plugins/cache.ts'
const { local } = cache

// const model = new Model();
interface Props {
    tileset: Cesium.Cesium3DTileset | null;
    model: Model
}

const props = withDefaults(defineProps<Props>(), {
    tileset: null,
    model: null,
});

const data = reactive({
    drawer: false,
    form: {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        zome: 1.4,
        height: 46,
        lon: 0,
        lat: 0,
        opacity: 1,
        visible: true,
        entityId: true,
        tileseVisible: false
    }
})
const { drawer, form } = toRefs(data)
const { tileset, model } = toRefs(props);

// 缩放/平移旋转
const update3dtilesMaxtrix = () => {
    model.value.update3dtilesMaxtrix(tileset.value, form.value.rotateX, form.value.rotateY, form.value.rotateZ, form.value.zome, form.value.height, form.value.lon, form.value.lat)
}

// 修改模型的透视度
const update3dtilesOpacity = () => {
    model.value.changeModelOpacity(tileset.value, form.value.opacity)
}
// 修改模型的显示隐藏
const update3dtilesVisible = () => {
    model.value.changeModelVisibility(tileset.value, form.value.visible)
}
// 模型关联实体id
const tilesetModel = () => {
    if (form.value.tileseVisible) {
        const polygonData = local.getJSON('polygon')
        const data = JSON.parse(polygonData)
        console.log(data)
        data.map(item => {
            model.value.addTilesetModel(item)
        })
    }
}

// 鼠标点击模型是执行的方法
const handleModelClick = () => {
    drawer.value = true;
    // 获取模型的默认高度
    let cartographic = Cesium.Cartographic.fromCartesian(tileset.value.boundingSphere.center);
    let lon = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let height = cartographic.height;
    form.value.height = height
    form.value.height = 46
    form.value.lon = lon
    form.value.lat = lat
    update3dtilesMaxtrix()
}
defineExpose({
    handleModelClick
})
</script>
<style lang="scss">
.zome {
    margin: 10px 0;
}

.item {
    display: flex;
    align-items: center;
    margin-bottom: 7px;

    .title {
        width: 60px;
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