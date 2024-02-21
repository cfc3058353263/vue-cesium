import * as Cesium from 'cesium';
import circle_red from '@/assets/drawImage/circle_red.png';

export class Circle {
    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler;
    circle: any;
    centerPoint: any;
    borderPoint: any;
    changePoint: string | null;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.circle = null; // 圆实体
        this.centerPoint = null; // 圆的中心点实例
        this.borderPoint = null; // 圆的边点实例
        this.changePoint = null; // 当前点击获取的点
    }
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat
     * @returns
     */
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
    /**
     * 绘制圆
     * @param cartesian3
     */
    drawCircle = (cartesian3: Cesium.Cartesian3, radius: number) => {
        const entityEllipse = this.viewer.entities.add({
            position: cartesian3,
            type: 'circle',
            name: 'rangeCircle',
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(() => radius, false), //指定椭圆的长半轴
                semiMajorAxis: new Cesium.CallbackProperty(() => radius, false), //指定椭圆的短半轴
                // material: Cesium.Color.RED,
                material: Cesium.Color.fromCssColorString('rgba(0, 225, 225, 0.5)'),
                outline: false,
                // outlineColor: Cesium.Color.BLACK,
                outlineColor: Cesium.Color.fromCssColorString('rgba(0, 225, 225, 1)'),
                outlineWidth: 1.0,
            },
        });
        return entityEllipse;
    };
    // 开启绘制
    draw = () => {
        // 监听鼠标左键点击事件
        this.handler.setInputAction((event: any) => {
            if (this.borderPoint) {
                this.clearData();
                this.clearHandler();
                return;
            }
            // 开启绘制
            const cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.position);
            // 添加圆的中心点
            this.centerPoint = this.drawPoint(cartesian3 as Cesium.Cartesian3, 'center_point');
            // 添加圆边上的点的实例
            this.borderPoint = this.drawPoint(cartesian3 as Cesium.Cartesian3, 'border_point');
            // 绘制圆
            this.circle = this.drawCircle(cartesian3 as Cesium.Cartesian3, 1);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 监听鼠标移动事件
        this.handler.setInputAction((event: any) => {
            if (this.borderPoint) {
                let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                this.borderPoint.position = cartesian3;
                // 根据笛卡尔坐标计算两点之前的直线距离
                const distance = Cesium.Cartesian3.distance(
                    this.borderPoint.position._value,
                    this.centerPoint.position._value
                );
                if (distance > 0) {
                    this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => distance, false);
                    this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => distance, false);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    // 开启编辑
    edit = () => {
        // 监听鼠标左键点击事件
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position);
            if (pick && pick.id.type === 'circle') {
                if (this.circle) {
                    this.clearData();
                }
                this.circle = pick.id;
                const cartesian3 = pick.id.position._value;
                const semiMajorAxis = pick.id.ellipse.semiMajorAxis._callback();
                // 添加圆的中心点
                if (!this.centerPoint) {
                    this.centerPoint = this.drawPoint(cartesian3 as Cesium.Cartesian3, 'center_point');
                }
                if (!this.borderPoint) {
                    const translatedPosition = this.getNorthPointByDistance(cartesian3, semiMajorAxis);
                    this.borderPoint = this.drawPoint(
                        translatedPosition as Cesium.Cartesian3,
                        'border_point'
                    );
                }
            }
            if (pick && pick.id.name === 'center_point') {
                if (this.changePoint) {
                    this.changePoint = null;
                } else {
                    this.changePoint = 'center_point';
                }
            }
            if (pick && pick.id.name === 'border_point') {
                if (this.changePoint) {
                    this.changePoint = null;
                } else {
                    this.changePoint = 'border_point';
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 监听鼠标移动事件
        this.handler.setInputAction((event: any) => {
            if (this.changePoint === 'center_point') {
                let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                this.centerPoint.position = cartesian3;
                this.circle.position = cartesian3;
                // 根据笛卡尔坐标计算两点之前的直线距离
                const distance = Cesium.Cartesian3.distance(
                    this.borderPoint.position._value,
                    this.centerPoint.position._value
                );
                if (distance > 0) {
                    this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => distance, false);
                    this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => distance, false);
                }
            }
            if (this.changePoint === 'border_point') {
                let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                this.borderPoint.position = cartesian3;
                // 根据笛卡尔坐标计算两点之前的直线距离
                const distance = Cesium.Cartesian3.distance(
                    this.borderPoint.position._value,
                    this.centerPoint.position._value
                );
                if (distance > 0) {
                    this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => distance, false);
                    this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => distance, false);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // 监听鼠标右键点击事件
        this.handler.setInputAction((event: any) => {
            this.clearData();
            this.clearHandler();
            return;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清空数据
     */
    clearData = () => {
        this.circle = null;
        this.viewer.entities.remove(this.centerPoint);
        this.viewer.entities.remove(this.borderPoint);
        this.centerPoint = null;
        this.borderPoint = null;
        this.changePoint = null
    };
    // 清空鼠标事件
    clearHandler = () => {
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
    };
    // 计算一个点正北方向x米的另一个点的坐标
    getNorthPointByDistance(position:Cesium.Cartesian3, distance: number) {
        //以点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
        var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        return Cesium.Matrix4.multiplyByPoint(
            localToWorld_Matrix,
            Cesium.Cartesian3.fromElements(distance, 0, 0),
            new Cesium.Cartesian3()
        );
    }
}
