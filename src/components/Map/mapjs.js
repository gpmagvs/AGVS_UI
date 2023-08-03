
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import Point from 'ol/geom/Point.js';

const station_colors = {
    normal: 'orange',
    eq: 'lightblue',
    charge: 'yellow',
    stk: 'lime'
}

/**一般點位 */
var normal_station_icon = new Circle({
    radius: 6,
    fill: new Fill({
        color: station_colors.normal,
    }),
    stroke: new Stroke({
        color: 'black',
        width: 2,
    }),
})

const eq_station_icon = new Icon({
    src: '/images/eq-icon.png', // 设置PNG图像的路径
    scale: 0.45,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'white'
})

const charge_station_icon = new Icon({
    src: '/images/charging-station.png', // 设置PNG图像的路径
    scale: 0.5,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'white'

})

var rack_station_icon = new Icon({
    src: '/images/rack_station.png', // 设置PNG图像的路径
    scale: 0.45,
    anchor: [0.5, 0.5],
    size: [64, 64],
    opacity: 1,
    color: 'white'
})


export function StationPointStyle(station_type = 2) {
    if (station_type == 0) {
        return new Style({
            image: normal_station_icon,
        })
    }
    else if (station_type == 1) {
        return new Style({
            image: eq_station_icon,
        })
    }
    else if (station_type == 2) {
        return new Style({
            image: charge_station_icon,
        })
    }
    else if (station_type == 3) {
        return new Style({
            image: rack_station_icon,
        })
    }
    else {
        return new Style({
            image: normal_station_icon,
        })
    }
}
export function StationTextStyle(text = '', station_type = 0) {
    var textStyle = new Style({
        text: new Text({
            text: text,
            font: 'bold 16px Calibri,sans-serif',
            offsetX: 14,
            offsetY: -22,
            fill: new Fill({
                color: PointColorSelect(station_type),
            }),
            stroke: new Stroke({
                color: 'black',
                width: 2,
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
    var isEQLink = feature.get('isEqLink')
    var isPathClose = feature.get('isPathClose')
    const geometry = feature.getGeometry();
    const styles = [
        new Style({
            stroke: new Stroke({
                color: isPathClose ? 'red' : (isEQLink ? 'rgb(115, 115, 115)' : 'rgb(176, 176, 178)'),
                width: 2.7,
                lineDash: isEQLink ? [4, 11] : null // 虛線模式（設定虛線段的長度和間隔）
            }),
        }),
    ];

    geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);

        // arrows
        styles.push(
            new Style({
                geometry: new Point(end),
                image: new Icon({
                    src: 'arrow.png',
                    anchor: [1.2, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                    scale: 0.18,
                    color: isPathClose ? 'red' : 'white'
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
                        scale: 0.5,
                    }),
                })
            );
        }
    });
    return styles;
}

export function AGVPointStyle(agv_name, color) {
    return new Style({
        image: new Icon({
            src: '/agv.png', // 设置PNG图像的路径
            scale: .8, // 设置PNG图像的缩放比例
            anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
            size: [60, 60],// 设置PNG图像的大小
            opacity: 1,

        }),
        text: new Text({
            text: agv_name,
            offsetX: 0,
            offsetY: 20,
            font: 'bold 14px Arial',
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: 'black',
                width: 3
            })
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

/**AGV地圖顯示參數 */
export class AGVOption {
    constructor(AGVNum = 1, AGVDisplayOptions = [new clsAGVDisplay()]) {
        this.AGVNum = AGVNum
        this.AGVDisplays = AGVDisplayOptions

    }
}

export class clsAGVDisplay {
    constructor(AgvName = "AGV", TextColor = "pink", initCoordination = [0, 0]) {
        this.AgvName = AgvName
        this.TextColor = TextColor
        this.InitCoordination = initCoordination;

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