# 需要一个不带后台的若依前端项目

###  geoserver安装部署
###  geoserver 接口服务查询
###  多边形绘制工具
###  不同级别下的地图图层展示
###  cesium图层引入

设置高度参数
是否可以编辑


### 编辑操作 
点击点可以进行拖住操作；
点击边，在边上生成一个可以进行拖住点，之后进行编辑

### 根据平面数据添加高度生成立体数据

### 保存/还原/删除
数据格式
{
   id:'',
   name: '',
   data: [],
   type: '',
   color: ''
}

[
    {
        "x": 1309517.3687710846,
        "y": -4642114.222481885,
        "z": 4159324.254014073
    },
    {
        "x": 1322930.2618680482,
        "y": -4652508.811422034,
        "z": 4143541.8261547
    },
    {
        "x": 1332093.879154647,
        "y": -4644769.549563497,
        "z": 4149246.2563269013
    }
]


### wmts 加载 / 倾斜摄影的加载

### 影像图添加根据不同级别显示不同分辨率的图层

### 倾斜摄影图层添加根据不同级别显示不同分辨率的图层


### 添加多个多边形且保存到
保存格式
```js
[
    {
        id:'xxxxx-xxxx-xxxx', //标识
        name: '', //名称
        data: [], // 经纬度
        show: '', // 状态是否显示隐藏
        color: ', //多边形颜色，
        state: '', //是否是选中状态
    }
]
```
### 隐藏之后如何显示还原

### 拖拽，高亮，回显，保存

### 修改点击边添加编辑点，且重新绘制实体

### 使用步骤
1. 开始绘制面
2. 绘制完成后，右键结束绘制
3. 


### 开发
1. 区块添加
2. 路线/路线导航
4. 模型区块模型高亮显示
5. 圆形/椭圆
6. 不同级别显示不同分辨率的图层

### 高德等其他影像图的添加方式
```js
const imageLayers = viewer.value.imageryLayers
// 清空默认影像图
imageLayers.remove(imageLayers.get(0))
// 加载高德影像图
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
