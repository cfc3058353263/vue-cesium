import * as Cesium from 'cesium';
import circle_red from '@/assets/drawImage/circle_red.png';

export class rectangle {
    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler;
    rectangle: any;
    startPoint: any;
    endPoint: any;
    changePoint: string | null;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.rectangle = null; // 矩形实体
        this.startPoint = null; // 圆的中心点实例
        this.endPoint = null; // 圆的边点实例
        this.changePoint = null; // 当前点击获取的点
    }
    // 绘制点
    drawPoint = (cartesian3: Cesium.Cartesian3, name: string) => {
        const entityPoint = this.viewer.entities.add({
            position: cartesian3,
            name: name,
            billboard: {
                image: circle_red,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                scale: 1.2,
            },
        });
        return entityPoint;
    };
    // 绘制矩形
    drawRectangle = (name: string) => {
        let rect: Cesium.Rectangle;
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            if (this.startPoint && this.endPoint) {
                rect = Cesium.Rectangle.fromCartesianArray([
                    this.startPoint.position._value,
                    this.endPoint.position._value,
                ]);
                return rect;
            } else {
                return rect;
            }
        }, false);
        let positions: Cesium.Cartesian3[];
        let outlineDynamicPositions = new Cesium.CallbackProperty(() => {
            if (this.startPoint && this.endPoint) {
                const points = [this.startPoint.position._value, this.endPoint.position._value];
                let rect = Cesium.Rectangle.fromCartesianArray(points);
                var arr = [
                    rect.west,
                    rect.north,
                    rect.east,
                    rect.north,
                    rect.east,
                    rect.south,
                    rect.west,
                    rect.south,
                    rect.west,
                    rect.north,
                ];
                positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            } else {
                return positions;
            }
        }, false);
        const entityRectangle = this.viewer.entities.add({
            type: 'rectangle',
            name: name,
            // 矩形图形
            rectangle: {
                coordinates: dynamicPositions,
                material: Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5),
                show: true,
            },
            // 矩形边框线
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7),
                }),
                show: true,
            },
        });
        return entityRectangle;
    };
    // 回显矩形
    showPolygon = (points: any) => {
        let rect = Cesium.Rectangle.fromCartesianArray(points);
        var arr = [
            rect.west,
            rect.north,
            rect.east,
            rect.north,
            rect.east,
            rect.south,
            rect.west,
            rect.south,
            rect.west,
            rect.north,
        ];
        let positions = Cesium.Cartesian3.fromRadiansArray(arr);
        const entityRectangle = this.viewer.entities.add({
            type: 'rectangle',
            // 矩形图形
            rectangle: {
                coordinates: Cesium.Rectangle.fromCartesianArray(points),
                material: Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5),
                show: true,
            },
            // 矩形边框线
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7),
                }),
                show: true,
            },
        });
        return entityRectangle;
    };
    // 开启绘制
    draw = () => {
        // 监听鼠标左键点击事件
        this.handler.setInputAction((event: any) => {
            let position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            let ray = this.viewer.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (this.endPoint) {
                this.clearData();
                this.clearHandler();
                return;
            }
            // 开启绘制
            const cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.position);
            // 添加开始点
            this.startPoint = this.drawPoint(cartesian3 as Cesium.Cartesian3, 'start_point');
            // 添加结束点
            this.endPoint = this.drawPoint(cartesian3 as Cesium.Cartesian3, 'end_point');
            // 开始绘制
            this.rectangle = this.drawRectangle('rectangle');
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 监听鼠标移动事件
        this.handler.setInputAction((event: any) => {
            let position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            let ray = this.viewer.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (this.endPoint) {
                let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                this.endPoint.position = cartesian3;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    // 开启绘制
    edit = () => {
        // 监听鼠标左键点击事件
        this.handler.setInputAction((event: any) => {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            const ray = this.viewer.scene.camera.getPickRay(event.position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian3)) {
                return;
            }
            const pick = this.viewer.scene.pick(event.position);
            if (Cesium.defined(pick) && pick.id.type === 'rectangle') {
                if (this.rectangle) {
                    this.clearData();
                }
                const rect = pick.id.rectangle.coordinates._value;
                const positions = Cesium.Rectangle.subsample(rect);
                // 添加开始点
                this.startPoint = this.drawPoint(positions[0] as Cesium.Cartesian3, 'start_point');
                // 添加结束点
                this.endPoint = this.drawPoint(positions[2] as Cesium.Cartesian3, 'end_point');
                // 开始绘制
                this.rectangle = this.drawRectangle('rectangle');
                this.viewer.entities.remove(pick.id);
            }
            if (Cesium.defined(pick) && pick.id.name === 'start_point') {
                if (this.changePoint) {
                    this.changePoint = null;
                } else {
                    this.changePoint = 'start_point';
                }
            }
            if (Cesium.defined(pick) && pick.id.name === 'end_point') {
                if (this.changePoint) {
                    this.changePoint = null;
                } else {
                    this.changePoint = 'end_point';
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 监听鼠标移动事件
        this.handler.setInputAction((event: any) => {
            let position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            let ray = this.viewer.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
            if (this.changePoint === 'start_point') {
                this.startPoint.position = cartesian3;
            }
            if (this.changePoint === 'end_point') {
                this.endPoint.position = cartesian3;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // 监听鼠标右键点击事件
        this.handler.setInputAction((event: any) => {
            this.clearData();
            this.clearHandler();
            return;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    // 清空数据
    clearData = () => {
        this.showPolygon([this.startPoint.position._value, this.endPoint.position._value]);
        this.viewer.entities.remove(this.rectangle);
        this.rectangle = null;
        this.viewer.entities.remove(this.startPoint);
        this.viewer.entities.remove(this.endPoint);
        this.startPoint = null;
        this.endPoint = null;
        this.changePoint = null;
    };
    // 清空鼠标事件
    clearHandler = () => {
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
    };
}
