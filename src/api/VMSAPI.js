import axios from 'axios'
import param from '@/gpm_param'
import { agv_states_store } from '@/store'
import { ElMessage } from 'element-plus'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

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

export async function UnregisterFromNetwork(AGV_Name) {
  var response = await axios_entity_vms.post(`/api/VmsManager/UnregisterFromNetwork?agv_name=${AGV_Name}`);
  return response.data;
}

export var VehicleManagerAPI = {
  /**新增車輛 */
  AddVehicle: async (payload) => {
    try {

      var response = await axios_entity_vms.post(`/api/VmsManager/AddVehicle`, payload);
      return response.data;
    } catch (error) {
      return {
        confirm: false,
        message: `與VMS系統通訊失敗(${error})`
      }
    }
  },
  /**修改車輛 */
  EditVehicle: async (payload, oriAGVID) => {
    var response = await axios_entity_vms.post(`/api/VmsManager/EditVehicle?oriAGVID=${oriAGVID}`, payload);
    return response.data;
  },
  DeleteVehicle: async (agv_name) => {
    var response = await axios_entity_vms.delete(`/api/VmsManager/DeleteVehicle?AGV_Name=${agv_name}`);
    return response.data;
  },
  /**將所有車輛關機 */
  ShutDownAllVehicles: async () => {
    var agvIpCollection = agv_states_store.getters.AGVIPCollection;
    agvIpCollection.forEach(agvIP => {
      setTimeout(() => {
        var _axios = axios.create({
          baseURL: `http://${agvIP}:7025`,
          timeout: 1000
        })
        _axios.post(`/api/System/ShutDownPC`)
          .then(response => {
            ElMessage({
              type: 'success',
              message: `${agvIP} ${response.data}`
            })
          })
          .catch(error => {
            ElMessage({
              type: 'error',
              message: `${agvIP} 關機失敗:${error.message}`,
              duration: 3000
            })
          });
      }, 100);
    });
  }
}

export const VehicleBatteryAPI = {
  GetSettings: async () => {
    var response = await axios_entity_vms.get('api/vehiclebattery')
    return response.data;
  },
  ModifySetting: async (agvName, payload) => {
    var response = await axios_entity_vms.post(`api/vehiclebattery?agvName=${agvName}`, payload)
    return response.data;
  },
  StopDeepCharge: async (agvName) => {
    var response = await axios_entity_vms.post(`api/VmsManager/StopDeepCharge?agvName=${agvName}`)
    return response.data;
  }

}

export const EmuAPI = {
  Initialize: async (agvName) => {
    var response = await axios_entity_vms.get(`api/AGVSimulation/Initialize?AGVName=${agvName}`)
    return response.data;
  },
  RemoveCargo: async (agvName) => {
    var response = await axios_entity_vms.get(`api/AGVSimulation/CargoRemove?AGVName=${agvName}`)
    return response.data;
  },
  EMO: async (agvName) => {
    var response = await axios_entity_vms.get(`api/AGVSimulation/EMO?AGVName=${agvName}`)
    return response.data;
  }
}