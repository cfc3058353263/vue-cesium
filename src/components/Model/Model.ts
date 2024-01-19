import * as Cesium from "cesium";
import cache from '@/plugins/cache.ts'

const { local } = cache
let currentObjectId
let currentPrimitive
let attributes
let currentColor
let currentShow
export class Model {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    tileset: any; // 当前加载的模型实例
    handlerLeftClickCallBack: Function; // 当前点击模型调用的回调函数
    tilesModelObj: any
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler;
        this.tileset = null;
        this.handlerLeftClickCallBack = () => { };
        this.tilesModelObj = null;
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
                // modelMatrix: m,
                maximumScreenSpaceError: 64,//用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
            });
        tileset['type'] = '3dtiles';
        this.viewer.scene.primitives.add(tileset);
        this.viewer.zoomTo(tileset)
        return tileset;
    }
    /**
     * 修改模型大小
     */
    setModelScale = (tileset: any, scale: number) => {
        // 将模型中心点的笛卡尔坐标转换为cartographic{longitude,latitude,height}(带有经度纬度高度)
        let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        // 弧度转为角度（经纬度）
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        //模型高度
        // let height = cartographic.height;
        let position = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        const _scale = Cesium.Matrix4.fromUniformScale(scale);
        Cesium.Matrix4.multiply(m, _scale, m);
        tileset._root.transform = m;
    }


    /**
     * 模型单体化
     */
    addTilesetModel = (data) => {
        this.handlerLeftClick()
        this.handlerMouseMove()
        const positions = data.positions
        this.tilesModelObj = this.viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    // 有线的实体
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(
                            positions
                        ),
                        height: data.height + data.extrudedHeight,//分层底部海拔
                        extrudedHeight: data.extrudedHeight,//分层顶部海拔
                    }),
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.fromCssColorString(data.color).withAlpha(0)
                        ),
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    },
                    id: data.name
                }),
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
            })
        )
    }
    /**
    * 模型旋转 / 大小修改 / 平移 由于每次进行变换时tileset.boundingSphere.center模型中心的位置是不会改变的，你只能对模型进行偏移的操作 因此旋转缩放平移目前只能在一个方法中实现
    */
    update3dtilesMaxtrix = (tileset, rotateX, rotateY, rotateZ, zome, height, lon, lat) => {
        let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        // let lon = Cesium.Math.toDegrees(cartographic.longitude);
        // let lat = Cesium.Math.toDegrees(cartographic.latitude);
        // let height = cartographic.height;
        // 平移
        let position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
        let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        // 旋转
        let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotateX));
        let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(rotateY));
        let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateZ));
        let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
        let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
        let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz)

        //旋转、平移矩阵相乘
        Cesium.Matrix4.multiply(m, rotationX, m);
        Cesium.Matrix4.multiply(m, rotationY, m);
        Cesium.Matrix4.multiply(m, rotationZ, m);
        // 缩放
        const scale = Cesium.Matrix4.fromUniformScale(zome);
        Cesium.Matrix4.multiply(m, scale, m);
        tileset._root.transform = m;
    }
    //如果模型没有贴地 调整高度,height表示物体离地面的高度
    changeHeight = (tileset: Cesium.Cesium3DTileset, height: number) => {
        height = Number(height);
        if (isNaN(height) || !Cesium.defined(tileset)) {
            return;
        }
        const cartographic = Cesium.Cartographic.fromCartesian(
            tileset.boundingSphere.center
        );
        const surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0
        );
        const offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height
        );
        // 计算两个笛卡尔的分量差异。
        const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
        );
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
    /**
     * 修改模型的透视度
     */
    changeModelOpacity = (tileset: Cesium.Cesium3DTileset, opacity: number) => {
        if (opacity === 1) {
            tileset.style = new Cesium.Cesium3DTileStyle()
        } else {
            tileset.style = new Cesium.Cesium3DTileStyle({
                // 数值加大，能让最终成像变模糊
                maximumScreenSpaceError: 64,
                color: `color('rgba(0,255, 255,${opacity + ''})')`
            })
        }
    }
    /**
     * 修改模型显示隐藏
     */
    changeModelVisibility = (tileset: Cesium.Cesium3DTileset, visible: boolean) => {
        tileset.show = visible;
        if (visible) {
            this.handlerLeftClick()
            this.handlerMouseMove()
        }
    }
    // 监听鼠标左击事件
    handlerLeftClick = () => {
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position)
            if (Cesium.defined(pick) && pick.primitive && pick.primitive.type === '3dtiles') {
                this.handlerLeftClickCallBack()
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    // 鼠标移动事件
    handlerMouseMove = () => {
        this.handler.setInputAction((event: any) => {
            const pickedObject = this.viewer.scene.pick(event.endPosition);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                if (pickedObject.id === currentObjectId) {
                    return;
                }

                if (Cesium.defined(currentObjectId)) {
                    attributes = currentPrimitive.getGeometryInstanceAttributes(
                        currentObjectId
                    );
                    attributes.color = currentColor;
                    attributes.show = currentShow;
                    currentObjectId = undefined;
                    currentPrimitive = undefined;
                    currentColor = undefined;
                    currentShow = undefined;
                }
            }
            if (
                Cesium.defined(pickedObject) &&
                Cesium.defined(pickedObject.primitive) &&
                Cesium.defined(pickedObject.id) &&
                Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes)
            ) {
                currentObjectId = pickedObject.id;
                currentPrimitive = pickedObject.primitive;
                attributes = currentPrimitive.getGeometryInstanceAttributes(
                    currentObjectId
                );
                currentColor = attributes.color;
                currentShow = attributes.show;
                const color = attributes.color;
                color[3] = 128;
                if (!this.viewer.scene.invertClassification) {
                    attributes.color = color;
                }
                attributes.show = [1];
            } else if (Cesium.defined(currentObjectId)) {
                attributes = currentPrimitive.getGeometryInstanceAttributes(
                    currentObjectId
                );
                attributes.color = currentColor;
                attributes.show = currentShow;
                currentObjectId = undefined;
                currentPrimitive = undefined;
                currentColor = undefined;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}