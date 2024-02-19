<template>
    <div class="app-main">
        <div class="menu">
            <el-button type="primary" @click="drawGraph('Point')">绘制点</el-button>
            <el-button type="primary" @click="drawGraph('LineString')">绘制线</el-button>
            <el-button type="primary" @click="drawGraph('Polygon')">绘制面</el-button>
            <el-button type="primary" @click="drawGraph('Circle')">绘制圆</el-button>
            <el-button type="primary" @click="clearDraw()">清空</el-button>
            <el-button type="primary" @click="exitDraw()">退出</el-button>
            <el-button type="primary" @click="changeOlCs">{{
                ol3dstate ? '切换二维场景' : '切换三维场景'
            }}</el-button>
        </div>
        <div id="olContainer"></div>
        <!-- <div id="cesiumContainer"></div> -->
    </div>
</template>
  
<script setup lang="ts">
import { onMounted, ref } from 'vue';

import 'ol/ol.css';
import { Map, View } from 'ol';
import OSM from 'ol/source/OSM'; //可以理解为数据源,就是一张图片
import { fromLonLat } from 'ol/proj'; //将坐标从经度/纬度转换为不同的投影。
import WMTS from 'ol/source/WMTS';
import TileLayer from 'ol/layer/Tile'; //可以理解为图层
import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer, Tile } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import TileWMS from 'ol/source/TileWMS';
import Draw from 'ol/interaction/Draw';

import * as Cesium from 'cesium';
// openlayer 转换cesium的工具
import OLCesium from 'olcs/OLCesium.js';
import Interaction from 'ol/interaction/Interaction';

// 创建Cesium Viewer
let viewer: Cesium.Viewer;
// 初始化cesium地图
const initCesiumMap = async () => {
    viewer = new Cesium.Viewer('cesiumContainer', {
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
    viewer.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(116.39121137414092, 39.90778348948195, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-90),
            // 翻滚角
            roll: 0.0,
        },
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(async function (event: any) {}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// 初始化ol地图
let map: Map;
const initOlMap = () => {
    map = new Map({
        target: 'olContainer',
        layers: [gaode, wms, geoJson, vector],
        view: new View({
            projection: 'EPSG:4326', //使用这个坐标系
            center: [104.704968, 31.540962], //西南科技大学
            zoom: 5,
        }),
    });
};

// ol影像加载
// arcgis
const arcgis = new TileLayer({
    source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: 'anonymous',
    }),
});
// 高德
const gaode = new TileLayer({
    source: new XYZ({
        url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
        crossOrigin: 'anonymous',
    }),
});
// 天地图地形
const tdt = new TileLayer({
    source: new XYZ({
        url: 'http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=1fd11e6be6e8f4ff21d36269bb32d415',
        crossOrigin: 'anonymous',
    }),
});
// 天地图标注
const tdtLabel = new TileLayer({
    source: new XYZ({
        url: 'http://t4.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=1fd11e6be6e8f4ff21d36269bb32d415',
        crossOrigin: 'anonymous',
    }),
});
// Bing Maps（使用专用的 BingMaps 服务）
const bing = new TileLayer({
    source: new BingMaps({
        key: '{your-bing-maps-api-key}',
        imagerySet: 'Road',
    }),
});
// geoJson
const geoJson = new VectorLayer({
    source: new VectorSource({
        url: 'https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json',
        format: new GeoJSON(),
    }),
});
// wms
const wms = new TileLayer({
    source: new TileWMS({
        url: 'geoserver/geoserver/tiger/wms',
        params: { LAYERS: '	tiger:tiger_roads', TILED: true },
        serverType: 'geoserver',
        transition: 0,
    }),
});

const ol3dstate = ref(false);
let ol3d: OLCesium;
// 2d 3d 切换
const changeOlCs = () => {
    ol3dstate.value = !ol3dstate.value;
    ol3d.setEnabled(ol3dstate.value);
    if (ol3dstate.value) {
        // 获取cesium scene
        const ol3dLayer = ol3d.getCesiumScene();
        const tdMap = new Cesium.WebMapTileServiceImageryProvider({
            url: 'http://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c',
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            layer: 'tdtImgLayer',
            style: 'default',
            format: 'image/jpeg',
            tileMatrixSetID: 'GoogleMapsCompatible', //使用谷歌的瓦片切片方式
        });
        // 添加天地图影像
        ol3dLayer.imageryLayers.addImageryProvider(tdMap);
        // 获取cesium dataSources 用来添加geojson数据
        const ol3dDataSource = ol3d.getDataSources();
        const sourcePromise = Cesium.GeoJsonDataSource.load(
            'https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json',
            {
                stroke: Cesium.Color.WHITE, //边界颜色
                fill: Cesium.Color.BLUE.withAlpha(0.1), //注意：颜色必须大写，即不能为blue，区域颜色
                strokeWidth: 5, //折线和多边形轮廓的宽度
            }
        );
        // 添加geojson数据到cesium dataSources
        sourcePromise.then(function (dataSource) {
            ol3dDataSource.add(dataSource);
        });
        console.log(ol3dDataSource);
    }
};

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
});
let draw: Interaction | null;
const drawGraph = (type: any) => {
    exitDraw()
    draw = new Draw({
        source: source,
        type: type,
    });
    map.addInteraction(draw);
};
const exitDraw = () => {
    // 退出绘制模式
    if (draw) {
        map.removeInteraction(draw as Interaction);
        draw = null;
    }
};
const clearDraw = () => {
    // 清空绘制
    source.clear();
};
onMounted(() => {
    initOlMap();
    ol3d = new OLCesium({ map: map });
});
</script>
  
<style lang="scss" scoped>
.menu {
    position: absolute;
    z-index: 9999;
    right: 10px;
    top: 10px;
}

#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;
        padding-left: 10px;
        padding-top: 10px;
    }
}

#olContainer {
    width: 100%;
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;
        padding-left: 10px;
        padding-top: 10px;
    }
}
</style>
  