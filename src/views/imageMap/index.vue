<template>
    <div class="app-main">
        <div id="cesiumContainer">
            <div class="draw">
                <div class="base-layer-diag__content">
                    <div class="content__thumb" v-for="(item, index) in layerList" :key="index"
                        @click="changeBaseLayer(item.id)">
                        <img :src="item.iconUrl" alt="" />
                        <span>{{ item.name }}</span>
                    </div>
                </div>
                <el-button type="primary" @click="changeBaseLayer('destroy')">还原</el-button>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref, reactive } from "vue";
import GDDZ from "@/assets/imageMap/gaodedianzi.png";
import GDImg from "@/assets/imageMap/gaodeimg.png";
import AnnotationImg from "@/assets/imageMap/weiruanimg.png";
import coordtransform from 'coordtransform';
import { Billboard } from '@/components/Billboard/Billboard.ts';
import icon from '@/assets/images/icon4.png'
import axios from "axios";

const billboard = new Billboard();
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
        selectionIndicator: false,

    });
    const bj84 = coordtransform.gcj02towgs84(116.397455, 39.909187)
    const entityPoint = viewer.value.entities.add({
        name: '',
        // 10 是用来设置广告牌的距离地面的高度
        position: Cesium.Cartesian3.fromDegrees(bj84[0], bj84[1], 10),
        billboard: {
            image: icon,//图标地址
            // 位置固定不会因为旋转视角发生偏移
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            // 设置距离控制可见度
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2100),
            // 设置近大远小
            scaleByDistance: new Cesium.NearFarScalar(0, 0.3, 1050, 0.1),
            // scale: 0.1,
        },
        type: 'billboard',
    })
    // 相机飞入点
    viewer.value.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(bj84[0], bj84[1], 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-90),
            // 翻滚角
            roll: 0.0,
        },
    })
    // viewer.value.camera.flyTo({
    //     // destination: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 1000),
    //     destination: {
    //         "x": -2518829.629660936,
    //         "y": 4848644.594240261,
    //         "z": 3279401.2055265936
    //     },
    //     orientation: {
    //         heading: Cesium.Math.toRadians(0),
    //         pitch: Cesium.Math.toRadians(-30),
    //         roll: Cesium.Math.toRadians(0)
    //     },
    //     duration: 3
    // }).then(function () {
    //     viewer.value.camera.rotateLeft(Cesium.Math.toRadians(90), 3);
    // })
};
const layerList = reactive([
    {
        id: "gddz",
        name: "高德电子",
        iconUrl: GDDZ
    },
    {
        id: "gdyx",
        name: "高德影像",
        iconUrl: GDImg
    },
    {
        id: "annotation",
        name: "高德注记",
        iconUrl: AnnotationImg
    },
    {
        id: "tdmap",
        name: "天地图矢量",
        iconUrl: AnnotationImg
    },
    {
        id: "tdmapcva",
        name: "天地图矢量注记",
        iconUrl: AnnotationImg
    },
    {
        id: "bdmap",
        name: "百度地图",
        iconUrl: AnnotationImg
    },
    {
        id: "esri",
        name: "ArcGIS",
        iconUrl: AnnotationImg
    },
    {
        id: "wfs",
        name: "wfs",
        iconUrl: AnnotationImg
    },
    {
        id: "wmts",
        name: "wmts",
        iconUrl: AnnotationImg
    },
]);
//底图
const basLayers = {
    //高德矢量
    tdtLayer: new Cesium.UrlTemplateImageryProvider({
        url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18,
    }),
    // tdtLayer: new Cesium.AmapImageryProvider({
    //     style: 'img',
    //     crs: 'WGS84'
    // }),
    //高德影像
    tdtImgLayer: new Cesium.UrlTemplateImageryProvider({
        url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        minimumLevel: 3,
        maximumLevel: 18,
    }),
    //高德注记
    tdtAnnoLayer: new Cesium.UrlTemplateImageryProvider({
        url: 'http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
        layer: 'tdtAnnoLayer',
        style: 'default',
        format: 'image/jpeg',
        tileMatrixSetID: 'GoogleMapsCompatible',
    }),
    tdMap: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c",
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        layer: "tdtImgLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
    }),
    tdMapCav: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t{s}.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c",
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        minimumLevel: 0,
        // maximumLevel: 5,
    }),
    esri: Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
    ),
    wmts: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://localhost:8080/geoserver/gwc/service/wmts/rest/sf:roads/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
        layer: "sf:roads",
        style: "",
        tileMatrixSetID: "EPSG:4326",
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        // format: 'image/png',
        // tileMatrixSetID: 'EPSG:4326',
        // tilingScheme: new Cesium.GeographicTilingScheme(),
    })
};
// 添加wfs图层
const addWFSTileLayer = () => {
    const wfsParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "tiger:poly_landmarks",
        outputFormat: "application/json",
    };
    // 发送请求获取WFS数据
    axios
        .get("geoserver/geoserver/tiger/ows", {
            params: wfsParams,
            headers: {
                Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
            },
        })
        .then((res) => {
            console.log(res);
            const data = res.data;
            const sourcePromise = Cesium.GeoJsonDataSource.load(data);
            sourcePromise.then(function (dataSource) {
                viewer.value.dataSources.add(dataSource);
                viewer.value.flyTo(dataSource);
            });
        });
};

//底图切换
const changeBaseLayer = (mapTag: string) => {
    const imageLayers = viewer.value.imageryLayers
    switch (mapTag) {
        case 'gddz': //高德矢量
            imageLayers.addImageryProvider(basLayers.tdtLayer, imageLayers.length);
            break;
        case 'gdyx': //高德影像
            imageLayers.addImageryProvider(basLayers.tdtImgLayer, imageLayers.length);
            break;
        case 'annotation': //高德注记
            imageLayers.addImageryProvider(basLayers.tdtAnnoLayer, imageLayers.length);
            break;
        case 'tdmap': //天地图
            imageLayers.addImageryProvider(basLayers.tdMap, imageLayers.length);
            break;
        case 'tdmapcva': //天地图标注
            imageLayers.addImageryProvider(basLayers.tdMapCav, imageLayers.length);
            break;
        case 'esri': //ArcGIS
            imageLayers.addImageryProvider(basLayers.esri, imageLayers.length);
            break;
        case 'esri': //ArcGIS
            imageLayers.addImageryProvider(basLayers.esri, imageLayers.length);
            break;
        case 'wfs': //wfs
            addWFSTileLayer()
            break;
        case 'wmts': //wfs
            imageLayers.addImageryProvider(basLayers.wmts, imageLayers.length)
            break;
        case 'destroy':
            const length = imageLayers.length
            for (let i = length - 1; i > 0; i--) {
                imageLayers.remove(imageLayers.get(i))
            }
            break;
    }
};
const tileLevel = () => {
    let tiles = new Set();
    let tilesToRender = viewer.value.scene.globe._surface._tilesToRender;
    if (Cesium.defined(tilesToRender)) {
        for (let i = 0; i < tilesToRender.length; i++) {
            tiles.add(tilesToRender[i].level);
        }
        console.log("当前地图瓦片级别为:");
        console.log(tiles);
    }
}

onMounted(() => {
    initMap();
    tileLevel()
    // const imageLayers = viewer.value.imageryLayers
    // imageLayers.addImageryProvider(basLayers.arcgisLayer);
});
</script>
  
<style lang="scss" scoped>
#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;

        .base-layer-diag__content {
            .content__thumb {
                text-align: center;
                width: 70px;
                height: 90px;
                color: #fff;
                font-size: 13px;
                margin-right: 10px;

                img {
                    margin-left: 2px;
                }
            }
        }
    }
}
</style>
  