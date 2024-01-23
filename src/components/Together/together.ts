import * as Cesium from "cesium";
import LocationRed from '@/assets/images/location-red.png';
import LocationOrange from '@/assets/images/location-orange.png';
import LocationGreen from '@/assets/images/location-green.png';
import LocationLight from '@/assets/images/location-light.png';
import LocationBlue from '@/assets/images/location-blue.png';
import LocationBlueMiddle from '@/assets/images/location-blue-middle.png';

//生成自定义图标和文字
export const computeImgAndTxt = (url: string, label: string, size: number) => {
    // 创建画布对象
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    const promise = new Cesium.Resource.fetchImage(url).then(image => {
        // 异常判断
        try {
            ctx && ctx.drawImage(image, 0, 0);
        } catch (e) {
            console.log(e);
        }
        if(ctx){
            // 渲染字体
            // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
            ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
            ctx.font = 'bold 26px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, size / 2, size / 2);
        }
        return canvas;
    });
    return promise;
};

const data = [
    {lng: -73.97748760091288, lat: 40.791306549042616, img: LocationBlueMiddle},
    {lng: -73.97520609644867, lat: 40.795850255323415, img: LocationBlueMiddle},
    {lng: -73.97429916219376, lat: 40.79369862765062, img: LocationBlueMiddle},
    {lng: -73.97272460862781, lat: 40.79441671370217, img: LocationBlueMiddle},
    {lng: -73.97172460462781, lat: 40.79541671350217, img: LocationBlueMiddle},
]

// 点聚合功能效果
export const pointTogether = (viewer:Cesium.Viewer) => {
    // 可用于手动或者自定义管理一组实体的 DataSource 实现。
    const customDataSource = new Cesium.CustomDataSource('pointTogether');
    data.map((item, index)=>{
        customDataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat, 0),
            billboard: {
                image: item.img,
                color: Cesium.Color.WHITE.withAlpha(0.8),
                height: 52,
                width: 34,
                // 逆时针旋转
                // rotation: 20,
                // 大小是否以米为单位
                sizeInMeters: false,
                // 相对于坐标的垂直位置
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                // // 相对于坐标的水平位置
                // horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
                pixelOffset: new Cesium.Cartesian2(-6, 6),
                // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
                scale: 1.0,
                //显示在距相机的距离处的属性，多少区间内是可以显示的
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                //     item.minDistance,
                //     item.maxDistance
                // ),
                // 是否显示
                show: true,
            },
        });
    })
    // 添加到dataSources
    viewer.dataSources.add(customDataSource).then(dataSource => {
        // 设置聚合参数
        dataSource.clustering.enabled = true; // 是否聚合
        dataSource.clustering.pixelRange = 35; //聚合范围（单位px）
        dataSource.clustering.minimumClusterSize = 3; //最小聚合数值（小于等于该数值，不聚合）
    })
     // 添加监听函数
     customDataSource.clustering.clusterEvent.addEventListener(
        function(clusteredEntities, cluster) {
            // 关闭自带的显示聚合数量的标签
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            console.log(clusteredEntities)
            // 根据聚合数量的多少设置不同层级的图片以及大小
            if (clusteredEntities.length >= 50) {
                cluster.billboard.image = computeImgAndTxt(LocationRed, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 100;
                cluster.billboard.height = 100;
            } else if (clusteredEntities.length >= 40) {
                cluster.billboard.image = computeImgAndTxt(LocationOrange, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 95;
                cluster.billboard.height = 95;
            } else if (clusteredEntities.length >= 30) {
                cluster.billboard.image = computeImgAndTxt(LocationGreen, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 90;
                cluster.billboard.height = 90;
            } else if (clusteredEntities.length >= 20) {
                cluster.billboard.image = computeImgAndTxt(LocationLight, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 85;
                cluster.billboard.height = 85;
            } else if (clusteredEntities.length >= 10) {
                cluster.billboard.image = computeImgAndTxt(LocationBlue, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 80;
                cluster.billboard.height = 80;
            } else {
                cluster.billboard.image = computeImgAndTxt(LocationBlue, clusteredEntities.length.toString(), 108);
                cluster.billboard.width = 70;
                cluster.billboard.height = 70;
            }
        }
    )
}