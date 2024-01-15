import * as Cesium from "cesium";
import { reactive, toRefs } from "vue";

export class Circle {
  viewer: any;
  handler: any;
  isDrawCircle: any;
  idEditCircle: any;
  circle: any;
  centerPoint: any;
  borderPoint: any;
  constructor(viewer: any, handler: any) {
    this.viewer = viewer;// cesium 实例
    this.handler = handler;// cesium 鼠标监听事件
    this.isDrawCircle = false;// 是否开启绘制
    this.idEditCircle = false;// 是否开启编辑
    this.circle = null;// 圆实体
    this.centerPoint = null;// 圆的中心点实例
    this.borderPoint = null;// 圆的边点实例
  }
  /**
   * 删除点与线实体
   * @param name 判断删除的实体类型
   */
  delDemoEntity = (name: string) => { };

  /**
   * 点击绘制点,并返回点的实例
   * @param lonAndLat
   * @returns
   */
  drawPoint = (cartesian3: Cesium.Cartesian3) => {
    // console.log(cartesian3)
    const entityPoint = this.viewer.entities.add({
      position: cartesian3,
      name: "point_name",
      point: {
        color: Cesium.Color.fromCssColorString("#fc3d4a"),
        outlineColor: Cesium.Color.fromCssColorString("#fc3d4a"),
        pixelSize: 11,
      },
    });
    return entityPoint;
  };
  /**
   * 绘制圆
   * @param cartesian3
   */
  drawCircle = (cartesian3: Cesium.Cartesian3, radius) => {
    const entityEllipse = this.viewer.entities.add({
      position: new Cesium.CallbackProperty(() => cartesian3, false),
      name: "rangeCircle",
      ellipse: {
        semiMinorAxis: new Cesium.CallbackProperty(() => radius, false), //指定椭圆的长半轴
        semiMajorAxis: new Cesium.CallbackProperty(() => radius, false), //指定椭圆的短半轴
        material: Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.3)"),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(
          "rgba(255, 255, 255, 0.5)"
        ),
        outlineWidth: 3.0,
      },
      type: "circle",
    });
    return entityEllipse
  };
  // 根据圆心和半径计算锚点的经纬度
  getDragPosition = (center: any, radius: any) => {
    let dragPosition = null;
    const ellRadius = 6371; // 地球半径，单位千米
    const distance = radius / 1000; // 将周边范围单位转化为千米
    const dlng =
      2 *
      Math.asin(
        Math.sin(distance / (2 * ellRadius)) /
        Math.cos((center.latitude * Math.PI) / 180)
      );
    const dlat = distance / ellRadius;
    const parseLng = (dlng * 180) / Math.PI;
    const parseLat = (dlat * 180) / Math.PI;
    dragPosition = {
      parseLng: parseLng,
      parseLat: parseLat,
    };
    return dragPosition;
  };
  // 只计算起点和终点的距离
  getSpaceDistance = (cartesian3: Cesium.Cartesian3) => {
    var radius = 300; // 设置圆的半径（单位为米）
    var startAngle = 0; // 起始角度（单位为弧度）
    var endAngle = Math.PI * 2; // 结束角度（单位为弧度）
    var pointOnCircle = Cesium.EllipseGeometry.computeRectangle({
      center: cartesian3,
      semiMajorAxis: radius,
      semiMinorAxis: radius,
    });
    console.log(pointOnCircle);
  };
  // 根据经纬度计算两点之前的直线距离
  two_points_distance = (start_point, end_point) => {
    // 经纬度转换为世界坐标
    var start_position = Cesium.Cartesian3.fromDegrees(
      start_point.lon,
      start_point.lat,
      start_point.height
    );
    var end_position = Cesium.Cartesian3.fromDegrees(
      end_point.lon,
      end_point.lat,
      end_point.height
    );
    // 返回两个坐标的距离（单位：米）
    return Cesium.Cartesian3.distance(start_position, end_position);
  };
  /**
   * 开启绘制
   */
  draw = () => {
    this.isDrawCircle = true;
    this.idEditCircle = false;
    this.clearHandler()
    this.handlerLeftClick();
    this.handlerMouseMove();
    this.handerRightClick();
  };
  /**
   * 开启编辑
   */
  edit = () => {
    this.isDrawCircle = false;
    this.idEditCircle = true;
    this.clearHandler()
    this.handlerLeftClick();
    this.handlerMouseMove();
    this.handerRightClick();
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
  }
  /**
   * 删除左键/移动/右键事件
   */
  clearHandler = () => {
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }
  // 监听鼠标左键点击事件
  handlerLeftClick = () => {
    this.handler.setInputAction((event: any) => {
      let pick = this.viewer.scene.pick(event.position);
      // 开启绘制
      if (this.isDrawCircle && !this.circle) {
        const cartesian3 = this.viewer.scene.camera.pickEllipsoid(
          event.position
        );
        // 添加圆的中心点
        this.centerPoint = this.drawPoint(cartesian3)
        // 添加圆边上的点的实例
        this.borderPoint = this.drawPoint(cartesian3)
        // 绘制圆
        this.circle = this.drawCircle(cartesian3, 1);
        // this.isDrawCircle = false;
      } else if (this.idEditCircle && pick.id && pick.id.type === "circle") {
        const cartesian3 = pick.id.position._callback();
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        const dragPosition = this.getDragPosition(
          cartographic,
          pick.id.ellipse.semiMinorAxis._value
        );
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        this.drawPoint(
          Cesium.Cartesian3.fromDegrees(
            longitude + dragPosition.parseLng,
            latitude,
            height
          )
        );
        this.getSpaceDistance(cartesian3);
        this.circle = pick.id;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  // 监听鼠标移动事件
  handlerMouseMove = () => {
    this.handler.setInputAction((event: any) => {
      if (this.isDrawCircle && this.circle) {
        let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
        this.borderPoint.position = cartesian3
        // 根据笛卡尔坐标计算两点之前的直线距离
        const distance = Cesium.Cartesian3.distance(this.borderPoint.position._value, this.centerPoint.position._value)
        if (distance > 0) {
          this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => distance, false)
          this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => distance, false)
        }
      }
      // if (this.idEditCircle && this.circle) {
      //   let cartesian3 = this.viewer.scene.camera.pickEllipsoid(
      //     event.endPosition
      //   );
      //   this.circle.position = new Cesium.CallbackProperty(
      //     () => cartesian3,
      //     false
      //   );
      // }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  };
  // 监听鼠标右键点击事件
  handerRightClick = () => {
    this.handler.setInputAction((event: any) => {
      if (this.isDrawCircle) {
        this.isDrawCircle = false;
        this.clearData();
        this.clearHandler()
      } else if (this.idEditCircle) {
        this.idEditCircle = false;
        this.clearData();
        this.clearHandler()
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  };
}
