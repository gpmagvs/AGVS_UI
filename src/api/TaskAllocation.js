import axios from 'axios'
import param from '@/gpm_param'
import moment from 'moment'
import { getAuthHeaders } from './AuthHelper'
import { userStore } from '@/store'
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: {},
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
  }
}

export class clsMeasureTaskData {
  constructor(agv_name, bay_name, Priority = 50, bypass_eq_status_check = false) {
    this.TaskName = `Measure_${moment(Date.now()).format('yyMMDD_HHmmssSSS')}`
    this.Action = 6
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = bay_name
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
    this.bypass_eq_status_check = bypass_eq_status_check
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
  }
}

export class clsCarryTaskData {
  constructor(
    agv_name,
    from_tag,
    from_slot,
    to_tag,
    to_slot,
    cst_id,
    Priority = 50, bypass_eq_status_check = false
  ) {
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
  }
}

export var TaskAllocation = {
  async Task() {
    axios_entity
      .get(`/api/Task/Allocation`, { headers: getAuthHeaders() })
      .then((response) => {
        console.log('Response:', response.data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  },
  async Cancel(taskName) {
    return await axios_entity.get(`/api/Task/Cancel?task_name=${taskName}`, {
      headers: getAuthHeaders(),
    })
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
  async ExangeBatteryTask(clsExangeBatteryTaskData) {
    return await CallAPI('/api/Task/ExangeBattery', clsExangeBatteryTaskData)
  },
  async ParkTask(clsChargeTaskData) {
    return await CallAPI('/api/Task/Park', clsChargeTaskData)
  },
}
export async function SaveHotRunSettings(data) {
  var response = await axios_entity.post('/api/Task/HotRun', data)
  return response.data;
}
export async function GetHotRunSettings() {
  var response = await axios_entity.get('/api/Task/HotRun')
  return response.data;
}

export async function StartHotRun(no) {
  var response = await axios_entity.get(`/api/Task/HotRun/Start?no=${no}`)
  return response.data;//{confirm,message}
}

export async function StopHotRun(no) {
  var response = await axios_entity.get(`/api/Task/HotRun/Stop?no=${no}`)
}
async function CallAPI(path, data) {
  var user_param = `?user=${userStore.getters.UserName}`
  path += user_param;
  return axios_entity
    .post(path, data, { headers: getAuthHeaders() })
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
