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
import { AmapImageryProvider, BaiduImageryProvider, GeoVisImageryProvider } from '@dvgis/cesium-map'
import CesiumNavigation from "cesium-navigation-es6";
import type { NavigationOptions } from 'cesium-navigation-es6'

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
        // baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        //     Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
        //         Cesium.ArcGisBaseMapType.SATELLITE
        //     )
        // ),
    });

    viewer.value.cesiumWidget.creditContainer.style.display = "none";
    // 北京高德地图坐标转84坐标
    const bj84 = coordtransform.gcj02towgs84(116.397455, 39.909187)
    // 添加北京的标注
    viewer.value.entities.add({
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
    /**相机视角锁死 */
    viewer.value.scene.screenSpaceCameraController.minimumZoomDistance = 200;//相机的高度的最小值
    viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = 3500000;  //相机高度的最大值
    viewer.value.scene.screenSpaceCameraController._minimumZoomRate = 300; // 设置相机缩小时的速率
    viewer.value.scene.screenSpaceCameraController._maximumZoomRate = 5906376272000    //设置相机放大时的速率
    // // 相机将锁定到当前标题,鼠标不能拖动地图
    // viewer.value.scene.screenSpaceCameraController.enableRotate = false;
    // // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    // viewer.value.scene.screenSpaceCameraController.enableTranslate = false;
    // // 如果为true，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    // viewer.value.scene.screenSpaceCameraController.enableZoom = false;
    // // 如果为true，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。鼠标滚轮按下
    // viewer.value.scene.screenSpaceCameraController.enableTilt = false;
    /**相机视角锁死 */

    // 罗盘控件
    const options: NavigationOptions = {};
    options.defaultResetView = Cesium.Cartographic.fromDegrees(bj84[0], bj84[1], 2000)
    //相机方向
    options.orientation = {
        pitch: Cesium.Math.toRadians(-45)
    }
    //相机延时
    // options.duration = 4//默认为3s

    // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
    options.enableCompass = true;
    // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
    options.enableZoomControls = true;
    // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
    options.enableDistanceLegend = true;
    // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
    options.enableCompassOuterRing = true;

    //修改重置视图的tooltip
    options.resetTooltip = "重置视图";
    //修改放大按钮的tooltip
    options.zoomInTooltip = "放大";
    //修改缩小按钮的tooltip
    options.zoomOutTooltip = "缩小";
    new CesiumNavigation(viewer.value, options);
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
    {
        id: "geojson",
        name: "山东",
        iconUrl: AnnotationImg
    },
]);
//底图
const basLayers = {
    //高德矢量
    // tdtLayer: new Cesium.UrlTemplateImageryProvider({
    //     url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    //     minimumLevel: 3,
    //     maximumLevel: 18,
    // }),
    tdtLayer: new AmapImageryProvider({
        style: 'elec', // style: img、elec、cva
        crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
    }),
    //高德影像
    // tdtImgLayer: new Cesium.UrlTemplateImageryProvider({
    //     url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    //     minimumLevel: 3,
    //     maximumLevel: 18,
    // }),
    tdtImgLayer: new AmapImageryProvider({
        style: 'img', // style: img、elec、cva
        crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
    }),
    //高德注记
    // tdtAnnoLayer: new Cesium.UrlTemplateImageryProvider({
    //     url: 'http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
    //     layer: 'tdtAnnoLayer',
    //     style: 'default',
    //     format: 'image/jpeg',
    //     tileMatrixSetID: 'GoogleMapsCompatible',
    // }),
    tdtAnnoLayer: new AmapImageryProvider({
        style: 'cva', // style: img、elec、cva
        crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
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
    bdMap: new BaiduImageryProvider({
        style: 'normal', // style: img、vec、normal、dark
        crs: 'WGS84' // 使用84坐标系，默认为：GCJ02
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
    }),
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
            const data = res.data;
            const sourcePromise = Cesium.GeoJsonDataSource.load(data);
            sourcePromise.then(function (dataSource) {
                viewer.value.dataSources.add(dataSource);
                viewer.value.flyTo(dataSource);
            });
        });
};
// 添加geoJson数据
const addGeoJsonData = () => {
    const sourcePromise = Cesium.GeoJsonDataSource.load('https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json', {
        stroke: Cesium.Color.WHITE, //边界颜色
        fill: Cesium.Color.BLUE.withAlpha(0.1), //注意：颜色必须大写，即不能为blue，区域颜色
        strokeWidth: 5, //折线和多边形轮廓的宽度
    });
    sourcePromise.then(function (dataSource) {
        viewer.value.dataSources.add(dataSource);
        viewer.value.flyTo(dataSource);
    });
}

//底图切换
const changeBaseLayer = async (mapTag: string) => {
    const imageLayers = await viewer.value.imageryLayers
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
        case 'bdmap':
            imageLayers.addImageryProvider(basLayers.bdMap, imageLayers.length);
            break;
        case 'esri': //ArcGIS
            const esri = await basLayers.esri;
            imageLayers.addImageryProvider(esri, imageLayers.length);
            break;
        case 'wfs': //wfs
            addWFSTileLayer()
            break;
        case 'wmts': //wfs
            imageLayers.addImageryProvider(basLayers.wmts, imageLayers.length)
            break;
        case 'geojson':
            addGeoJsonData()
            break;
        case 'destroy':
            // 移除所有影像图层
            const length = imageLayers.length
            for (let i = length - 1; i > 0; i--) {
                imageLayers.remove(imageLayers.get(i))
            }
            // 移除wfs图层
            viewer.value.dataSources.removeAll()
            break;
    }
};

onMounted(() => {
    initMap();
});
</script>
  
<style lang="scss" scoped>
#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;

        .base-layer-diag__content {
            display: flex;

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
  