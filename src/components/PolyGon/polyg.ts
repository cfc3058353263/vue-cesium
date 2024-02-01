import * as Cesium from "cesium";
import { cartesian3_to_lng_lat } from '@/components/utils/utils'

// 图形储存数据
const polygonList: Array<{ id: string, name: string; data: any; show: boolean; color: string, height: number }> = []


//  
export class Polygon {
    viewer: any;
    handler: any;
    isDrawPolyGon: boolean = false;
    isEditPolyGon: boolean = false;
    pointAndLineEntity: any;
    nowPoint: any;
    pointArr: any;
    polygonId: any;
    handlerLeftClickCallBack: Function | null;
    constructor(viewer: any, handler: any) {
        this.viewer = viewer; // cesium 实例
        this.handler = handler; // cesium 鼠标监听事件
        this.isDrawPolyGon = false; // 是否开始绘制
        this.isEditPolyGon = false; // 是否开始编辑
        this.nowPoint = []; // 当前点位的数据
        this.pointArr = []; // 储存绘制节点的信息 使用的是cartesain3的坐标格式
        this.polygonId = null; // 当前选中的图形id
        this.pointAndLineEntity = { // 当前多边形中的点和线实体集合
            pointEntityArr: [], // 多边形中点的实体集合
            lineEntityArr: [],  // 多边形中线的实体集合
            demoLineEntityArr: [], // 绘制移动时线的实体集合
        };
        this.handlerLeftClickCallBack = null // 点击实体调用的回调函数

    }
    /**
     * 删除点与线实体
     * @param name 判断删除的实体类型
     */
    delDemoEntity = (name: string) => {
        switch (name) {
            // 删除辅助点
            case 'point_dome_name':
                this.pointAndLineEntity.pointEntityArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;
            // 绘制线
            case 'line_name':
                this.pointAndLineEntity.lineEntityArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;

            // 删除辅助线
            case 'line_demo_name':
                this.pointAndLineEntity.demoLineEntityArr.map((item: any) => {
                    this.viewer.entities.remove(item)
                })
                break;
            default:
                break;
        }
    }
    /**
     * 点击绘制点,并返回点的实例
     * @param lnglatHeight //经度纬度高度
     * @returns 
     */
    drawPoint = (lnglatHeight: number[]) => {
        const entityPoint = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lnglatHeight[0], lnglatHeight[1], lnglatHeight[2]),
            name: 'point_dome_name',
            point: {
                color: Cesium.Color.fromCssColorString('#fc3d4a'),
                outlineColor: Cesium.Color.fromCssColorString('#fc3d4a'),
                pixelSize: 11,
                clampToGround: true,
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
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
        const entityLine = this.viewer.entities.add({
            name: name,
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return [Cesium.Cartesian3.fromDegrees(lineArr[0][0], lineArr[0][1], lineArr[0][2]), Cesium.Cartesian3.fromDegrees(lineArr[1][0], lineArr[1][1], lineArr[1][2])]
                }, false),
                width: 5,
                material: Cesium.Color.fromCssColorString('#fcc31f'),
                clampToGround: true,
            },
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
        })
        return entityLine
    }
    /**
    * 绘制面
    * @param lonAndLat 经纬度
    */
    drawPolyGon = (lonAndLat: any[]) => {
        // 坐标转换为cartesian3
        const points: Cesium.Cartesian3[] = []
        lonAndLat.map((item: number[]) => {
            var cartesian3 = Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]);
            points.push(cartesian3);
        })
        this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(points);
                }, false),
                material: Cesium.Color.fromCssColorString('#ffffff'),
                extrudedHeight: 0,
                height: 0,
                clampToGround: true, //开启贴地
            },
            type: 'polygon',
        });
    }
    /**
     * 绘制多面体
     * @param lonAndLat 经纬度集合
     */
    drawPolyhedron = (extrudedHeight, height = 0, color) => {
        // 获取当前点击的实体坐标
        const positions = this.viewer.entities.getById(this.polygonId).polygon.hierarchy._callback().positions;
        this.viewer.entities.removeById(this.polygonId);
        this.viewer.entities.add({
            id: this.polygonId,
            name: 'polyhedron_name',
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(positions);
                }, false),
                extrudedHeight: extrudedHeight, // 是指polygon拉伸后的面距离地面的拉伸高度 只有当extrudedHeight大于height时才会呈现挤出高度的效果，且polygon的厚度就是两者的差值。
                height: height, // 是指polygon距离地面的高度
                material: Cesium.Color.fromCssColorString(color),
                outlineColor: Cesium.Color.RED,
                outlineWidth: 2,
                outline: true
            },
        });
    }
    // 修改面的高度
    setHeight = (polygonEntity: Cesium.Entity, height: number) => {
        const extrudedHeight = polygonEntity.polygon.extrudedHeight._value;
        polygonEntity.polygon.height._value = height + extrudedHeight;
    }
    // 修改面的离地高度
    setExtrudedHeight = (polygonEntity: Cesium.Entity, extrudedHeight: number) => {
        const xheight = polygonEntity.polygon.extrudedHeight._value
        const sheight = polygonEntity.polygon.height._value
        const Difference = extrudedHeight - xheight;
        polygonEntity.polygon.extrudedHeight._value = extrudedHeight;
        polygonEntity.polygon.height._value = sheight + Difference;
    }
    //  修改颜色
    setColor = (polygonEntity: Cesium.Entity, color: string) => {
        polygonEntity.polygon.material = Cesium.Color.fromCssColorString(color)
    }
    // 显示隐藏
    setShow = (polygonEntity: Cesium.Entity, show: boolean) => {
        polygonEntity.show = show
    }

    // 修改名称
    setName = (polygonEntity: Cesium.Entity, name: string) => {
        polygonEntity.name = name
    }

    /**
     * 加载现有的多边形
     */
    drawDatapolygon = (data: any) => {
        data.forEach((item: any) => {
            if (item.show) {
                polygonList.push(item)
                this.viewer.entities.add({
                    id: item.id,
                    name: item.name,
                    polygon: {
                        hierarchy: new Cesium.CallbackProperty(() => {
                            return new Cesium.PolygonHierarchy(item.data);
                        }, false),
                        extrudedHeight: item.height, // 是指polygon拉伸后的面距离地面的拉伸高度 只有当extrudedHeight大于height时才会呈现挤出高度的效果，且polygon的厚度就是两者的差值。
                        height: 0, // 是指polygon距离地面的高度
                        material: Cesium.Color.fromCssColorString(item.color),
                        outlineColor: Cesium.Color.RED,
                        outlineWidth: 2,
                        outline: true
                    },
                });
            }
        })
    }

    // 开启绘制
    draw = () => {
        this.isDrawPolyGon = true
        this.isEditPolyGon = false
        this.clearHandler();
        this.openHandlerListen();
    }
    // 开启编辑
    edit = () => {
        this.isEditPolyGon = true
        this.isDrawPolyGon = false
        this.clearHandler();
        this.openHandlerListen();
    }
    // 删除左键/移动/右键事件
    clearHandler = () => {
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
    }
    // 开启事件监听
    openHandlerListen = () => {
        if (this.handler) {
            this.handlerLeftClick()
            this.handlerMouseMove()
            this.handerRightClick()
        }
    }
    // 清空数据
    clearData = () => {
        this.nowPoint = []
        this.pointArr = []
        this.polygonId = null
        this.pointAndLineEntity = {
            pointEntityArr: [],
            lineEntityArr: [],
            demoLineEntityArr: [],
        }
    }
    // 监听鼠标左键点击事件
    handlerLeftClick = () => {
        // 监听鼠标左击事件
        this.handler.setInputAction((event: any) => {
            let pick = this.viewer.scene.pick(event.position)
            if (this.isDrawPolyGon) {
                // 鼠标当前位置的cartesain3坐标
                let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.position);
                // 转换为wg84坐标
                const lngLat = cartesian3_to_lng_lat(cartesain3)
                // 点数据保存格式为经纬度
                this.pointArr.push(lngLat)
                // 当前点数据
                this.nowPoint = lngLat
                // 绘制点
                const point = this.drawPoint(lngLat)
                // 保存点的实体
                this.pointAndLineEntity.pointEntityArr.push(point)
                // 画线
                const num = this.pointArr.length
                // 当节点数量大于1时开会绘制线
                if (num > 1) {
                    // 删除鼠标移动画线
                    this.delDemoEntity('line_demo_name')
                    // 生成线的实体
                    const line = this.drawLine('line_name', [this.pointArr[num - 2], this.pointArr[num - 1]])
                    // 保存线的实体
                    this.pointAndLineEntity.lineEntityArr.push(line);
                }
            } else if (this.isEditPolyGon) {
                if (Cesium.defined(pick) && pick.id && pick.id.type === 'polygon') {
                    this.polygonId = pick.id.id;
                    this.delDemoEntity('point_dome_name')
                    this.pointAndLineEntity.pointEntityArr = []
                    const positions = pick.id.polygon.hierarchy._callback().positions
                    positions.map((cartesian3, index) => {
                        const point = this.viewer.entities.add({
                            name: "point_dome_name",
                            position: cartesian3,
                            point: {
                                color: Cesium.Color.fromCssColorString('#fc3d4a'),
                                pixelSize: 11,
                                outlineColor: Cesium.Color.fromCssColorString('#fc3d4a'),
                                clampToGround: true,
                            },
                            type: 'point'
                        });
                        // 保存点的实体以便删除
                        this.pointAndLineEntity.pointEntityArr.push(point)
                    })
                    this.handlerLeftClickCallBack && this.handlerLeftClickCallBack(pick.id)
                    // 添加线
                    // const line = this.viewer.entities.add({
                    //     name: 'line_name',
                    //     polyline: {
                    //         positions: new Cesium.CallbackProperty(() => {
                    //             return [...positions, positions[0]]
                    //         }, false),
                    //         width: 5,
                    //         material: Cesium.Color.fromCssColorString('#fcc31f'),
                    //         clampToGround: true,
                    //     },
                    //     classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
                    // })
                    // this.pointAndLineEntity.lineEntityArr.push(line)
                } else if (Cesium.defined(pick) && pick.id && pick.id.type === 'point') {
                    // 清空数据
                    this.nowPoint = []
                    // 添加当前点位的数据
                    this.nowPoint.push(pick)
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    // 监听鼠标移动事件
    handlerMouseMove = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawPolyGon && this.pointArr.length > 0) {
                // 绘制逻辑
                // 鼠标当前位置的cartesain3坐标
                let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                // 转换为wg84坐标
                const lngLat = cartesian3_to_lng_lat(cartesain3)
                // 删除上一次生成线
                this.delDemoEntity('line_demo_name')
                // 创建线
                const demoLine = this.drawLine('line_demo_name', [this.nowPoint, lngLat])
                // 保存移动线的实体
                this.pointAndLineEntity.demoLineEntityArr.push(demoLine)
            } else if (this.isEditPolyGon && this.nowPoint.length > 0) {
                // 编辑逻辑
                // 通过id查询当前选中的实体
                const box = this.viewer.entities.getById(this.polygonId);
                // 鼠标当前位置的cartesain3坐标
                let cartesain3 = this.viewer.scene.camera.pickEllipsoid(event.startPosition);
                // 更新点坐标
                this.nowPoint[0].id.position = cartesain3
                // 获取更新面坐标的数据
                let points: any = [];
                this.pointAndLineEntity.pointEntityArr.forEach((item: any) => {
                    points.push(item.position._value);
                })
                // 更新面坐标
                box.polygon.hierarchy = new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(points);
                }, false);
                // 更新线坐标
                // this.pointAndLineEntity.lineEntityArr[0].polyline.positions = new Cesium.CallbackProperty(() => {
                //     return points;
                // }, false);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    // 监听鼠标右键点击事件
    handerRightClick = () => {
        this.handler.setInputAction((event: any) => {
            if (this.isDrawPolyGon) {
                // 结束绘制
                this.isDrawPolyGon = false
                // 删除辅助线
                this.delDemoEntity('line_demo_name')
                // 删除画点以及画线
                this.delDemoEntity('line_name')
                this.delDemoEntity('point_dome_name')
                // 画多边形结束,形成面开始
                this.drawPolyGon(this.pointArr)
                // 清空数据
                this.clearData()
            } else if (this.isEditPolyGon) {
                // 结束编辑
                this.isEditPolyGon = false
                // 删除辅助线
                this.delDemoEntity('line_demo_name')
                // 删除画点以及画线
                this.delDemoEntity('line_name')
                this.delDemoEntity('point_dome_name')
                // 画多边形结束,形成面开始
                this.drawPolyGon(this.pointArr)
                // 清空数据
                this.clearData()
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }
    //
}

