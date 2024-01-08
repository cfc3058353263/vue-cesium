import * as Cesium from "cesium";
import { reactive, toRefs } from "vue";
import cache from '../../../plugins/cache.ts'
const { local } = cache
const data = reactive({
    drawer: false, // 抽屉
    form: {
        id: '',
        name: '',
        show: true,
        height: 0,
        color: '#ffffff80',
    }
})
export const { drawer, form } = toRefs(data)
// 图形储存数据
const polygonList: Array<{ id: string, name: string; data: any; show: boolean; color: string, height: number }> = []
// 当前选中的图形id
let polygonId: string | null = null
// 开启绘制是储存绘制节点的信息
let pointArr: any[] = []
// 当前点位的数据
let nowPoint: any[] = []
// 当前多边形中的点和线实体集合
let pointAndLineEntity: any = {
    pointEntityArr: [], // 多边形中点的实体集合
    lineEntityArr: [],// 多边形中线的实体集合
    demoLineEntityArr: [], // 绘制移动时线的实体集合
}
// 当前选择的编辑点
let nowEditPoint: any[] = []
// 是否开始画多边形
let isDrawLine = false
// 是否形成面
let isDrawPolyGon = false

// uuid生成
const guid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

//  
export class editPolyGonFunC {
    viewer: any; // cesium 实例
    handler: any; // cesium 鼠标监听事件
    constructor(viewer: any, handler: any) {
        this.viewer = viewer;
        this.handler = handler
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delDemoEntity = (name: string) => {

        // 绘制点
        name == 'point_name' && pointAndLineEntity.pointEntityArr.forEach((item: any) => {
            this.viewer.entities.remove(item)
        })
        // 绘制线
        name == 'line_name' && pointAndLineEntity.lineEntityArr.forEach((item: any) => {
            this.viewer.entities.remove(item)
        })
        // 移动时的线
        name == 'line_demo_name' && pointAndLineEntity.demoLineEntityArr.forEach((item: any) => {
            this.viewer.entities.remove(item)
        })
        // 编辑点
        name == 'polygon_point' && pointAndLineEntity.pointEntityArr.forEach((item: any) => {
            this.viewer.entities.remove(item)
        })
    }
    /**
     * 将屏幕坐标转换为经纬度坐标
     * @param cartesian2 
     * @returns 
     */
    getLonOrLat = (cartesian2: any) => {
        var cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(cartesian2), this.viewer.scene);
        let cartorgraphic = Cesium.Cartographic.fromCartesian(cartesian);
        let lon = Cesium.Math.toDegrees(cartorgraphic.longitude);  // 经度
        let lat = Cesium.Math.toDegrees(cartorgraphic.latitude);   // 纬度  
        return {
            longitude: lon,
            latitude: lat
        }
    }
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat 
     * @returns 
     */
    drawPoint = (lonAndLat: number[]) => {
        const entityPoint = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lonAndLat[0], lonAndLat[1], lonAndLat[2]),
            name: 'point_name',
            point: {
                color: Cesium.Color.fromCssColorString('#fc3d4a'),
                outlineColor: Cesium.Color.fromCssColorString('#fc3d4a'),
                pixelSize: 11
            },
        })
        return entityPoint
    }
    /**
     * 绘制线
     * @param name 线条名称
     * @param lineArr 绘制线所需要的经纬度
     * @returns 
     */
    drawLine = (name: string, lineArr: any[]) => {
        console.log(Cesium.Cartesian3.fromDegreesArrayHeights(lineArr))
        const entityLine = this.viewer.entities.add({
            name: name,
            polyline: {
                positions: new Cesium.CallbackProperty(() => Cesium.Cartesian3.fromDegreesArrayHeights(lineArr), false),
                width: 5,
                material: Cesium.Color.fromCssColorString('#fcc31f'),
            }
        })
        return entityLine
    }
    /**
    * 绘制面
    * @param lonAndLat 经纬度
    */
    drawPolyGon = (lonAndLat: any[]) => {
        // 返回lonAndLat中的经度和纬度,去掉高程
        let lonLats = (data: any) => {
            let arr = []
            for (let d in data) {
                //判断经纬度范围
                if (
                    data[d][0] >= -180 &&
                    data[d][0] <= 180 &&
                    data[d][1] >= -90 &&
                    data[d][1] <= 90
                ) {
                    arr.push(data[d][0], data[d][1])
                } else {
                    console.log('经纬度数值不对：', data[d][0], data[d][1])
                }
            }
            return arr
        }
        const uuid = guid()
        // 绘制图形
        this.viewer.entities.add({
            id: uuid,
            name: "",
            polygon: {
                clampToGround: true, //开启贴地
                // 定义多边形及其孔的线性环的层次结构
                hierarchy: new Cesium.PolygonHierarchy(
                    // Cesium.Cartesian3.fromDegreesArray 根据经纬度返回三维笛卡尔坐标的数组
                    Cesium.Cartesian3.fromDegreesArray(lonLats(lonAndLat))
                ),
                material: Cesium.Color.fromCssColorString('#ffffff80'),
                extrudedHeight: 0
            }
        });
        console.log(Cesium.Cartesian3.fromDegreesArray(lonLats(lonAndLat)))
        polygonList.push({
            id: uuid,
            name: "",
            data: [lonAndLat],
            show: true,
            color: '#ffffff80',
            height: 0
        })
        local.set('polygon', JSON.stringify(polygonList))
    }
    /**
     * 绘制多面体
     * @param lonAndLat 经纬度集合
     */
    drawPolyhedron = () => {
        // 获取当前点击的实体坐标
        const positions = this.viewer.entities.getById(polygonId).polygon.hierarchy._value.positions;
        console.log(positions)
        this.viewer.entities.removeById(polygonId);
        this.viewer.entities.add({
            id: polygonId,
            name: 'polyhedron_name',
            polygon: {
                hierarchy: positions,
                extrudedHeight: form.value.height, // 是指polygon拉伸后的面距离地面的拉伸高度 只有当extrudedHeight大于height时才会呈现挤出高度的效果，且polygon的厚度就是两者的差值。
                height: 0, // 是指polygon距离地面的高度
                material: Cesium.Color.fromCssColorString(form.value.color),
                outlineColor: Cesium.Color.RED,
                outlineWidth: 2,
                outline: true
            },
        });

    }
    /**
     * 修改颜色
     */
    setColor = () => {
        let polygon = this.viewer.entities.getById(polygonId).polygon
        polygon.material = Cesium.Color.fromCssColorString(form.value.color)
    }
    /**
     * 显示隐藏
     */
    setShow = () => {
        let entities = this.viewer.entities.getById(polygonId)
        entities.show = !entities.show
    }
    /**
     * 修改名称
     */
    setName = () => {
        let entities = this.viewer.entities.getById(polygonId)
        entities.name = form.value.name
    }
    /**
     * 保存
     */
    save = () => {
        const positions = this.viewer.entities.getById(polygonId).polygon.hierarchy._value.positions;
        positions.map(item=>{
            const lnglat = Cesium.Cartographic.fromCartesian(item)
            console.log(lnglat)
        })
        var cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions)//一组坐标
        console.log('cartographics', cartographics)
        // const polygon = polygonList.find(item => item.id === form.id)
        console.log(JSON.parse(local.get('polygon')))
    }
    /**
    * 开启绘制
    */
    draw = () => {
        isDrawLine = true
    }
    /**
     * 加载现有的多边形
     */
    // 重置
    klk = () => {
        this.delDemoEntity('point_name')
        isDrawLine = false
        isDrawPolyGon = false
        pointAndLineEntity = {
            pointEntityArr: [],
            lineEntityArr: [],
            demoLineEntityArr: [],
        }
        nowEditPoint = []
    }
    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position)
            // 判断是否有实体
            if (pick && pick.id && pick.id.polygon) {
                for (let item of polygonList) {
                    form.value.id = item.id
                    form.value.name = item.name
                    form.value.show = item.show
                    form.value.height = item.height
                    form.value.color = item.color
                    if (item.id === pick.id.id) {
                        // 开启抽屉
                        drawer.value = true
                        // 储存当前选中的点位id用于查询编辑
                        polygonId = item.id
                        // 删除其他实体的编辑点位
                        this.delDemoEntity('polygon_point')
                        pointAndLineEntity.pointEntityArr = []
                        // 选中多边形实体 循环添加编辑点位
                        for (let cartesian of pick.id.polygon.hierarchy._value.positions) {
                            const point = this.viewer.entities.add({
                                name: "polygon_point",
                                position: cartesian,
                                point: {
                                    color: Cesium.Color.WHITE,
                                    pixelSize: 8,
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 1,
                                },
                            });
                            // 保存点的ID以便删除
                            pointAndLineEntity.pointEntityArr.push(point)
                        }
                    }
                }
            } else if (pick && pick.id && pick.id.point && (pick.id.name == 'polygon_point')) {
                // console.log('编辑点保存');
                nowEditPoint = []
                nowEditPoint.push(pick)
                isDrawPolyGon = true
            } else {
                // 开始绘制多边形
                if (isDrawLine) {
                    let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.position);
                    
                    // 将屏幕转换为经纬度坐标
                    let nowPosition = this.getLonOrLat(event.position)
                    // 点数据保存
                    pointArr.push([nowPosition.longitude, nowPosition.latitude, 0])
                    // 当前点数据
                    nowPoint = [nowPosition.longitude, nowPosition.latitude, 0]
                    // 绘制点
                    const point = this.drawPoint([nowPosition.longitude, nowPosition.latitude, 0])
                    pointAndLineEntity.pointEntityArr.push(point)
                    //isDrawLines设为true 开始画多边形
                    isDrawLine = true
                    // 画线
                    const num = pointArr.length
                    if (num > 1) {
                        // 删除鼠标移动画线
                        this.delDemoEntity('line_demo_name')
                        // 生成线的实体
                        const line = this.drawLine('line_name', [...pointArr[num - 2], ...pointArr[num - 1]])
                        // 保存线的实体
                        pointAndLineEntity.lineEntityArr.push(line)
                    }
                } else {

                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    // 监听鼠标移动事件
    handlerMouseMove = () => {
        this.handler.setInputAction((event: any) => {
            if (isDrawLine && !isDrawPolyGon) {
                // 绘制逻辑
                // 获取坐标信息
                let movePosition = this.getLonOrLat(event.startPosition)
                // 删除上一次生成
                this.delDemoEntity('line_demo_name')
                // 创建线
                const demoLine = this.drawLine('line_demo_name', [...nowPoint, ...[movePosition.longitude, movePosition.latitude, 0]])
                // 保存移动线的实体
                pointAndLineEntity.demoLineEntityArr.push(demoLine)
            } else if (isDrawPolyGon && !isDrawLine) {
                // 编辑逻辑
                // 通过id查询当前选中的实体
                const box = this.viewer.entities.getById(polygonId);
                // 获取坐标信息
                let movePosition = this.getLonOrLat(event.startPosition)
                // 更新点坐标
                nowEditPoint[0].id.position = Cesium.Cartesian3.fromDegrees(movePosition.longitude, movePosition.latitude, 0)
                // 获取更新面坐标的数据
                let points: any = [];
                pointAndLineEntity.pointEntityArr.forEach((item: any) => {
                    points.push(item.position._value);
                })
                // 更新面坐标
                box.polygon.hierarchy = points;
                // box.polygon.hierarchy = new Cesium.CallbackProperty(() => {
                //     return points;
                // }, false);
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    // 监听鼠标右键点击事件
    handerRightClick = () => {
        this.handler.setInputAction((event: any) => {
            if (!isDrawPolyGon && isDrawLine) {
                // 结束绘制
                isDrawLine = false
                // 删除鼠标移动画线
                this.delDemoEntity('line_demo_name')
                // 画多边形结束,形成面开始
                this.drawPolyGon(pointArr)
                // 清空数据
                // 删除画点以及画线
                this.delDemoEntity('line_name')
                this.delDemoEntity('point_name')
                pointArr = []
                nowPoint = []
                pointAndLineEntity = {
                    pointEntityArr: [],
                    lineEntityArr: [],
                    demoLineEntityArr: [],
                }
            } else if (isDrawPolyGon && !isDrawLine) {
                // 结束编辑
                isDrawPolyGon = false
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }
}

