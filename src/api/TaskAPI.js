import axios from 'axios';
import param from '@/gpm_param';

var axios_entity = axios.create({
  baseURL: param.backend_host,
})
/*任務歷史查詢*/
export async function TaskQuery(currentpage, start_time, end_time, AGV_Name = 'ALL', TaskName = 'ALL', ExecuteResultSelected = "ALL", ActionTypeSelected = "ALL", Fail_reason = 'ALL') {
  var retquery = await axios_entity.get(`/api/TaskQuery/TaskQuery?currentpage=${currentpage}&StartTime=${start_time}&EndTime=${end_time}&AGV_Name=${AGV_Name}&TaskName=${TaskName}&Result=${ExecuteResultSelected}&ActionType=${ActionTypeSelected}&Failurereason=${Fail_reason}`)

  console.info(retquery.data)
  return retquery.data;
}
/**輸出CSV */
export async function SaveTocsv(start_time, end_time, AGV_Name = 'ALL', TaskName = 'ALL') {
  const response = await axios_entity.get(`/api/TaskQuery/SaveTocsv?StartTime=${start_time}&EndTime=${end_time}&AGV_Name=${AGV_Name}&TaskName=${TaskName}`, {
    responseType: 'blob' // Ensure the response is treated as a blob
  })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  let fileName = `AGVS_Task_From_${start_time}_To_${end_time}.csv`
  link.setAttribute('download', fileName); // 設定下載檔案的名稱
  document.body.appendChild(link);
  link.click();
}
/**查詢任務 */

export async function GetTasks(start, end, agvname) {
  var ret = await axios_entity.get(`/api/TaskQuery/GetTasks?agv_name=${agvname}&start=${start}&end=${end}`)
  return ret.data;
}

export async function GetTrajectory(taskID) {
  var ret = await axios_entity.get(`/api/TaskQuery/GetTrajectory?taskID=${taskID}`)
  return ret.data;
}

export async function DeleteTask(taskID) {
  var ret = await axios_entity.get(`/api/TaskQuery/DeleteTask?taskID=${taskID}`)
  return ret.data;
}

/**指定日期區間匯出至系統設定的目錄 */
export async function ExportToAutoRptFolder(start, end) {
  var ret = await axios_entity.post(`/api/TaskQuery/ExportTaskHistoryDataOfDays?from_date=${start}&to_date=${end}`)
  return ret.data;
}