import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})


/**從服務器取得區域選項 */
export async function GetValidRegionOptions(){
  return await axios_entity
  .get('api/Map/RegionOptions')
  .then((ret) => {
    return ret.data
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
  ReloadMap() {
    return axios_entity
      .get('api/Map/ReloadMap')
      .then((ret) => {
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
  GetMapStationTemplate(){
    return axios_entity
    .get('api/Map/MapPointTemplate')
    .then((ret) => {
      return ret.data
    })
    .catch((err) => {
      return undefined
    })
  }
}

/**站點 */
export const pointTypes= [
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
    label: ' Charge & STK',
    value: 6
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
    label: 'Repair',
    value: 110
  },
]

export function GetPointTypeNameByTypeNum(num){
  return pointTypes.findLast(t=>t.value==num).label
}


export default MapAPI
