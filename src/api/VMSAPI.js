import axios from 'axios'
import param from '@/gpm_param'
<<<<<<< HEAD
=======
import MoveTestVM from '@/ViewModels/MoveTestDto.js'
import bus from '@/event-bus.js'
import clsLocalization from '@/ViewModels/InspectionAGV/clsLocalization'

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

<<<<<<< HEAD
var axios_entity_vms = axios.create({
  baseURL: param.vms_host,
})

export async function OnlineRequest(AGV_Name, Model = 0) {
  return await axios_entity_vms.get(
    `/api/VmsManager/OnlineRequet?agv_name=${AGV_Name}&model=${Model}`,
  )
}

export async function OfflineRequest(AGV_Name, Model = 0) {
  return await axios_entity_vms.get(
    `/api/VmsManager/OfflineRequet?agv_name=${AGV_Name}&model=${Model}`,
  )
}

/**
 * 
 * @param {String} AGV_Name 
 * @param {{}} Payload 
 * @returns 
 */
export async function AGVLocating(AGV_Name, Payload) {
  var response = await axios_entity_vms.post(`/api/VmsManager/AGVLocating?agv_name=${AGV_Name}`, Payload);
  return response.data;
}

export var VehicleManagerAPI = {
  /**新增車輛 */
  AddVehicle: async (payload) => {
    var response = await axios_entity_vms.post(`/api/VmsManager/AddVehicle`, payload);
    return response.data;
=======
/**
 * 播放音效API
 */
export var SoundsAPI = {
  Alarm: async () => {
    await axios_entity.get('api/Sounds/Alarm')
  },
  Action: async () => {
    await axios_entity.get('api/Sounds/Action')
  },
  Move: async () => {
    await axios_entity.get('api/Sounds/Moving')
  }
}
/**系統相關api */
export var SystemAPI = {
  async GetSettings() {
    var ret = await axios_entity.get('api/System/Settings')
    return ret.data
  },
  async SaveSettings(settings) {
    var ret = await axios_entity.post('api/System/SaveParameters', settings)
    return ret.data
  },
  async RestartSystem() {
    var ret = await axios_entity.post('api/System/RestartSystem')
    return ret.data
  },
  async CloseSystem() {
    var ret = await axios_entity.post('api/System/CloseSystem')
    return ret.data
  }
}

export async function EMO() {
  var ret = await axios_entity.post('api/VMS/EMO')
  return ret
}

export async function Where_r_u() {
  var ret = await axios_entity.get('api/VMS/Where_r_u')
  return ret.data
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

export async function ClearAlarm(code) {
  var ret = await axios_entity.post(`api/VMS/ClearAlarm?alarm_code=${code}`)
  return ret
}


export async function BuzzerOff() {
  var ret = await axios_entity.post('api/VMS/BuzzerOff')
  return ret
}

/**移除卡匣CST Reader資料 */
export async function RemoveCassette() {
  var ret = await axios_entity.post('api/VMS/RemoveCassette')
  var success = ret.data;
  if (success)
    bus.emit('remove_cst')
  return success;
}

/**關閉空取空放功能 */
export async function CloseLDULD_No_Entry() {
  await axios_entity.get('api/VMS/LDULDWithoutEntryControl?actived=false');
}

/**取得工位數據 */
export async function GetWorkstationsData() {
  var ret = await axios_entity.get('api/VMS/GetWorkstations')
  return ret.data;
}

/**與指定TAG之工位進行IO測試(MODBUS )) */
export async function WorkStationModbusIOTest(tag) {
  var ret = await axios_entity.post(`api/VMS/WorkstationModbusIOTest?Tag=${tag}`)
  return ret.data;
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
  /**車體向左橫移 */
  async AGVShift_LEFT(speed = 0.1) {
    var ret = await axios_entity.get(`api/ManualOperator/ShiftLeft?speed=${speed}`)
    return ret
  },
  /**車體移動-RIGHT */
  async AGVMove_RIGHT(speed = 0.1) {
    var ret = await axios_entity.get(`api/ManualOperator/Right?speed=${speed}`)
    return ret
  },
  /**車體向右橫移 */
  async AGVShift_Right(speed = 0.1) {
    var ret = await axios_entity.get(`api/ManualOperator/ShiftRight?speed=${speed}`)
    return ret
  },

  /**車體移動-STOP */
  async AGVMove_STOP() {
    var ret = await axios_entity.get('api/ManualOperator/Stop')
    return ret
  },

  async AGVMove_FordwardRight() {

    var ret = await axios_entity.get('api/ManualOperator/FordwardRight')
    return ret
  },

  async AGVMove_FordwardLeft() {
    var ret = await axios_entity.get('api/ManualOperator/FordwardLeft')
    return ret
  },
  async AGVMove_BackwardRight() {
    var ret = await axios_entity.get('api/ManualOperator/BackwardRight')
    return ret
  },
  async AGVMove_BackwardLeft() {
    var ret = await axios_entity.get('api/ManualOperator/BackwardLeft')
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

/**Reset_Mileage */
export async function Reset_Mileage(mode = 0) {
  var ret = await axios_entity.get(`api/VMS/Reset_Mileage`)
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
  async HsSignalChange(owner = "AGV|EQ", signal, state) {
    var ret = await axios_entity.get(
      `api/VMS/DIO/Set${owner}HsSignalState?signal_name=${signal}&state=${state}`,
    )
    return ret.data
  },
  async UpdateInputMap(data) {
    var ret = await axios_entity.post(
      `api/VMS/UpdateINPUTSettings`, data
    )
    return ret.data
  },
  async UpdateOutputMap(data) {
    var ret = await axios_entity.post(
      `api/VMS/UpdateOUTPUTSettings`, data
    )
    return ret.data
  }
}

/**煞車模組 */
export const Braker = {
  async Brake() {
    var ret = await axios_entity.get(`api/VMS/Brake`)
    return ret.data
  },
  async UnBrake() {
    var ret = await axios_entity.get(`api/VMS/UnBrake`)
    return ret.data
  },
}

export const AlarmTableAPI = {
  async TotalAlarmCount(from, to, alarm_type = 'All', code = -1) {
    var ret = await axios_entity.get(`api/AlarmTable/Total?from=${from}&to=${to}&alarm_type=${alarm_type}&code=${code}`)
    return ret.data
  },
  async QueryByPage(from, to, page = 1, page_size = 16, alarm_type = 'All', code = -1) {
    var ret = await axios_entity.get(
      `api/AlarmTable/Query?from=${from}&to=${to}&page=${page}&page_size=${page_size}&alarm_type=${alarm_type}&code=${code}`,
    )
    return ret.data
  },

  async GetAlarmClassifies() {
    var ret = await axios_entity.get(
      `api/AlarmTable/GetAlarmClassifies`,
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
      `api/LocalNav/Action?action=${action}&from=${from}&to=${to}&cst_id=${cst_id}`,
    )
    return ret.data
  },
  async MoveTo(x, y, theta, point_id) {
    await axios_entity.get(`api/LocalNav/MoveTo?x=${x}&y=${y}&theta=${theta}&point_id=${point_id}`)
  },
  /**移動測試 
   *  { confirm: Boolean, message: String }
  */
  async MoveTest(moveTestVM = MoveTestVM) {
    try {
      var ret = await axios_entity.post(`api/LocalNav/MoveTo`, moveTestVM)
      return ret.data; //{confirm,message}
    } catch (error) {
      return { confirm: false, message: error.message };
    }
  }
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
  ReloadMapFromAGVS(currentMapName) {
    return axios_entity.get(`api/Map/ReloadMapFromAGVS?mapName=${currentMapName}`).then((ret) => {
      return ret.data
    })
      .catch((err) => {
        return undefined
      })
  }
}

/**觸發Tray Reader 拍照 回傳 barcode  */
export async function TriggerCSTReaderWithCargoType(_type) {
  try {

    var ret = await axios_entity.get(
      `api/VMS/TriggerCSTReaderWithCargoType?cargo_type=${_type}`
    )
    return ret.data.barcode;
  } catch (error) {

    return "Network Error";
  }
}
/**觸發Tray Reader 拍照 回傳 barcode  */
export async function TriggerCSTReader() {
  try {

    var ret = await axios_entity.get(
      'api/VMS/TriggerCSTReader'
    )
    return ret.data.barcode;
  } catch (error) {

    return "Network Error";
  }
}

/**停止Tray Reader 拍照*/
export async function StopCSTReader() {
  try {

    var ret = await axios_entity.get(
      'api/VMS/StopCSTReader'
    )
    return ret.data;
  } catch (error) {

    return false;
  }
}


/**FindTagCenter*/
export async function FindTagCenter() {
  try {

    var ret = await axios_entity.get(
      'api/VMS/FindTagCenter'
    )
    return ret.data;
  }
  catch (error) {
    return {
      confirm: false,
      message: error
    };
  }
}

export async function BatteryLockCtrl(battery_no, islock) {
  var ret = await axios_entity.get(`api/VMS/BatteryLockCtrl?battery_no=${battery_no}&islock=${islock}`)
}

/**充電迴路DO開關 */
export async function RechargeCircuit() {
  var ret = await axios_entity.get(`api/VMS/RechargeCircuit`)
  return ret.data //boolean 
}

export const WorkStationAPI = {
  async GetWorkStationSettings() {
    return (await axios_entity.get('api/VMS/WorkStationData')).data;
  }
}

/**控制Fork */
export const ForkAPI = {

  /**取得教點資料 */
  async GetTeachData() {
    var ret = await axios_entity.get(`api/VMS/Fork/TeachDatas`)
    return ret.data;
  },
  /**儲存所有教點設定 */
  async SaveTeachData(teach_data) {
    var ret = await axios_entity.post(`api/VMS/Fork/SaveTeachDatas`, teach_data)
    return ret.data;
  },
  /**儲存所有教點設定 */
  async WorkstationHandshakeSetting(eq_tag, isNeedHandshake) {
    var ret = await axios_entity.get(`api/VMS/Workstation/HandshakeSetting?eq_tag=${eq_tag}&need_handshake=${isNeedHandshake}`)
    return ret.data;
  },
  /**儲存單元教點設定 */
  async SaveUnitTeachData(unit_teach_data) {
    var ret = await axios_entity.post(`api/VMS/Fork/SaveUnitTeachData`, unit_teach_data)
    return ret.data;
  },
  /**移除Tag教點設定 */
  async RemoveTagTeachData(tag) {
    var ret = await axios_entity.get(`api/VMS/Fork/RemoveTagTeachData?tag=${tag}`)
    return ret.data;
  },
  /**移除單元教點設定 */
  async RemoveUnitTeachData(tag, layer) {
    var ret = await axios_entity.get(`api/VMS/Fork/RemoveUnitTeachData?tag=${tag}&layer=${layer}`)
    return ret.data;
  },

  /**枒杈伸出 */
  async ARM_Extend() {
    var ret = await axios_entity.get(`api/VMS/Fork/Arm/Extend`)
    return ret.data;
  },

  /**枒杈縮回 */
  async ARM_Shorten() {
    var ret = await axios_entity.get(`api/VMS/Fork/Arm/Shorten`)
    return ret.data;
  },
  /**枒杈停止 */
  async ARM_Stop() {
    var ret = await axios_entity.get(`api/VMS/Fork/Arm/Stop`)
    return ret.data;
  },
  async Action(action = "", pose = 0, speed = 0) {
    var ret = await axios_entity.get(`api/VMS/Fork?action=${action}&pose=${pose}&speed=${speed}`)
    return ret.data;
  },

  async SetTagHeightLimit(tag_id, pose_loc, layer, height) {
    return true
  },
  /**浮動牙叉鎖定 */
  async PIN_LOCK() {
    var ret = await axios_entity.get(`api/VMS/Fork/Pin/Lock`)
    return ret.data;
  },
  /**浮動牙叉Release */
  async PIN_RELEASE() {
    var ret = await axios_entity.get(`api/VMS/Fork/Pin/Release`)
    return ret.data;
  },

}

/**LOG Controller API */
export const LogAPI = {
  async Query(option) {
    var ret = await axios_entity.post(`api/Log/Query`, option)
    return ret.data;
  },
  async QueryParkingAcq(option) {
    var ret = await axios_entity.post(`api/ParkingAccurcy/Query`, option)
    return ret.data;
  },
  async GetParkedLocs() {
    var ret = await axios_entity.get(`api/ParkingAccurcy/GetAllParkLoc`)
    return ret.data;
  },
  async GetTransferLogToday() {
    var ret = await axios_entity.get(`api/Log/GetTransferLogToday`)
    return ret.data;
  },
  async GetTransferLog(from, to) {
    var ret = await axios_entity.get(`api/Log/GetTransferLog?from=${from}&to=${to}`)
    return ret.data;
  },
  async QueryVibrationRecordsByTaskName(taskName) {
    var ret = await axios_entity.get(`api/Log/QueryVibHistoryByTaskName?taskName=${taskName}`)
    return ret.data;
  },
  async QueryVibrationRecordsByTime(from, to) {
    var ret = await axios_entity.get(`api/Log/QueryVibHistoryByTime?from=${from}&to=${to}`)
    return ret.data;
  }
}

export const BatteryAPI = {
  async Query(option) {
    var ret = await axios_entity.post(`api/Battery`, option)
    return ret.data;
  },

  async GetChargeCicuitState() {
    var ret = await axios_entity.get(`api/Battery/ChargeCicuitState`)
    return ret.data;
  },

  async ChargeCicuitSwitch(enabled = false) {
    var ret = await axios_entity.get(`api/Battery/RechargeSwitch?enabled=${enabled}`)
    return ret.data;
  }
}


export const DataAnalysisAPI = {
  async QueryAvalibility(from, to) {
    var ret = await axios_entity.get(`api/DataAnalysis/QueryAvalibility?from=${from}&to=${to}`)
    return ret.data;
  },
}

/**巡檢AGV API */
export const InspectionAGVAPI = {
  async Localization(localization = clsLocalization) {
    try {

      var ret = await axios_entity.post(`api/AGV/Localization`, localization)
      return ret.data;
    }
    catch (ex) {
      return {
        Success: false,
        Message: ex.message
      }
    }
  },
  async EquipmentStateControl(equipment, state) {
    var ret = await axios_entity.get(`api/VMS/EquipmentStateControl?equipment=${equipment}&state=${state}`)
    return ret.data;
  },
  async SensorStateControl(sensor, state) {
    var ret = await axios_entity.get(`api/VMS/SensorStateControl?sensor=${sensor}&state=${state}`)
    return ret.data;
  }
}

/**IMU API */
export const IMUAPI = {
  /**重置IMU 最大/最小值紀錄 */
  async ResetMAXMINRecord() {
    var ret = await axios_entity.get(`api/IMU/ResetMAXMINRecord`)
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
  }
}