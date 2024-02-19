<template>
    <div id="mapContainer"></div>
</template>

<script lang="ts" setup>
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import util from '@/components/HeatMap/util';
import Heatmap3d from '@/components/HeatMap/heatmap3d';
import * as turf from '@turf/turf';

let viewer = ref();
let mapContainer = ref();

// 用到的全局变量
let heatmap = null;
let height = 1080;
let width = 1920; //热力图尺寸
let bounds = [113.5, 22, 114.5, 23]; //覆盖经纬度范围.
// 随机生成点
let data = [];
for (let i = 0; i < 200; i++) {
    let lon = Math.random() * (bounds[2] - bounds[0]) + bounds[0];
    let lat = Math.random() * (bounds[3] - bounds[1]) + bounds[1];
    let value = Math.random() * 100;
    let x = Math.round(((lon - bounds[0]) / (bounds[2] - bounds[0])) * width);
    let y = height - Math.round(((lat - bounds[1]) / (bounds[3] - bounds[1])) * height);
    data.push({ x: x, y: y, value: value });
}

// 根据数据通过heatmaph33p生成热力图图片
function createHeatmap(data) {
    console.log(data);
    // 相机飞入点
    viewer.value.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(113.5, 22, 2000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-45),
            // 翻滚角
            roll: 0.0,
        },
    });
    var domElement = document.createElement('div');
    domElement.setAttribute(
        'style',
        'width: ' + width + 'px; height: ' + height + 'px; margin: 0px; display: none;'
    );
    document.body.appendChild(domElement);
    heatmap = h337.create({
        container: domElement,
        radius: 100,
        maxOpacity: 1,
        minOpacity: 0.1,
        blur: 0.85,
        gradient: {
            '.3': 'blue',
            '.45': 'green',
            '.65': 'yellow',
            '.8': 'orange',
            '.95': 'red',
        },
    });
    heatmap.setData({
        min: 0,
        max: 100,
        data: data,
    });
    console.log(heatmap);
}

// 使用image材质把热力图贴上去。
function createPrimitive() {
    let material = new Cesium.ImageMaterialProperty({
        image: heatmap._renderer.canvas, //热力图的canvas直接拿来做材质
    });
    let instance = generateGeometryInstance(); //primitive的geometry是生成立体图的关键
    console.log(instance);
    let appearance = new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType(
            Cesium.Material.ImageType,
            material.getValue(new Cesium.JulianDate())
        ),
    });
    let opt = {
        geometryInstances: instance,
        appearance: appearance,
        allowPicking: false,
    };
    // let primitive = viewer.value.scene.primitives.add(new Cesium.Primitive(opt));
}

// generateGeometryInstance方法我们要插入点。
function generateGeometryInstance() {
    // 宽 高 左
    const dWidth = bounds[2] - bounds[0],
        dHeight = bounds[3] - bounds[1],
        left = bounds[0],
        bottom = bounds[1];
    const dx = 0.005,
        dy = 0.005,
        h = 0,
        dh = 100; // 这里配置了插入间隔和起始高度、高度间隔
    let r = Math.floor(dWidth / dx),
        l = Math.floor(dHeight / dy);
    console.log(r);
    console.log(l);
    const grids = [];
    for (let i = 0; i < l + 1; i++) {
        let row = [];
        for (let u = 0; u < r + 1; u++) {
            let x = left + (u == r ? dWidth : u * dx),
                y = bottom + (i == l ? dHeight : i * dy);
            let screen = {
                x: Math.round(((x - left) / dWidth) * width),
                y: height - Math.round(((y - bottom) / dHeight) * height),
            };
            let v = heatmap.getValueAt(screen);
            let color = heatmap._renderer.ctx.getImageData(screen.x, screen.y, 1, 1).data;
            row.push([
                x,
                y,
                h + v * dh,
                color.map(c => c / 255),
                [(x - left) / dWidth, (y - bottom) / dHeight],
            ]);
        }
        grids.push(row);
    }
    console.log('grids', grids);
    const wgs84Positions = [];
    const indices = [];
    const colors = [];
    const sts = [];
    let vtxCursor = 0;
    let idxCursor = 0;
    for (let i = 0; i < l; i++) {
        for (let u = 0; u < r; u++) {
            let p1 = grids[i][u];
            let p2 = grids[i][u + 1];
            let p3 = grids[i + 1][u + 1];
            let p4 = grids[i + 1][u];

            addVertices(p1, wgs84Positions, colors, sts);
            addVertices(p2, wgs84Positions, colors, sts);
            addVertices(p3, wgs84Positions, colors, sts);
            addVertices(p1, wgs84Positions, colors, sts);
            addVertices(p3, wgs84Positions, colors, sts);
            addVertices(p4, wgs84Positions, colors, sts);
            indices.push(
                idxCursor + 0,
                idxCursor + 1,
                idxCursor + 2,
                idxCursor + 3,
                idxCursor + 4,
                idxCursor + 5
            );
            idxCursor += 6;
        }
    }
    return new Cesium.GeometryInstance({
        // computeNormal会自动帮我们计算法向量
        geometry: Cesium.GeometryPipeline.computeNormal(
            generateGeometry(wgs84Positions, colors, indices, sts)
        ),
    });
}
// 把信息写入点，可以在顶点着色器中取到
function addVertices(p, positions, colors, sts) {
    const c3Position = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]);
    positions.push(c3Position.x, c3Position.y, c3Position.z);
    colors.push(p[3][0], p[3][1], p[3][2], p[3][3]);
    sts.push(p[4][0], p[4][1]);
}
function generateGeometry(positions, colors, indices, sts) {
    let attributes = new Cesium.GeometryAttributes({
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: new Float64Array(positions),
        }),
        color: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 4,
            values: new Float32Array(colors),
        }),
        st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: new Float32Array(sts),
        }),
    });
    // 计算包围球
    const boundingSphere = Cesium.BoundingSphere.fromVertices(
        positions,
        new Cesium.Cartesian3(0.0, 0.0, 0.0),
        3
    );
    //
    const geometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: boundingSphere,
    });
    return geometry;
}

const initMap = () => {
    viewer.value = new Cesium.Viewer('mapContainer', {
        animation: false, // 设置动画小组件关闭展示
        timeline: false, // 时间轴关闭展示
        infoBox: false, // 信息盒子关闭展示
        geocoder: false, // 地理编码搜索关闭展示
        baseLayerPicker: false, // 基础图层选择器关闭展示
        sceneModePicker: false, // 场景选择器关闭展示
        fullscreenButton: false, // 全屏按钮关闭展示
        navigationInstructionsInitiallyVisible: false, // 导航说明是否最初展示
        navigationHelpButton: false, // 导航帮助按钮关闭展示
        homeButton: false,
        baseLayer: Cesium.ImageryLayer.fromProviderAsync(
            Cesium.ArcGisMapServerImageryProvider.fromBasemapType(Cesium.ArcGisBaseMapType.SATELLITE)
        ),
    });
};
const creat3dHeatmap1 = () => {
    // 设置相机视角
    util.setCameraView(
        {
            x: 117.31366962163708,
            y: 31.582212285238125,
            z: 12222.804219526453,
            heading: 354.6893925320491,
            pitch: -16.957477434957926,
            roll: 0.13837382238243223,
            duration: 0,
        },
        viewer.value
    );

    let list = [];
    // 随机生成经纬度坐标和value值
    for (let i = 0; i < 100; i++) {
        list.push({
            lnglat: [
                117.28 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
                31.923 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
            ],
            value: 1000 * Math.random(),
        });
    }
    new Heatmap3d(viewer.value, {
        list: list,
        raduis: 15,
        baseHeight: 800,
        primitiveType: 'TRNGLE',
        gradient: {
            '.3': 'blue',
            '.45': 'green',
            '.65': 'yellow',
            '.8': 'orange',
            '.95': 'red',
        },
    });
};
onMounted(() => {
    initMap();
    creat3dHeatmap1();

    // turf 测试数据
    var bbox = [-95, 30, -85, 40];
    var cellSide = 50;
    var options = { units: 'miles' };

    var triangleGrid = turf.triangleGrid(bbox, cellSide, options);
    const addGeoJsonData = () => {
        const sourcePromise = Cesium.GeoJsonDataSource.load(triangleGrid, {
            stroke: Cesium.Color.WHITE, //边界颜色
            fill: Cesium.Color.BLUE.withAlpha(0.1), //注意：颜色必须大写，即不能为blue，区域颜色
            strokeWidth: 5, //折线和多边形轮廓的宽度
        });
        sourcePromise.then(function (dataSource) {
            viewer.value.dataSources.add(dataSource);
            viewer.value.flyTo(dataSource);
        });
    };
    addGeoJsonData();
    var point = turf.point([-75.343, 39.984]);
    console.log(point);
});
</script>

<style scoped>
.toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 999;
}

.toolbar-btn {
    margin: 10px;
}

#mapContainer {
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>
