import axios from 'axios'
import param from '@/gpm_param'
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
  }
}