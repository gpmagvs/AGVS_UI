import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

/**取得今日的稼動資料 */
export async function GetTodayAvailability() {
  var res = await axios_entity.get('api/Availabilitys/Today')
  return res.data
}
