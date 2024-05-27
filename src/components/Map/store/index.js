import { createStore } from "vuex";
import axios from 'axios'
import { AGVOption, clsMap, clsAGVDisplay, clsMapStation, StationSelectOptions, AgvDisplayProps } from '../mapjs';
import param from "@/gpm_param";

/**圖資狀態儲存 */
export const MapStore = createStore({
    state: {
        MapData: new clsMap(),
        MapGeoJson: null,
        AGVDynamicPathInfo: undefined,
        OthersAGVLocateInfo: [],
        /**被系統交通管制的路徑字典 */
        ControledPathesBySystem: {},
        AGVLocUpload: {},
        agv_colors: [
            'rgb(13, 110, 253)',
            'limegreen',
            'orange',
            'pink',
            'red',
            'purple',
        ],
        RegionOptions: null,
        Settings: {
            path_color: 'red'
        },
        worker: new Worker(''),
        mapBackendServer: process.env.NODE_ENV == 'development' ? param.backend_host : `${window.location.protocol}//${window.location.host}`
    },
    getters: {
        MapBackednAxios: state => {
            var axio = axios.create({
                baseURL: state.mapBackendServer
            })

            return axio
        },

        CustomAGVStyles: state => {
            var jsonStr = localStorage.getItem('custom-agv-styles');
            if (jsonStr) {
                return JSON.parse(jsonStr);
            }
            return {
                "AGV_001": new AgvDisplayProps('rgb(13, 110, 253)', "AGV_001"),
                "AGV_002": new AgvDisplayProps('limegreen', "AGV_002"),
                "AGV_003": new AgvDisplayProps('orange', "AGV_003"),
                "AGV_004": new AgvDisplayProps('pink', "AGV_004"),
            }
        },
        MapData: state => {
            var localStore = localStorage.getItem('mapData')
            if (state.MapData == null && localStore) {
                return JSON.parse(localStore)
            }
            return state.MapData;
        },
        /**圖片像素 [長,寬] */
        Map_Image_Size: state => {
            return state.MapData.Map_Image_Size;
        },
        Map_Image_Boundary: state => {
            return state.MapData.Map_Image_Boundary;
        },
        Pathes: state => {
            return state.MapData.Segments
        },
        MapName: state => {
            return state.MapData == null ? "Unkown" : state.MapData.Name
        },
        MapImageName: state => {
            return state.MapData == null ? "Unkown" : state.MapData.ImageName
        },
        Settings: state => state.MapData.Options,
        BezierCurves: state => {
            return state.MapData == null ? {} : state.MapData.BezierCurves
        },
        GeoMapData: state => {
            return state.MapGeoJson
        },
        MapServerUrl: state => {
            return state.mapBackendServer
        },
        MapStations: (state, actions) => {
            var mapDataSource = state.MapData
            if (!mapDataSource)
                return []
            var points = mapDataSource.Points
            if (!points)
                return [];
            var indexes = Object.keys(points)
            var map_stations = []
            indexes.forEach(index => {

                var pt = points[index]
                var mapStationData = new clsMapStation()
                mapStationData.index = parseInt(index);
                mapStationData.name = pt.Name;
                mapStationData.station_type = pt.StationType;
                mapStationData.tag = pt.TagNumber;
                mapStationData.coordination = [pt.X, pt.Y];
                mapStationData.targets = [];
                mapStationData.graph = [pt.Graph.X, pt.Graph.Y];
                mapStationData.data = pt;
                Object.keys(pt.Target).forEach(targetIndex => {
                    mapStationData.targets.push(parseInt(targetIndex))
                })
                map_stations.push(mapStationData)
            })
            return map_stations
        },
        BaysData: state => {
            if (state.MapData)
                return state.MapData.Bays
            else
                return {}
        },
        Regions: (state) => {
            if (state.MapData.Regions)
                return state.MapData.Regions
            else
                return []
        },
        AGVDynamicPathInfo: state => {

            return state.AGVDynamicPathInfo
        },
        AGVLocUpload: state => {
            return state.AGVLocUpload;
        },
        AGVNavInfo: (state, getters) => {
            var agv_nav_info = state.AGVDynamicPathInfo;
            if (agv_nav_info == undefined) {
                return new AGVOption(0, [])
            }
            var agv_num = Object.keys(agv_nav_info).length;
            var agvDataLs = [];
            var index = 0;
            Object.keys(agv_nav_info).forEach(name => {
                var data = agv_nav_info[name]
                var vehicleLength = data.vehicleLength
                var vehicleWidth = data.vehicleWidth

                var pathtags = data.nav_path
                var pathCoordinations = []

                var coordination = [0, 0]
                if (data.currentCoordication) {
                    coordination = [data.currentCoordication.X, data.currentCoordication.Y]
                }
                if (pathtags) {

                    var pathTagsLen = pathtags.length;
                    pathCoordinations.push(coordination);
                    for (let index = 1; index < pathTagsLen; index++) {
                        const tag = pathtags[index];
                        var pt = getters.MapStations.find(st => st.tag == tag)
                        if (pt) {
                            pathCoordinations.push(pt.coordination)
                        }
                    }
                }


                var _agv_style_custom = getters.CustomAGVStyles[name];
                var _agv_color = 'black'
                var _agv_display_text = name
                if (_agv_style_custom) {
                    _agv_color = _agv_style_custom.DisplayColor;
                    _agv_display_text = _agv_style_custom.DisplayText;

                } else {
                    _agv_color = state.agv_colors[index];
                }
                var agvDisplayModel = new clsAGVDisplay(name, _agv_color, coordination, pathCoordinations, data.cargo_status, data.currentLocation, data.theta, data.waiting_info, data.currentAction, data.states, _agv_display_text, vehicleLength, vehicleWidth);
                agvDataLs.push(agvDisplayModel)
                index += 1;
            })
            var _AGVOption = new AGVOption(agv_num, agvDataLs)
            return _AGVOption;
        },
        /**[ {"AGVName":"AGV_001","Location":"DEMOS001"}] */
        OthersAGVLocateInfo: state => {
            return state.OthersAGVLocateInfo;
        },
        AllNormalStationOptions: state => {
            //[{tag:1,name:'' }]
            var points = Object.values(state.MapData.Points)
            var points = points.filter(pt => !pt.IsVirtualPoint && pt.StationType == 0).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return points;
        },
        AllParkableStationOptions: state => {
            var points = Object.values(state.MapData.Points)
            var points = points.filter(pt => pt.IsParking).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return points;
        },
        AllEqStation: (state, getters) => {
            var points = Object.values(state.MapData.Points)
            var eqs = points.filter(pt => pt.StationType != 0 && pt.StationType != 3).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))

            // 使用 sort 方法按照 name_display 進行排序
            eqs.sort((a, b) => {
                return a.name_display.localeCompare(b.name_display);
            });
            return eqs;

            var buffers = getters.AllBufferStationOptions
            return [...eqs, ...buffers];
        },
        AllChargeStation: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => !pt.IsVirtualPoint && (pt.StationType == 3 || pt.StationType == 5 || pt.StationType == 6)).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return options;
        },
        AllExangeBatteryStation: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => !pt.IsVirtualPoint && (pt.StationType == 16 || pt.StationType == 3)).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return options;
        },
        AllParkingStationOptions: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => !pt.IsVirtualPoint && pt.IsParking == true || pt.StationType == 4 || pt.StationType == 5).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return options;
        },
        AllBufferStationOptions: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => !pt.IsVirtualPoint && (pt.StationType == 4 || pt.StationType == 41 || pt.StationType == 5)).map(pt => new StationSelectOptions(pt.TagNumber, `${pt.Graph.Display}(Tag=${pt.TagNumber})`, pt.Graph.Display))
            return options;
        },
        AllPointsOptions: state => {
            var options = []
            var points = state.MapData.Points
            var indexes = Object.keys(points)
            indexes.forEach(index => {
                var ptData = points[index]
                options.push({
                    index: index,
                    tag: ptData.TagNumber,
                    name: ptData.Graph.Display
                })
            })
            return options
        },

        ControledPathesBySystem: state => state.ControledPathesBySystem,
        RegionOptions: state => state.RegionOptions,
        EqIcons: state => state.MapData.Options.EQIcons,
        GridSize: state => state.MapData.Options.gridSize,
        Rotation: state => state.MapData.Options.Rotation ? state.MapData.Options.Rotation : 0,
        DefaultShowBackgroundImage: state => state.MapData.Options.defaultShowBackgroudImage,

    },
    mutations: {
        setMapData(state, mapdata) {
            state.MapData = mapdata;
            localStorage.setItem('mapData', JSON.stringify(mapdata))
        },
        setGeoMapData(state, mapdata) {
            state.MapGeoJson = mapdata;
        },
        setAGVDynamicPathInfo(state, info) {
            state.AGVDynamicPathInfo = info
        },
        setOtherAGVLocateInfo(state, data) {
            state.OthersAGVLocateInfo = data;
        },
        setAGVLocUpload(state, data) {
            state.AGVLocUpload = data
        },
        setWorker(state, worker) {
            state.worker = worker;
        },
        setControledPathesBySystem(state, ControledPathesBySystem) {
            state.ControledPathesBySystem = ControledPathesBySystem
        },
        RegionOptions(state, options) {
            state.RegionOptions = options;
        },
        setMapGridSize(state, grid_size) {
            state.MapData.Options.gridSize = grid_size;
            console.log(state.MapData.Options.gridSize);
        },
        SaveAGVStyle(state, payload) {
            var jsonStr = localStorage.getItem('custom-agv-styles');
            var _savedObject = {}
            if (jsonStr) {
                _savedObject = JSON.parse(jsonStr);
            }
            _savedObject[payload.agvname] = payload.style;
            localStorage.setItem('custom-agv-styles', JSON.stringify(_savedObject));
        },
        SetRotation(state, rotation) {
            state.MapData.Options.Rotation = rotation
        },
        setPathColor(state, color) {
            state.MapData.Options.pathColor = color;
        },
        setNormalPointTextColor(state, color) {
            state.MapData.Options.normalStationTextColor = color;
        },
        setWorkStationPointTextColor(state, color) {
            state.MapData.Options.workStationTextColor = color;
        },
        setNormalPointTextFontSize(state, size) {
            state.MapData.Options.normalStationTextFontSize = size;
        },
        setWorkStationPointTextFontSize(state, size) {
            state.MapData.Options.workStationTextFontSize = size;
        }

    },
    actions: {
        async DownloadMapData({ commit, getters }) {
            await getters.MapBackednAxios.get('api/Map').then(response => {
                //console.log('[MapStore] get map data', response.data);
                commit('setMapData', response.data)
            });
        },
        async GetPointEnableMap({ getters }) {
            var response = await getters.MapBackednAxios.get('api/Map/GetPointEnableMap');
            return response.data;
        },
        Save({ commit }) {

        },
        /**根據點位的index搜尋點位物件 */
        GetMapPointByIndex({ commit, state }, index) {
            var points = state.MapData.Points
            return points[index]
        },
        /**根據點位的index搜尋點位物件 */
        GetMapPointByTag({ commit, state }, tag) {
            var points = state.MapData.Points
            return Object.values(points).find(pt => pt.TagNumber + '' == tag + '')
        },
        async SaveMap({ commit, state, actions, getters }, payload) {
            var _data = payload.data;
            var _file = payload.file;
            console.log(_file);


            var uploadImage = async (file) => {

                const formData = new FormData();
                formData.append('image', file);
                console.log(formData)
                await getters.MapBackednAxios.post("api/Map/MapImageUpload", formData)

            }
            if (_file) {
                _data.ImageName = _file.name
                await uploadImage(_file)
            }
            return getters.MapBackednAxios.post('api/Map/SaveMap', _data)
                .then((ret) => {
                    _data.Note = ret.data;
                    commit('setMapData', _data);
                    return true
                })
                .catch((err) => {
                    return false
                })
        },
        UploadCoorFunctionSwitch({ commit, state, getters }, enabled) {
            getters.MapBackednAxios.get(`api/Map/SwitchAGVUploadLocFun?enabled=${enabled}`)
            if (enabled) {
                const worker = new Worker('websocket_worker.js')
                worker.onmessage = (event) => {
                    if (event.data != 'error' && event.data != 'closed')
                        commit('setAGVLocUpload', event.data)
                }
                worker.postMessage({ command: 'connect', ws_url: getters.MapServerUrl.replace('http', 'ws') + '/ws/AGVLocationUpload' });
                commit('setWorker', worker)

            } else {
                state.worker.postMessage({ command: 'disconnect' })
            }
        },
        DeleteIcon({ commit, state, getters, actions }, path) {
            getters.MapBackednAxios.delete(`api/Map/DeleteIcon?filePath=${path}`)
        },
        GetRegionByName({ state, getters }, name) {
            var _forbid_regions = getters.Regions
            return _forbid_regions.find(reg => reg.Name == name)
        },
        ResetMapXYGraphAsCoordinations({ state, getters, actions }) {
            return getters.MapBackednAxios.post(`api/Map/ResetGraphXYAsCoordinations`).then(response => {
                return response.data
            })
        }
    }
}
)
MapStore.dispatch('DownloadMapData')