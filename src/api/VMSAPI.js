import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

var axios_entity_vms = axios.create({
  baseURL: param.vms_host,
})

export async function OnlineRequest(AGV_Name) {
  return await axios_entity_vms.get(
    `/api/VmsManager/OnlineRequet?agv_name=${AGV_Name}`,
  )
}

export async function OfflineRequest(AGV_Name) {
  return await axios_entity_vms.get(
    `/api/VmsManager/OfflineRequet?agv_name=${AGV_Name}`,
  )
}
