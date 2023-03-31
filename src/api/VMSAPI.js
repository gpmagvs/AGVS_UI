import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export async function EMO() {
  var ret = await axios_entity.post('api/VMS/EMO')
  return ret
}

export async function Initialize() {
  var ret = await axios_entity.post('api/VMS/Initialize')
  return ret.data
}
export async function CancelInitProcess() {
  var ret = await axios_entity.get('api/VMS/CancelInitProcess')
  return ret.data
}
export async function ResetAlarm() {
  var ret = await axios_entity.post('api/VMS/ResetAlarm')
  return ret
}
export async function BuzzerOff() {
  var ret = await axios_entity.post('api/VMS/BuzzerOff')
  return ret
}
export async function RemoveCassette() {
  var ret = await axios_entity.post('api/VMS/RemoveCassette')
  return ret
}

export const MOVEControl = {
  /**車體移動-UP */
  async AGVMove_UP(speed = 0.08) {
    var ret = await axios_entity.get(
      `api/ManualOperator/Forward?speed=${speed}`,
    )
    return ret
  },

  /**車體移動-DOWN */
  async AGVMove_DOWN(speed = 0.08) {
    var ret = await axios_entity.get(
      `api/ManualOperator/Backward?speed=${speed}`,
    )
    return ret
  },
  /**車體移動-LEFT */
  async AGVMove_LEFT(speed = 0.1) {
    var ret = await axios_entity.get(`api/ManualOperator/Left?speed=${speed}`)
    return ret
  },

  /**車體移動-RIGHT */
  async AGVMove_RIGHT(speed = 0.1) {
    var ret = await axios_entity.get(`api/ManualOperator/Right?speed=${speed}`)
    return ret
  },

  /**車體移動-STOP */
  async AGVMove_STOP() {
    var ret = await axios_entity.get('api/ManualOperator/Stop')
    return ret
  },
}

export const MODESwitcher = {
  async AutoModeSwitch(mode) {
    var ret = await axios_entity.get(`api/VMS/AutoMode?Mode=${mode}`)
    return ret.data
  },
  async OnlineModeSwitch(mode) {
    var ret = await axios_entity.get(`api/VMS/OnlineMode?Mode=${mode}`)
    return ret.data
  },
}

/**GetModuleInformation */
export async function GetModuleInformation() {
  var ret = await axios_entity.get('api/VMS')
  return ret.data
}

/**GetBatteryState */
export async function GetBatteryState() {
  var ret = await axios_entity.get('api/VMS/BateryState')
  return ret.data
}

/**GetMileage */
export async function GetMileage() {
  var ret = await axios_entity.get('api/VMS/Mileage')
  return ret.data
}

/**Laser Mode */
export async function LaserMode(mode = 0) {
  var ret = await axios_entity.get(`api/VMS/LaserMode?mode=${mode}`)
  return ret.data
}

export const DIO = {
  async DO_State_Change(address, state) {
    var ret = await axios_entity.get(
      `api/VMS/DIO/DO_State?address=${address}&state=${state}`,
    )
    return ret.data
  },

  async DI_State_Change(address, state) {
    var ret = await axios_entity.get(
      `api/VMS/DIO/DI_State?address=${address}&state=${state}`,
    )
    return ret.data
  },
}

export const AlarmTableAPI = {
  async TotalAlarmCount() {
    var ret = await axios_entity.get(`api/AlarmTable/Total`)
    return ret.data
  },
  async QueryByPage(page = 1, page_size = 16) {
    var ret = await axios_entity.get(
      `api/AlarmTable/Query?page=${page}&page_size=${page_size}`,
    )
    return ret.data
  },
  async ClearAlarms() {
    var ret = await axios_entity.get('api/AlarmTable/Clear')
  },
}

export const NavigationAPI = {
  async Action(action, from, to = '', cst_id = '') {
    console.info(action, from, to, cst_id)
    var ret = await axios_entity.get(
      `api/NavigateTask/Action?action=${action}&from=${from}&to=${to}&cst_id=${cst_id}`,
    )
    return ret.data
  },
}

export const MapAPI = {
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
}
