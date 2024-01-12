import * as Cesium from "cesium";

export class edit3dTilesetFunC {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler
    }
    /**
     * 添加3dtileset
     * @param url 
     * @returns 
     */
    add3dTileset = async (url: string) => {
        let translation = Cesium.Cartesian3.fromArray([0, 0, -170])
        let m = Cesium.Matrix4.fromTranslation(translation)
        const tileset = await Cesium.Cesium3DTileset.fromUrl(
            // 3dtileset模型位置地址
            url,
            {
                modelMatrix: m,
                maximumScreenSpaceError: 32,//用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
            });
        this.viewer.scene.primitives.add(tileset);
        this.viewer.zoomTo(tileset)
        return tileset;
    }
    /**
     * 模型单体化
     */
    tilesModel = () => {
        // const positions = this.viewer.entities.getById('5a0e1246-2d3d-4819-bb77-28ee2ba6b28d').polygon.hierarchy._callback().positions;
        // console.log(positions)
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
        const tilesModelObj = this.viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(
                            positions
                        ),
                        extrudedHeight: 100,//分层顶部海拔
                        height: 50,//分层底部海拔
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
    }
    //如果模型没有贴地 调整高度,height表示物体离地面的高度
    changeHeight = (height: number, tileset: any) => {
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
    // 监听鼠标左击事件
    handlerLeftClick = () => {
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position)
            if (Cesium.defined(pick) && pick) {
                this.tilesModel()
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
}