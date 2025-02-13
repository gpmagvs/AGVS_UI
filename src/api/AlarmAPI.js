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

/**警報查詢 */
export async function QueryAlarm(currentpage, start_time, end_time, alarms, AGV_Name = 'ALL', TaskName = 'ALL', AlarmType = "ALL", Alarm_description = "ALL") {
  var retquery = await axios_entity.get(`/api/Alarmquery/QueryAlarm?currentpage=${currentpage}&StartTime=${start_time}&EndTime=${end_time}&AlarmCode=${alarms}&AGV_Name=${AGV_Name}&TaskName=${TaskName}&AlarmType=${AlarmType}&Alarm_description=${Alarm_description}`)
  return retquery.data;
}

export async function DeleteAlarm(Time) {
  var retquery = await axios_entity.delete(`/api/Alarm/Delete?time=${Time}`)
  return retquery.data;
}

/**輸出CSV */
export async function SaveTocsv(start_time, end_time, AGV_Name = 'ALL', TaskName = 'ALL', ExecuteResultSelected = "ALL") {
  const response = await axios_entity.get(`/api/Alarmquery/SaveTocsv?StartTime=${start_time}&EndTime=${end_time}&AGV_Name=${AGV_Name}&TaskName=${TaskName}&Result=${ExecuteResultSelected}`, { responseType: 'blob', });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  let fileName = `AGVS_Alarms_From_${start_time}_To_${end_time}.csv`
  link.setAttribute('download', fileName); // 設定下載檔案的名稱
  document.body.appendChild(link);
  link.click();
}


/**關閉蜂鳴器 */
export async function StopBuzzer() {
  return await axios_entity.post(`/api/Alarm/StopBuzzer`)
}

export class AlarmHelper {
  constructor(onmessage = (evt) => { }) {
    this.onmessageHandler = onmessage
    var _alarm_ws = new WebSocketHelp('/UncheckedAlarm')
    _alarm_ws.Connect()
    _alarm_ws.onmessage = onmessage
  }
}

export async function GetUncheckedAlarms() {
  return (await axios_entity.get(`/api/Alarm`)).data
}
