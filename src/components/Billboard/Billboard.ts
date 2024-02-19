import * as Cesium from 'cesium';
import icon1 from '@/assets/images/icon4.png';
import Label from './index.vue';
import { defineComponent, createApp } from 'vue';
import { createSlotDialog, createPopup } from './dialog/index';
import { App } from 'vue';

// 当前选中的图形id
export class Billboard {
    viewer: any;
    handler: any;
    isDrawPoint: boolean;
    popupApp: App | null;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.isDrawPoint = false; // 是否开启绘制
        this.popupApp = null; // 是否开启绘制
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delDemoEntity = (name: string) => {};
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat
     * @returns
     */
    drawPoint = (cartesian3: Cesium.Cartesian3) => {
        //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
        const entityPoint = this.viewer.entities.add({
            position: cartesian3,
            billboard: {
                image: icon1, //图标地址
                // heightReference: Cesium.HeightReference.NONE,
                // 位置固定不会因为旋转视角发生偏移
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                // 设置距离控制可见度
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2100),
                // 设置近大远小
                scaleByDistance: new Cesium.NearFarScalar(0, 0.3, 1050, 0.1),
            },
            // label: {
            //     scale: 1,
            //     font: "bolder 16px sans-serif",
            //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            //     text: '摄像头',//图标名称
            //     fillColor: Cesium.Color.fromCssColorString("#ffffff"),
            // },
            // type 类型/虽然该字段在Entity类型中不存在，但你依旧可以添加其他字段，并且在查询时该字段也会获取到
            type: 'billboard',
        });
        this.isDrawPoint = false;
        return entityPoint;
    };
    // 绘制弹框
    drawmessageBox = (cartesian3: Cesium.Cartesian3) => {
        const options = {
            title: '标题2',
            id: '002',
            state: '002',
        };
        createPopup(this.viewer, cartesian3, options, () => {});
        // var cartographic = Cesium.Cartographic.fromCartesian(cartesian3); //笛卡尔转换为弧度
        // //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
        // var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        // var height = cartographic.height;
        // // 关闭弹框
        // if (this.popupApp) {
        //     this.popupApp.unmount();
        // }

        // const popDiv = document.createElement('div');
        // const widgetEl = this.viewer.cesiumWidget.container;
        // widgetEl.appendChild(popDiv);
        // const options = {
        //     title: '标题2',
        //     id: '002',
        //     state: '002',
        // };
        // this.popupApp = createSlotDialog(this.viewer, options, () => {});
        // // const unmount = this.popupApp.unmount;
        // // this.popupApp.unmount = () => {
        // //     unmount();
        // //     if (widgetEl.contains(popDiv)) {
        // //         popDiv.remove();
        // //     }
        // // };
        // this.popupApp.mount(popDiv);
        // popDiv.style.position = 'absolute';
        // // this.viewer.scene.postRender.addEventListener(() => {
        // //     const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        // //     const canvasHeight = this.viewer.scene.canvas.height;
        // //     const windowPosition = new Cesium.Cartesian2();
        // //     Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, gisPosition, windowPosition);
        // //     popDiv.style.bottom = canvasHeight - windowPosition.y + 225 + 'px';
        // //     const elWidth = popDiv.offsetWidth;
        // //     // popDiv.style.left = windowPosition.x - elWidth / 2 + 'px';
        // //     popDiv.style.left = windowPosition.x + 'px';
        // // }, this);
        // const postRender = () => {
        //     console.log(1111);
        //     const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        //     const canvasHeight = this.viewer.scene.canvas.height;
        //     const windowPosition = new Cesium.Cartesian2();
        //     Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, gisPosition, windowPosition);
        //     popDiv.style.bottom = canvasHeight - windowPosition.y + 225 + 'px';
        //     // const elWidth = popDiv.offsetWidth;
        //     // popDiv.style.left = windowPosition.x - elWidth / 2 + 'px';
        //     popDiv.style.left = windowPosition.x + 'px';
        // };
        // // 移除addEventListener监听事件
        // this.viewer.scene.postRender.removeEventListener(postRender, this);
        // // 开启监听
        // this.viewer.scene.postRender.addEventListener(postRender, this);
        // return;
    };

    //场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致
    postRender = (popDiv: HTMLElement, cartesian3: Cesium.Cartesian3) => {
        console.log(111);
        console.log(popDiv);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3); //笛卡尔转换为弧度
        //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        const canvasHeight = this.viewer.scene.canvas.height;
        const windowPosition = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, gisPosition, windowPosition);
        // 修改bottom left位置
        popDiv.style.bottom = canvasHeight - windowPosition.y + 225 + 'px';
        const elWidth = popDiv.offsetWidth;
        // popDiv.style.left = windowPosition.x - elWidth / 2 + 'px';
        popDiv.style.left = windowPosition.x + 'px';
    };
    // 添加弹框
    addmessageBox = (cartesian3: Cesium.Cartesian3) => {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3); //笛卡尔转换为弧度
        //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        const div = document.createElement('div');
        div.id = 'id';
        div.style.position = 'absolute';
        div.style.width = '332px';
        const HTML = `
            <div style="background:#fff;color:#333333;padding:14px">
                <div style="font-weight: 700;">
                <input style="width: 100%;padding-left: 5px" />
            </div>
        `;
        div.innerHTML = HTML;
        this.viewer.cesiumWidget.container.appendChild(div);
        this.viewer.scene.postRender.addEventListener(() => {
            const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
            const canvasHeight = this.viewer.scene.canvas.height;
            const windowPosition = new Cesium.Cartesian2();
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, gisPosition, windowPosition);
            div.style.bottom = canvasHeight - windowPosition.y + 25 + 'px';
            const elWidth = div.offsetWidth;
            div.style.left = windowPosition.x - elWidth / 2 + 'px';
        }, this);
    };
    // 开启绘制
    draw = () => {
        this.handlerLeftClick();
        // this.viewer._element.style.cursor = 'pointer';
        this.isDrawPoint = true;
    };
    // 结束绘制
    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            // 判断是否在地球上点击
            const position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            const ray = this.viewer.scene.camera.getPickRay(event.position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian3: Cesium.Cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian3)) {
                return;
            }
            // 根据位置信息选择场景上的物体
            let pick: any = this.viewer.scene.pick(event.position);
            if (this.isDrawPoint) {
                if (
                    Cesium.defined(pick) &&
                    pick.id instanceof Cesium.Entity &&
                    pick.id.type === 'billboard'
                ) {
                    console.log(pick.id);
                    console.log(position);
                    let cartesian3 = pick.id.position._value;
                    // this.addmessageBox(cartesian3);
                    this.drawmessageBox(cartesian3);
                } else {
                    // 获取模型坐标
                    let position = this.viewer.scene.pickPosition(event.position);
                    console.log(position);
                    console.log(pick);
                    // 判断是点击在模型还是地形上
                    if (pick && position && !pick.id) {
                        console.log(position);
                        const point = this.drawPoint(position);
                    } else {
                        const point = this.drawPoint(cartesian3);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
}
