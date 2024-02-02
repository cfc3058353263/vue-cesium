<template>
    <el-drawer v-model="drawer" :modal="false" modal-class="drawerModal" @close="close">
        <el-form ref="ruleFormRef" :model="form" status-icon label-width="120px" class="demo-ruleForm">
            <div class="zome">旋转:</div>
            <div class="item">
                <div class="title">X轴：</div>
                <el-input-number
                    :min="-360"
                    :max="360"
                    v-model="form.rotateX"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="item">
                <div class="title">Y轴：</div>
                <el-input-number
                    :min="-360"
                    :max="360"
                    v-model="form.rotateY"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="item">
                <div class="title">Z轴：</div>
                <el-input-number
                    :min="-360"
                    :max="360"
                    v-model="form.rotateZ"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="zome">缩放：</div>
            <div class="item">
                <el-slider
                    v-model="form.zome"
                    size="small"
                    @change="update3dtilesMaxtrix"
                    show-input
                    input-size="small"
                />
            </div>
            <div class="zome">离地高度：</div>
            <div class="item">
                <el-input-number
                    :min="-360"
                    :max="360"
                    v-model="form.height"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="zome">经纬度：</div>
            <div class="title">经度：</div>
            <div class="item">
                <el-input-number
                    style="width: 200px"
                    :precision="14"
                    :step="0.00001"
                    :min="-360"
                    :max="360"
                    v-model="form.lon"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="title">纬度：</div>
            <div class="item">
                <el-input-number
                    style="width: 200px"
                    :precision="14"
                    :step="0.00001"
                    :min="-360"
                    :max="360"
                    v-model="form.lat"
                    controls-position="right"
                    @change="update3dtilesMaxtrix"
                />
            </div>
            <div class="zome">透视度：</div>
            <div class="item">
                <el-input-number
                    :precision="2"
                    :step="0.1"
                    :min="0"
                    :max="1"
                    v-model="form.opacity"
                    controls-position="right"
                    @change="update3dtilesOpacity"
                />
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
import { reactive, toRefs, watch } from 'vue';
import * as Cesium from 'cesium';
import { Model } from '@/components/Model/Models';
const model = new Model(null, null);
interface Props {
    drawer: boolean;
    tilesModel: Cesium.Cesium3DTileset;
}

const props = withDefaults(defineProps<Props>(), {
    drawer: false,
});
const data = reactive({
    form: {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        zome: 1,
        height: 0,
        lon: 0,
        lat: 0,
        opacity: 1,
        visible: true,
        entityId: true,
        tileseVisible: false,
    },
});
const { form } = toRefs(data);
const { drawer, tilesModel } = toRefs(props);
const emit = defineEmits(['update:drawer']);
const close = () => {
    emit('update:drawer', false);
};

watch(tilesModel, newVal => {
    if (newVal) {
        let cartographic = Cesium.Cartographic.fromCartesian(tilesModel.value.boundingSphere.center);
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height;
        form.value.height = height;
        form.value.lon = lon;
        form.value.lat = lat;
    }
});

// 缩放/平移旋转
const update3dtilesMaxtrix = () => {
    model.update3dtilesMaxtrix(
        tilesModel.value,
        form.value.rotateX,
        form.value.rotateY,
        form.value.rotateZ,
        form.value.zome,
        form.value.height,
        form.value.lon,
        form.value.lat
    );
};

// 修改模型的透视度
const update3dtilesOpacity = () => {
    model.changeModelOpacity(tilesModel.value, form.value.opacity)
};
// 修改模型的显示隐藏
const update3dtilesVisible = () => {
    model.changeModelVisibility(tilesModel.value, form.value.visible)
};
// 模型关联实体id
const tilesetModel = () => {
    if (form.value.tileseVisible) {
        // const polygonData = local.getJSON('polygon')
        // const data = JSON.parse(polygonData)
        // data.map(item => {
        //     model.value.addTilesetModel(item)
        // })
    }
};

</script>
<style lang="scss" scoped>
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