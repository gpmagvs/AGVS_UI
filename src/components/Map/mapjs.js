
import { Circle, Fill, Icon, Stroke, Style, Text, RegularShape } from 'ol/style.js';
import Point from 'ol/geom/Point.js';
import { Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { Rectangle } from 'leaflet';
import { MapStore } from './store';
import gpm_param from '../../gpm_param'
function IsDev() {
    return process.env.NODE_ENV == 'development'
}

var agv_image_path_default = IsDev() ? `${gpm_param.backend_host}/AGVImages/default.png` : '/agv.png'

/**根據Index取得點位物件 */
export function GetPointByIndex(index) {
    var points = MapStore.getters.MapData.Points;
    var pt = points[index]
    if (pt) {
        return pt;
    } else {
        return {}
    }
}

/**階乘 */
function factorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}

/*
 * 生成贝塞尔曲线插值点
 * @para n {number} 控制点数量
 * @para arrPoints {array} 控制点坐标集合
 */
export function createBezierCurvePoints(n = 1, arrPoints = [Point]) {

    var Ptx = 0;
    var Pty = 0;

    var arrbline = [];
    for (var t = 0; t < 1; t = t + 0.01) {
        Ptx = 0;
        Pty = 0;
        for (var i = 0; i <= n; i++) {
            Ptx += (factorial(n) / (factorial(i) * factorial(n - i))) * Math.pow((1 - t), n - i) * Math.pow(t, i) * arrPoints[i][0];
            Pty += (factorial(n) / (factorial(i) * factorial(n - i))) * Math.pow((1 - t), n - i) * Math.pow(t, i) * arrPoints[i][1];
        }
        arrbline.push([Ptx, Pty]);
    }

    return arrbline;
}


const station_colors = {
    normal: 'orange',
    eq: 'lightblue',
    charge: 'yellow',
    stk: 'lime'
}

/**路徑顏色 */

var pathColor = 'rgb(222,222,222)';

export function SetPathColor(color) {
    pathColor = color;
}

function eq_station_icon(image, size = [64, 64], scale = 0.45) {
    return new Icon({
        src: image == '' ? '/images/eq-icon.png' : image, // 设置PNG图像的路径
        scale: scale,
        anchor: [0.5, 0.2],
        size: size,
        opacity: 1,
        color: 'transparent',

    })
}

function charge_station_icon(image) {
    return new Icon({
        src: image == '' ? '/images/charging-station.png' : image, // 设置PNG图像的路径
        scale: 0.5,
        anchor: [0.5, 0.5],
        size: [64, 64],
        opacity: 1,
        color: 'transparent'

    })
}

function rack_station_icon(image) {
    return new Icon({
        src: image == '' ? '/images/rack.png' : image, // 设置PNG图像的路径
        scale: 0.45,
        anchor: [0.5, 0.5],
        size: [64, 64],
        opacity: 1,
        color: 'white'
    })
}


function rack_charge_station_icon(image) {
    return new Icon({
        src: image == '' ? '/images/rack_charge_station.png' : image, // 设置PNG图像的路径
        scale: 0.5,
        anchor: [0.5, 0.5],
        size: [64, 64],
        opacity: 1,
        color: 'yellow'
    })

}

function stocker_icon(image) {
    return new Icon({
        src: image == '' ? '/images/stk_.jpg' : image, // 设置PNG图像的路径
        scale: 0.45,
        anchor: [0.5, 0.5],
        size: [64, 64],
        opacity: 1,
        color: 'white'
    })
}

function lifter_icon(image) {
    return new Icon({
        src: image == '' ? '/images/lifter_icon.png' : image, // 设置PNG图像的路径
        scale: 0.35,
        anchor: [0.5, 0.5],
        size: [128, 128],
        opacity: 1,
        color: 'white'
    })
}

const loc_icon = new Icon({
    src: '/images/location.png', // 设置PNG图像的路径
    offset: [-25, -5],
    scale: 0.5,
    size: [180, 180]

})

const source_station_mark = new Icon({
    src: '/images/location.png', // 设置PNG图像的路径
    offset: [-120, -40],
    scale: 0.6,
    size: [300, 300],
})

/**一般點位 */
export function normal_station_image(stationData = new MapPointModel()) {
    var fillColor = 'orange'
    const stroke = new Stroke({ color: 'black', width: 2 });

    if (stationData) {
        if (!stationData.Enable) {
            return new RegularShape({
                fill: new Fill({
                    color: 'red',
                }),
                stroke: new Stroke({ color: 'red', width: 2 }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: Math.PI / 4,
            })
        } else {

            if (stationData.IsVirtualPoint) {
                fillColor = 'grey'
            }
            else if (stationData.IsTrafficCheckPoint) {
                fillColor = 'rgb(13, 110, 253)'
            }
            else {
                fillColor = 'orange'
            }
            if (stationData.IsAvoid) {
                return new RegularShape({
                    fill: new Fill({
                        color: 'orange',
                    }),
                    stroke: stroke,
                    points: 3,
                    radius: 6,
                    angle: 0,
                })
            }
        }

    }
    return new Circle({
        radius: 6,
        fill: new Fill({
            color: fillColor,
        }),
        stroke: stroke,
    })
}

export function CreateTransTaskMark(coordinate, text = '', bgFillColor = 'rgb(13, 110, 253)') {
    let iconFeture = new Feature({
        geometry: new Point(coordinate),
    })
    iconFeture.setStyle(new Style({
        image: source_station_mark,
        text: new Text({
            text: text,
            font: 'bold 30px Calibri,sans-serif',
            offsetX: -7,
            offsetY: -89,
            fill: new Fill({
                color: 'white'
            }),
            stroke: new Stroke({
                color: 'black',
                width: 2,
            }),
            backgroundFill: new Fill({
                color: bgFillColor
            }),
            padding: [5, 9, 5, 9]
        })
    }))
    return iconFeture;
}
export function CreateLocIcon(coordinate, isStart = true, text = '') {
    let iconFeture = new Feature({
        geometry: new Point(coordinate),
    })
    iconFeture.setStyle(new Style({
        image: isStart ? loc_icon : loc_icon,
        text: new Text({
            text: text,
            font: 'bold 16px Calibri,sans-serif',
            offsetX: 14,
            offsetY: -22,
            fill: new Fill({
                color: 'gold'
            }),
            stroke: new Stroke({
                color: 'black',
                width: 2,
            }),
        })
    }))
    return iconFeture;
}

export function GetStationStyle(text = '', station_type = 0, map_data = new MapPointModel(), size = [64, 64], scale = 0.45) {
    var image = normal_station_image(map_data)

    if (station_type == 0) {
        image = normal_station_image(map_data)
    }
    else if (station_type == 1) {
        const scale = map_data.Graph.ImageScale;
        const size = map_data.Graph.ImageSize;
        image = eq_station_icon(map_data.Graph.ImageName, size, scale)
    }
    else if (station_type == 2 || station_type == 12 || station_type == 22) {
        image = stocker_icon(map_data.Graph.ImageName)
    }
    else if (station_type == 4 || station_type == 41) {
        image = rack_station_icon(map_data.Graph.ImageName)
    }
    else if (station_type == 5 || station_type == 6) {
        image = rack_charge_station_icon(map_data.Graph.ImageName)
    }
    else if (station_type == 3) {
        image = charge_station_icon(map_data.Graph.ImageName)
    }
    else if (station_type == 100 || station_type == 201) {
        image = lifter_icon(map_data.Graph.ImageName)
    }
    var _normalStationTextColor = MapStore.getters.Settings.normalStationTextColor;
    var _workStationTextColor = MapStore.getters.Settings.workStationTextColor;
    var _normalStationTextFontSize = MapStore.getters.Settings.normalStationTextFontSize;
    var _workStationTextFontSize = MapStore.getters.Settings.workStationTextFontSize;

    var textFillColor = !map_data.Enable ? 'rgb(255, 102, 92)' : (station_type == 0 ? _normalStationTextColor : _workStationTextColor);
    var fontSize = station_type == 0 ? _normalStationTextFontSize : _workStationTextFontSize;

    var textStyle = new Style({
        image: image,
        text: new Text({
            text: text + `${map_data.Enable ? '' : '(已禁用)'}`,

            font: `bold ${fontSize}px Calibri,sans-serif`,
            offsetX: map_data.Graph.textOffsetX,
            offsetY: map_data.Graph.textOffsetY,
            fill: new Fill({
                color: textFillColor,//PointColorSelect(station_type)

            }),
            backgroundFill: station_type == 0 ? undefined : new Fill({
                color: 'rgba(152, 209, 224,.2)'
            }),
            // stroke: new Stroke({
            //     color: 'black',
            //     width: 1.5,
            // }),
            padding: [1, 6, 20, 6]
        }),
    })
    return textStyle
}
/**軌跡顯示Style */
export function CreateLocusPathStyles(color = 'red', width = 1) {
    const styles = [
        new Style({
            stroke: new Stroke({
                color: color,
                width: width,
            }),
        }),
    ];
    return styles;
}
/**道路 */
export function CreateStationPathStyles(feature, color = undefined) {
    var _color = MapStore.getters.Settings.pathColor;
    var data = feature.get('data');
    var isEQLink = feature.get('isEqLink')
    var isPathClose = feature.get('isClose');
    const geometry = feature.getGeometry();
    const styles = [
        new Style({
            stroke: new Stroke({
                color: isPathClose ? 'red' : _color,
                width: 2.7,
                lineDash: isEQLink ? [4, 11] : null // 虛線模式（設定虛線段的長度和間隔）
            }),
        }),
    ];
    const coordinates = geometry.getCoordinates()

    var index = 0;
    geometry.forEachSegment(function (start, end) {
        if (index == coordinates.length - 2) {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            // arrows
            styles.push(
                new Style({
                    geometry: new Point(end),
                    image: new Icon({
                        src: '/arrow.png',
                        anchor: isEQLink ? [1.8, 0.5] : [1.2, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                        scale: 0.20,
                        color: isPathClose ? 'red' : _color
                    }),
                })
            );
            if (isPathClose) {
                start = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2]
                const dx = end[0] - start[0];
                const dy = end[1] - start[1];
                const rotation = Math.atan2(dy, dx);
                styles.push(
                    new Style({
                        geometry: new Point(start),
                        image: new Icon({
                            src: '/close.png',
                            anchor: [1.2, 0.5],
                            rotateWithView: true,
                            rotation: -rotation,
                            scale: 0.6,
                        }),
                    })
                );
            }
        }
        index += 1;
    });
    return styles;
}

export function CreateNewStationPointFeature(coordinate, point_index, featureStatonType) {
    var station = new clsMapStation();
    station.coordination = coordinate;
    station.index = point_index;
    station.station_type = 0;
    station.name = station.index + '';
    station.tag = station.index;
    station.graph = coordinate;

    var mapPtModel = new MapPointModel();
    mapPtModel.StationType = 0;
    mapPtModel.X = coordinate[0];
    mapPtModel.Y = coordinate[1];
    mapPtModel.Graph.X = coordinate[0];
    mapPtModel.Graph.Y = coordinate[1];
    mapPtModel.Name = mapPtModel.Graph.Display = station.name;
    mapPtModel.TagNumber = station.index;
    station.data = mapPtModel;
    var feature = CreateStationFeature(station);
    return feature;
}
export function CreateStationFeature(station = new clsMapStation()) {
    const iconFeature = new Feature({
        geometry: new Point(station.coordination)
        // geometry: new Point(station.graph)
    });
    iconFeature.set('index', station.index)
    iconFeature.set('name', station.name)
    iconFeature.set('station_type', station.station_type)
    iconFeature.set('targets', station.targets)
    iconFeature.set('feature_type', 'station')
    iconFeature.set('data', station.data)
    iconFeature.set('coordination', station.coordination)
    iconFeature.set('graph', station.graph)
    var name = station.name
    iconFeature.setStyle(GetStationStyle(name, station.station_type, station.data));
    var routeFeature = iconFeature.clone();
    if (station.data.Graph) {
        routeFeature.setGeometry(new Point([station.data.Graph.X, station.data.Graph.Y]))
    }
    iconFeature.set('routeModeFeature', routeFeature)
    return iconFeature;
}

export function CreateEQLDULDFeature(station = new clsMapStation(), mode = 'router' | 'coordination') {
    var _coor = mode == 'coordination' ? station.coordination : station.graph;
    const iconFeature = new Feature({
        geometry: new Point(_coor)
    });
    iconFeature.set('feature_type', 'lduld')
    iconFeature.set('data', station.data)
    iconFeature.set('action', 0)
    var _style = new Style({
        image: undefined,
        text: new Text({
            font: 'bold 14px Calibri,sans-serif',
            offsetX: 14,
            offsetY: -52,
            stroke: new Stroke({
                width: 1
            }),
            fill: new Fill({
                color: 'white',//PointColorSelect(station_type)
            }),
            backgroundFill: new Fill({
                color: 'seagreen',//PointColorSelect(station_type)
            }),
            backgroundStroke: new Stroke({
                color: 'grey',
                width: 2,
            }),
            rotation: 0.15,
            padding: [5, 5, 5, 5]

        }),
    })
    iconFeature.setStyle(_style)
    return iconFeature;
}


/**生成禁制區 */
export function CreateRegionPolygon(name = "禁制區", polygon_coordinations = [], region_type = 0 | 1) {

    var _isForbidRegion = region_type == 0;
    var _fillColor = _isForbidRegion ? 'rgba(255, 0, 0,0.5)' : 'rgba(116, 249, 42,0.3)';
    var _textBgColor = _isForbidRegion ? 'orange' : 'rgb(139, 171, 206)';
    var _strokeColor = _isForbidRegion ? 'red' : 'seagreen';
    var _region_type = _isForbidRegion ? 'forbid' : 'passible';
    var polygon = new Feature(
        new Polygon([polygon_coordinations])
    );
    polygon.setStyle(new Style({
        fill: new Fill({
            color: _fillColor
        }),
        stroke: new Stroke({
            color: _strokeColor,
            width: 1 // 邊框寬度,
        })
    }));
    polygon.set('type', "polygon")
    polygon.set('name', name)
    polygon.set('region_type', _region_type)
    const center = polygon.getGeometry().getInteriorPoint().getCoordinates();
    // 新增文字標籤
    var text = new Feature({
        geometry: new Point(center),
        name: name
    });
    text.set('type', "text")
    text.set('name', name)
    text.set('region_type', _region_type)

    text.setStyle(new Style({
        text: new Text({
            text: text.get('name'),
            scale: 1.1,
            font: 'bold 22px Arial',
            fill: new Fill({
                color: 'white'
            }),
            backgroundFill: new Fill({
                color: _textBgColor
            }),
            padding: [5, 5, 5, 5]

        })
    }));
    return { region_feature: polygon, text_feature: text }
}

function GetCargoIcon(cargo_type, exist = false) {
    if (!exist)
        return null
    return new Icon({
        src: cargo_type == 201 ? 'images/rack2.png' : 'images/tray.png',
        scale: cargo_type == 201 ? .8 : .12, // 设置PNG图像的缩放比例
        anchor: cargo_type == 201 ? [1.3, 0.95] : [1, 0.85], // 设置PNG图像的锚点，即图片的中心点位置
        size: cargo_type == 201 ? [60, 60] : [1052, 781],// 设置PNG图像的大小
        opacity: 1,
    })
}
export function AGVCargoIconStyle(cargo_type = 0, cargo_id = '', cst_exist = false) {
    return new Style({
        image: GetCargoIcon(cargo_type, cst_exist),
        text: new Text({
            // text: `${cargo_type.toUpperCase()}\r\n${cargo_id}`,
            text: cargo_id,
            offsetX: -55,
            offsetY: -45,
            textAlign: 'left',
            font: 'bold 16px Arial',
            fill: new Fill({
                color: 'white'
            }),
            backgroundFill: new Fill({
                color: 'rgb(13, 110, 253)',
            }),
            padding: [5, 8, 5, 8]


        })
    })
}
export function ChangeCargoIcon(feature = new Feature(), cargoStates = new clsCargoStates()) {
    var style = AGVCargoIconStyle(cargoStates.cargo_type, cargoStates.cst_id, cargoStates.exist);
    feature.setStyle(style);
}

export var AGVIcon = (imgUrl = undefined, ImageSize = undefined) => {
    var width = 64;
    var height = 64;

    var _isblob = imgUrl.substring(0, 4) == 'blob';
    var _imgUrl = imgUrl
    // var _imgUrl = _isblob || !IsDev() ? imgUrl : `${gpm_param.backend_host}/AGVImages/AGV_001-Icon.png`
    if (ImageSize) {
        width = ImageSize[0]
        height = ImageSize[1]

    } else {
        function delay(ms) {
            return new Promise(resolve => {
                setTimeout(resolve, ms)
            })
        }
        var agv_img = new Image();
        agv_img.src = _imgUrl;
        width = agv_img.width == 0 ? 64 : agv_img.width;
        height = agv_img.height == 0 ? 64 : agv_img.height;
    }
    return new Icon({
        src: _imgUrl, // 设置PNG图像的路径
        scale: 48 / width, // 设置PNG图像的缩放比例
        anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
        size: [width, height],// 设置PNG图像的大小
        opacity: 1,
        rotation: 0 * Math.PI / 180.0 //3.14 180

    })
}
export function SimpleAGVStyle(agv_name, color) {
    return new Style({
        image: new Icon({
            src: '/agv.png', // 设置PNG图像的路径
            scale: .6, // 设置PNG图像的缩放比例
            anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
            size: [64, 64],// 设置PNG图像的大小
            opacity: 1,
            rotation: 0 * Math.PI / 180.0 //3.14 180

        }),
        text: new Text({
            text: agv_name,
            offsetX: 0,
            offsetY: 32,
            font: 'bold 16px Arial',
            fill: new Fill({
                color: 'white'
            }),

            backgroundFill: new Fill({
                color: color,
            }),
            backgroundStroke: new Stroke({
                color: 'black',
            }),
            textAlign: 'center',
            padding: [4, 4, 4, 4]
        }),
    })
}
export function AGVPointStyle(agv_name, color, ImageName = undefined, ImageSize = undefined) {
    return new Style({
        image: AGVIcon(ImageName),
        text: new Text({
            text: agv_name,
            offsetX: 0,
            offsetY: 32,
            font: 'bold 16px Arial',
            fill: new Fill({
                color: 'white'
            }),

            backgroundFill: new Fill({
                color: color,
            }),
            backgroundStroke: new Stroke({
                color: 'black',
            }),
            textAlign: 'center',
            padding: [6, 8, 6, 8]
        }),
    })
}

export function convertColorNameToRGBA(colorName, alpha = 1) {
    var tempElem = document.createElement("div");
    tempElem.style.color = colorName;
    document.body.appendChild(tempElem);
    var rgbColor = window.getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
    var rgbaColor = rgbColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    return rgbaColor;
}

function PointColorSelect(station_type) {
    if (station_type == 0)
        return station_colors.normal
    else if (station_type == 1)
        return station_colors.eq
    else if (station_type == 2)
        return station_colors.stk
    else if (station_type == 3)
        return station_colors.charge
    else
        return 'black'
}
function GetActionName(action, CargoStates = new clsCargoStates()) {
    if (action == 0)
        return CargoStates.exist ? '跑貨' : '移動'
    if (action == 1)
        return '取貨'
    if (action == 2)
        return '放貨停車'
    if (action == 3)
        return '前進'
    if (action == 4)
        return '後退'
    if (action == 5)
        return 'Fab?'
    if (action == 6)
        return '量測'
    if (action == 7)
        return '放貨'
    if (action == 8)
        return '充電'
    if (action == 9)
        return '搬運'
    if (action == 10)
        return '移出充電站'
    if (action == 11)
        return '快逃'
    if (action == 12)
        return '停車'

    if (action == 13)
        return '離開停車'
    if (action == 14)
        return '電池交換'
    if (action == 15)
        return 'Hold'
    if (action == 16)
        return 'Break'
    if (action == 17)
        return ''
}
/**AGV地圖顯示參數 */
export class AGVOption {
    constructor(AGVNum = 1, AGVDisplayOptions = []) {
        this.AGVNum = AGVNum
        this.AGVDisplays = AGVDisplayOptions

    }
}

export class clsAGVDisplay {
    constructor(AgvName = "AGV", TextColor = "pink", initCoordination = [0, 0], navCoorList = [], CargoStatus = new clsCargoStates(), Tag = 0, Theta = 0, WaitingInfo = new clsWaitingInfo(), CurrentAction = 0, AgvStates = new clsAgvStates(), DisplayText = "", vehicleLength = 145, vehicleWidth = 80) {
        this.AgvName = AgvName
        this.TextColor = TextColor
        this.Coordination = initCoordination;
        this.NavPathCoordinationList = navCoorList
        this.CargoStatus = CargoStatus
        this.Tag = Tag
        this.Theta = Theta
        this.WaitingInfo = WaitingInfo
        this.CurrentAction = AgvStates.is_executing_task ? GetActionName(CurrentAction, CargoStatus) : ""
        this.AgvStates = AgvStates
        this.DisplayText = DisplayText == "" ? AgvName : DisplayText
        this.vehicleWidth = vehicleWidth;
        this.vehicleLength = vehicleLength;
    }
}
export class clsWaitingInfo {
    constructor() {
        this.IsWaiting = false;
        this.Descrption = '';
        this.WaitingPoint = {}
    }
}
export class clsCargoStates {
    constructor(exist = false, type = 0, cst_id = '') {
        this.exist = exist;
        this.cargo_type = type; //0:tray,1:rack
        this.cst_id = cst_id
    }
}

export class clsMapStation {
    constructor() {
        this.index = 0
        this.name = 'name'
        this.tag = 0
        this.station_type = 1
        this.targets = []
        this.coordination = [0, 0]
        this.graph = [0, 0]
        this.data = {}
    }
}
export class clsAgvStates {
    constructor() {
        this.is_online = false
        this.is_executing_task = false
        this.main_status = 'IDLE'
    }
}
export class clsMap {
    constructor() {
        this.Version = 1;
        this.Name = undefined;
        this.Options = new clsMapOptions();
        this.Note = '';
        this.PointIndex = 0;
        this.Map_Image_Size = [400, 400];
        this.Map_Image_Boundary = [-20, -20, 20, 20];
        this.Points = {};
        this.BezierCurves = {};
        this.Pathes = [];
        this.Segments = [];
        this.Bays = {};
        this.Regions = [new MapRegion()]
    }
}
export class clsMapOptions {
    constructor() {
        this.pathColor = 'rgb(45,42,46)';
        this.normalStationTextColor = 'orange';
        this.workStationTextColor = 'lime';
        this.normalStationTextFontSize = 12;
        this.workStationTextFontSize = 18;
        this.fontSizeOfDisplayName = 12;
        this.fontSizeOfAsCandicates = 16;
        this.Rotation = 0;
        this.EQIcons = [];
        this.gridSize = 1;
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;
        this.defaultShowBackgroudImage = true
    }
}
/**後端圖資模型 */
export class MapPointModel {
    constructor() {
        this.X = 0;
        this.Y = 0;
        this.Name = ""
        this.TagNumber = 0
        this.Direction = 0
        this.Direction_Secondary_Point = 0 //二次定位點的停車角度
        this.AGV_Alarm = false;
        this.Enable = true;
        this.IsStandbyPoint = false;
        this.IsSegment = false
        this.IsOverlap = false
        this.IsParking = false
        this.IsAvoid = false;
        this.IsVirtualPoint = false;
        this.IsAutoDoor = false
        this.IsExtinguishing = false
        this.InvolvePoint = ""
        this.StationType = 0
        this.LsrMode = 1
        this.Speed = 1
        this.Bay = ""
        this.Graph = {
            Display: "",
            X: 0,
            Y: 0,
            ImageName: '',
            ImageScale: 0.45,
            ImageSize: [64, 64],
            IsBezierCurvePoint: false,
            BezierCurveID: '',
            textOffsetX: 0,
            textOffsetY: -22
        }
        this.Target = {

        }
        this.DodgeMode = 0
        this.SpinMode = 0
        this.SubMap = ""
        this.AutoDoor = {
            KeyName: "",
            KeyPassword: ""
        }
        this.MotionInfo = {
            ControlBypass: {
                GroundHoleCCD: "",
                GroundHoleSensor: "",
                UltrasonicSensor: ""

            }
        }
        this.Region = ""
        this.IsCharge = false
        this.IsEquipment = false
        this.IsSTK = false
        this.IsEQLink = false
        this.IsCross = false
        this.IsRegisted = false
        this.IsTrafficCheckPoint = false
        this.RegistInfo = null
    }
}

export class MapRegion {
    constructor(name = "", coordinations = [], region_type = 0 | 1) {
        this.Name = name
        this.PolygonCoordinations = coordinations
        this.RegionType = region_type
        this.IsOpend = true
        this.IsNarrowPath = true
        this.MaxVehicleCapacity = 2
        this.SpeedLimit = 1
        this.EnteryTags = []
        this.LeavingTags = []
        this.ThetaLimitWhenAGVIdling = 0
    }
}
export class MapContextMenuOptions {
    constructor() {
        this.title = 'title'
        this.backgroundColor = 'white'
        this.feature_type = 'Station'
        this.point_data = new MapPointModel()
        this.show_task_dispatch = false
        this.task_options = new MenuUseTaskOption()
    }
}

export class MenuUseTaskOption {
    constructor(StationType) {
        this.StationType = StationType

    }
}

/**Select點位選項 */
export class StationSelectOptions {
    constructor(tag = 0, name = '', name_display = '') {
        this.tag = tag
        this.name = name
        this.name_display = name_display
    }
}

export class BezierCurve {
    constructor(ID = "", Rank = 2, MidPointCoordination = [0, 0]) {
        this.ID = ID
        this.Rank = Rank
        this.MidPointCoordination = MidPointCoordination
    }
}

export class AgvDisplayProps {
    constructor(color = "pink", text = "RRRR", index = 0) {
        this.DisplayText = text
        this.DisplayColor = color
        this.Index = index
    }
}