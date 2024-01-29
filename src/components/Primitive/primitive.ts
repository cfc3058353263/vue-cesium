import * as Cesium from 'cesium';
/*
 * Cesium 1.102之后的版本：
 * 由于版本更迭 ，一些webgl的关键字需要变动
 * 将顶点着色器中的varying替换为out
 * 将片元着色器中的varying替换为in
 * 将片元着色器中的texture2D替换为texture
 * 修改片元着色器中的 gl_FragColor替换为out_FragColor
 */
const DynamicCircle = `
uniform sampler2D colorTexture;    //颜色纹理
uniform sampler2D depthTexture;    //深度纹理
in vec2 v_textureCoordinates; //纹理坐标
uniform vec4 u_scanCenterEC;       //扫描中心
uniform vec3 u_scanPlaneNormalEC;  //扫描平面法向量
uniform float u_radius;            //扫描半径
uniform vec4 u_scanColor;          //扫描颜色

// 根据二维向量和深度值 计算距离camera的向量
vec4 toEye(in vec2 uv, in float depth) {
    vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
    // 看看源码中关于此函数的解释是，cesium系统自动生成的4*4的反投影变换矩阵
    // 从clip坐标转为眼睛坐标，clip坐标是指顶点着色器的坐标系统gl_position输出的
    vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
    posInCamera = posInCamera / posInCamera.w; //将视角坐标除深度分量
    return posInCamera;
}

// 点在平面上的投影，输入参数为 平面法向量，平面起始点，测试点
vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
    // 计算测试点与平面起始点的向量
    vec3 v01 = point - planeOrigin;
    // 平面法向量与 测试点与平面上的点 点积  点积的几何意义，b在a上的投影长度，
    // 即v01在平面法向量上的长度
    float d = dot(planeNormal, v01);
    // planeNormal * d 即为v01在平面法向量上的投影向量
    // 根据三角形向量相加为0的原则 即可得点在平面上的投影
    return (point - planeNormal * d);
}

// 获取深度值，根据纹理坐标获取深度值
float getDepth(in vec4 depth) {
    float z_window = czm_unpackDepth(depth);  //源码解释将一个vec4向量还原到0，1内的一个数
    z_window = czm_reverseLogDepth(z_window); // czm_reverseLogDepth解开深度
    float n_range = czm_depthRange.near;      //
    float f_range = czm_depthRange.far;
    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
}

void main() {
    out_FragColor = texture(colorTexture, v_textureCoordinates);          //片元颜色
    float depth = getDepth(texture(depthTexture, v_textureCoordinates)); //根据纹理获取深度值
    vec4 viewPos = toEye(v_textureCoordinates, depth);                     //根据纹理坐标和深度值获取视点坐标
    // 点在平面上的投影，平面法向量，平面中心，视点坐标
    vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
    // 计算投影坐标到视点中心的距离
    float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
    // 如果在扫描半径内，则重新赋值片元颜色
    if (dis < u_radius) {
        // 计算与扫描中心的距离并归一化
        float f = dis / u_radius;
        // 原博客如下，实际上可简化为上式子
        // float f = 1.0 -abs(u_radius - dis) / u_radius;
        // 四次方
        f = pow(f, 2.0);
        // mix(x, y, a): x, y的线性混叠， x(1-a)  y*a;,
        // 效果解释：在越接近扫描中心时，f越小，则片元的颜色越接近原来的，相反则越红
        out_FragColor = mix(out_FragColor, u_scanColor, f);
    }
}
`;

/**
 * 创建圆形扩散
 * @param viewer cesium实例
 * @param cartographicCenter 扩散中心点位置
 * @param maxRadius 最大半径 米
 * @param scanColor 颜色
 * @param duration 动画时间 毫秒
 * @returns
 */
export function createDynamicCircleStage(
    viewer: Cesium.Viewer,
    cartographicCenter: Cesium.Cartographic,
    maxRadius: number,
    scanColor: Cesium.Color,
    duration: number
) {
    // 中心点
    var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    var _Cartesian4Center = new Cesium.Cartesian4(
        _Cartesian3Center.x,
        _Cartesian3Center.y,
        _Cartesian3Center.z,
        1
    );

    // 中心点垂直高度上升500m的坐标点，目的是为了计算平面的法向量
    var _CartographicCenter1 = new Cesium.Cartographic(
        cartographicCenter.longitude,
        cartographicCenter.latitude,
        cartographicCenter.height + 500
    );
    var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(
        _Cartesian3Center1.x,
        _Cartesian3Center1.y,
        _Cartesian3Center1.z,
        1
    );

    // 当前时间
    var _time = new Date().getTime();

    // 转换成相机参考系后的中心点，上升高度后的中心点以及平面法向量
    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();

    // 自定义PostProcessStage
    var dynamicCircle = new Cesium.PostProcessStage({
        fragmentShader: DynamicCircle,
        uniforms: {
            // 将中心点坐标转化到相机参考系
            u_scanCenterEC: function () {
                return Cesium.Matrix4.multiplyByVector(
                    viewer.camera._viewMatrix,
                    _Cartesian4Center,
                    _scratchCartesian4Center
                );
            },
            // 计算相机参考系下的平面法向量
            u_scanPlaneNormalEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(
                    viewer.camera._viewMatrix,
                    _Cartesian4Center,
                    _scratchCartesian4Center
                );
                var temp1 = Cesium.Matrix4.multiplyByVector(
                    viewer.camera._viewMatrix,
                    _Cartesian4Center1,
                    _scratchCartesian4Center1
                );
                _scratchCartesian3Normal.x = temp1.x - temp.x;
                _scratchCartesian3Normal.y = temp1.y - temp.y;
                _scratchCartesian3Normal.z = temp1.z - temp.z;

                Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                return _scratchCartesian3Normal;
            },
            // 动态半径
            u_radius: function () {
                return (maxRadius * ((new Date().getTime() - _time) % duration)) / duration;
            },
            u_scanColor: scanColor,
        },
    });
    return dynamicCircle;
}

/**
 * 创建多个几何图形且合并
 */
export const connectGeometry = (viewer: Cesium.Viewer) => {
    var instances = [];
    for (var lon = -180.0; lon < 180.0; lon += 5.0) {
        for (var lat = -90.0; lat < 90.0; lat += 5.0) {
            instances.push(
                new Cesium.GeometryInstance({
                    // geometry 实体
                    geometry: new Cesium.RectangleGeometry({
                        //  Cesium.Rectangle.fromDegrees 给定边界经度和纬度（以度为单位）创建一个矩形。
                        //  rectangle 具有弧度的北，南，东和西属性的制图矩形。
                        rectangle: Cesium.Rectangle.fromDegrees(lon, lat, lon + 5.0, lat + 5.0),
                    }),
                    attributes: {
                        // 颜色
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.fromRandom({
                                alpha: 0.5,
                            })
                        ),
                    },
                })
            );
        }
    }
    viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: instances, //合并
            //某些外观允许每个几何图形实例分别指定某个属性，例如：
            appearance: new Cesium.PerInstanceColorAppearance(),
        })
    );
};

/**
 * 多个GeometryInstancee可以共用一个Geometry
 */
export const geometryInstancesAddGeo = (viewer: Cesium.Viewer) => {
    var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radii: new Cesium.Cartesian3(300000.0, 200000.0, 150000.0), //三轴半径
    });
    //下方的实例
    var cyanEllipsoidInstance = new Cesium.GeometryInstance({
        geometry: ellipsoidGeometry,
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
            new Cesium.Cartesian3(0.0, 0.0, 150000.0)
        ),
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.CYAN),
        },
    });
    //上方的实例
    var orangeEllipsoidInstance = new Cesium.GeometryInstance({
        geometry: ellipsoidGeometry,
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
            new Cesium.Cartesian3(0.0, 0.0, 450000.0)
        ),
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE),
        },
    });
    viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [cyanEllipsoidInstance, orangeEllipsoidInstance],
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: false,
                closed: true,
            }),
        })
    );
};

/**
 * 修改GeometryInstancee的样式
 */
// instance: Cesium.GeometryInstance,
// style: Cesium.Appearance
export const setGeometryInstanceStyle = (
    viewer: Cesium.Viewer,
) => {
    var circleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CircleGeometry({
            center: Cesium.Cartesian3.fromDegrees(116.39121137414092, 39.90778348948195),
            radius: 250000.0,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
            show: new Cesium.ShowGeometryInstanceAttribute(true), //显示或者隐藏
        },
        id: 'circle',
    });
    var primitive = new Cesium.Primitive({
        geometryInstances: circleInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
        }),
    });
    viewer.scene.primitives.add(primitive);
    //定期修改颜色
    setInterval(function () {
        var attributes = primitive.getGeometryInstanceAttributes('circle'); //获取某个实例的属性集
        attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(
            Cesium.Color.fromRandom({
                alpha: 1.0,
            })
        );
    }, 2000);
};
