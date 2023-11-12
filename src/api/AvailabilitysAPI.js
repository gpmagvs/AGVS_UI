import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

/**取得今日的稼動資料 */
export async function GetTodayAvailability() {
  console.log(Date.now())
  var res = await axios_entity.get('api/Availabilitys/Today')
  console.log(Date.now())
  return res.data
}

/**查詢稼動資料 */
export async function Query(AGVName, StartDate, EndDate) {
  var res = await axios_entity.get(`api/Availabilitys/Query?AGVName=${AGVName}&StartDate=${StartDate}&EndDate=${EndDate}`)
  return res.data
}
