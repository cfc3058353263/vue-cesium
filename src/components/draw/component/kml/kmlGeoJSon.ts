import * as Cesium from "cesium";

export default class kmlGeoJSon {
    viewer: any;
    handler: any;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
    }
    // Cesium加载GeoJson数据
    geoJsonDataSource = () => {
        let dataGeo = Cesium.GeoJsonDataSource.load("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
            //设置样式
            {
                stroke: Cesium.Color.RED,
                fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
                strokeWidth: 4,
            });
        //dataGeo Promise对象加载完毕后执行
        dataGeo.then((dataSources) => {
            console.log(dataSources);
            this.viewer.dataSources.add(dataSources);
            // 获取datasources中的实体
            let entities = dataSources.entities.values;
            //获取每一个实体
            entities.forEach((entity: any, i) => {
                //设置随机颜色
                entity.polygon.material = new Cesium.ColorMaterialProperty(
                    Cesium.Color.fromRandom({
                        alpha: 1,
                    })
                );
                entity.polygon.outline = false;
                //随机高度（5个级别）
                let randomNum = parseInt(Math.random() * 5);
                //挤出高度
                entity.polygon.extrudedHeight = 100000 * randomNum;
            });
        });
        // 添加数据
        this.viewer.dataSources.add(dataGeo)
    }
    // kml数据加载
    KmlDataSource = () => {
        // let kmlData = Cesium.KmlDataSource.load('http://localhost:8080/geoserver/tiger/wms/kml?layers=tiger%3Atiger_roads', {
        let kmlData = Cesium.KmlDataSource.load('geoserver/geoserver/tiger/wms/kml?layers=tiger:tiger_roads', {
            camera: this.viewer.scene.camera,
            canvas: this.viewer.scene.canvas,
            screenOverlayContainer: this.viewer.container,
        });
        kmlData.then((dataSource) => {
            this.viewer.dataSources.add(dataSource);
        });
    }
}