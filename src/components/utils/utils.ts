import * as Cesium from "cesium";

// 根据笛卡尔坐标获取两个点直接的距离(米)
export const two_cartesian3_m = (startCoordinate: Cesium.Cartesian3, endCoordinate: Cesium.Cartesian3) => {
    const distance = Cesium.Cartesian3.distance(startCoordinate, endCoordinate)
    return distance
}

// 根据经纬度坐标获取两个点直接的距离(米)
export const two_lng_lat_m = (startLngLat: Cesium.Cartographic, endLngLat: Cesium.Cartographic) => {
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(startLngLat, endLngLat);
    const distance = geodesic.surfaceDistance
    return distance
}

// 世界坐标转经纬度（Cartesian3）-->WGS84坐标系
export const cartesian3_to_lng_lat = (cartesian3: Cesium.Cartesian3) => {
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var height = cartographic.height;
    return [lng, lat, height]
}

// 经纬度转世界坐标
export const lng_lat_to_cartesian3 = (lng: number, lat: number, height: number) => {
    var cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat, height);
    return cartesian3
}


