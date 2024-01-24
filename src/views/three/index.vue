<template>
    <div class="app-main">
        <div id="cesiumContainer"></div>
        <div id="ThreeContainer"></div>
    </div>
</template>
  
<script setup lang="ts">
import * as Cesium from "cesium";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { onMounted, reactive, ref } from "vue";
let minWGS84 = [115.56936458615716, 39.284100766866445];
let maxWGS84 = [117.10745052365716, 41.107831235616445];
// 创建Cesium Viewer
const viewer = ref();
// 创建three
const three = reactive({
    renderer: <any>null, //渲染
    camera: <any>null, //相机
    scene: <any>null, //场景
});
// 可以是任何Three.js对象网格
let _3Dobjects = [];
// 初始化cesium
const initCesium = async () => {
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
        selectionIndicator: false
    });
    // 相机飞入点
    viewer.value.camera.setView({
        // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
        destination: Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, ((minWGS84[1] + maxWGS84[1]) / 2) - 1, 200000),
        orientation: {
            // 指向
            heading: Cesium.Math.toRadians(0.0),
            // -90 视角 由上往下
            pitch: Cesium.Math.toRadians(-60),
            // 翻滚角
            roll: 0.0,
        },
        duration: 3
    });
};
// 初始化three.js
const initThree = () => {
    let fov = 45;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspect = width / height;
    let near = 1;
    let far = 10 * 1000 * 1000; // needs to be far to support Cesium's world-scale rendering
    three.scene = new THREE.Scene();    //场景
    three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far); //透视相机
    three.renderer = new THREE.WebGLRenderer({  //渲染器
        alpha: true //true，代表透明度为0，完全透明（渲染器设置背景为透明，达成叠加效果）
    });
    // 添加灯光
    let Amlight = new THREE.AmbientLight(0xffffff, 2);
    three.scene.add(Amlight);
    // 注意这里，直接把three容器（canvas 添加到 cesium中，在cesium的canvas之下），
    // 这样的话，两个canvas才会重叠起来。
    viewer.value.cesiumWidget.canvas.parentElement.appendChild(
        three.renderer.domElement
    );
    // three.js创建实体
    let ThreeContainer = <HTMLElement>document.getElementById("ThreeContainer");
    ThreeContainer.appendChild(three.renderer.domElement);
}

// three对象
function _3DObject() {
    //THREEJS 3DObject.mesh
    this.threeMesh = null;
    //location bounding box
    this.minWGS84 = null;
    this.maxWGS84 = null;
}

// 添加gltf模型
const threeAddGLTF = (url) => {
    const gltfLoader = new GLTFLoader(); // 创建gltf加载器对象
    gltfLoader.load(url, (gltf) => { // 加载模型文件
        const model = gltf.scene; // 获取模型对象
        let dodecahedronMeshYup = new THREE.Group();
        dodecahedronMeshYup.add(model);
        // 添加场景当中
        three.scene.add(model); // 将模型添加到场景中

        let _3DOB = new _3DObject();
        // 存储模型
        _3DOB.threeMesh = dodecahedronMeshYup;
        // 存储模型位置坐标
        _3DOB.minWGS84 = minWGS84;
        _3DOB.maxWGS84 = maxWGS84;
        _3Dobjects.push(_3DOB);
    })
}

// cesium 渲染
const renderCesium = () => {
    viewer.value.render();
}
// three.js每次刷新的操作
const renderThreeObj = () => {
    // 镜头同步
    three.camera.fov = Cesium.Math.toDegrees(
        viewer.value.camera.frustum.fovy
    ); // ThreeJS FOV is vertical
    //three.camera.updateProjectionMatrix();
    let cartToVec = function (cart) {
        return new THREE.Vector3(cart.x, cart.y, cart.z);
    };
    // 将Three.js网格配置为相对于地球仪中心位置向上
    for (let id in _3Dobjects) {
        // 水流动一动
        if (_3Dobjects[id].myType)
            _3Dobjects[id].threeMesh.material.uniforms["time"].value +=
                1.0 / 60.0;

        minWGS84 = _3Dobjects[id].minWGS84;
        maxWGS84 = _3Dobjects[id].maxWGS84;
        // convert lat/long center position to Cartesian3
        let center = Cesium.Cartesian3.fromDegrees(
            (minWGS84[0] + maxWGS84[0]) / 2,
            (minWGS84[1] + maxWGS84[1]) / 2
        );
        // get forward direction for orienting model
        let centerHigh = Cesium.Cartesian3.fromDegrees(
            (minWGS84[0] + maxWGS84[0]) / 2,
            (minWGS84[1] + maxWGS84[1]) / 2,
            1
        );
        // use direction from bottom left to top left as up-vector
        let bottomLeft = cartToVec(
            Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
        );
        let topLeft = cartToVec(
            Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1])
        );
        let latDir = new THREE.Vector3()
            .subVectors(bottomLeft, topLeft)
            .normalize();
        // configure entity position and orientation
        // 配置实体位置和方向
        _3Dobjects[id].threeMesh.position.copy(center); // 控制更新后的模型位置
        // if(_3Dobjects[id].myType) _3Dobjects[id].threeMesh.position.y += 10.0;

        _3Dobjects[id].threeMesh.lookAt(
            centerHigh.x,
            centerHigh.y,
            centerHigh.z
        );
        _3Dobjects[id].threeMesh.up.copy(latDir);
    }
    // 克隆铯相机的投影位置，使Three.js对象看起来与铯地球仪上方的位置相同
    three.camera.matrixAutoUpdate = false;
    let cvm = viewer.value.camera.viewMatrix;
    let civm = viewer.value.camera.inverseViewMatrix;

    // 注意这里，经大神博客得知，three高版本这行代码需要放在 three.camera.matrixWorld 之前
    three.camera.lookAt(0, 0, 0);

    three.camera.matrixWorld.set(
        civm[0],
        civm[4],
        civm[8],
        civm[12],
        civm[1],
        civm[5],
        civm[9],
        civm[13],
        civm[2],
        civm[6],
        civm[10],
        civm[14],
        civm[3],
        civm[7],
        civm[11],
        civm[15]
    );

    three.camera.matrixWorldInverse.set(
        cvm[0],
        cvm[4],
        cvm[8],
        cvm[12],
        cvm[1],
        cvm[5],
        cvm[9],
        cvm[13],
        cvm[2],
        cvm[6],
        cvm[10],
        cvm[14],
        cvm[3],
        cvm[7],
        cvm[11],
        cvm[15]
    );
    // cesium 容器
    let cesiumContainer = <HTMLElement>document.getElementById("cesiumContainer");
    // 设置three宽高
    let width = cesiumContainer.clientWidth;
    let height = cesiumContainer.clientHeight;

    let aspect = width / height;
    three.camera.aspect = aspect;
    three.camera.updateProjectionMatrix();
    three.renderer.setSize(width, height);
    three.renderer.clear();
    three.renderer.render(three.scene, three.camera);
}
// 同步
const loop = () => {
    requestAnimationFrame(loop);
    renderCesium();
    renderThreeObj()
}
onMounted(() => {
    // initCesium();
    // initThree();
    // threeAddGLTF('http://127.0.0.1:8888/model/DI.gltf')
    // // 同步
    // loop()

    // three对象
    let three = {
        renderer: null,
        camera: null,
        scene: null,
    };

    //cesium对象
    let cesium = {
        viewer: null,
    };

    function pageload() {
        // 模型定位范围
        let minWGS84 = [115.56936458615716, 39.284100766866445];
        let maxWGS84 = [117.10745052365716, 41.107831235616445];

        // cesium 容器
        let cesiumContainer = document.getElementById("cesiumContainer");
        let _3Dobjects = []; // 可以是任何Three.js对象网格

        // three对象
        function _3DObject() {
            //THREEJS 3DObject.mesh
            this.threeMesh = null;
            //location bounding box
            this.minWGS84 = null;
            this.maxWGS84 = null;
        }

        // 初始化地球
        function initCesium() {
            cesium.viewer = new Cesium.Viewer(cesiumContainer, {
                animation: false, //动画控制，默认true
                scene3DOnly: true, //设置为true，则所有几何图形以3D模式绘制以节约GPU资源
                fullscreenButton: false, //全屏按钮,默认显示true

                geocoder: false, //地名查找,默认true
                timeline: true, //时间线,默认true
                vrButton: false, //双屏模式,默认不显示false
                homeButton: false, //主页按钮，默认true
                infoBox: false, //点击要素之后显示的信息,默认true
                selectionIndicator: false, //选中元素显示,默认true
                navigationHelpButton: false, //导航帮助说明,默认true
                navigationInstructionsInitiallyVisible: false,
                automaticallyTrackDataSourceClocks: false, //自动追踪最近添加的数据源的时钟设置,默认true
                terrainExaggeration: 2.0,
                sceneModePicker: false, //是否显示地图2D2.5D3D模式
                useDefaultRenderLoop: false,
                allowTextureFilterAnisotropic: false,

                contextOptions: {
                    webgl: {
                        alpha: false,
                        antialias: true,
                        preserveDrawingBuffer: true,
                        failIfMajorPerformanceCaveat: false,
                        depth: true,
                        stencil: false,
                        anialias: false,
                    },
                },

                targetFrameRate: 60,
                resolutionScale: 0.1,
                orderIndependentTranslucency: true,
                // creditContainer : "hidecredit", //注意：这里需要注释掉，否则会报找不到容器的问题
                dataSources: null,
                clock: null,
                terrainShadows: Cesium.ShadowMode.DISABLED,
                baseLayer: Cesium.ImageryLayer.fromProviderAsync(
                    Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
                        Cesium.ArcGisBaseMapType.SATELLITE
                    )
                ),
            });
            //去掉银河，月亮，太阳，大气层
            cesium.viewer.scene.moon.show = false;
            cesium.viewer.scene.fog.enabled = false;
            cesium.viewer.scene.sun.show = true;
            cesium.viewer.scene.skyBox.show = false


            let center = Cesium.Cartesian3.fromDegrees(
                (minWGS84[0] + maxWGS84[0]) / 2,
                (minWGS84[1] + maxWGS84[1]) / 2 - 1,
                200000
            );
            cesium.viewer.camera.flyTo({
                destination: center,
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-60),
                    roll: Cesium.Math.toRadians(0),
                },
                duration: 3,
            });
        }

        //初始化three
        function initThree() {
            let fov = 45;
            let width = window.innerWidth;
            let height = window.innerHeight;
            let aspect = width / height;
            let near = 1;
            let far = 10 * 1000 * 1000;
            three.scene = new THREE.Scene();
            three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            three.renderer = new THREE.WebGLRenderer({ alpha: true });
            let Amlight = new THREE.AmbientLight(0xffffff, 2);
            three.scene.add(Amlight);
            // 注意这里，直接把three容器（canvas 添加到 cesium中，在cesium的canvas之下），
            // 这样的话，两个canvas才会重叠起来。
            cesium.viewer.cesiumWidget.canvas.parentElement.appendChild(
                three.renderer.domElement
            );
            // ThreeContainer.appendChild(three.renderer.domElement);
            var ThreeContainer = document.getElementById("ThreeContainer");
            ThreeContainer.appendChild(three.renderer.domElement);
        }

        // 加载模型
        function getDBModel(url) {
            // let url = './model/1.glb'
            // 外部模型加载
            const loader = new GLTFLoader();
            loader.load(url, (gltf) => {
                const modelss = gltf.scene;
                console.log(modelss, "加载到模型");
                modelss.scale.set(10, 10, 10); // 缩放相关参数 scale object to be visible at planet scale
                // z方向移动一段距离
                // modelss.position.z += 10.0; // 在Three.js空间中平移“向上”，使网格的“底部”为句
                modelss.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
                // 创建组
                let dodecahedronMeshYup = new THREE.Group();
                dodecahedronMeshYup.add(modelss);
                // 添加场景当中
                three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually

                let _3DOB = new _3DObject();
                // 存储模型
                _3DOB.threeMesh = dodecahedronMeshYup;
                // 存储模型位置坐标
                _3DOB.minWGS84 = minWGS84;
                _3DOB.maxWGS84 = maxWGS84;
                _3Dobjects.push(_3DOB);
            });
        }

        // 创建three 对象
        function createThreeObject() {
            getDBModel("http://127.0.0.1:8888/model/DI.gltf");
        }

        // 初始化模型
        function init3DObject() {
            //Cesium entity
            // createPolygon();
            //Three.js Objects
            createThreeObject();
        }

        // cesium 渲染
        function renderCesium() {
            cesium.viewer.render();
        }

        // three.js每次刷新的操作
        function renderThreeObj() {
            // register Three.js scene with Cesium
            // 镜头同步
            three.camera.fov = Cesium.Math.toDegrees(
                cesium.viewer.camera.frustum.fovy
            ); // ThreeJS FOV is vertical
            //three.camera.updateProjectionMatrix();
            let cartToVec = function (cart) {
                return new THREE.Vector3(cart.x, cart.y, cart.z);
            };

            // 控制下水流变化 water.position.y += 100.0;
            // water.material.uniforms["time"].value += 1.0 / 60.0;

            // Configure Three.js meshes to stand against globe center position up direction
            // 将Three.js网格配置为相对于地球仪中心位置向上
            for (let id in _3Dobjects) {
                // 水流动一动
                if (_3Dobjects[id].myType)
                    _3Dobjects[id].threeMesh.material.uniforms["time"].value +=
                        1.0 / 60.0;

                minWGS84 = _3Dobjects[id].minWGS84;
                maxWGS84 = _3Dobjects[id].maxWGS84;
                // convert lat/long center position to Cartesian3
                let center = Cesium.Cartesian3.fromDegrees(
                    (minWGS84[0] + maxWGS84[0]) / 2,
                    (minWGS84[1] + maxWGS84[1]) / 2
                );
                // get forward direction for orienting model
                let centerHigh = Cesium.Cartesian3.fromDegrees(
                    (minWGS84[0] + maxWGS84[0]) / 2,
                    (minWGS84[1] + maxWGS84[1]) / 2,
                    1
                );
                // use direction from bottom left to top left as up-vector
                let bottomLeft = cartToVec(
                    Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
                );
                let topLeft = cartToVec(
                    Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1])
                );
                let latDir = new THREE.Vector3()
                    .subVectors(bottomLeft, topLeft)
                    .normalize();
                // configure entity position and orientation
                // 配置实体位置和方向
                _3Dobjects[id].threeMesh.position.copy(center); // 控制更新后的模型位置
                // if(_3Dobjects[id].myType) _3Dobjects[id].threeMesh.position.y += 10.0;

                _3Dobjects[id].threeMesh.lookAt(
                    centerHigh.x,
                    centerHigh.y,
                    centerHigh.z
                );
                _3Dobjects[id].threeMesh.up.copy(latDir);
            }
            // Clone Cesium Camera projection position so the
            // Three.js Object will appear to be at the same place as above the Cesium Globe
            // 克隆相机的投影位置，使Three.js对象看起来与铯地球仪上方的位置相同
            three.camera.matrixAutoUpdate = false;
            let cvm = cesium.viewer.camera.viewMatrix;
            let civm = cesium.viewer.camera.inverseViewMatrix;

            // 注意这里，经大神博客得知，three高版本这行代码需要放在 three.camera.matrixWorld 之前
            three.camera.lookAt(0, 0, 0);

            three.camera.matrixWorld.set(
                civm[0],
                civm[4],
                civm[8],
                civm[12],
                civm[1],
                civm[5],
                civm[9],
                civm[13],
                civm[2],
                civm[6],
                civm[10],
                civm[14],
                civm[3],
                civm[7],
                civm[11],
                civm[15]
            );

            three.camera.matrixWorldInverse.set(
                cvm[0],
                cvm[4],
                cvm[8],
                cvm[12],
                cvm[1],
                cvm[5],
                cvm[9],
                cvm[13],
                cvm[2],
                cvm[6],
                cvm[10],
                cvm[14],
                cvm[3],
                cvm[7],
                cvm[11],
                cvm[15]
            );

            // 设置three宽高
            let width = cesiumContainer.clientWidth;
            let height = cesiumContainer.clientHeight;

            let aspect = width / height;
            three.camera.aspect = aspect;
            three.camera.updateProjectionMatrix();
            three.renderer.setSize(width, height);
            three.renderer.clear();
            three.renderer.render(three.scene, three.camera);
        }

        // 同步
        function loop() {
            requestAnimationFrame(loop);
            renderCesium();
            renderThreeObj();
        }

        initCesium(); // Initialize Cesium renderer
        initThree(); // Initialize Three.js renderer
        init3DObject(); // Initialize Three.js object mesh with Cesium Cartesian coordinate system
        loop(); // Looping renderer
    }

    pageload();

});
</script>
  
<style lang="scss" scoped>
#cesiumContainer {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    font-family: sans-serif;
}

#ThreeContainer {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    font-family: sans-serif;
    /* 关闭three鼠标控制器 */
    pointer-events: none;
}
</style>
  