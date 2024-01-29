import * as Cesium from 'cesium';
import yjwz from '@/assets/images/yingjiwuzi.png';
import { cartesian3_to_lng_lat, two_cartesian3_m, lng_lat_to_cartesian3 } from '@/components/utils/utils';

export class Track {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    perspective: number; // 视角类型 0 第一人视角 1 跟随视角 2 上帝视角 3 自由视角
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler;
        this.perspective = 0;
    }
    /**
     * 添加DataSource例如线路或经纬度
     * @param clampedCartesians 使用createRouter方法返回的路线点位
     * @param modelUrl 移动模型的url地址
     */
    craterAnimation(clampedCartesians: any, modelUrl: string) {
        var lujingdata = clampedCartesians;
        //添加轨迹线
        // this.viewer.entities.add({
        //     name: "line",
        //     polyline: {
        //         positions: Cesium.Cartesian3.fromDegreesArrayHeights(lujingdata.flat()),
        //         material: Cesium.Color.RED,
        //         width: 1
        //     }
        // })
        // SampledPositionProperty回放时间和坐标
        var property = new Cesium.SampledPositionProperty();
        // 开始时间
        var starttime = new Date();
        // 结束时间
        var stoptime = new Date();
        // 当前时间的时间戳
        var timestamp = starttime.getTime();
        // 遍历数据将每个点经纬度与时间进行关联
        lujingdata.map((pos:Cesium.Cartesian3, index:number) => {
            // 速度
            let s = 0;
            if (index > 0) {
                const v = 10;
                const m = two_cartesian3_m(lujingdata[index], lujingdata[index - 1]);
                s = m / v;
            }
            // 每一个时间点间隔5秒
            var time = new Date(stoptime.getTime() + s * 1000);
            // 结束时间
            stoptime = time;
            var position = pos;
            // 利用cesium中SampledPositionProperty的addSample方法将数据中经纬度与时间关联
            // 朱利安时间 / 笛卡尔坐标
            // 将标准时间转换成julianDate格式
            property.addSample(Cesium.JulianDate.fromDate(time), position);
        });
        // 设置差值
        property.setInterpolationOptions({
            // 设置差值
            interpolationDegree: 2,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
        });

        var entities = this.viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([
                new Cesium.TimeInterval({
                    start: Cesium.JulianDate.fromDate(starttime),
                    stop: Cesium.JulianDate.fromDate(new Date(stoptime)),
                }),
            ]),
            position: property, // 点集
            // 描述一条折线，该折线定义为 Entity 随着时间的推移所形成的路径。
            path: {
                // 用于指定要显示的对象前面的秒数。
                leadTime: 0,
                // 用于指定在对该位置进行采样时要移动的最大秒数
                resolution: 1,
                // 指定折线颜色
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Cesium.Color.GREEN,
                }),
                width: 10,
            },
            // 模型添加
            model: {
                uri: modelUrl,
                scale: 1,
                minimumPixelSize: 70,
                maximumScale: 70,
            },
            viewFrom: new Cesium.Cartesian3(-100, 0, 20), // 观察位置的偏移量
            //模型朝向
            orientation: new Cesium.VelocityOrientationProperty(property),
        });
        // 视角跟随 注意:当使用该方法活其他视角切换会不生效
        this.viewer.trackedEntity = entities;
        //修改时间轴的当前时间
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(starttime);
        // 结束时间
        this.viewer.clock.stopTime = Cesium.JulianDate.fromDate(new Date(stoptime));
        // 时间结束了，再继续重复来一遍
        // this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        // 重复播放
        this.viewer.clock.shouldAnimate = true;
        // preUpdate 监听的方法
        const traceHandler = () => {
            // 当场景更新时获取entities的position函数的设定相机位置。
            let center = entities.position.getValue(this.viewer.clock.currentTime);
            // 当场景更新时获取entities的模型的方向 不仅是相机方向，还包括模型的方向等
            let orientation = entities.orientation.getValue(this.viewer.clock.currentTime);
            switch (this.perspective) {
                case 0:
                    if (center && orientation) {
                        // 去除center的的视角高度
                        let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                        // 转换为3*3的矩阵
                        var mtx3 = Cesium.Matrix3.fromQuaternion(orientation);
                        // 转换为4*4的矩阵
                        var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, center);
                        // 获取奥拉角
                        var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4);
                        console.log(hpr);
                        // 固定 roll 翻滚角 与 pitch 俯视角 / heading 偏转角 是获取当前模型朝向的偏转角
                        const newHpr: any = {
                            heading: hpr.heading,
                            pitch: Cesium.Math.toRadians(0),
                            roll: Cesium.Math.toRadians(0),
                        };
                        var newOrientation = Cesium.Transforms.headingPitchRollQuaternion(center, newHpr);
                        transform = Cesium.Matrix4.fromRotationTranslation(
                            Cesium.Matrix3.fromQuaternion(newOrientation),
                            center
                        );
                        // transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), center);
                        this.viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(-50, 10, 30));
                    }
                    break;
                case 1:
                    this.viewer.clock.shouldAnimate = true;
                    break;
                case 2:
                    if (center && orientation) {
                        // 去除center的的视角高度
                        let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                        // 转换为3*3的矩阵
                        var mtx3 = Cesium.Matrix3.fromQuaternion(orientation);
                        // 转换为4*4的矩阵
                        var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, center);
                        // 获取奥拉角
                        var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4);
                        console.log(hpr);
                        // 固定 roll 翻滚角 与 pitch 俯视角 / heading 偏转角 是获取当前模型朝向的偏转角
                        const newHpr: any = {
                            heading: hpr.heading,
                            pitch: Cesium.Math.toRadians(0),
                            roll: Cesium.Math.toRadians(0),
                        };
                        var newOrientation = Cesium.Transforms.headingPitchRollQuaternion(center, newHpr);
                        transform = Cesium.Matrix4.fromRotationTranslation(
                            Cesium.Matrix3.fromQuaternion(newOrientation),
                            center
                        );
                        // transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), center);
                        this.viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(-50, 10, 300));
                    }
                    break;

                default:
                    this.viewer.trackedEntity = null;
                    break;
            }
        };
        // 视角监听
        // preUpdate 获取在场景更新之后以及场景渲染之前立即引发的事件。事件的订阅者将Scene实例作为第一个参数，将当前时间作为第二个参数参数
        this.viewer.scene.preUpdate.addEventListener(traceHandler);
    }

    /**
     * 在两个点位之间添加间隔相同的点位 且绘制路线 返回一个Cartesian3的路线点位数组
     * @param lngLatH 经纬度+高度的数组，长度 > 1
     * @param count 两个经纬度之间的点位
     * @returns
     */
    createRoute = async (lngLatH: number[][], count: number = 30) => {
        // 连个坐标点之间生成差值的数量
        // cartesian3 保存数组
        const cartesians: Cesium.Cartesian3[] = [];
        // 根据坐标计算坐标的差值
        lngLatH.map((item: number[], index: number) => {
            if (index > 0) {
                for (let i = 0; i < count; ++i) {
                    const offset = i / (count - 1);
                    // Cartesian3.lerp差值计算
                    let cartesian3 = Cesium.Cartesian3.lerp(
                        Cesium.Cartesian3.fromDegrees(
                            lngLatH[index - 1][0],
                            lngLatH[index - 1][1],
                            lngLatH[index - 1][2]
                        ),
                        Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]),
                        offset,
                        new Cesium.Cartesian3()
                    );
                    cartesians.push(cartesian3);
                }
            }
        });
        const clampedCartesians = await this.viewer.scene.clampToHeightMostDetailed(cartesians);
        // 绘制线
        this.viewer.entities.add({
            polyline: {
                positions: clampedCartesians,
                arcType: Cesium.ArcType.NONE,
                width: 2,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            },
        });
        return clampedCartesians;
    };

    // 通过使用new Cesium.Cartesian3.lerp(x, y, z)计算两个点之间的差值坐标 再使用new Cesium.CallbackProperty来进行模型移动
    transformModel = async () => {
        const cartesian3Array = await this.createRoute([]);
        let factor = 0;
        // 添加模型
        const vehicleEntity = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
                if (factor > cartesian3Array.length - 1) {
                    factor = 0;
                }
                factor++;
                // 动态更新位置
                return cartesian3Array[factor];
            }, false),
            model: {
                uri: 'http://127.0.0.1:8888/model/xiaofangche.gltf',
                scale: 1,
                minimumPixelSize: 70,
                maximumScale: 70,
            },
            orientation: new Cesium.VelocityOrientationProperty(cartesian3Array),
        });
    };

    // 监听鼠标左击事件
    handlerLeftClick = () => {
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position);
            if (Cesium.defined(pick) && pick.primitive && pick.primitive.type === '3dtiles') {
                let cartesain3 = this.viewer.scene.pickPosition(event.position);
                let lng_lat = cartesian3_to_lng_lat(cartesain3);
                console.log(lng_lat);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
}
