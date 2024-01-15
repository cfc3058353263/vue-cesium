import * as Cesium from "cesium";
import { reactive, toRefs } from "vue";

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
export class Line {
    viewer: any;
    handler: any;
    isDrawLine: boolean;
    isEditLine: boolean;
    pointArr: Cesium.Cartesian3[];
    nowPoint: Cesium.Cartesian3 | null;
    pointAndLineEntity: any;
    lineId: string | null;
    lineInfo: any;
    nowEditPoint: Cesium.Polyline[];
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.isDrawLine = false; // 是否开启绘制
        this.isEditLine = false; // 是否开启绘制
        this.pointArr = []; // 点的储存数据
        this.nowPoint = null; // 当前点的数据
        this.lineId = null; // 当前选中的线的id
        this.lineInfo = null; // 当前线的基本信息
        this.nowEditPoint = []; //编辑时选中的点实例
        this.pointAndLineEntity = {
            demoLineArr: [], // 辅助线实体的储存数据
            demoPointArr: [], // 辅助点实体的储存数据
            lineArr: [] // 线的储存数据
        }
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delEntity = (name: string) => {
        switch (name) {
            // 删除辅助点
            case 'point_dome_name':
                this.pointAndLineEntity.demoPointArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;
            // 删除
            case 'line_name':
                this.pointAndLineEntity.lineArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;

            // 删除移动时的绘制线
            case 'line_demo_name':
                this.pointAndLineEntity.demoLineArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;

            default:
                break;
        }
    }
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat 
     * @returns 
     */
    drawPoint = (name: string, cartesain3:Cesium.Cartesian3) => {
        const entityPoint = this.viewer.entities.add({
            position: cartesain3,
            name: name,
            point: {
                color: Cesium.Color.fromCssColorString('#fc3d4a'),
                outlineColor: Cesium.Color.fromCssColorString('#fc3d4a'),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelSize: 11
            },
            clampToGround: true,
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
        const entityLine = this.viewer.entities.add({
            name: name,
            polyline: {
                positions: new Cesium.CallbackProperty(() => lineArr, false),
                width: 5,
                material: Cesium.Color.fromCssColorString('#fcc31f'),
            },
            clampToGround: true,
            type: 'line'
        })
        return entityLine
    }

    /**
    * 开启绘制
    */
    draw = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        this.handlerLeftClick()
        this.handlerMouseMove()
        this.handerRightClick()
        this.isDrawLine = true
        this.isEditLine = false
    }
    /**
     * 开启编辑
     */
    edit = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        this.handlerLeftClick()
        this.handlerMouseMove()
        this.handerRightClick()
        this.isEditLine = true
        this.isDrawLine = false
    }
    /**
     * 结束编辑
     */
    endEdit = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        this.isEditLine = false
        // 删除画点
        this.delEntity('point_dome_name')
        // 清空数据
        this.pointArr = []
        this.nowPoint = null
        this.pointAndLineEntity = {
            demoLineArr: [],
            demoPointArr: [],
            lineArr: []
        }
    }

    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            // 根据位置信息选择场景上的物体
            let pick = this.viewer.scene.pick(event.position)
            // 判断是否开启绘制
            if (this.isDrawLine) {
                // 鼠标当前位置的cartesain3坐标
                let cartesain3: Cesium.Cartesian3 = this.viewer.scene.camera.pickEllipsoid(event.position);
                // 点数据保存
                this.pointArr.push(cartesain3)
                // 当前点数据
                this.nowPoint = cartesain3
                // 绘制点
                const point = this.drawPoint('point_dome_name', cartesain3)
                // 保存点的实体
                this.pointAndLineEntity.demoPointArr.push(point)
                // 当前绘制点的数量
                const num = this.pointArr.length
                if (num > 1) {
                    // 删除鼠标移动时绘制的线
                    this.delEntity('line_demo_name')
                    // 生成线的实体
                    const line = this.drawLine('line_name', [this.pointArr[num - 2], this.pointArr[num - 1]])
                    // 保存线的实体
                    this.pointAndLineEntity.lineArr.push(line)
                }

            } else if (this.isEditLine) {
                // 判断是否获取到了 pick 且是线的实体
                if (Cesium.defined(pick) && pick.id.type === 'line') {
                    this.lineId = pick.id.id
                    const coordinates = pick.id.polyline.positions._callback()
                    // 删除其他实体的编辑点位
                    this.delEntity('point_dome_name')
                    this.pointAndLineEntity.demoPointArr = []
                    for (let cartesian3 of coordinates) {
                        const point = this.viewer.entities.add({
                            name: "point_dome_name",
                            position: cartesian3,
                            point: {
                                color: Cesium.Color.fromCssColorString('#fc3d4a'),
                                outlineColor: Cesium.Color.fromCssColorString('#fc3d4a'),
                                pixelSize: 11,
                            },
                            type: 'edit'
                        });
                        // 保存线的实体
                        this.pointAndLineEntity.demoPointArr.push(point)
                    }
                } else if (Cesium.defined(pick) && pick.id.type === 'edit') {
                    // 清空数据
                    this.nowEditPoint = []
                    // 添加当前点位的数据
                    this.nowEditPoint.push(pick)
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }

    // 监听鼠标移动事件
    handlerMouseMove = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawLine && this.pointArr.length > 0) {
                // 绘制逻辑
                // 鼠标当前位置的cartesain3坐标
                let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                // 删除上一次生成线
                this.delEntity('line_demo_name')
                // 创建线
                const demoLine = this.drawLine('line_demo_name', [this.nowPoint, cartesain3])
                // 保存移动线的实体
                this.pointAndLineEntity.demoLineArr.push(demoLine)
            } else if (this.isEditLine && this.nowEditPoint.length > 0) {
                // 编辑逻辑
                // 通过id查询当前选中的实体
                const line = this.viewer.entities.getById(this.lineId);
                console.log(line)
                // 鼠标当前位置的cartesain3坐标
                let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                // 更新点坐标
                this.nowEditPoint[0].id.position = cartesain3
                // 获取更新面坐标的数据
                let points: any = [];
                this.pointAndLineEntity.demoPointArr.forEach((item: any) => {
                    points.push(item.position._value);
                })
                // 更新面坐标
                line.polyline.positions = new Cesium.CallbackProperty(() => {
                    return points;
                }, false);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    // 监听鼠标右键点击事件
    handerRightClick = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawLine) {
                // 结束绘制
                this.isDrawLine = false
                // 删除辅助线
                this.delEntity('line_demo_name')
                // 删除画点
                this.delEntity('point_dome_name')
                // 删除线
                this.delEntity('line_name')
                // 绘制线
                this.drawLine('line_name', this.pointArr)
                // 清空数据
                this.pointArr = []
                this.nowPoint = null
                this.pointAndLineEntity = {
                    demoLineArr: [],
                    demoPointArr: [],
                    lineArr: []
                }
                // 清除可能会用到的监听事件
                if (this.handler) {
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
            } else if (this.isEditLine) {
                // 清空编辑点为
                this.nowEditPoint = []
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }
}

