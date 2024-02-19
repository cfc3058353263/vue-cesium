<template>
    <el-drawer v-model="drawer" :modal="false" modal-class="drawerModal" @close="close">
        <el-form ref="ruleFormRef" :model="form" status-icon label-width="120px" class="demo-ruleForm">
            <el-form-item label="实体名称" prop="name">
                <el-input v-model="form.name" autocomplete="off" @change="handleChangeName" />
            </el-form-item>
            <el-form-item label="实体高度" prop="height">
                <el-input-number
                    v-model="form.height"
                    :min="0"
                    :max="1000"
                    size="small"
                    controls-position="right"
                    @change="handleChangeHeight"
                />
                米
            </el-form-item>
            <el-form-item label="离地高度" prop="extrudedHeight">
                <el-input-number
                    v-model="form.extrudedHeight"
                    :min="0"
                    :max="1000"
                    size="small"
                    controls-position="right"
                    @change="handleChangeExtrudedHeight"
                />
                米
            </el-form-item>
            <el-form-item label="是否隐藏" prop="show">
                <el-switch v-model="form.show" @change="handleChangeShow" />
            </el-form-item>
            <el-form-item label="实体颜色" prop="color">
                <el-color-picker
                    v-model="form.color"
                    show-alpha
                    @change="handleChangeColor"
                    color-format="hex"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSubmit">保存</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium';
import { reactive, toRefs, watch } from 'vue';
import { Polygon } from '@/components/Polygon/Polygon';
import cache from '@/plugins/cache.ts';
interface Props {
    drawer: boolean;
    polygonEntity: Cesium.PointGraphics;
}

const props = withDefaults(defineProps<Props>(), {
    drawer: false,
});
const { drawer, polygonEntity } = toRefs(props);
const emit = defineEmits(['update:drawer']);
const close = () => {
    emit('update:drawer', false);
};

const data = reactive({
    form: {
        name: '',
        height: 0,
        extrudedHeight: 0,
        show: true,
        color: '',
    },
});
const { form } = toRefs(data);

const { local } = cache;
let polygon = new Polygon(null, null)
// 修改名称
const handleChangeName = () => {
    polygon.setName(polygonEntity.value, form.value.name);
};
// 修改高度
const handleChangeHeight = () => {
    polygon.setHeight(polygonEntity.value, form.value.height);
};
// 修改离地高度
const handleChangeExtrudedHeight = () => {
    polygon.setExtrudedHeight(polygonEntity.value, form.value.extrudedHeight);
};
//  修改颜色
const handleChangeColor = () => {
    polygon.setColor(polygonEntity.value, form.value.color);
};
// 显示隐藏
const handleChangeShow = () => {
    polygon.setShow(polygonEntity.value, form.value.show);
};
// 保存
const handleSubmit = () => {
    const positions = polygonEntity.value.polygon.hierarchy._callback().positions;
    const polygonData = {
        positions,
        ...form.value,
    };
    let data = local.getJSON('polygon');
    if (!data) {
        data = [polygonData];
        local.setJSON('polygon', JSON.stringify(data));
    } else {
        const dataParse = JSON.parse(data);
        dataParse.push(polygonData);
        local.setJSON('polygon', JSON.stringify(dataParse));
    }
};

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