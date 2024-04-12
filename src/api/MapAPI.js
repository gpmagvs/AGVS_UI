import axios from 'axios'
import param from '@/gpm_param'
<<<<<<< HEAD
import { MapStore } from '@/components/Map/store'
var axios_entity = axios.create({
  baseURL: MapStore.getters.MapServerUrl,
})
var axios_entity_vms = axios.create({
  baseURL: param.vms_host,
})


/**從服務器取得區域選項 */
export async function GetValidRegionOptions() {
  return await axios_entity
    .get('api/Map/RegionOptions')
    .then((ret) => {
      var data = ret.data;
      MapStore.commit('RegionOptions', data)
      return data
    })
    .catch((err) => {
      return undefined
    })
}


const MapAPI = {
  GetMapFromLocal() {
    return axios_entity
      .get('api/Map')
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  GetGeoMap() {
    return axios_entity
      .get('api/Map/GeoMapJson')
=======
import { map_store } from '@/store'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

const MapAPI = {
  GetMapFromServer() {
    return axios_entity
      .get('api/map/GetMapFromServer')
      .then((ret) => {
        var _data = ret.data;
        map_store.commit('SetMapData', _data)
        console.info('download map data from server ..');
        return _data
      })
      .catch((er) => {
        return undefined
      })
  },
  GetMapFromLocal() {
    return axios_entity
      .get('api/Map')
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  GetMapTags() {
    return axios_entity
      .get('api/Map/Tags')
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
<<<<<<< HEAD
=======
  GetNormalStations() {
    return axios_entity
      .get('api/Map/GetNormalStations')
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  SaveMap(_data) {
    return axios_entity
      .post('api/Map/SaveMap', _data)
      .then((ret) => {
        return true
      })
      .catch((err) => {
        return false
      })
  },
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
  ReloadMap() {
    return axios_entity
      .get('api/Map/ReloadMap')
      .then((ret) => {
<<<<<<< HEAD
        MapStore.dispatch('DownloadMapData');
=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  GetAGVList() {
    return axios_entity
      .get(`api/Map/AGVList`)
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  PathPlanByTag(from, to) {
    return axios_entity
      .get(`api/Map/PathPlan?fromTag=${from}&toTag=${to}`)
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
<<<<<<< HEAD
  GetMapStationTemplate() {
    return axios_entity
      .get('api/Map/MapPointTemplate')
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  Regist(tag_number) {
    return axios_entity_vms
      .get(`api/Map/Regist?Tag_Number=${tag_number}`)
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  },
  Unregist(tag_number) {
    return axios_entity_vms
      .get(`api/Map/Unregist?Tag_Number=${tag_number}`)
      .then((ret) => {
        return ret.data
      })
      .catch((err) => {
        return undefined
      })
  }
}

/**站點 */
export const pointTypes = [
  {
    label: 'Normal',
    value: 0
  },
  {
    label: 'EQ',
    value: 1
  },
  {
    label: 'STK',
    value: 2
  },
  {
    label: 'Charge',
    value: 3
  },
  {
    label: 'Buffer',
    value: 4
  },
  {
    label: 'Charge & Buffer',
    value: 5
  },
  {
    label: 'Charge & STK',
    value: 6
  },
  {
    label: 'Battery_Exchanger',
    value: 7
  },
  {
    label: 'Escape',
    value: 8
  },
  {
    label: 'EQ_LD',
    value: 11
  },
  {
    label: 'STK_LD',
    value: 12
  },
  {
    label: 'EQ_ULD',
    value: 21
  },
  {
    label: 'STK_ULD',
    value: 22
  },
  {
    label: 'Fire Door',
    value: 31
  },
  {
    label: 'Fire EQ',
    value: 32
  },
  {
    label: 'Auto Door',
    value: 33
  },
  {
    label: 'Elevator',
    value: 100
  },
  {
    label: 'Elevator',
    value: 201
  },
  {
    label: 'Elevator_LD',
    value: 201
  },
  {
    label: 'Elevator_ULD',
    value: 221
  },
  {
    label: 'Repair',
    value: 110
  },
]

export function GetPointTypeNameByTypeNum(num) {
  var ptType = pointTypes.findLast(t => t.value == num);
  if (ptType)
    return ptType.label
  else
    return num + '';
}


=======
  UploadCoordination(agv_name, tag, x, y, theta) {
    try {
      return axios_entity.get(`api/Map/UploadCoordination?AGVName=${agv_name}&tagNumber=${tag}&x=${x}&y=${y}&theta=${theta}`).
        then(ret => {
          return ret.data
        })
    } catch (error) {
      return false;
    }
  }
}

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
export default MapAPI
