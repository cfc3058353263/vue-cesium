<template>
    <el-drawer v-model="drawer" :modal="false" modal-class="drawerModal">
        <el-form ref="ruleFormRef" :model="form" status-icon label-width="120px" class="demo-ruleForm">
            <el-form-item label="实体名称" prop="name">
                <el-input v-model="form.name" autocomplete="off" @change="handleChangeName" />
            </el-form-item>
            <el-form-item label="实体高度" prop="height">
                <el-input-number v-model="form.height" :min="0" :max="1000" size="small" controls-position="right"
                    @change="handleChangeHeight" /> 米
            </el-form-item>
            <el-form-item label="离地高度" prop="extrudedHeight">
                <el-input-number v-model="form.extrudedHeight" :min="0" :max="1000" size="small" controls-position="right"
                    @change="handleChangeExtrudedHeight" /> 米
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
        </el-form>
    </el-drawer>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { reactive, toRefs } from 'vue'
import { Polygon } from '@/components/Polygon/polyg.ts';
import cache from '@/plugins/cache.ts'

const { local } = cache
const polygon = new Polygon();

const data = reactive({
    drawer: false,
    form: {
        name: '',
        height: 0,
        extrudedHeight: 0,
        show: true,
        color: '',
    },
    polygonEntity: <any>null, //当前实体
})
const { drawer, form, polygonEntity } = toRefs(data)

// 修改名称
const handleChangeName = () => {
    polygon.setName(polygonEntity.value, form.value.name)
}
// 修改高度
const handleChangeHeight = () => {
    polygon.setHeight(polygonEntity.value, form.value.height)
}
// 修改离地高度
const handleChangeExtrudedHeight = () => {
    polygon.setExtrudedHeight(polygonEntity.value, form.value.extrudedHeight)
}
//  修改颜色
const handleChangeColor = () => {
    polygon.setColor(polygonEntity.value, form.value.color)
}
// 显示隐藏
const handleChangeShow = () => {
    polygon.setShow(polygonEntity.value, form.value.show)
}
// 保存
const handleSubmit = () => {
    const positions = polygonEntity.value.polygon.hierarchy._callback().positions
    const polygonData = {
        positions,
        ...form.value,
    }
    let data = local.getJSON('polygon')
    console.log(polygonData)

    if(!data){
        data = [polygonData]
        local.setJSON('polygon', JSON.stringify(data))
    }else{
        const dataParse = JSON.parse(data)
        dataParse.push(polygonData)
        local.setJSON('polygon', JSON.stringify(dataParse))
    }
}

// 鼠标点击模型是执行的方法
const handlePolygonClick = (polygon) => {
    polygonEntity.value = polygon
    drawer.value = true;
}
defineExpose({
    handlePolygonClick
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