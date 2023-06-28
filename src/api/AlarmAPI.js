import axios from 'axios'
import param from '@/gpm_param'
import WebSocketHelp from './WebSocketHepler'

var axios_entity = axios.create({
  baseURL: param.backend_host,
})

/**復歸系統警報 */
export async function ResetSystemAlarm() {
  return await axios_entity.get(`/api/Alarm/SystemAlarmReset`)
}

/**復歸設備警報 */
export async function ResetEquipmentAlarm() {
  return await axios_entity.get(`/api/Alarm/EquipmentAlarmReset`)
}
/**警報履歷 */
export async function QueryALL() {
  //{data:~, status_code}
  var ret= await axios_entity.get(`/api/Alarmquery/QueryALL`) 
  console.info(ret)
  return ret.data;
}
/**警報查詢 */
export async function Query() {
  return await axios_entity.get(`/api/Alarmquery/Query`)
}

export class AlarmHelper {
  constructor(onmessage = (evt) => {}) {
    this.onmessageHandler = onmessage
    var _alarm_ws = new WebSocketHelp('/UncheckedAlarm')
    _alarm_ws.Connect()
    _alarm_ws.onmessage = onmessage
  }
}
