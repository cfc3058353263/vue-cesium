<template>
    <div class="app-main">
        <div id="cesiumContainer">
            <div class="draw">
                <el-button type="primary" @click="change2D3D">切换为二维</el-button>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import { cartesian3_to_lng_lat } from '@/components/utils/utils';
import { pointTogether } from '@/components/Together/together';
import { Model } from '@/components/Model/models';
import data from './data';
import * as turf from '@turf/turf';

// 创建Cesium Viewer
const viewer = ref();
// 模型实例
let tileset: Cesium.Cesium3DTileset;

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
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees(117.82138, 36.077592, 2000000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-90),
            // 翻滚角
            roll: 0.0,
        },
    });

    // 开启地形深度检测
    viewer.value.scene.globe.depthTestAgainstTerrain = true;
    // 相机高度的最大值/最大放大比例
    viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
    const imageLayers = await viewer.value.imageryLayers;
    await imageLayers.remove(imageLayers.get(0));
    const arcgis = await esri;
    imageLayers.addImageryProvider(arcgis, 0);

    const model = new Model(viewer.value, handler);
    handler.setInputAction(async function (event: any) {
        const pick = viewer.value.scene.pick(event.position);
        console.log(pick);
        // 点击聚合点放大到中心位置
        if (pick && pick.id instanceof Cesium.Entity && pick.id.length && pick.id.length < 7) {
            console.log(pick.id);
            //具体图标点击
            const lngArr: number[] = [];
            const latArr: number[] = [];
            pick.id.map((element: any) => {
                const obj = data.find(item => {
                    return item.id === element.id;
                });
                if (obj) {
                    lngArr.push(obj.x);
                    latArr.push(obj.y);
                }
            });
            const lngMin = Math.min(...lngArr);
            const lngMax = Math.max(...lngArr);
            const latMin = Math.min(...latArr);
            const latMax = Math.max(...latArr);
            const averageLng = (lngMin + lngMax) / 2;
            const averageLat = (latMin + latMax) / 2;
            viewer.value.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(averageLng, averageLat, 2000),
                // destination: Cesium.Cartesian3.fromDegrees(center.geometry.coordinates[0], center.geometry.coordinates[1], 20000),
                orientation: {
                    heading: Cesium.Math.toRadians(5),
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0.0,
                    duration: 1,
                },
            });
            // 点击标注
        } else if (pick && pick.id instanceof Cesium.Entity && pick.id.type === 'billboard') {
            let centerResult = viewer.value.camera.pickEllipsoid(
                new Cesium.Cartesian2(
                    viewer.value.canvas.clientWidth / 2,
                    viewer.value.canvas.clientHeight / 2
                )
            );

            const lnglatH = cartesian3_to_lng_lat(pick.id.position._value);
            // 三维切换
            viewer.value.scene.morphTo3D(0);

            // 删除点聚合中的enterprise entity
            viewer.value.dataSources.remove(customDataSource);
            // 加载模型
            tileset = await model.add3dTileset('http://127.0.0.1:8888/model/b3dm/tileset.json');
            await model.update3dtilesMaxtrix(tileset, 0, 0, 0, 1, 43, lnglatH[0], lnglatH[1]);
            // 相机飞入
            viewer.value.flyTo(tileset, {
                duration: 1.5,
                offset: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-45),
                    range: 0,
                },
            });
            // 相机高度的最大值/最大放大比例
            viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = 1000000;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function (event: any) {
        var camera = viewer.value.camera;
        var position = camera.position;
        var heading = camera.heading;
        var pitch = camera.pitch;
        var roll = camera.roll;
        var lnglat = Cesium.Cartographic.fromCartesian(position);
        const cameraView = {
            x: Cesium.Math.toDegrees(lnglat.longitude),
            y: Cesium.Math.toDegrees(lnglat.latitude),
            z: lnglat.height,
            heading: Cesium.Math.toDegrees(heading),
            pitch: Cesium.Math.toDegrees(pitch),
            roll: Cesium.Math.toDegrees(roll),
        };
        // console.log(cameraView);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // 监听相机变换用于切换图层
    // viewer.value.camera.moveEnd.addEventListener(() => {
    //     // 视高 km
    //     // let alt = (viewer.value.camera.positionCartographic.height / 1000).toFixed(2);
    //     let alt = viewer.value.camera.positionCartographic.height / 1000;
    //     // 方位角
    //     let heading = Cesium.Math.toDegrees(viewer.value.camera.heading).toFixed(2);
    //     // 俯仰角
    //     let pitch = Cesium.Math.toDegrees(viewer.value.camera.pitch).toFixed(2);
    //     // 翻滚角
    //     let roll = Cesium.Math.toDegrees(viewer.value.camera.roll).toFixed(2);
    //     // 级别
    //     let level = 0;
    //     let tileRender = viewer.value.scene._globe._surface._tilesToRender;
    //     if (tileRender && tileRender.length > 0) {
    //         level = viewer.value.scene._globe._surface._tilesToRender[0]._level;
    //     }
    //     let str = `级数：${level} 视高：${alt}km  方位角：${heading}° 俯仰角：${pitch}° 翻滚角：${roll}°`;
    //     // 856.73km
    //     const imageLayers = viewer.value.imageryLayers;
    //     if (alt < 856) {
    //         console.log(imageLayers);
    //         if (imageLayers._layers.length > 1) return;
    //         imageLayers.addImageryProvider(tdMapCav, 1);
    //     } else {
    //         imageLayers.remove(imageLayers.get(1));
    //     }
    // });
    // 监听鼠标滑轮
    handler.setInputAction(function (event: any) {
        var camera = viewer.value.camera;
        var position = camera.position;
        var heading = camera.heading;
        var pitch = camera.pitch;
        var roll = camera.roll;
        var lnglat = Cesium.Cartographic.fromCartesian(position);
        const cameraView = {
            x: Cesium.Math.toDegrees(lnglat.longitude),
            y: Cesium.Math.toDegrees(lnglat.latitude),
            z: lnglat.height,
            heading: Cesium.Math.toDegrees(heading),
            pitch: Cesium.Math.toDegrees(pitch),
            roll: Cesium.Math.toDegrees(roll),
        };
        console.log(cameraView);
        // 相机视高 km
        let alt = viewer.value.camera.positionCartographic.height / 1000;
        console.log(alt);
        const imageLayers = viewer.value.imageryLayers;
        // 判断当前缩放比例来进行图层添加和移除
        if (alt < 856) {
            if (imageLayers._layers.length > 1) return;
            imageLayers.addImageryProvider(tdMapCav, 1);
        } else {
            imageLayers.remove(imageLayers.get(1));
        }
    }, Cesium.ScreenSpaceEventType.WHEEL);
};

// esri
const esri = Cesium.ArcGisMapServerImageryProvider.fromUrl(
    'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
);
// 添加天地图标注
const tdMapCav = new Cesium.WebMapTileServiceImageryProvider({
    url: 'http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=b679e53c0eca7f1f302d4336b6e21b2c',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    layer: 'tdtAnnoLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
    minimumLevel: 0,
    // maximumLevel: 5,
});
// 添加中国geojson数据
const addChinaGeoJson = () => {
    const sourcePromise = Cesium.GeoJsonDataSource.load(
        'https://geo.datav.aliyun.com/areas_v3/bound/100000.json',
        {
            stroke: Cesium.Color.WHITE, //边界颜色
            fill: Cesium.Color.BLUE.withAlpha(0), //注意：颜色必须大写，即不能为blue，区域颜色
            strokeWidth: 5, //折线和多边形轮廓的宽度
        }
    );
    sourcePromise.then(function (dataSource) {
        viewer.value.dataSources.add(dataSource);
    });
};

// 添加geoJson数据
const addSDGeoJsonData = () => {
    const sourcePromise = Cesium.GeoJsonDataSource.load(
        'https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json',
        {
            stroke: Cesium.Color.WHITE, //边界颜色
            fill: Cesium.Color.BLUE.withAlpha(0.1), //注意：颜色必须大写，即不能为blue，区域颜色
            strokeWidth: 5, //折线和多边形轮廓的宽度
        }
    );
    sourcePromise.then(function (dataSource) {
        viewer.value.dataSources.add(dataSource).then(() => {
            // 设置geojson的图层为最底
            viewer.value.dataSources.lowerToBottom(dataSource);
        });
    });
};

// 二维转换
const change2D3D = () => {
    // 相机高度的最大值/最大放大比例
    viewer.value.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
    // canvas 中心位置为相机焦点
    let cartesian2 = new Cesium.Cartesian2(
        Math.floor(viewer.value.canvas.clientWidth / 2),
        Math.floor(viewer.value.canvas.clientHeight / 2)
    );
    // 给定中心的像素，获取世界位置
    let cartesian3 = viewer.value.scene.camera.pickEllipsoid(cartesian2, viewer.value.scene.globe.ellipsoid);
    const lnglat = cartesian3_to_lng_lat(cartesian3);
    const cameraHeight = Math.round(viewer.value.camera.positionCartographic.height);

    viewer.value.scene.primitives.remove(tileset);
    viewer.value.scene.morphTo2D(0);
    customDataSource = pointTogether(viewer.value, data);
    // 相机飞入点
    viewer.value.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1], 1000000),
    });
};

// customDataSource
let customDataSource: Cesium.CustomDataSource;
onMounted(() => {
    initMap();
    // 切换为2d
    viewer.value.scene.morphTo2D(0);
    addChinaGeoJson();
    addSDGeoJsonData();
    // 点聚合
    customDataSource = pointTogether(viewer.value, data);
});
</script>
  
<style lang="scss" scoped>
#cesiumContainer {
    height: 100%;

    .draw {
        position: absolute;
        z-index: 999;
    }
}
</style>
  