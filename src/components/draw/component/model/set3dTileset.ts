import * as Cesium from "cesium";

export class edit3dTilesetFunC {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler
    }
    add3dTileset = async (url: string) => {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(
            // 3dtileset模型位置地址
            url,
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
        this.viewer.scene.primitives.add(tileset);
        this.viewer.zoomTo(tileset)
        return tileset;
    }
    //如果模型没有贴地 调整高度,height表示物体离地面的高度
    changeHeight = (height, tileset) => {
        height = Number(height);
        if (isNaN(height)) {
            return;
        }
        var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
        var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
}