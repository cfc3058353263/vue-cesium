import * as Cesium from 'cesium';

interface tilesetHighlight {
    name: string
    positions: Cesium.Cartesian3[];
    height: number;
    extrudedHeight: number;
    color: string;
}

export class Model {
    viewer: Cesium.Viewer; // cesium 实例
    handler: Cesium.ScreenSpaceEventHandler; // cesium 鼠标监听事件
    handlerLeftClickCallBack: Function; // 当前点击模型调用的回调函数
    tilesetModel: Cesium.Cesium3DTileset | null;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler;
        this.handlerLeftClickCallBack = () => {};
        this.tilesetModel = null;
    }
    /**
     * 添加3dtileset
     * @param url 模型地址
     * @returns
     */
    add3dTileset = async (url: string) => {
        const tileset: any = await Cesium.Cesium3DTileset.fromUrl(url, {
            maximumScreenSpaceError: 64, //用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
        });
        tileset['type'] = '3dtiles';
        this.viewer.scene.primitives.add(tileset);
        this.viewer.zoomTo(tileset);
        return tileset;
    };
    //  模型旋转 / 大小修改 / 平移 由于每次进行变换时tileset.boundingSphere.center模型中心的位置是不会改变的，你只能对模型进行偏移的操作 因此旋转缩放平移目前只能在一个方法中实现
    update3dtilesMaxtrix = (
        tileset: Cesium.Cesium3DTileset,
        rotateX: number,
        rotateY: number,
        rotateZ: number,
        zome: number,
        height: number,
        lon: number,
        lat: number
    ) => {
        // 平移 模型贴地
        let position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        // 旋转
        let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotateX));
        let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(rotateY));
        let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateZ));
        let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
        let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
        let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);

        //旋转、平移矩阵相乘
        Cesium.Matrix4.multiply(m, rotationX, m);
        Cesium.Matrix4.multiply(m, rotationY, m);
        Cesium.Matrix4.multiply(m, rotationZ, m);
        // 缩放
        const scale = Cesium.Matrix4.fromUniformScale(zome);
        Cesium.Matrix4.multiply(m, scale, m);
        tileset._root.transform = m;
    };
    // 修改模型的透视度
    changeModelOpacity = (tileset: Cesium.Cesium3DTileset, opacity: number) => {
        if (opacity === 1) {
            tileset.style = new Cesium.Cesium3DTileStyle();
        } else {
            tileset.style = new Cesium.Cesium3DTileStyle({
                // 数值加大，能让最终成像变模糊
                maximumScreenSpaceError: 64,
                color: `color('rgba(0,255, 255,${opacity + ''})')`,
            });
        }
    };
    // 修改模型显示隐藏
    changeModelVisibility = (tileset: Cesium.Cesium3DTileset, visible: boolean) => {
        tileset.show = visible;
    };
    // 添加单体化数据
    addTilesetModel = (data: tilesetHighlight) => {
        const positions = data.positions;
            this.viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    // 有线的实体
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
                        height: data.height + data.extrudedHeight, //分层底部海拔
                        extrudedHeight: data.extrudedHeight, //分层顶部海拔
                    }),
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.fromCssColorString(data.color).withAlpha(0)
                        ),
                        show: new Cesium.ShowGeometryInstanceAttribute(true),
                    },
                    id: data.name,
                }),
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            })
        );
    };
    // 监听鼠标左击事件
    handlerLeftClick = () => {
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position);
            if (Cesium.defined(pick) && pick.primitive && pick.primitive.type === '3dtiles') {
                this.tilesetModel = pick.primitive;
                this.handlerLeftClickCallBack(pick.primitive);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    // 监听鼠标移入 触发模型单体化
}
