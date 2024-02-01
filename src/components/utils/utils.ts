import * as Cesium from 'cesium';

// 根据笛卡尔坐标获取两个点直接的距离(米)
export const two_cartesian3_m = (startCoordinate: Cesium.Cartesian3, endCoordinate: Cesium.Cartesian3) => {
    const distance = Cesium.Cartesian3.distance(startCoordinate, endCoordinate);
    return distance;
};

// 根据经纬度坐标获取两个点直接的距离(米)
export const two_lng_lat_m = (startLngLat: Cesium.Cartographic, endLngLat: Cesium.Cartographic) => {
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(startLngLat, endLngLat);
    const distance = geodesic.surfaceDistance;
    return distance;
};

// 世界坐标转经纬度（Cartesian3）-->WGS84坐标系
export const cartesian3_to_lng_lat = (cartesian3: Cesium.Cartesian3) => {
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var height = cartographic.height;
    return [lng, lat, height];
};

// 经纬度转世界坐标
export const lng_lat_to_cartesian3 = (lng: number, lat: number, height: number) => {
    var cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat, height);
    return cartesian3;
};

// 获取屏幕中心点的位置 -> cartesian2 屏幕坐标 / cartesian3 笛卡尔坐标
export const get_clientCenter_cartesian2 = (viewer: Cesium.Viewer) => {
    const cartesian2 = new Cesium.Cartesian2(
        Math.floor(viewer.canvas.clientWidth / 2),
        Math.floor(viewer.canvas.clientHeight / 2)
    );
    const cartesian3 = viewer.scene.camera.pickEllipsoid(cartesian2, viewer.scene.globe.ellipsoid);
    return { cartesian2, cartesian3 };
};

// 计算两个笛卡尔坐标的中心点坐标
export const get_two_center = (point1, point2) => {

};
