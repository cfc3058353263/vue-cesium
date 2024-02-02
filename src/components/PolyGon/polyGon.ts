import * as Cesium from 'cesium';
import { cartesian3_to_lng_lat } from '@/components/utils/utils';
import circle_gray from '@/assets/drawImage/circle_gray.png';
import circle_red from '@/assets/drawImage/circle_red.png';

// 当前选中的图形id
export class Polygon {
    viewer: any;
    handler: any;
    pointAndLineEntity: any;
    positions: Cesium.Cartesian3[];
    pointArr: any[];
    constructor(viewer: Cesium.Viewer, handler: Cesium.ScreenSpaceEventHandler) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.positions = []; // 点的坐标
        this.pointArr = []; //点的实例
    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delEntity = (name: string) => {
        switch (name) {
            // 删除辅助点
            case 'point_demo_name':
                this.pointArr.map((item: any) => {
                    this.viewer.entities.remove(item);
                });
                break;
            default:
                break;
        }
    };
    // 绘制点
    drawPoint = (
        name: string,
        cartesian3: Cesium.Cartesian3,
        type: string = 'point',
        image: string = circle_red
    ) => {
        const entityPoint = this.viewer.entities.add({
            position: cartesian3,
            name: name,
            billboard: {
                image: image,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                scale: 1.2,
            },
            type: type,
        });
        return entityPoint;
    };
    // 绘制面
    drawPolygon = (name: string = '') => {
        const hierarchy = new Cesium.CallbackProperty(() => {
            if (this.positions.length > 2) {
                return new Cesium.PolygonHierarchy(this.positions);
            } else {
                return null;
            }
        }, false);
        var positions = new Cesium.CallbackProperty(() => {
            if (this.positions.length > 1) {
                const emptyArr: any = [];
                const arr = emptyArr.concat(this.positions);
                const first = this.positions[0];
                arr.push(first);
                return arr;
            } else {
                return null;
            }
        }, false);
        const entityPolygon = this.viewer.entities.add({
            name: name,
            polygon: {
                hierarchy: hierarchy,
                material: Cesium.Color.fromCssColorString('#ffffff80'),
                classificationType: Cesium.ClassificationType.BOTH,
            },
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7),
                }),
            },
            type: 'polygon',
        });
        return entityPolygon;
    };
    // 回显面
    showPolygon = (positions: any) => {
        let outlinePositions: any = [].concat(positions);
        outlinePositions.push(positions[0]);
        this.viewer.entities.add({
            type: 'polygon',
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                material: Cesium.Color.fromCssColorString('#ffffff80'),
                classificationType: Cesium.ClassificationType.BOTH,
            }),
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7),
                }),
            },
        });
    };
    // 开启绘制
    draw = () => {
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        let polygon: Cesium.Entity.ConstructorOptions | null = null;
        let floatingPoint: any = null;
        this.handler.setInputAction((event: any) => {
            var position = event.position;
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
            const num = this.positions.length;
            if (num === 0) {
                this.positions.push(cartesian3);
                floatingPoint = this.drawPoint('point_demo_name', cartesian3);
                polygon = this.drawPolygon('polygon');
            }
            this.positions.push(cartesian3);
            const point = this.drawPoint('point_demo_name', cartesian3);
            this.pointArr.push(point);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((event: any) => {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = this.viewer.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian3)) {
                return;
            }
            if (this.positions.length > 0) {
                floatingPoint.position.setValue(cartesian3);
                this.positions.pop();
                this.positions.push(cartesian3);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction((event: any) => {
            if (this.positions.length < 4) {
                return;
            }
            this.positions.pop();
            this.viewer.entities.remove(floatingPoint);
            this.clearHander();
            this.delEntity('point_demo_name');
            this.pointArr = [];
            this.showPolygon(this.positions);
            this.viewer.entities.remove(polygon);
            this.positions = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    // 开启编辑
    edit = () => {
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        this.clearHander();
        let polygon: any = null;
        let floatingPoint: any = null;
        let leftCenterPoint: any = null; // 左侧点
        let rightCenterPoint: any = null; // 右侧点
        this.handler.setInputAction((event: any) => {
            console.log(event);
            var position = event.position;
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
            const pick = this.viewer.scene.pick(event.position);
            if (Cesium.defined(pick) && pick.id.type === 'polygon') {
                if (polygon) {
                    return;
                }
                this.viewer.entities.remove(pick.id);
                this.positions = pick.id.polygon.hierarchy._value.positions;
                this.positions.map((item: Cesium.Cartesian3, index: number) => {
                    // 生成白色编辑点
                    if (index > 0) {
                        const point1 = this.positions[index - 1];
                        const point2 = this.positions[index];
                        const cartesian3 = this.centerCartesian3(point1, point2);
                        const point = this.drawPoint(
                            'point_center_demo_name',
                            cartesian3,
                            'center_edit',
                            circle_gray
                        );
                        this.pointArr.push(point);
                    }
                    // 生成红色编辑点
                    const point = this.drawPoint('point_demo_name', item, 'edit');
                    this.pointArr.push(point);
                    if (index === this.positions.length - 1) {
                        const point1 = this.positions[index];
                        const point2 = this.positions[0];
                        const cartesian3 = this.centerCartesian3(point1, point2);
                        const point = this.drawPoint(
                            'point_center_demo_name',
                            cartesian3,
                            'center_edit',
                            circle_gray
                        );
                        this.pointArr.push(point);
                    }
                });
                polygon = this.drawPolygon('polygon');
            } else if (Cesium.defined(pick) && pick.id.type === 'edit') {
                if (floatingPoint) {
                    floatingPoint = null;
                    leftCenterPoint = null;
                    rightCenterPoint = null;
                } else {
                    floatingPoint = pick.id;
                    this.pointArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === pick.id.id) {
                            if (index === 0) {
                                leftCenterPoint = this.pointArr[this.pointArr.length - 1];
                            } else {
                                leftCenterPoint = this.pointArr[index - 1];
                            }
                            rightCenterPoint = this.pointArr[index + 1];
                        }
                    });
                }
            } else if (Cesium.defined(pick) && pick.id.type === 'center_edit') {
                if (floatingPoint) {
                    floatingPoint.type = 'edit';
                    floatingPoint.billboard.image._value = circle_red;
                    const index = this.pointArr.findIndex((item: any) => floatingPoint.id === item.id);
                    // 插入数据点先右在左
                    // 右侧
                    let pointR = this.centerCartesian3(floatingPoint.position._value, rightCenterPoint);
                    pointR = this.drawPoint('point_center_demo_name', pointR, 'center_edit', circle_gray);
                    this.pointArr.splice(index + 1, 0, pointR);
                    // 左侧
                    let pointL = this.centerCartesian3(floatingPoint.position._value, leftCenterPoint);
                    pointL = this.drawPoint('point_center_demo_name', pointL, 'center_edit', circle_gray);
                    this.pointArr.splice(index, 0, pointL);
                    floatingPoint = null;
                    leftCenterPoint = null;
                    rightCenterPoint = null;
                } else {
                    floatingPoint = pick.id;
                    floatingPoint.name = 'point_demo_name';
                    this.pointArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === pick.id.id) {
                            if (index === this.pointArr.length - 1) {
                                rightCenterPoint = this.pointArr[0].position._value;
                            } else {
                                rightCenterPoint = this.pointArr[index + 1].position._value;
                            }
                            leftCenterPoint = this.pointArr[index - 1].position._value;
                        }
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((event: any) => {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = this.viewer.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!Cesium.defined(cartesian3)) {
                return;
            }
            if (floatingPoint) {
                floatingPoint.position.setValue(cartesian3);
                const points: Cesium.Cartesian3[] = [];
                const editArr: any[] = [];
                this.pointArr.map((item: any, index: number) => {
                    if (item.name === 'point_demo_name') {
                        points.push(item.position._value);
                        editArr.push(item);
                    }
                });
                if (floatingPoint.type === 'edit') {
                    editArr.map((item: Cesium.Polyline, index: number) => {
                        if (item.id === floatingPoint.id) {
                            let pointL;
                            let pointR;
                            if (index === 0) {
                                pointL = editArr[editArr.length - 1].position._value;
                            } else {
                                pointL = editArr[index - 1].position._value;
                            }
                            if (index === editArr.length - 1) {
                                pointR = editArr[0].position._value;
                            } else {
                                pointR = editArr[index + 1].position._value;
                            }
                            leftCenterPoint.position._value = this.centerCartesian3(
                                floatingPoint.position._value,
                                pointL
                            );
                            rightCenterPoint.position._value = this.centerCartesian3(
                                floatingPoint.position._value,
                                pointR
                            );
                        }
                    });
                }
                this.positions = points;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction((event: any) => {
            this.clearHander();
            this.delEntity('point_demo_name');
            this.pointArr = [];
            this.showPolygon(this.positions);
            this.viewer.entities.remove(polygon);
            this.positions = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    // 生成中心点坐标
    centerCartesian3 = (startPoint: Cesium.Cartesian3, entityPoint: Cesium.Cartesian3) => {
        const cartesian3 = Cesium.Cartesian3.lerp(startPoint, entityPoint, 0.5, new Cesium.Cartesian3());
        return cartesian3;
    };
    // 结束编辑
    endEdit = () => {
        return;
    };
    // 获取选中面的上的点数据
    getPolygonData = () => {
        let pointData: any[] = [];
        pointData = this.positions.map((item: Cesium.Cartesian3) => {
            return cartesian3_to_lng_lat(item);
        });
        return pointData;
    };
    // 鼠标事件清空
    clearHander = () => {
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
    };
}
