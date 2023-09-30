
import { Circle, Fill, Icon, Stroke, Style, Text, RegularShape } from 'ol/style.js';
import Point from 'ol/geom/Point.js';
import Feature from 'ol/Feature';
import { Rectangle } from 'leaflet';

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
var pathColor = 'rgb(166, 166, 166)'

export function SetPathColor(color) {
    pathColor = color;
}

const eq_station_icon = new Icon({
    src: '/images/eq-icon.png', // 设置PNG图像的路径
    scale: 0.45,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'transparent',

})

const charge_station_icon = new Icon({
    src: '/images/charging-station.png', // 设置PNG图像的路径
    scale: 0.5,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'transparent'

})

var rack_station_icon = new Icon({
    src: '/images/rack_station.png', // 设置PNG图像的路径
    scale: 0.45,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'white'
})

/**一般點位 */
function normal_station_image(map_data = {}) {
    var fillColor = 'orange'
    const stroke = new Stroke({ color: 'black', width: 2 });

    if (map_data) {
        if (!map_data.Enable) {
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

            if (map_data.IsVirtualPoint) {
                fillColor = 'grey'
            } else {
                fillColor = 'orange'
            }
            if (map_data.IsAvoid) {
                return new RegularShape({
                    fill: new Fill({
                        color: 'orange',
                    }),
                    stroke: stroke,
                    points: 3,
                    radius: 8,
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


export function GetStationStyle(text = '', station_type = 0, map_data = {}) {
    var image = normal_station_image(map_data)
    if (station_type == 0) {
        image = normal_station_image(map_data)
    }
    else if (station_type == 1) {
        image = eq_station_icon
    }
    else if (station_type == 2) {
        image = rack_station_icon
    }
    else if (station_type == 3) {
        image = charge_station_icon
    }


    var textStyle = new Style({
        image: image,
        text: new Text({
            text: text,
            font: 'bold 16px Calibri,sans-serif',
            offsetX: 14,
            offsetY: -22,
            fill: new Fill({
                color: 'gold',//PointColorSelect(station_type)
            }),
            stroke: new Stroke({
                color: 'black',
                width: 3,
            }),
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
export function CreateStationPathStyles(feature) {
    var data = feature.get('data');
    var isEQLink = feature.get('isEqLink')
    var isPathClose = false;
    if (data) {
        isPathClose = data.IsPathClose
    }

    const geometry = feature.getGeometry();
    const styles = [
        new Style({
            stroke: new Stroke({
                color: isPathClose ? 'red' : pathColor,
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
                        src: 'arrow.png',
                        anchor: [1.6, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                        scale: 0.22,
                        color: isPathClose ? 'red' : pathColor
                    }),
                })
            );
            if (isPathClose) {
                start = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2]
                const dx = end[0] - start[0];
                const dy = end[1] - start[1];
                const rotation = Math.atan2(dy, dx);
                // arrows
                styles.push(
                    new Style({
                        geometry: new Point(start),
                        image: new Icon({
                            src: 'close.png',
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

    var mapPtModel = new MapPointModel();
    mapPtModel.StationType = 0;
    mapPtModel.X = coordinate[0];
    mapPtModel.Y = coordinate[1];
    mapPtModel.Graph.X = parseInt(Math.round(coordinate[0]));
    mapPtModel.Graph.Y = parseInt(Math.round(coordinate[1]));
    mapPtModel.Name = station.index + '';
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
    iconFeature.set('station_type', station.station_type)
    iconFeature.set('targets', station.targets)
    iconFeature.set('feature_type', 'station')
    iconFeature.set('data', station.data)
    var name = station.name
    iconFeature.setStyle(GetStationStyle(name, station.station_type, station.data));
    var routeFeature = iconFeature.clone();
    if (station.data.Graph) {
        routeFeature.setGeometry(new Point([station.data.Graph.X, station.data.Graph.Y]))
    }
    iconFeature.set('routeModeFeature', routeFeature)
    return iconFeature;
}

export function CreateEQLDULDFeature(station = new clsMapStation()) {
    const iconFeature = new Feature({
        geometry: new Point(station.coordination)
    });
    iconFeature.set('feature_type', 'lduld')
    iconFeature.set('data', station.data)

    if (station.station_type != 1)
        return iconFeature;

    var _style = new Style({
        text: new Text({
            text: "",
            font: 'bold 18px Calibri,sans-serif',
            offsetX: 14,
            offsetY: -52,
            fill: new Fill({
                color: 'white',//PointColorSelect(station_type)
            }),
            backgroundFill: new Fill({
                color: 'seagreen',//PointColorSelect(station_type)
            }),
            backgroundStroke: new Stroke({
                color: 'black',
                width: 3,
            })
        }),
    })
    iconFeature.setStyle(_style)
    return iconFeature;
}


function GetCargoIcon(cargo_type, exist = false) {
    if (!exist)
        return null
    return new Icon({
        src: cargo_type == 1 ? 'images/rack2.png' : 'images/tray.png',
        scale: cargo_type == 1 ? .6 : .8, // 设置PNG图像的缩放比例
        anchor: cargo_type == 1 ? [1.3, 0.95] : [.8, 0.65], // 设置PNG图像的锚点，即图片的中心点位置
        size: [60, 60],// 设置PNG图像的大小
        opacity: 1,
    })
}
export function AGVCargoIconStyle(cargo_type = 0, cargo_id = '', cst_exist = false) {
    return new Style({
        image: GetCargoIcon(cargo_type, cst_exist),
        text: new Text({
            // text: `${cargo_type.toUpperCase()}\r\n${cargo_id}`,
            text: cargo_id,
            offsetX: -45,
            offsetY: -35,
            textAlign: 'left',
            font: 'bold 9px Arial',
            fill: new Fill({
                color: 'white'
            }),
            backgroundFill: new Fill({
                color: 'grey',
            }),


        })
    })
}
export function ChangeCargoIcon(feature = new Feature(), cargoStates = new clsCargoStates()) {
    var style = AGVCargoIconStyle(cargoStates.cargo_type, cargoStates.cst_id, cargoStates.exist);
    feature.setStyle(style);
}
export function AGVPointStyle(agv_name, color) {
    return new Style({
        image: new Icon({
            src: '/agv.png', // 设置PNG图像的路径
            scale: .5, // 设置PNG图像的缩放比例
            anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
            size: [64, 64],// 设置PNG图像的大小
            opacity: 1,
            rotateWithView: true,
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
    constructor(AGVNum = 1, AGVDisplayOptions = [new clsAGVDisplay()]) {
        this.AGVNum = AGVNum
        this.AGVDisplays = AGVDisplayOptions

    }
}

export class clsAGVDisplay {
    constructor(AgvName = "AGV", TextColor = "pink", initCoordination = [0, 0], navCoorList = [], CargoStatus = new clsCargoStates(), Tag = 0, Theta = 0, WaitingInfo = new clsWaitingInfo(), CurrentAction = 0, AgvStates = new clsAgvStates()) {
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

    }
}
export class clsWaitingInfo {
    constructor() {
        this.IsWaiting = false;
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
        this.LsrMode = 0
        this.Speed = 1
        this.Bay = ""
        this.Graph = {
            Display: "",
            X: 0,
            Y: 0,
            IsBezierCurvePoint: false,
            BezierCurveID: ''
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
        this.RegistInfo = null
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
    constructor(tag = 0, name = '') {
        this.tag = tag
        this.name = name
    }
}

export class BezierCurve {
    constructor(ID = "", Rank = 2, MidPointCoordination = [0, 0]) {
        this.ID = ID
        this.Rank = Rank
        this.MidPointCoordination = MidPointCoordination
    }
}