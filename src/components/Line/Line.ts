import * as Cesium from 'cesium';
import { cartesian3_to_lng_lat } from '@/components/utils/utils';
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
    nowEditPoint: any;
    leftCenterPoint: any;
    rightCenterPoint: any;
    constructor(viewer: Cesium.Viewer, handler: Cesium.ScreenSpaceEventHandler) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.isDrawLine = false; // 是否开启绘制
        this.isEditLine = false; // 是否开启绘制
        this.pointArr = []; // 点的储存数据
        this.nowPoint = null; // 当前点的数据
        this.lineId = null; // 当前选中的线的id
        this.lineInfo = null; // 当前线的基本信息
        this.nowEditPoint = null; //编辑时选中的点实例
        this.pointAndLineEntity = {
            demoLineArr: [], // 辅助线实体的储存数据
            demoPointArr: [], // 辅助点实体的储存数据
            lineArr: [], // 线的储存数据
        };
        // 编辑点附近的生成的中心点
        this.leftCenterPoint = null; // 左侧中心点
        this.rightCenterPoint = null; // 右侧中心点
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delEntity = (name: string) => {
        switch (name) {
            // 删除辅助点
            case 'point_demo_name':
                this.pointAndLineEntity.demoPointArr.map((item: any) => {
                    this.viewer.entities.remove(item);
                });
                break;
            // 删除
            case 'line_name':
                this.pointAndLineEntity.lineArr.map((item: any) => {
                    this.viewer.entities.remove(item);
                });
                break;
            // 删除移动时的绘制线
            case 'line_demo_name':
                this.pointAndLineEntity.demoLineArr.map((item: any) => {
                    this.viewer.entities.remove(item);
                });
                break;

            default:
                break;
        }
    };
    /**
     * 点击绘制点,并返回点的实例
     * @param lonAndLat
     * @returns
     */
    drawPoint = (
        name: string,
        cartesian3: Cesium.Cartesian3,
        type: string = 'draw',
        color: string = '#fc3d4a',
        outlineColor: string = '#fc3d4a',
        pixelSize: number = 20
    ) => {
        const entityPoint = this.viewer.entities.add({
            position: cartesian3,
            name: name,
            point: {
                color: Cesium.Color.fromCssColorString(color),
                outlineColor: Cesium.Color.fromCssColorString(outlineColor),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelSize: pixelSize,
            },
            type: type,
        });
        return entityPoint;
    };
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
                clampToGround: true,
            },
            type: 'line',
        });
        return entityLine;
    };

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
        this.handlerLeftClick();
        this.handlerMouseMove();
        this.handerRightClick();
        this.isDrawLine = true;
        this.isEditLine = false;
    };
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
        this.handlerLeftClick();
        this.handlerMouseMove();
        this.handerRightClick();
        this.isEditLine = true;
        this.isDrawLine = false;
    };
    // 结束编辑
    endEdit = () => {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        this.isEditLine = false;
        // 删除画点
        this.delEntity('point_demo_name');
        // 清空数据
        this.lineId = null;
        this.pointArr = [];
        this.nowPoint = null;
        this.pointAndLineEntity = {
            demoLineArr: [],
            demoPointArr: [],
            lineArr: [],
        };
        return;
    };
    // 获取选中线条的经纬度数据
    getPointData = () => {
        const line = this.viewer.entities.getById(this.lineId);
        this.pointArr = line.polyline.positions._callback();
        let pointData: any[] = [];
        pointData = this.pointArr.map((item: Cesium.Cartesian3) => {
            return cartesian3_to_lng_lat(item);
        });
    };
    // 根据数据生成线

    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            // 根据位置信息选择场景上的物体
            let pick = this.viewer.scene.pick(event.position);
            // 判断是否开启绘制
            if (this.isDrawLine) {
                // 鼠标当前位置的cartesain3坐标
                const ray = this.viewer.scene.camera.getPickRay(event.position);
                let cartesian3: Cesium.Cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
                // 点数据保存
                this.pointArr.push(cartesian3);
                // 当前点数据
                this.nowPoint = cartesian3;
                // 绘制点
                const point = this.drawPoint('point_demo_name', cartesian3);
                // 保存点的实体
                this.pointAndLineEntity.demoPointArr.push(point);
                // 当前绘制点的数量
                const num = this.pointArr.length;
                if (num > 1) {
                    // 删除鼠标移动时绘制的线
                    this.delEntity('line_demo_name');
                    // 生成线的实体
                    const line = this.drawLine('line_name', [this.pointArr[num - 2], this.pointArr[num - 1]]);
                    // 保存线的实体
                    this.pointAndLineEntity.lineArr.push(line);
                }
                // 判断是否开启编辑
            } else if (this.isEditLine) {
                // 判断是否获取到了 pick 且是线的实体
                if (Cesium.defined(pick) && pick.id.type === 'line') {
                    if (!this.lineId) {
                        this.lineId = pick.id.id;
                        const coordinates = pick.id.polyline.positions._callback();
                        // 删除其他实体的编辑点位
                        this.delEntity('point_demo_name');
                        this.pointAndLineEntity.demoPointArr = [];
                        coordinates.map((item: Cesium.Cartesian3, index: number) => {
                            if (index > 0) {
                                const point1 = coordinates[index - 1];
                                const point2 = coordinates[index];
                                const cartesian3 = Cesium.Cartesian3.lerp(
                                    point1,
                                    point2,
                                    0.5,
                                    new Cesium.Cartesian3()
                                );
                                const point = this.drawPoint(
                                    'point_center_demo_name',
                                    cartesian3,
                                    'center_edit',
                                    '#fff'
                                );
                                this.pointAndLineEntity.demoPointArr.push(point);
                            }
                            const point = this.drawPoint('point_demo_name', item, 'edit');
                            // 保存线的实体
                            this.pointAndLineEntity.demoPointArr.push(point);
                        });
                    }
                    // 判断是否获取到了 pick 且是点的实体
                } else if (Cesium.defined(pick) && pick.id.type === 'edit') {
                    this.pointAndLineEntity.demoPointArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === pick.id.id && pick.id.name === 'point_demo_name') {
                            this.leftCenterPoint = this.pointAndLineEntity.demoPointArr[index - 1];
                            this.rightCenterPoint = this.pointAndLineEntity.demoPointArr[index + 1];
                        }
                    });
                    // 清空数据
                    this.nowEditPoint = null;
                    // 添加当前点位的数据
                    this.nowEditPoint = pick;
                } else if (Cesium.defined(pick) && pick.id.type === 'center_edit') {
                    this.pointAndLineEntity.demoPointArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === pick.id.id && pick.id.name === 'point_center_demo_name') {
                            pick.id.name = 'point_demo_name';
                        }
                    });
                    // 清空数据
                    this.nowEditPoint = null;
                    // 添加当前点位的数据
                    this.nowEditPoint = pick;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };

    // 监听鼠标移动事件
    handlerMouseMove = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawLine && this.pointArr.length > 0) {
                // 绘制逻辑
                // 鼠标当前位置的cartesain3坐标
                const ray = this.viewer.scene.camera.getPickRay(event.startPosition);
                let cartesian3: Cesium.Cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
                // 删除上一次生成线
                this.delEntity('line_demo_name');
                // 创建线
                const demoLine = this.drawLine('line_demo_name', [this.nowPoint, cartesian3]);
                // 保存移动线的实体
                this.pointAndLineEntity.demoLineArr.push(demoLine);
            } else if (this.isEditLine && this.nowEditPoint) {
                // 编辑逻辑
                // 通过id查询当前选中的实体
                const line = this.viewer.entities.getById(this.lineId);
                // 鼠标当前位置的cartesain3坐标
                const ray = this.viewer.scene.camera.getPickRay(event.startPosition);
                let cartesian3: Cesium.Cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
                // 更新点坐标
                this.nowEditPoint!.id.position = cartesian3;
                // 获取更新点坐标的数据
                let points: any = [];
                // 获取更新点的实体集合
                let demoPointArr: any = [];
                this.pointAndLineEntity.demoPointArr.map((item: any) => {
                    if (item.name === 'point_demo_name') {
                        points.push(item.position._value);
                        demoPointArr.push(item);
                    }
                });
                // 修改edit编辑点周围白色点的位置
                if (this.nowEditPoint.id.type == 'edit') {
                    demoPointArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === this.nowEditPoint.id.id) {
                            const pointL = demoPointArr[index - 1]?.position._value;
                            const pointR = demoPointArr[index + 1]?.position._value;
                            if (this.leftCenterPoint) {
                                this.leftCenterPoint.position._value = Cesium.Cartesian3.lerp(
                                    pointL,
                                    this.nowEditPoint.id.position._value,
                                    0.5,
                                    new Cesium.Cartesian3()
                                );
                            }
                            if (this.rightCenterPoint) {
                                this.rightCenterPoint.position._value = Cesium.Cartesian3.lerp(
                                    pointR,
                                    this.nowEditPoint.id.position._value,
                                    0.5,
                                    new Cesium.Cartesian3()
                                );
                            }
                        }
                    });
                }
                // 更新面坐标
                line.polyline.positions = new Cesium.CallbackProperty(() => {
                    return points;
                }, false);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    // 监听鼠标右键点击事件
    handerRightClick = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawLine) {
                // 结束绘制
                this.isDrawLine = false;
                // 删除辅助线
                this.delEntity('line_demo_name');
                // 删除画点
                this.delEntity('point_demo_name');
                // 删除线
                this.delEntity('line_name');
                // 绘制线
                this.drawLine('line_name', this.pointArr);
                // 清空数据
                this.lineId = null;
                this.pointArr = [];
                this.nowPoint = null;
                this.pointAndLineEntity = {
                    demoLineArr: [],
                    demoPointArr: [],
                    lineArr: [],
                };
                // 清除可能会用到的监听事件
                if (this.handler) {
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
            } else if (this.isEditLine) {
                if (this.nowEditPoint.id.type === 'center_edit') {
                    const index = this.pointAndLineEntity.demoPointArr.findIndex(
                        (item: any) => this.nowEditPoint.id.id === item.id
                    );
                    const nowEditPointPosition = this.nowEditPoint!.id.position._value;
                    this.nowEditPoint.id.point.color = Cesium.Color.fromCssColorString('#fc3d4a');
                    this.nowEditPoint.id.type = 'edit';
                    // 右侧
                    let pointR = this.pointAndLineEntity.demoPointArr[index + 1].position._value;
                    pointR = Cesium.Cartesian3.lerp(
                        pointR,
                        nowEditPointPosition,
                        0.5,
                        new Cesium.Cartesian3()
                    );
                    pointR = this.drawPoint('point_center_demo_name', pointR, 'center_edit', '#fff');
                    this.pointAndLineEntity.demoPointArr.splice(index + 1, 0, pointR);
                    // 左侧
                    let pointL = this.pointAndLineEntity.demoPointArr[index - 1].position._value;
                    pointL = Cesium.Cartesian3.lerp(
                        pointL,
                        nowEditPointPosition,
                        0.5,
                        new Cesium.Cartesian3()
                    );
                    pointL = this.drawPoint('point_center_demo_name', pointL, 'center_edit', '#fff');
                    this.pointAndLineEntity.demoPointArr.splice(index, 0, pointL);
                }
                // 清空编辑点为
                this.nowEditPoint = null;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
}
