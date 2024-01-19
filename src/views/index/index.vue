<template>
  <div class="app-main">
    <div id="cesiumContainer">
      <div class="draw">
        <button @click="click_draw_polygon('#ffffff')">绘制多边形</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";
import axios from "axios";
// 创建Cesium Viewer
const viewer = ref();
// 初始化地图
const initMap = async () => {
  viewer.value = new Cesium.Viewer("cesiumContainer", {
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false
  });
  // 相机飞入点
  // viewer.value.camera.setView({
  //   // destination: Cesium.Cartesian3.fromDegrees(119.76426786809103, 36.142744517915986, 2000),
  //   destination: Cesium.Cartesian3.fromDegrees(-73.97198, 40.7761, 2000),
  //   orientation: {
  //     // 指向
  //     heading: Cesium.Math.toRadians(0.0),
  //     // -90 视角 由上往下
  //     pitch: Cesium.Math.toRadians(-45),
  //     // 翻滚角
  //     roll: 0.0,
  //   },
  // });
  viewer.value.camera.flyTo({
    // destination: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 1000),
    destination: {
      "x": -2518829.629660936,
      "y": 4848644.594240261,
      "z": 3279401.2055265936
    },
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: Cesium.Math.toRadians(0)
    },
    duration: 3
  }).then(function () {
    viewer.value.camera.rotateLeft(Cesium.Math.toRadians(90), 3);
  })

  var handler = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas);
  handler.setInputAction(async function (movement: any) {
    var pickedFeature = viewer.value.scene.pick(movement.position);
    if (pickedFeature) {
      console.log("pickedFeature", pickedFeature);
      var featuresPromise =
        await viewer.value.imageryLayers.pickImageryLayerFeatures(
          pickedFeature,
          viewer.value.scene
        );
      console.log("featuresPromise", featuresPromise);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // screenHandleClick()
};

// 多边形全部点的数组
var polygon_point_arr: any = [];
// 临时多边形entity
var temporary_polygon_entity: any = null;
var handler: any = null;
/**
 * 开启绘制
 * @param color 颜色
 * @param level 高程
 */
const click_draw_polygon = (color: string) => {
  // 清除可能会用到的监听事件
  if (handler) {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  handler = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);

  //鼠标左键--确定选中点
  handler.setInputAction((event: { position: any }) => {
    // 屏幕坐标转为空间坐标
    const cartesian = viewer.value.camera.pickEllipsoid(
      event.position,
      viewer.value.scene.globe.ellipsoid
    );

    // 判断是否定义（是否可以获取到空间坐标）
    if (Cesium.defined(cartesian)) {
      // 将点添加进保存多边形点的数组中，鼠标停止移动的时添加的点和，点击时候添加的点，坐标一样
      polygon_point_arr.push(cartesian);
      // 判断是否开始绘制动态多边形，没有的话则开始绘制
      if (temporary_polygon_entity == null) {
        // 绘制动态多边形
        draw_dynamic_polygon(color);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //鼠标移动--实时绘制多边形
  handler.setInputAction((event: { endPosition: any }) => {
    // 屏幕坐标转为空间坐标
    const cartesian = viewer.value.camera.pickEllipsoid(
      event.endPosition,
      viewer.value.scene.globe.ellipsoid
    );
    // 判断是否定义（是否可以获取到空间坐标）
    if (Cesium.defined(cartesian)) {
      // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
      if (temporary_polygon_entity) {
        // 只要元素点大于一，每次就删除一个点，因为实时动态的点是添加上去的
        if (polygon_point_arr.length > 1) {
          // 删除数组最后一个元素（鼠标移动添加进去的点）
          polygon_point_arr.pop();
        }
        // 将新的点添加进动态多边形点的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
        polygon_point_arr.push(cartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  //鼠标右键--结束绘制
  handler.setInputAction(() => {
    end_draw_polygon(color);
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};

/**
 * 绘制动态多边形
 * @param color 颜色
 */
const draw_dynamic_polygon = (color: string) => {
  temporary_polygon_entity = viewer.value.entities.add({
    polygon: {
      // 这个方法上面有重点说明
      hierarchy: new Cesium.CallbackProperty(() => {
        // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
        return new Cesium.PolygonHierarchy(polygon_point_arr);
      }, false),
      extrudedHeight: 0, // 多边体的高度（多边形拉伸高度）
      height: 10, // 多边形离地高度
      material: Cesium.Color.fromCssColorString(color + "80"),
    },
  });
};
/**
 * 结束绘制
 */
const end_draw_polygon = (color: any) => {
  // 取消鼠标移动监听
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 清除动态绘制的多边形
  viewer.value.entities.remove(temporary_polygon_entity);
  // 删除保存的临时多边形的entity
  temporary_polygon_entity = null;
  // 绘制结果多边形
  draw_polygon(color);
  // 清空多边形点数组，用于下次绘制
  polygon_point_arr = [];
  // 清除所有事件
  if (handler) {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
};

/**
 * 绘制多边形
 */
// uuid生成
const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const draw_polygon = (color: string) => {
  const id = guid();
  // 删除最后一个动态添加的点，如果鼠标没移动，最后一个和倒数第二个是一样的，所以也要删除
  polygon_point_arr.pop();
  // 三个点以上才能绘制成多边形
  if (polygon_point_arr.length >= 3) {
    console.log(polygon_point_arr);
    viewer.value.entities.add({
      id: id,
      type: "point",
      polygon: {
        hierarchy: polygon_point_arr,
        heightReference: 20, // 多边体的高度（多边形拉伸高度）
        height: 10, // 多边形离地高度
        material: Cesium.Color.fromCssColorString(color + "80"),
        outlineColor: Cesium.Color.RED,
        outlineWidth: 2,
      },
    });
  }
};
// 添加wfs图层
const addWFSTileLayer = () => {
  const wfsParams = {
    service: "WFS",
    version: "1.1.0",
    request: "GetFeature",
    typeName: "tiger:poly_landmarks",
    outputFormat: "application/json",
  };
  // 发送请求获取WFS数据
  axios
    .get("geoserver/geoserver/tiger/ows", {
      params: wfsParams,
      headers: {
        Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
      },
    })
    .then((res) => {
      console.log(res);
      const data = res.data;
      const sourcePromise = Cesium.GeoJsonDataSource.load(data);
      sourcePromise.then(function (dataSource) {
        viewer.value.dataSources.add(dataSource);
        viewer.value.flyTo(dataSource);
      });
    });
};
// 添加点击事件
const screenHandleClick = () => {
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
  handler.setInputAction(async (event: any) => {
    viewer.value.selectedEntity = undefined;
    var pickRay = viewer.value.camera.getPickRay(event.position);
    var featuresPromise =
      await viewer.value.imageryLayers.pickImageryLayerFeatures(
        pickRay,
        viewer.value.scene
      );
    console.log("featuresPromise:", featuresPromise);

    // let pickRay = viewer.value.camera.getPickRay(event.position);
    // try {
    //     clickfeaturesPromise = await viewer.value.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.value.scene);
    //     clickfeaturesPromise = await clickfeaturesPromise[0]['properties']
    //   } catch (error) {
    //     clickfeaturesPromise = '没有选择到图层'
    //   }
    //   console.log("featuresPromise:", clickfeaturesPromise)
    // console.log('属性展示和编辑');
    // //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    // cartesian = viewer.value.camera.pickEllipsoid(movement.position, ellipsoid);
    // if (cartesian) {
    //   //将笛卡尔坐标转换为地理坐标
    //   var cartographic = ellipsoid.cartesianToCartographic(cartesian);
    //   //将弧度转为度的十进制度表示
    //   var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    //   var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    //   var point = longitudeString + ',' + latitudeString;
    //   console.log(point);
    //   // queryWFSByPoint(geoserverUrl, point, param.typeName, ShowAndEditWfsLayerAttributes);
    // }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

/*通过点选来选择并获取图层对象
 ***@method queryWFSByPoint
 ***@param geoserverUrl Geoserver发布的WFS服务地址
 ***@param point 查询的位置点
 ***@param typeName 图层名称
 ***@return 返回值是点选位置查询获取的的图层对象
 */
function queryWFSByPoint(
  geoserverUrl: string,
  point: string,
  typeName: string,
  callback
) {
  var filter =
    '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
  filter += "<Intersects>";
  filter += "<PropertyName>the_geom</PropertyName>";
  filter += "<gml:Point>";
  filter += "<gml:coordinates>" + point + "</gml:coordinates>";
  filter += "</gml:Point>";
  filter += "</Intersects>";
  filter += "</Filter>";
  var param = {
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: typeName,
    outputFormat: "application/json",
    filter: filter,
  };
  $.ajax({
    url: geoserverUrl + "/ows" + getParamString(param, geoserverUrl),
    async: true,
    type: "GET",
    dataType: "json",
    success(result) {
      callback(geoserverUrl, result); //返给回调函数ShowAndEditWfsLayer
    },
    error(err) {
      console.log(err);
    },
  });
}

onMounted(() => {
  initMap();
  // addWFSTileLayer()
});
</script>

<style lang="scss" scoped>
#cesiumContainer {
  height: 100%;

  .draw {
    position: absolute;
    z-index: 999;
  }
}
</style>
