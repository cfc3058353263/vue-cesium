import { createApp, CSSProperties } from 'vue';
import Dialog from './Dialog.vue';
import * as Cesium from 'cesium';

let popupApp: any;
let postRender: any;
export function createSlotDialog(viewer: Cesium.Viewer, options: any, template: Record<string, any>) {
    if (popupApp) {
        popupApp.unmount();
    }
    if (!template) {
        template = {};
    }
    const app = createApp({
        render() {
            return (
                <Dialog remove={removeFn} title={options.title} id={options.id} state={options.state}>
                    {template}
                </Dialog>
            );
        },
    });
    function removeFn() {
        app.unmount();
        viewer.scene.postRender.removeEventListener(postRender);
    }
    return app;
}

export function createPopup(
    viewer: Cesium.Viewer,
    cartesian3: Cesium.Cartesian3,
    options: any,
    template: Record<string, any>
) {
    // 创建弹框
    popupApp = createSlotDialog(viewer, options, template);
    const popDiv = document.createElement('div');
    popDiv.style.position = 'absolute';
    const widgetEl = viewer.cesiumWidget.container;
    widgetEl.appendChild(popDiv);
    popupApp.mount(popDiv);
    // 移除addEventListener监听事件
    postRender && viewer.scene.postRender.removeEventListener(postRender);
    // 监听事件
    postRender = () => {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3); //笛卡尔转换为弧度
        //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        const canvasHeight = viewer.scene.canvas.height;
        const windowPosition = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, gisPosition, windowPosition);
        popDiv.style.bottom = canvasHeight - windowPosition.y + 225 + 'px';
        popDiv.style.left = windowPosition.x + 'px';
    };
    // 开启监听
    viewer.scene.postRender.addEventListener(postRender);
}
