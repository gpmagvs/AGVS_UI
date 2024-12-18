import axios from 'axios'
import param from '@/gpm_param'
import { getAuthHeaders, getJWTAuthorizationVal } from './AuthHelper'
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: {
    'Authorization': getJWTAuthorizationVal()
  }
})
export class PointStayState {
  constructor() {
    this.Tag = 0;
    this.Coordination = [0, 0];
    this.Duration = 0;
    this.DurationNormalized = 0;
  }
}
/**
 * 取得交通狀態資料
 * @param {String} start_time 
 * @param {String} end_time 
 * @returns {Array<PointStayState>}
 */
export async function GetTrafficStateData(start_time, end_time) {
  var ret = await axios_entity.get(`/api/TrafficStateData/PointStayStateData?StartTime=${start_time}&EndTime=${end_time}`)
  let result = [new PointStayState()]
  _.merge(result, ret.data)
  return result
}

