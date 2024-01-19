import * as Cesium from "cesium";
import { reactive, toRefs } from "vue";
import icon1 from '@/assets/images/icon4.png'

const data = reactive({
    drawer: false, // 抽屉
    form: {
        id: '',
        name: '',
        show: true,
        height: 0,
        color: '#ffffff80'
    }
})
export const { drawer, form } = toRefs(data)

// 当前选中的图形id
let pointId: string | null = null
export class Billboard {
    viewer: any;
    handler: any;
    isDrawPoint: boolean;
    pointList: [];
    pointId: string | null;
    pointInfo: any;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.isDrawPoint = false; // 是否开启绘制
        this.pointList = []; // 点储存数据
        this.pointId = null; // 当前选中的点id
        this.pointInfo = null; // 当前点信息用于保存
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delDemoEntity = (name: string) => {
        // // 绘制点
        // name == 'point_name' && pointAndLineEntity.pointEntityArr.forEach((item: any) => {
        //     this.viewer.entities.remove(item)
        // })
    }
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat 
     * @returns 
     */
    drawPoint = (cartesian3: Cesium.Cartesian3) => {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);//笛卡尔转换为弧度 
        //使用经纬度和弧度的转换，将WGS84弧度坐标系转换到目标值，弧度转度 
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        const entityPoint = this.viewer.entities.add({
            name: '',
            // 10 是用来设置广告牌的距离地面的高度
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
            billboard: {
                image: icon1,//图标地址
                // 位置固定不会因为旋转视角发生偏移
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                // 设置距离控制可见度
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2100),
                // 设置近大远小
                scaleByDistance: new Cesium.NearFarScalar(0, 0.3, 1050, 0.1),
                // scale: 0.1,
            },
            // label: {
            //     scale: 1,
            //     font: "bolder 16px sans-serif",
            //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            //     text: '摄像头',//图标名称
            //     fillColor: Cesium.Color.fromCssColorString("#ffffff"),
            // },
            // type 类型/虽然该字段在Entity类型中不存在，但你依旧可以添加其他字段，并且在查询是该字段也会获取到
            type: 'billboard',
        })
        this.isDrawPoint = false
        return entityPoint
    }
    /**
     * 绘制弹框
     */
    drawmessageBox = () => {
        return 
     }

    /**
     * 添加弹框
     */
    addmessageBox = (cartesian3: Cesium.Cartesian3) => {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);//笛卡尔转换为弧度 
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
        `
        div.innerHTML = HTML;
        this.viewer.cesiumWidget.container.appendChild(div);
        console.log(div)
        this.viewer.scene.postRender.addEventListener(() => {
            const gisPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 10);
            const canvasHeight = this.viewer.scene.canvas.height;
            const windowPosition = new Cesium.Cartesian2();
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, gisPosition, windowPosition);
            div.style.bottom = canvasHeight - windowPosition.y + 25 + 'px';
            const elWidth = div.offsetWidth;
            div.style.left = windowPosition.x - elWidth / 2 + 'px';
        }, this);
    }
    /**
     * 显示隐藏
     */
    setShow = () => {
        let entities = this.viewer.entities.getById(pointId)
        entities.show = !entities.show
    }
    /**
     * 修改名称
     */
    setName = () => {
        let entities = this.viewer.entities.getById(pointId)
        entities.name = form.value.name
    }
    /**
     * 保存
     */
    save = () => {
       
    }
    /**
    * 开启绘制
    */
    draw = () => {
        this.handlerLeftClick()
        this.isDrawPoint = true
    }
    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            // 根据位置信息选择场景上的物体
            let pick = this.viewer.scene.pick(event.position)
            // 判断是否获取到了 pick 
            if (Cesium.defined(pick)) {
                if (pick.id instanceof Cesium.Entity && pick.id.type === 'billboard') {
                    let cartesain3 = pick.id.position._value
                    this.addmessageBox(cartesain3)
                }
            } else if (this.isDrawPoint) {
                let cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.position);
                const point = this.drawPoint(cartesian3)
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
}

