<template>
    <div class="app-main">
        <div id="cesiumContainer">
            <div class="draw">
                <div class="base-layer-diag__content">
                    <div
                        class="content__thumb"
                        v-for="(item, index) in layerList"
                        :key="index"
                        @click="changeBaseLayer(item.id)"
                    >
                        <img :src="item.iconUrl" alt="" />
                        <span>{{ item.name }}</span>
                    </div>
                </div>
                <el-button type="primary" @click="changeBaseLayer('destroy')">还原</el-button>
                <el-button type="primary" @click="addModel">添加模型</el-button>
                <el-button type="primary" @click="change2D3D">{{
                    scene3d2d == 3 ? '二维转换' : '三维转换'
                }}</el-button>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref, reactive } from 'vue';
import GDDZ from '@/assets/imageMap/gaodedianzi.png';
import GDImg from '@/assets/imageMap/gaodeimg.png';
import AnnotationImg from '@/assets/imageMap/weiruanimg.png';
import coordtransform from 'coordtransform';
import icon from '@/assets/images/icon4.png';
import axios from 'axios';
import { AmapImageryProvider, BaiduImageryProvider, GeoVisImageryProvider } from '@dvgis/cesium-map';
import CesiumNavigation from 'cesium-navigation-es6';
import type { NavigationOptions } from 'cesium-navigation-es6';
import { Model } from '@/components/Model/Model';
import { cartesian3_to_lng_lat } from '@/components/utils/utils';
// 创建Cesium Viewer
const viewer = ref();
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
        // baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        //     Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
        //         Cesium.ArcGisBaseMapType.SATELLITE
        //     )
        // ),
    });

    viewer.value.cesiumWidget.creditContainer.style.display = 'none';
    viewer.value.scene.skyBox.show = false; //去掉天空盒子
    viewer.value.scene.moon.show = false; // 将月球设置为不显示
    viewer.value.scene.skyAtmosphere.show = false; // 设置大气为不显示
    viewer.value.scene.fog.enable = false; //设置雾为不显示

    // 北京高德地图坐标转84坐标
    const bj84 = coordtransform.gcj02towgs84(116.397455, 39.909187);
    // 添加北京的标注
    viewer.value.entities.add({
        name: '',
        // 10 是用来设置广告牌的距离地面的高度
        position: Cesium.Cartesian3.fromDegrees(bj84[0], bj84[1], 10),
        billboard: {
            image: icon, //图标地址
            // 位置固定不会因为旋转视角发生偏移
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            // 设置距离控制可见度
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2100),
            // 设置近大远小
            scaleByDistance: new Cesium.NearFarScalar(0, 0.3, 1050, 0.1),
            // scale: 0.1,
        },
        type: 'billboard',
    });
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
    });

    /**相机视角锁死 */
    // viewer.value.scene.screenSpaceCameraController.minimumZoomDistance = 0;//相机的高度的最小值
    // viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;  //相机高度的最大值
    // viewer.value.scene.screenSpaceCameraController._minimumZoomRate = 300; // 设置相机缩小时的速率
    // viewer.value.scene.screenSpaceCameraController._maximumZoomRate = 5906376272000    //设置相机放大时的速率
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
    options.defaultResetView = Cesium.Cartographic.fromDegrees(bj84[0], bj84[1], 2000);
    //相机方向
    options.orientation = {
        pitch: Cesium.Math.toRadians(-45),
    };
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
    options.resetTooltip = '重置视图';
    //修改放大按钮的tooltip
    options.zoomInTooltip = '放大';
    //修改缩小按钮的tooltip
    options.zoomOutTooltip = '缩小';
    new CesiumNavigation(viewer.value, options);

    // 相机监听
    // viewer.value.camera.changed.addEventListener(() => {
    //     const pitch = Cesium.Math.toRadians(-45)
    //     if (viewer.value.camera.pitch < pitch) {
    //         var direction = viewer.value.camera.direction
    //         var heading = viewer.value.camera.heading
    //         var roll = viewer.value.camera.roll;
    //         viewer.value.camera.setView(direction, new Cesium.HeadingPitchRange(heading, pitch, roll));
    //     }
    // });
    // mouseListener()
    addCylinder();
};
const layerList = reactive([
    {
        id: 'gddz',
        name: '高德电子',
        iconUrl: GDDZ,
    },
    {
        id: 'gdyx',
        name: '高德影像',
        iconUrl: GDImg,
    },
    {
        id: 'annotation',
        name: '高德注记',
        iconUrl: AnnotationImg,
    },
    {
        id: 'tdmap',
        name: '天地图矢量',
        iconUrl: AnnotationImg,
    },
    {
        id: 'tdmapcva',
        name: '天地图矢量注记',
        iconUrl: AnnotationImg,
    },
    {
        id: 'bdmap',
        name: '百度地图',
        iconUrl: AnnotationImg,
    },
    {
        id: 'esri',
        name: 'ArcGIS',
        iconUrl: AnnotationImg,
    },
    {
        id: 'wfs',
        name: 'wfs',
        iconUrl: AnnotationImg,
    },
    {
        id: 'wmts',
        name: 'wmts',
        iconUrl: AnnotationImg,
    },
    {
        id: 'geojson',
        name: '山东',
        iconUrl: AnnotationImg,
    },
]);
//底图
const basLayers = {
    //高德矢量
    tdtLayer: new AmapImageryProvider({
        style: 'elec', // style: img、elec、cva
        crs: 'WGS84', // 使用84坐标系，默认为：GCJ02
    }),
    //高德影像
    tdtImgLayer: new AmapImageryProvider({
        style: 'img', // style: img、elec、cva
        crs: 'WGS84', // 使用84坐标系，默认为：GCJ02
    }),
    //高德注记
    tdtAnnoLayer: new AmapImageryProvider({
        style: 'cva', // style: img、elec、cva
        crs: 'WGS84', // 使用84坐标系，默认为：GCJ02
    }),
    tdMap: new Cesium.WebMapTileServiceImageryProvider({
        // url: 'http://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c',
        // subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        // layer: 'tdtImgLayer',
        // style: 'default',
        // format: 'image/jpeg',
        // tileMatrixSetID: 'GoogleMapsCompatible', //使用谷歌的瓦片切片方式
        url: 'http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'], // 天地图8个服务器
        layer: 'img_w',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'GoogleMapsCompatible', //使用谷歌的瓦片切片方式
        maximumLevel: 18,
    }),
    tdMapCav: new Cesium.WebMapTileServiceImageryProvider({
        // url: 'http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=b679e53c0eca7f1f302d4336b6e21b2c',
        url: 'http://t0.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c',
        // url: "http://t{s}.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c",
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        // layer: 'img_w',
        // style: 'default',
        // format: 'tiles',
        // tileMatrixSetID: 'GoogleMapsCompatible',
        // minimumLevel: 0,
        // maximumLevel: 18,

        layer: 'tdtCvaLayer',
        style: 'default',
        format: 'image/jpeg',
        tileMatrixSetID: 'GoogleMapsCompatible',
        maximumLevel: 18,
    }),
    // tdMap: new Cesium.WebMapTileServiceImageryProvider({
    //     url: "http://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c",
    //     subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    //     layer: "tdtImgLayer",
    //     style: "default",
    //     format: "image/jpeg",
    //     tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
    // }),
    // tdMapCav: new Cesium.WebMapTileServiceImageryProvider({
    //     url: "http://t{s}.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b679e53c0eca7f1f302d4336b6e21b2c",
    //     subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    //     layer: "tdtAnnoLayer",
    //     style: "default",
    //     format: "image/jpeg",
    //     tileMatrixSetID: "GoogleMapsCompatible",
    //     minimumLevel: 0,
    //     // maximumLevel: 5,
    // }),
    bdMap: new BaiduImageryProvider({
        style: 'normal', // style: img、vec、normal、dark
        crs: 'WGS84', // 使用84坐标系，默认为：GCJ02
    }),
    esri: Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
    ),
    wmts: new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.com/cia_w/wmts?tk=b679e53c0eca7f1f302d4336b6e21b2c',
        layer: 'cia',
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18,
        // format: 'image/png',
        // tileMatrixSetID: 'EPSG:4326',
        // tilingScheme: new Cesium.GeographicTilingScheme(),
    }),
};
// 添加wfs图层
const addWFSTileLayer = () => {
    const wfsParams = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: 'tiger:poly_landmarks',
        outputFormat: 'application/json',
    };
    // 发送请求获取WFS数据
    axios
        .get('geoserver/geoserver/tiger/ows', {
            params: wfsParams,
            headers: {
                Authorization: 'Basic YWRtaW46Z2Vvc2VydmVy',
            },
        })
        .then(res => {
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
    const sourcePromise = Cesium.GeoJsonDataSource.load(
        'https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json',
        {
            stroke: Cesium.Color.WHITE, //边界颜色
            fill: Cesium.Color.BLUE.withAlpha(0.1), //注意：颜色必须大写，即不能为blue，区域颜色
            strokeWidth: 5, //折线和多边形轮廓的宽度
        }
    );
    sourcePromise.then(function (dataSource) {
        viewer.value.dataSources.add(dataSource);
        viewer.value.flyTo(dataSource);
    });
};

//底图切换
const changeBaseLayer = async (mapTag: string) => {
    const imageLayers = await viewer.value.imageryLayers;
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
            addWFSTileLayer();
            break;
        case 'wmts': //wfs
            imageLayers.addImageryProvider(basLayers.wmts, imageLayers.length);
            break;
        case 'geojson':
            addGeoJsonData();
            break;
        case 'destroy':
            // 移除所有影像图层
            const length = imageLayers.length;
            for (let i = length - 1; i > 0; i--) {
                imageLayers.remove(imageLayers.get(i));
            }
            // 移除wfs图层
            viewer.value.dataSources.removeAll();
            break;
    }
};

// 二维三维转换
const scene3d2d = ref(3);
const change2D3D = () => {
    // viewer.scene.mode === Cesium.SceneMode.SCENE3D //3D情况下
    // Cesium.SceneMode中包含：
    // Cesium.SceneMode.COLUMBUS_VIEW//哥伦布视图
    // Cesium.SceneMode.SCENE2D//2维模式
    // Cesium.SceneMode.SCENE3D//3维模式
    // Cesium.SceneMode.MORPHING//模式之间变换，例如二维到三维
    if (scene3d2d.value === 3) {
        // console.log(viewer.value.scene.camera)
        // canvas 中心位置为相机焦点
        let cartesian2 = new Cesium.Cartesian2(
            Math.floor(viewer.value.canvas.clientWidth / 2),
            Math.floor(viewer.value.canvas.clientHeight / 2)
        );
        // 给定中心的像素，获取世界位置
        let cartesian3 = viewer.value.scene.camera.pickEllipsoid(
            cartesian2,
            viewer.value.scene.globe.ellipsoid
        );
        const lnglat = cartesian3_to_lng_lat(cartesian3);
        const cameraHeight = Math.round(viewer.value.camera.positionCartographic.height);
        console.log(cameraHeight);
        // 相机飞入点
        viewer.value.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1], cameraHeight),
        });
        scene3d2d.value = 2;
        viewer.value.scene.morphTo2D(0);
    } else {
        console.log(viewer.value.scene.camera);
        scene3d2d.value = 3;
        viewer.value.scene.morphTo3D(0);
        viewer.value.scene3DOnly = false;
    }
};
// 获取当前三维范围
const getCurrentExtent = () => {
    //获取当前三维地图范围
    const Rectangle = viewer.value.camera.computeViewRectangle();
    //地理坐标（弧度）转经纬度坐标
    const extent = [
        (Rectangle.west / Math.PI) * 180,
        (Rectangle.south / Math.PI) * 180,
        (Rectangle.east / Math.PI) * 180,
        (Rectangle.north / Math.PI) * 180,
    ];
    console.log(extent);
    return extent;
};

/* 获取camera中心点坐标 */
const getCameraPosition = () => {
    function getHeight() {
        if (viewer.value) {
            const height = viewer.value.camera.positionCartographic.height;
            return height;
        }
    }
    const result = viewer.value.camera.pickEllipsoid(
        new Cesium.Cartesian2(viewer.value.canvas.clientWidth / 2, viewer.value.canvas.clientHeight / 2)
    );
    const curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
    const lon = (curPosition.longitude * 180) / Math.PI;
    const lat = (curPosition.latitude * 180) / Math.PI;
    const height = getHeight();
    return {
        lng: lon,
        lat: lat,
        height: height,
    };
};
// 鼠标事件监听
const mouseListener = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas); //处理用户输入事件
    //鼠标滚轮
    addListenerOnWheel(handler);
    // 鼠标移动
    // 相机事件监听
    // cameraLeftMouseListener(handler)
    // cameraMiddleMouseListener(handler)
    // cameraRightMouseListener(handler)
};
// 相机左键监听事件
const cameraLeftMouseListener = (handler: any) => {
    handler.setInputAction(() => {
        console.log(viewer.value.camera);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

// 鼠标中键移动
const cameraMiddleMouseListener = (handler: any) => {
    handler.setInputAction(() => {
        console.log(viewer.value.camera);
    }, Cesium.CameraEventType.MIDDLE_DRAG);
};

// 鼠标右键键移动
const cameraRightMouseListener = (handler: any) => {
    handler.setInputAction(() => {
        console.log(viewer.value.camera);
    }, Cesium.CameraEventType.MIDDLE_DRAG);
};

//监听滚轮事件
const addListenerOnWheel = (handler: any) => {
    handler.setInputAction(wheelment => {
        const extent = getCurrentExtent();
        console.log(`地图范围：w:${extent[0]}-s:${extent[1]}- e: ${extent[2]} -n: ${extent[3]}`);
        const camera = getCameraPosition();
        console.log(`相机位置：lng:${camera.lng},lat:${camera.lat},height:${camera.height}`);
    }, Cesium.ScreenSpaceEventType.WHEEL);
};

// 添加圆柱
const addCylinder = () => {
    // 创建圆柱体
    const cylinder = new Cesium.Entity({
        name: '圆柱体',
        position: Cesium.Cartesian3.fromDegrees(116.39121137414092, 39.90778348948195),
        cylinder: {
            length: 500.0,
            topRadius: 2000.0,
            bottomRadius: 2000.0,
            material: Cesium.Color.RED.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
    });
    viewer.value.entities.add(cylinder);
};

// 添加模型
const addModel = async () => {
    // 如果给定的模型高度是高于地面的，则可以关闭地形
    viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    const model = new Model(viewer.value, handler);
    const tileset = await model.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json');
    await model.update3dtilesMaxtrix(tileset, 0, 0, 0, 1.4, 46, 113.06259455349716, 22.64689365788796);
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
  