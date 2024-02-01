import * as Cesium from 'cesium';
import axios from 'axios';
import polylineTrailLinkMaterial from './polylineTrailLinkMaterial.png';
import redGradient from './redGradient.png';

// 创建立体墙
export const createWall = (viewer: Cesium.Viewer) => {
    // 添加山东的围墙
    axios.get('https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json').then((data: any) => {
        const features = data.data.features;
        addDataToGlobe(features);
    });
    const addDataToGlobe = (features: any) => {
        const instances = [];
        for (let i = 0; i < features.length; i++) {
            for (let j = 0; j < features[i].geometry.coordinates.length; j++) {
                const polygonArray = features[i].geometry.coordinates[j].toString().split(',').map(Number);
                const geometry = new Cesium.WallGeometry({
                    positions: Cesium.Cartesian3.fromDegreesArray(polygonArray),
                    // 设置高度
                    maximumHeights: new Array(polygonArray.length / 2).fill(10000),
                    minimumHeights: new Array(polygonArray.length / 2).fill(0),
                });
                instances.push(
                    new Cesium.GeometryInstance({
                        geometry: geometry,
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREEN),
                        },
                    })
                );
            }
        }
        const material = createMaterialPrimitive()
        // 合并单个geometry,提高渲染效率
        const primitive = new Cesium.Primitive({
            geometryInstances: instances,
            // PerInstanceColorAppearance：使用每个实例自定义的颜色着色
            // appearance: new Cesium.PerInstanceColorAppearance(),
            appearance: new Cesium.MaterialAppearance({
                material: material,
            }),
        });
        viewer.scene.primitives.add(primitive);
    };
};

// 添加动态墙
export function addWall(viewer: Cesium.Viewer) {
    //动态墙材质
    const DynamicWallMaterialProperty = createMaterialEntity();
    // 绘制墙体
    viewer.entities.add({
        name: '立体墙效果',
        wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                118.286419, 31.864436, 20000.0, 119.386419, 31.864436, 20000.0, 119.386419, 32.864436,
                20000.0, 118.286419, 32.864436, 20000.0, 118.286419, 31.864436, 20000.0,
            ]),
            // 设置高度
            maximumHeights: new Array(5).fill(10000),
            minimumHeights: new Array(5).fill(1000),
            material: new DynamicWallMaterialProperty({
                color: Cesium.Color.fromBytes(55, 96, 56).withAlpha(0.7),
                // color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                duration: 3000,
            }),
        },
    });
    viewer.zoomTo(viewer.entities);
}

// 创建entity材质
const createMaterialEntity = () => {
    //动态墙材质
    function DynamicWallMaterialProperty(options) {
        // 默认参数设置
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = options.color;
        this.duration = options.duration;
        this.trailImage = options.trailImage;
        this._time = new Date().getTime();
    }
    Object.defineProperties(DynamicWallMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            },
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            },
        },
        color: Cesium.createPropertyDescriptor('color'),
    });
    DynamicWallMaterialProperty.prototype.getType = function (time) {
        return 'DynamicWall';
    };
    DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(
            this._color,
            time,
            Cesium.Color.WHITE,
            result.color
        );
        if (this.trailImage) {
            result.image = this.trailImage;
        } else {
            result.image = Cesium.Material.DynamicWallImage;
        }

        if (this.duration) {
            result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
        }
        return result;
    };
    DynamicWallMaterialProperty.prototype.equals = function (other) {
        return (
            this === other ||
            (other instanceof DynamicWallMaterialProperty &&
                Cesium.Property.equals(this._color, other._color))
        );
    };
    Cesium.Material.DynamicWallType = 'DynamicWall';
    // Cesium.Material.DynamicWallImage = 'http://openlayers.vip/resources/polylineTrailLinkMaterial.png';
    // Cesium.Material.DynamicWallImage = polylineTrailLinkMaterial;
    Cesium.Material.DynamicWallImage = redGradient;
    Cesium.Material.DynamicWallSource =
        'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                {\n\
                                                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                vec2 st = materialInput.st;\n\
                                                vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));\n\
                                                vec4 fragColor;\n\
                                                fragColor.rgb = color.rgb / 1.0;\n\
                                                fragColor = czm_gammaCorrect(fragColor);\n\
                                                material.alpha = colorImage.a * color.a;\n\
                                                material.diffuse = color.rgb;\n\
                                                material.emission = fragColor.rgb;\n\
                                                return material;\n\
                                                }';
    Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
        fabric: {
            type: Cesium.Material.DynamicWallType,
            uniforms: {
                color: new Cesium.Color(1.0, 1.0, 1.0, 1),
                image: Cesium.Material.DynamicWallImage,
                time: 0,
            },
            source: Cesium.Material.DynamicWallSource,
        },
        translucent: function (material) {
            return true;
        },
    });
    return DynamicWallMaterialProperty;
};

// 创建primitive材质
const createMaterialPrimitive = () => {
    let image = polylineTrailLinkMaterial, //选择自己的动态材质图片
        color = Cesium.Color.fromCssColorString('rgba(0, 255, 255, 1)'),
        speed = 1.0, // 将speed设置为正数后，墙面会有上下移动的效果。
        source =
            'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
            {\n\
                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                vec2 st = materialInput.st;\n\
                vec4 colorImage = texture(image, vec2(fract((st.t - speed*czm_frameNumber*0.005)), st.t));\n\
                vec4 fragColor;\n\
                fragColor.rgb = color.rgb / 1.0;\n\
                fragColor = czm_gammaCorrect(fragColor);\n\
                material.alpha = colorImage.a * color.a;\n\
                material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                material.emission = fragColor.rgb;\n\
                return material;\n\
            }';
    let material = new Cesium.Material({
        fabric: {
            type: 'PolylinePulseLink',
            uniforms: {
                color: color,
                image: image,
                speed: speed,
            },
            source: source,
        },
        translucent: function () {
            return true;
        },
    });
    return material;
};
