
### 高德等其他影像图的添加方式
```js
const imageLayers = viewer.value.imageryLayers
// 清空默认影像图
imageLayers.remove(imageLayers.get(0))
// c
var gaodeImageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    maximumLevel: 18,
    minimumLevel: 1,
    credit: 'Amap'
})
imageLayers.addImageryProvider(gaodeImageryProvider);
// 其他影像图加载 https://blog.csdn.net/w137160164/article/details/130665272
```

### 倾斜摄影添加
```js
const tileset = await Cesium.Cesium3DTileset.fromUrl(
    // 3dtileset模型位置地址
    "http://127.0.0.1:8888/test3dtiles/tileset.json",
    {
        maximumMemoryUsage: 100,//不可设置太高，目标机子空闲内存值以内，防止浏览器过于卡
        maximumScreenSpaceError: 32,//用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
        maximumNumberOfLoadedTiles: 1000,  //最大加载瓦片个数
        shadows: false,//是否显示阴影
        skipLevelOfDetail: true,// 确定是否应在遍历期间应用详细级别跳过(默认false)
        baseScreenSpaceError: 1024,//When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
        skipScreenSpaceErrorFactor: 16,// 定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
        skipLevels: 1,//skipLevelOfDetail是true 一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
        immediatelyLoadDesiredLevelOfDetail: false,//当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
        loadSiblings: false,// 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
        cullWithChildrenBounds: true,//是否使用子边界体积的并集来剔除瓦片（默认true）
        dynamicScreenSpaceError: true,//减少距离相机较远的图块的屏幕空间错误(默认false)
        dynamicScreenSpaceErrorDensity: 0.00278,//数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
        dynamicScreenSpaceErrorFactor: 4.0,// 用于增加计算的动态屏幕空间误差的因素(默认4.0)
        dynamicScreenSpaceErrorHeightFalloff: 0.25//密度开始下降的瓦片集高度的比率(默认0.25)
    });
// primitives添加tileset
viewer.scene.primitives.add(tileset);
// 相机视角调整到模型位置
viewer.zoomTo(tileset)

// 参数配置详细地址 https://blog.csdn.net/weixin_51527962/article/details/122392166
```


### 倾斜摄影单体化
```js
// 单体化简单点说就是在模型上贴一层膜，然后在点击的时候让膜显示，并展示数据。
// 实例出一些透明的立方体或其他几何体，通过调位置大小，覆盖在你想单体化的楼栋上面，再通过ClassificationPrimitive反选倾斜摄影赋予颜色。 
// https://www.vvpstk.com/public/Cesium/Documentation/ClassificationPrimitive.html?classFilter=ClassificationPrimitive
// 在单体化的时候一般是用BoxGeometry实现的 例如
var tilesModelObj = scene.primitives.add(new Cesium.ClassificationPrimitive({
    geometryInstances : Cesium.BoxGeometry.fromDimensions({
        geometry : new Cesium.EllipsoidGeometry({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            // 第一个参数是遮罩的整体横向长度，第二个参数是竖向长度，第三个参数是整体高度
            dimensions: new Cesium.Cartesian3(Number(65), Number(50), Number(160))
        }),
        modelMatrix : modelMatrix,
        attributes : {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString('#F26419').withAlpha(0.5)
            ),
            show : new Cesium.ShowGeometryInstanceAttribute(true)
        },
        id : 'volume 1'
    }),
    classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
}));
// 你也可以使用其他的几何图形 这里使用的是PolygonGeometry
const positions = [
    {
        "x": -2306878.671540245,
        "y": 5418723.165773451,
        "z": 2440540.8378102113
    },
    {
        "x": -2306871.3570130244,
        "y": 5418740.242750738,
        "z": 2440510.0430691787
    },
    {
        "x": -2306938.396439779,
        "y": 5418715.395939039,
        "z": 2440501.896611101
    },
    {
        "x": -2306934.13796275,
        "y": 5418705.8433269,
        "z": 2440526.962879609
    }
]
 const tilesModelObj = scene.primitives.add(
    new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(
                    positions
                ),
                extrudedHeight: 1000,//分层顶部海拔
                height: 0,//分层底部海拔
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.fromCssColorString('#F26419').withAlpha(0.5)
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true)
            },
            id: 'volume 1'
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
    })
)
// 参考资料
// https://www.vvpstk.com/public/Cesium/Documentation/ClassificationPrimitive.html?classFilter=ClassificationPrimitive
// https://blog.csdn.net/qq_40863573/article/details/125890281?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-1-125890281-blog-84851824.235^v40^pc_relevant_3m_sort_dl_base3&spm=1001.2101.3001.4242.2&utm_relevant_index=4
// https://blog.csdn.net/weixin_48549175/article/details/127852100?spm=1001.2101.3001.6650.2&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-2-127852100-blog-125890281.235%5Ev40%5Epc_relevant_3m_sort_dl_base3&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-2-127852100-blog-125890281.235%5Ev40%5Epc_relevant_3m_sort_dl_base3&utm_relevant_index=5
```


### 多边形绘制
```js
viewer.entities.add({
    id: polygonId,
    name: 'polyhedron_name',
    polygon: {
        // CallbackProperty 用于做动态绘制 positions 绘制多边形的cartesian3格式的点坐标
        hierarchy: new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(positions);
        }, false),
        // extrudedHeight 是指多边形拉伸后的面距离地面的拉伸高度 只有当extrudedHeight大于height时才会呈现挤出高度的效果，且多边形的厚度就是两者的差值。
        extrudedHeight: form.value.height, 
        // 是指polygon距离地面的高度
        height: 0, 
        // 多边形颜色
        material: Cesium.Color.fromCssColorString(form.value.color),
        // 边的
        outlineColor: Cesium.Color.RED,
        // 边的宽度
        outlineWidth: 2,
        // 是否显示边
        outline: true
    },
})
```

### 圆形绘制

### dataSource
```js
// DataSource是用于表示和呈现地理空间数据的类。DataSource包含了一组实体(Entity)对象，每个实体都包含了地理位置、几何形状、材质、文本标注等属性，用于在Cesium Viewer中呈现地理空间数据。
```
### 轨迹回放
```js
// 逻辑
// 1. 首先需要一条线路,其格式是一些经纬度点的集合
// 2. 根据每个经纬度设置其所对应的时间点(这里要设置每秒进行几米)
```

### 关于视角切换模型或者实体出现漂移的问题
```js
// 如果给定的模型高度是高于地面的，则可以关闭地形
viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
// 开启地形深度检测
viewer.scene.globe.depthTestAgainstTerrain = true;
```

### 关于标注billboard，视角切换billboard会偏移的问题
```js
// verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
 const entityPoint = this.viewer.entities.add({
    name: '',
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
    billboard: {
        image: icon1,//图标地址
        // 固定位置
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scale: 0.3,
        pixelOffset: new Cesium.Cartesian2(-6, 6),
        // 设置距离控制可见度
        disableDepthTestDistance: 2e3
    },
    label: {
        scale: 1,
        font: "bolder 16px sans-serif",
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        text: '摄像头',//图标名称
        fillColor: Cesium.Color.fromCssColorString("#ffffff"),
        pixelOffset: new Cesium.Cartesian2(0, -60)
    },
    // type 类型/虽然该字段在Entity类型中不存在，但你依旧可以添加其他字段，并且在查询是该字段也会获取到
    type: 'billboard',
})
```  

### 笛卡尔空间直角坐标系（Cartesian3）-->WGS84坐标系
```js
var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);//笛卡尔转换为弧度 
//使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度 
var longitude = Cesium.Math.toDegrees(cartographic.longitude);
var latitude = Cesium.Math.toDegrees(cartographic.latitude);
var height = cartographic.height;
```

### 相机
```js
heading：默认方向为正北，正角度为向东旋转，即水平旋转，也叫偏航角。
pitch：默认旋转角度为一90,即朝向地面，正角度为平面之上，负角度为平面之下，即上下旋转，也叫俯仰角。
roll：默认旋转角度为0，左右旋转.正角度向右旋转，负角度向左旋转，也叫翻滚角。

// https://blog.csdn.net/Raccon_/article/details/127281362

// https://blog.csdn.net/ljy1998dsb/article/details/124072373?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-4-124072373-blog-132210829.235^v40^pc_relevant_3m_sort_dl_base3&spm=1001.2101.3001.4242.3&utm_relevant_index=7
```

### 二维场景与三维厂家切换

### 动画


### 关于 error @achrinza/node-ipc@9.2.2: The engine “node“ is incompatible的报错
```js
运行
yarn config set ignore-engines true 
```



### cesiun api
```js
Cesium的所有API汇总：
// Core：核心模块，包含Cesium的基础构件、数据结构、算法等。
// Scene：场景模块，包含Cesium的渲染引擎、摄像机、灯光、图像合成等。
// Widgets：小部件模块，包含Cesium的用户界面、控制面板、信息窗口等。
// DataSources：数据源模块，包含Cesium的数据解析、可视化、编辑等。
// ThirdParty：第三方模块，包含Cesium的依赖库、插件、工具等。
// Workers：工作线程模块，包含Cesium的并行计算、异步加载等。
// Plugins：插件模块，包含Cesium的地理编码、路线规划、地形分析等。

每个模块都包含了许多API，以下是一些常用的API：
// Cesium：Cesium命名空间，包含Cesium的全局变量、常量、函数等。
// Viewer：Cesium.Viewer类，用于创建和管理Cesium场景和小部件。
// Camera：Cesium.Camera类，用于管理摄像机的位置、朝向、视野等。
// Entity：Cesium.Entity类，用于描述Cesium场景中的实体，包含位置、属性、图形等。
// DataSource：Cesium.DataSource类，用于加载和解析各种格式的地理数据源。 如 kml czml等
// ImageryLayer：Cesium.ImageryLayer类，用于管理Cesium场景中的图像图层。
// TerrainProvider：Cesium.TerrainProvider类，用于加载和管理Cesium场景中的地形数据源。
// Ellipsoid：Cesium.Ellipsoid类，用于描述Cesium场景中的椭球体。
// Color：Cesium.Color类，用于描述颜色，包含RGBA、HSVA等。
// Cartesian3：Cesium.Cartesian3类，用于描述三维空间中的点，包含x、y、z坐标。

```

### cesium 事件
#### 以鼠标操作（左键、中键、右键操作等）为主的 ScreenSpaceEventHandler 类
#### 相机控制事件类 screenSpaceCameraController 并不是像鼠标事件相关类
```js
// ScreenSpaceEventHandler 那样需要提前实例化。Cesium在Viewer类的实例化过程中，也实例化了其他很多类，其中就包括ScreenSpaceCameraController类，并把实例化结果赋值给了viewer.scene.screenSpaceCameraController。所以，我们直接去操作viewer.scene.screenSpaceCameraController就可以了。
```
#### 场景渲染事件
```js
场景渲染事件主要包括以下四种：
scene.preUpdate： 更新或呈现场景之前将引发的事件
scene.postUpdate： 场景更新后以及渲染场景之前立即引发的事件
scene.preRender： 场景更新后以及渲染场景之前将引发的事件
scene.postRender： 渲染场景后立即引发的事件

preRender: 预渲染事件，在场景预处理之后，相机视角确定之前调用。此事件在场景开始渲染之前调用，因此可以使用此事件来执行一些初始化或准备工作，例如：获取视口或获取相机参数。
postRender: 渲染后事件，在场景完成渲染之后调用。此事件可以用于处理场景渲染的逻辑，例如：处理绘制、设置绘制命令等。
preUpdate: 预更新事件，在更新前的准备工作阶段调用。此事件在执行场景更新之前调用，可以使用此事件来检查更新是否需要执行，例如：检查更新是否需要更新相机或场景。
postUpdate: 更新后事件，在更新完成后调用。此事件在执行场景更新之后调用，可以使用此事件来处理更新后的逻辑，例如：处理相机或场景的更新结果。

在代码中需要addEventListener来进行绑定,用removeEventListener来移除绑定
```

### 经纬度转换
```js
// 高德转84  国测GCJ-02 --> 84 
var gcj02towgs84=coordtransform.gcj02towgs84(**116.404, 39.915**);
// 百度转84  (BD-09) --> 84
// 线百度经纬度坐标转国测局坐标
var bd09togcj02=coordtransform.bd09togcj02(116.404, 39.915);
var gcj02towgs84=coordtransform.gcj02towgs84(bd09togcj02);
```

### 加载wmts https://blog.csdn.net/m0_48524977/article/details/126527469

http://localhost:8080/geoserver/gwc/service/wmts/rest/topp:states/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png

### 关于viewer https://zhuanlan.zhihu.com/p/80904975?utm_id=0
```js
// Viewer是Cesium中用于显示3D场景的组件。它提供了创建和控制3D场景所需的所有基本功能，包括加载3D模型、添加图像覆盖物、设置相机位置和方向、处理用户输入等。
const viewer= new Cesium.Viewer('mycesium',{
    animation:false,//动画小组件,即左下角的仪表，默认为true
    baseLayerPicker:true,//是否显示图层选择器，默认为true
    fullscreenButton:true,//是否显示全屏按钮，默认为true
    geocoder:true,//是否显示Geocoder（右上角的查询按钮），默认为true
    homeButton:true,//上是否显示Home按钮
    infoBox:false,//是否显示信息框
    sceneModelPicker:true,//是否显示三位地球/二维地图选择器
    selectionIndicator:false,//是否显示选取指示器（鼠标点击显示绿框）
    timeline:false,//时间轴
    navigationHelpButton:true,//是否显示右上角的帮助按钮
    scene3DOnly:true,//如果设置为true，则所有几何图形以三维模式绘制以节约GPU资源，默认为false
    clock:new Cesium.Clock(),//用于控制当前时间的时钟对象
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
        Cesium.ArcGisBaseMapType.SATELLITE
      )
    ),//设置底图图层，尽在baseLayerPicker属性设置为flase时有意义
    terrainProvider:new Cesium.EllipsoidTerrainProvider(),//设置地形图层，仅在baseLayerPicker设置为false时有意义
    skyBox:new Cesium.skyBox({
        sources:{
            positiveX:'Cesium-1.7.1/Skybox/px.jpg',
            negativeX:'Cesium-1.7.1/Skybox/mx.jpg',
            positiveY:'Cesium-1.7.1/Skybox/py.jpg',
            negativeY:'Cesium-1.7.1/Skybox/my.jpg',
            positiveZ:'Cesium-1.7.1/Skybox/pz.jpg',
            negativeZ:'Cesium-1.7.1/Skybox/mz.jpg',
        }
    }),//用于渲染星空的SkyBox对象
    fullscreenElement:document.body,//全屏时渲染的html元素
    useDefaultRenderLoop:true,//如果需要控制渲染循环，则设置为true
    targetFrameRate:undefined,//使用默认render loop时的帧率
    showRenderLoopErrors:false,//如果设置为true，将显示错误信息
    automaticallyTrackDataSourceClocks:true,//自动追踪最近添加的数据源式中设置
    contextOptions:undefined,//传递给Scene对象的上下文参数（scene.options）
    sceneMode:Cesium.sceneMode.SCENE3D,//初始化场景模式
    mapProjection:new Cesium.WebMercatorProjection(),//地图投影体系
    dataScurces:new Cesium.DataSourceCollection()//需要进行可视化的数据源集合
});
// 常用方法：
// destroy(): 销毁Viewer实例。
// flyTo(target, options): 使相机飞行到指定的目标位置，并设置相应的动画效果和参数。
// forceResize(): 强制刷新Viewer的大小和位置。
// isDestroyed(): 判断Viewer是否已经销毁。
// render(): Promise: 渲染3D场景并返回Promise对象，用于异步等待渲染结果。
// resize(): undefined: 调整Viewer的大小和位置。
// zoomTo(target, offset): 用于将视图缩放到指定的范围或尺寸的函数,target:定位到的实体、实体集合、数据源等。 offset：偏移量。

```
### Primitive
```js
// 主要由两部分组成：Geometry（几何结构） 和 Appearance（GLSL 顶点着色器、片段着色器和渲染状态）
// Primitive 用的是 Geometry + Appearance，可以分别修改几何形状和外观。虽然有预定义的 Geometry，但是 Primitive API 提供的是更接近 WebGL 的接口，构造 Geometry 完全可以使用与 WebGL 十分接近的逻辑，传入顶点、法线等素材创建难以想象的形状。
// 其具有以下优势：
// 性能：绘制大量 Primitive 时，可以将其合并为单个 Geometry，减轻 CPU 负担，更好使用 GPU。
// 灵活：Geometry 和 Appearance 解耦，两者可独立修改。
// Entity 在数据量特别大的情况下性能比 Primitive 差。

// https://www.cnblogs.com/onsummer/p/14059204.html
// 注意viewer中的添加Primitive方法
// viewer.scene.primitives.add(...)
```

### Entity
```js
// 更高级别的数据驱动 API，它使用一致性设计的、高级别对象来管理一组相关性的可视化对象，其底层也是使用的 primitive。
// 多个类型的实体可以结合使用（如 billboard + label），但同一种实体不能存在多个（如多个 billboard 只能分别创建 entity 实例）

// https://blog.csdn.net/appleshowc/article/details/123479194
// 注意viewer中的添加Primitive方法
// viewer.entities.add(...)
```

### Scene
```js
// Scene 包含 globe、primitives、groundprimitives 和 环境对象。
// globe用来表示整个地球的表皮，地球表皮的绘制需要两样东西，地形高程和影像数据。Cesium的地形高程数据只能有一套，而影像数据可以由多层，多层可以相互叠加。
// primitives、groundprimitives则是表示加入三维场景中的各种三维对象了。groundPrimitives用来表示贴地的三维对象。我们之前通过viewer.entities加入场景中的三维实体，大多会转化成primitives和groundPrimitives。 
// 注意：尽量不要调用scene.primitives.removeAll()来清空所有三维场景对象，因为viewer.entities会在scene.primitives上偷偷挂接一些它管理的primitive对象。如果我们直接调用scene.primitives.removeAll()，相当于把viewer.entities也给删除了。
// 环境对象: 就是一堆地球周边的环境对象了，比如天空盒（用来表示星空）、skyAtmosphere（用来表示大气）、sun（表示太阳）、moon（表示月亮）等等
```

### DataSource
```js
// DataSource有多种类型文件形式，如czml，GeoJson等，不同的文件类型只是为了不同方式的输入数据结构而已，本质上内部还是转换为Entity对象保存。
// 开发中常用来天czml，GeoJson、kml等文件类型
```

### cesium + three.js


### lookAtTransform
```js
// 设定一个局部的参考系，让相机始终朝着局部参考系的原点。
// 接收两个参数 transform 与 offset
// transform是相机参考的局部坐标系到世界坐标系的齐次坐标转换矩阵(Matrix4)，通过此4×4的矩阵，可以把局部坐标系的位置直接转换到世界坐标系中（包含旋转和平移，详细参考另一篇文章：Cesium中的相机—齐次坐标与坐标变换）。此局部坐标系一般为地面某点的“east-north-up”坐标系或者运行的卫星轨道坐标系，见下图中的o-XYZ坐标系。
// offset有两种类型，此处只讲一种：Cartesian3，即笛卡尔坐标，表示相机在局部坐标系中的位置，如下图中的OP矢量即表示相机的offset参数。
```

### 初始化加载
```js
// 1. 去掉cesium的log
viewer.value.cesiumWidget.creditContainer.style.display = "none";
// 1. 背景设置
viewer.scene.skyBox.show = false; //去掉天空盒子
viewer.value.scene.backgroundColor = new Cesium.Color(255, 255, 255, 0); //设置场景背景色，便于显示自定的背景
viewer.value.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0); //修改地邱球体背景透明
viewer.value.scene.moon.show = false; // 将月球设置为不显示
viewer.value.scene.skyAtmosphere.show = false; // 设置大气为不显示
viewer.value.scene.fog.enable = false; //设置雾为不显示
// 移除双击监听事件
```