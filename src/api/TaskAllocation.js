import axios from 'axios'
import param from '@/gpm_param'
import { getAuthHeaders } from './AuthHelper'
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: {},
})

export class clsMoveTaskData {
  constructor(agv_name, to_tag, Priority = 50) {
    this.Action_Name = 'move'
    this.AGV_Name = agv_name
    this.To_Tag = to_tag
    this.Priority = Priority
  }
}

export class clsChargeTaskData {
  constructor(agv_name, to_tag, Priority = 50) {
    this.Action_Name = 'charge'
    this.AGV_Name = agv_name
    this.To_Tag = to_tag
    this.Priority = Priority
  }
}
export class clsLoadTaskData {
  constructor(agv_name, to_tag, slot_number, cst_id, Priority = 50) {
    this.Action_Name = 'load'
    this.AGV_Name = agv_name
    this.To_Tag = to_tag
    this.Slot_Number = slot_number
    this.CST_ID = cst_id
    this.Priority = Priority
  }
}

export class clsUnloadTaskData {
  constructor(agv_name, to_tag, slot_number, cst_id, Priority = 50) {
    this.Action_Name = 'unload'
    this.AGV_Name = agv_name
    this.To_Tag = to_tag
    this.Slot_Number = slot_number
    this.CST_ID = cst_id
    this.Priority = Priority
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
    Priority = 50,
  ) {
    this.Action_Name = 'carry'
    this.AGV_Name = agv_name
    this.From_Tag = from_tag
    this.From_Slot_Number = from_slot
    this.To_Tag = to_tag
    this.To_Slot_Number = to_slot
    this.CST_ID = cst_id
    this.Priority = Priority
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

  async MoveTask(clsMoveTaskData = new clsMoveTaskData('agv', 1)) {
    return CallAPI('/api/Task/Move', clsMoveTaskData)
  },
  async LoadTask(clsLoadTaskData = new clsLoadTaskData('agv', 1, 1, 'CST_ID')) {
    return CallAPI('/api/Task/Load', clsLoadTaskData)
  },
  async UnloadTask(
    clsUnloadTaskData = new clsUnloadTaskData('agv', 1, 1, 'CST_ID'),
  ) {
    return CallAPI('/api/Task/Unload', clsUnloadTaskData)
  },
  async CarryTask(clsCarryTaskData) {
    return CallAPI('/api/Task/Carry', clsCarryTaskData)
  },
  async ChargeTask(clsChargeTaskData) {
    return CallAPI('/api/Task/Charge', clsChargeTaskData)
  },
}

async function CallAPI(path, data) {
  axios_entity
    .post(path, data, { headers: getAuthHeaders() })
    .then((response) => {
      console.log('Response:', response.data)
      return response.data
    })
    .catch((error) => {
      console.error('Error:', error)
      return error.response.data
    })
}
