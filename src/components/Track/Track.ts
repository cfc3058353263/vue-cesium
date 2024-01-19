import * as Cesium from "cesium";
import yjwz from "@/assets/images/yingjiwuzi.png";
import { cartesian3_to_lng_lat, two_cartesian3_m } from '@/components/utils/utils.ts'

export class Track {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    position1: any; // cesium 鼠标监听事件
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler
        this.position1 = null
    }
    // 添加DataSource例如线路或经纬度
    craterDataSource(clampedCartesians: any) {
        // 路径数据
        // var lujingdata = [
        //     [117.4603186710001, 31.14388249900003, 11.147400000001653],
        //     // [117.45946237800001, 31.143739847000063, 11.108399999997346],
        //     // [117.45859906800001, 31.143571198000075, 10.89079999999376],
        //     // [117.45789337300005, 31.143422075000046, 11.12170000000333],
        //     // [117.4571119630001, 31.143350937000037, 11.545700000002398],
        //     // [117.45620292500007, 31.143325030000028, 11.529899999994086],
        //     // [117.45545284400009, 31.143363754000063, 11.038100000005215],
        //     // [117.45473256600008, 31.143448056000068, 10.86380000000645],
        //     // [117.45399052200003, 31.143623321000064, 11.345600000000559],
        //     // [117.45347615200001, 31.14381135600007, 11.687300000005052],
        //     [117.45292459000007, 31.144031608000034, 12.106100000004517],
        //     // [117.45192097000006, 31.144426226000064, 12.842399999994086],
        //     // [117.45065835500009, 31.144954275000032, 12.712299999999232],
        //     // [117.44980033200011, 31.145266268000057, 12.504899999999907],
        //     [117.44943370300007, 31.145413392000023, 12.731599999999162],
        //     // [117.44920128900003, 31.145382554000037, 12.967699999993783],
        //     // [117.44897692800009, 31.144980649000047, 14.909599999999045],
        //     // [117.44872415000009, 31.14449598400006, 14.55899999999383],
        //     // [117.44851592000009, 31.144125416000065, 14.410999999992782],
        //     // [117.44848024700002, 31.14392828000007, 14.475800000000163],
        //     // [117.44948683700011, 31.14350793500006, 14.507400000002235],
        //     // [117.45089297600009, 31.142959855000072, 14.290399999998044],
        //     // [117.45149371900004, 31.142693826000027, 14.127099999997881],
        //     // [117.45166848000008, 31.142571364000048, 15.52610000000277],
        //     [117.4516358520001, 31.142433625000024, 14.0341000000044],
        //     [117.45082070700005, 31.140899211000033, 13.289099999994505],
        // ]
        // var lujingdata = [
        //     [113.06399374973503, 22.646074479296296, 7.858175112489365],
        //     [113.05990887070467, 22.646882406734232, 4.8845174953085895]
        // ]
        var lujingdata = clampedCartesians
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
        lujingdata.map((pos, index) => {
            // 速度
            let s = 0
            if (index > 0) {
                const v = 10
                const m = two_cartesian3_m(lujingdata[index], lujingdata[index - 1])
                s = m / v
            }
            // 每一个时间点间隔5秒
            var time = new Date(stoptime.getTime() + s * 1000);
            // 结束时间
            stoptime = time;
            // var position = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], pos[2])
            var position = pos
            // 利用cesium中SampledPositionProperty的addSample方法将数据中经纬度与时间关联
            // 朱利安时间 / 笛卡尔坐标
            // 将标准时间转换成julianDate格式
            property.addSample(Cesium.JulianDate.fromDate(time), position);
        })
        // 设置差值
        property.setInterpolationOptions({
            // 设置差值
            interpolationDegree: 0.0001,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        });

        var entities = this.viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromDate(starttime),
                stop: Cesium.JulianDate.fromDate(new Date(stoptime))
            })]),
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
                    color: Cesium.Color.GREEN
                }),
                width: 10
            },
            // 模型添加
            model: {
                uri: 'http://127.0.0.1:8888/model/xiaofangche.gltf',
                scale: 1,
                minimumPixelSize: 70,
                maximumScale: 70
            },
            viewFrom: new Cesium.Cartesian3(-100, 0, 20), // 观察位置的偏移量
            //模型朝向
            orientation: new Cesium.VelocityOrientationProperty(property),
        });
        // 
        // this.viewer.clock.onTick.addEventListener((tick) => {
        //     entitydd.position.getValue(tick.currentTime);
        //     //  console.log(entitydd.position.getValue(tick.currentTime));
        //     //转为经纬度
        //     var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(entitydd.position.getValue(tick.currentTime))
        //     cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude)
        //     cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude)
        //     // console.log(cartographic);
        //     // entitydd.label.text = Number(cartographic.longitude).toFixed(4) + "," + Number(cartographic.latitude).toFixed(4);
        // })
        // entities.position.setInterpolationOptions({
        //     interpolationDegree: 10,
        //     interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        // })
        // this.viewer.zoomTo(entities)
        // 视角跟随 注意:当使用该方法活其他视角切换会不生效
        this.viewer.trackedEntity = entities;
        //修改时间轴的当前时间
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(starttime);
        // 结束时间
        this.viewer.clock.stopTime = Cesium.JulianDate.fromDate(new Date(stoptime));
        // 时间结束了，再继续重复来一遍 
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        // 重复播放
        this.viewer.clock.shouldAnimate = true;
        // preUpdate 监听的方法
        const traceHandler = () => {
            // 当场景更新时获取entities的position函数的设定相机位置。
            let center = entities.position.getValue(
                this.viewer.clock.currentTime
            );
            // 当场景更新时获取entities的模型
            let orientation = entities.orientation.getValue(
                this.viewer.clock.currentTime
            )
            if (center && orientation) {
                // this.setCameraPosition(center, this.viewer);
                let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), center);
                const target = new Cesium.Cartesian3.fromDegrees(117.460, 31.143, 300)
                const vector = new Cesium.Cartesian3(center.x - target.x, center.y - target.y, 100)
                // // 笛卡尔转换为弧度
                // var cartographic = Cesium.Cartographic.fromCartesian(center);
                // var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                // var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                this.viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(-100, 0, 50))
                // this.viewer.camera.lookAtTransform(transform, vector)
                // this.viewer.camera.lookAtTransform(transform, vector)
                // var heading = Cesium.Math.toRadians(-100.0);
                // var pitch = Cesium.Math.toRadians(-50.0);
                // var range = 50.0;
                // this.viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading,pitch,range))
                // this.viewer.camera.lookAt(center, vector)
            }
        }
        // 视角监听 
        // preUpdate 获取在场景更新之后以及场景渲染之前立即引发的事件。事件的订阅者将Scene实例作为第一个参数，将当前时间作为第二个参数参数
        // this.viewer.scene.preUpdate.addEventListener(traceHandler)
        // this.viewer.clock.onTick.addEventListener(traceHandler)
    }

    /**
     * @description  坐标转换
     * @param point radius下的WGS84坐标
     * @return degrees下的WGS84坐标
     */
    cartesian3ToWGS84(point) {
        const cartographic = Cesium.Cartographic.fromCartesian(point)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)
        const alt = cartographic.height
        return {
            longitude: lng,
            latitude: lat,
            height: alt
        }
    }

    /**
     * @description 设置相机位置
     * @param {cartesian3} position
     * @param {object} options
     * @memberof Roaming
     */
    setCameraPosition(position, options) {
        if (position) {
            //最新传进来的坐标（后一个位置）
            this.position2 = this.cartesian3ToWGS84(position)
            let heading = 0;
            //前一个位置点位
            if (this.position1) {
                //计算前一个点位与第二个点位的偏航角
                heading = this.bearing(this.position1.latitude, this.position1.longitude, this.position2.latitude, this.position2.longitude)
            }
            this.position1 = this.cartesian3ToWGS84(position)
            if (position) {
                console.log(position)
                console.log(this.position1)

                const dynamicHeading = Cesium.Math.toRadians(heading)
                const pitch = Cesium.Math.toRadians(options.pitch || -20.0)
                const range = options.range || 2000.0
                this.viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(dynamicHeading, pitch, range))
            }
        }
    }

    /**
     * @name bearing 计算两点的角度heading
     * @param startLat 初始点的latitude
     * @param startLng 初始点的longitude
     * @param destLat 第二个点的latitude
     * @param destLng 第二个点的longitude
     * @return {number} heading值
     */
    bearing(startLat, startLng, destLat, destLng) {
        startLat = Cesium.Math.toRadians(startLat)
        startLng = Cesium.Math.toRadians(startLng)
        destLat = Cesium.Math.toRadians(destLat)
        destLng = Cesium.Math.toRadians(destLng)
        const y = Math.sin(destLng - startLat) * Math.cos(destLat)
        const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
        const brng = Math.atan2(y, x)
        const brngDgr = Cesium.Math.toDegrees(brng)
        return (brngDgr + 360) % 360
    }
    sampleHeights = async () => {
        // Cesium.Cartesian3.fromDegrees(113.05990887070467, 22.646882406734232, 4.8845174953085895)
        const lnglat = [
            [
                113.06395692918217,
                22.646103761101813,
                7.893947268275958
            ],
            [
                113.06318174241878,
                22.646198467234374,
                6.220578897300639
            ],
            [
                113.0632511863859,
                22.646465666216077,
                26.25861487218874
            ]
        ]
        const cartesian1 = Cesium.Cartesian3.fromDegrees(113.06400049687993, 22.646068571421846, 8.009538984449595)
        const cartesian2 = Cesium.Cartesian3.fromDegrees(113.06098267893496, 22.646507448206656, 4.935609565793858)
        const cartesian3 = Cesium.Cartesian3.fromDegrees(113.0632572885776, 22.646431223148532, 20.182961423093143)
        // const cartesian1 = Cesium.Cartesian3.fromDegrees(113.06399374973503, 22.646074479296296, 7.858175112489365)
        // const cartesian2 = Cesium.Cartesian3.fromDegrees(113.05990887070467, 22.646882406734232, 4.8845174953085895)
        // 连个坐标点之间生成差值的数量
        const count = 10;
        // cartesian3 保存数组
        const cartesians:Cesium.Cartesian3[] = [];
        // 根据坐标计算坐标的差值
        lnglat.map((item: number[], index: number) => {
            if (index > 0) {
                for (let i = 0; i < count; ++i) {
                    const offset = i / (count - 1);
                    // Cartesian3.lerp差值计算
                    let cartesian3 = Cesium.Cartesian3.lerp(
                        Cesium.Cartesian3.fromDegrees(lnglat[index - 1][0], lnglat[index - 1][1], lnglat[index - 1][2]),
                        Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]),
                        offset,
                        new Cesium.Cartesian3()
                    );
                    cartesians.push(cartesian3);
                }
            }
        })
        // for (let i = 0; i < count; ++i) {
        //     const offset = i / (count - 1);
        //     cartesians[i] = Cesium.Cartesian3.lerp(
        //         cartesian1,
        //         cartesian2,
        //         offset,
        //         new Cesium.Cartesian3()
        //     );
        // }

        const clampedCartesians = await this.viewer.scene.clampToHeightMostDetailed(cartesians);
        // for (let i = 0; i < count; ++i) {
        //     this.viewer.entities.add({
        //         position: clampedCartesians[i],
        //         ellipsoid: {
        //             radii: new Cesium.Cartesian3(0.2, 0.2, 0.2),
        //             material: Cesium.Color.RED,
        //         },
        //     });
        // }
        console.log(clampedCartesians)
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
        })
        this.craterDataSource(clampedCartesians)
    }
    // 监听鼠标左击事件
    handlerLeftClick = () => {
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position)
            if (Cesium.defined(pick) && pick.primitive && pick.primitive.type === '3dtiles') {
                console.log(pick)
                let cartesain3 = this.viewer.scene.pickPosition(event.position);
                let lng_lat = cartesian3_to_lng_lat(cartesain3)
                console.log(lng_lat)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
}

