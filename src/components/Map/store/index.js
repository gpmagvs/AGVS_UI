import { createStore } from "vuex";
import axios from 'axios'
import { AGVOption, clsAGVDisplay, clsMapStation, StationSelectOptions } from '../mapjs';

/**圖資狀態儲存 */
export const MapStore = createStore({
    state: {
        MapData: null,
        MapGeoJson: null,
        AGVDynamicPathInfo: undefined,
        AGVLocUpload: {},
        agv_colors: [
            '#42c2f5',
            'limegreen',
            'orange',
            'pink',
            'red',
            'purple',
        ],
        mapBackendServer: 'http://127.0.0.1:5216'
    },
    getters: {
        MapData: state => {
            var localStore = localStorage.getItem('mapData')
            if (state.MapData == null && localStore) {
                return JSON.parse(localStore)
            }
            return state.MapData;
        },
        MapName: state => {
            return state.MapData == null ? "Unkown" : state.MapData.Name
        },
        GeoMapData: state => {
            return state.MapGeoJson
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
                mapStationData.graph = [pt.Graph.X / 100, pt.Graph.Y / 100];
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
                var pathtags = data.nav_path
                var pathCoordinations = []

                if (pathtags) {

                    pathtags.forEach(tag => {
                        var pt = getters.MapStations.find(st => st.tag == tag)
                        pathCoordinations.push(pt.coordination)
                    })
                }
                agvDataLs.push(new clsAGVDisplay(name, state.agv_colors[index], [data.currentCoordication.X, data.currentCoordication.Y], pathCoordinations, data.cargo_status, data.currentLocation, data.theta))
                index += 1;
            })
            var _AGVOption = new AGVOption(agv_num, agvDataLs)
            return _AGVOption;
        },
        AllNormalStationOptions: state => {
            //[{tag:1,name:'' }]
            var points = Object.values(state.MapData.Points)
            var points = points.filter(pt => pt.StationType == 0).map(pt => new StationSelectOptions(pt.TagNumber, `[Normal] ${pt.Name}(Tag=${pt.TagNumber})`))
            return points;
        },
        AllEqStation: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => pt.StationType == 1).map(pt => new StationSelectOptions(pt.TagNumber, `[EQ] ${pt.Name}(Tag=${pt.TagNumber})`))
            return options;
        },
        AllChargeStation: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => pt.StationType == 3).map(pt => new StationSelectOptions(pt.TagNumber, `[Charge] ${pt.Name}(Tag=${pt.TagNumber})`))
            return options;
        },
        AllParkingStationOptions: state => {
            var points = Object.values(state.MapData.Points)
            var options = points.filter(pt => pt.IsParking == true).map(pt => new StationSelectOptions(pt.TagNumber, `[Charge] ${pt.Name}(Tag=${pt.TagNumber})`))
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
                    name: ptData.Name
                })
            })
            return options
        }
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
        setAGVLocUpload(state, data) {
            state.AGVLocUpload = data
        }
    },
    actions: {
        DownloadMapData({ commit, state }) {
            console.log('[MapStore] try get map data');

            var axio = axios.create({
                baseURL: process.env.NODE_ENV == 'development' ? state.mapBackendServer :
                    `${window.location.protocol}//${window.location.host}`
            })

            axio.get('api/Map').then(response => {
                console.log('[MapStore] get map data', response.data);
                commit('setMapData', response.data)
            });

        },
        Save({ commit }) {

        },
        /**根據點位的index搜尋點位物件 */
        GetMapPointByIndex({ commit, state }, index) {
            var points = state.MapData.Points
            return points[index]
        }
    }
}
)