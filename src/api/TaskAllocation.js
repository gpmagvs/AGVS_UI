import axios from 'axios'
import param from '@/gpm_param'
import moment from 'moment'
import { getAuthHeaders } from './AuthHelper'
import { userStore } from '@/store'
import clsTaskState from '@/ViewModels/TaskState';
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: getAuthHeaders(),
})

export class clsMoveTaskData {
  constructor(agv_name, to_tag, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Move_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 0
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}

export class clsMeasureTaskData {
  constructor(agv_name, bay_name, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Measure_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 6
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = bay_name + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}
export class clsLoadTaskData {
  constructor(agv_name, to_tag, to_slot, cst_id, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Load_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 7
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}

export class clsUnloadTaskData {
  constructor(agv_name, to_tag, to_slot, cst_id, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Unload_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 1
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}

export class clsChargeTaskData {
  constructor(agv_name, to_tag, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Charge_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 8
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}

export class clsDeepChargeTaskData extends clsChargeTaskData {
  constructor(agv_name, Priority = 50, bypass_eq_status_check = false) {
    super(agv_name, -1, 100, bypass_eq_status_check)
    this.Action = 17
  }
}


export class clsExangeBatteryTaskData {
  constructor(agv_name, to_tag, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `BatEx_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 14
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}
export class clsParkTaskData {
  constructor(agv_name, to_tag, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Park_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 12
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = false
    this.ChangeAGVMiddleStationTag = 0
    this.TransferToDestineAGVName = ""
  }
}

export class clsCarryTaskData {
  constructor(agv_name, from_tag, from_slot, to_tag, to_slot, cst_id, Priority = 50, bypass_eq_status_check = false, need_change_agv = false, ChangeAGVMiddleStationTag = -1, TransferToDestineAGVName = "") {
    this.TaskName = `Local_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 9
    this.DesignatedAGVName = agv_name
    this.From_Station = from_tag + ''
    this.From_Slot = from_slot + ''
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
    this.need_change_agv = need_change_agv
    this.ChangeAGVMiddleStationTag = ChangeAGVMiddleStationTag
    this.TransferToDestineAGVName = TransferToDestineAGVName
  }
}

export var TaskAllocation = {
  async Task() {
    axios_entity
      .get(`/api/Task/Allocation`)
      .then((response) => {
        console.log('Response:', response.data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  },
  async RedoTask(clsTaskState = new clsTaskState({}), autoSelectVehicle = false) {
    return await CallAPI('/api/Task/ReAssignTask', clsTaskState, `autoSelectVehicle=${autoSelectVehicle}`)
  },
  async Cancel(taskName, reason = "", raiserName = "") {
    try {
      var ret = await axios_entity.get(`/api/Task/Cancel?task_name=${taskName}&reason=${reason}&raiserName=${raiserName}`)
      return ret.data;
    } catch (err) {
      throw err
    }
  },
  async MoveTask(clsMoveTaskData = new clsMoveTaskData('agv', 1)) {
    return await CallAPI('/api/Task/Move', clsMoveTaskData)
  },
  /**量測任務 */
  async MeasureTask(clsMeasureTaskData = new clsMeasureTaskData('agv', 1)) {
    return await CallAPI('/api/Task/Measure', clsMeasureTaskData)
  },
  async LoadTask(clsLoadTaskData = new clsLoadTaskData('agv', 1, 1, 'CST_ID')) {
    return await CallAPI('/api/Task/Load', clsLoadTaskData)
  },
  async UnloadTask(clsUnloadTaskData = new clsUnloadTaskData('agv', 1, 1, 'CST_ID')) {
    return await CallAPI('/api/Task/Unload', clsUnloadTaskData)
  },
  async CarryTask(clsCarryTaskData) {
    return await CallAPI('/api/Task/Carry', clsCarryTaskData)
  },
  async ChargeTask(clsChargeTaskData) {
    return await CallAPI('/api/Task/Charge', clsChargeTaskData)
  },
  async CancelChargeTask(agv_name) {
    var response = await axios_entity.get(`/api/Task/CancelChargeTask?agv_name=${agv_name}`)
    return response.data;
  },
  async ExangeBatteryTask(clsExangeBatteryTaskData) {
    return await CallAPI('/api/Task/ExangeBattery', clsExangeBatteryTaskData)
  },
  async ParkTask(clsChargeTaskData) {
    return await CallAPI('/api/Task/Park', clsChargeTaskData)
  },
  /**深度充電 */
  async DeepCharge(agvName) {
    return await CallAPI(`/api/Task/DeepCharge`, new clsDeepChargeTaskData(agvName, 100, false))
  }
}
export async function SaveHotRunSettings(data) {
  console.log('post:' + JSON.stringify(data));
  var response = await axios_entity.post('/api/HotRun', data)
  return response.data;
}
export async function GetHotRunSettings() {
  var response = await axios_entity.get('/api/HotRun')
  return response.data;
}

export async function StartHotRun(scriptID) {
  var response = await axios_entity.get(`/api/HotRun/Start?scriptID=${scriptID}`)
  return response.data;//{confirm,message}
}

export async function StopHotRun(scriptID) {
  var response = await axios_entity.get(`/api/HotRun/Stop?scriptID=${scriptID}`)
}
async function CallAPI(path, data, param = '') {
  var user_param = `?user=${userStore.getters.UserName}&${param}`
  path += user_param;
  return axios_entity
    .post(path, data)
    .then((response) => {
      console.log('Response:', response.data)
      return {
        status: response.status,
        data: response.data,
      }
    })
    .catch((error) => {
      console.error('Error:', error)
      return {
        status: error.response.status,
        data: error.response.data,
        message: error.message
      }
    })
}
