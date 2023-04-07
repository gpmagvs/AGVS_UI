import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export async function OnlineRequest(AGV_Name) {
  return await axios_entity.get(
    `/api/VMSManager/AGVOnline?agv_name=${AGV_Name}`,
  )
}

export async function OfflineRequest(AGV_Name) {
  return await axios_entity.get(
    `/api/VMSManager/AGVOffline?agv_name=${AGV_Name}`,
  )
}
