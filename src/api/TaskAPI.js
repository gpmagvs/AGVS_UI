import axios from 'axios'
import param from '@/gpm_param'
import WebSocketHelp from './WebSocketHepler'

var axios_entity = axios.create({
  baseURL: param.backend_host,
})
/*任務歷史查詢*/
export async function TaskQuery(currentpage,start_time,end_time,AGV_Name='ALL') {
    var retquery= await axios_entity.get(`/api/TaskQuery/TaskQuery?currentpage=${currentpage}&StartTime=${start_time}&EndTime=${end_time}&AGV_Name=${AGV_Name}`)
    
    console.info(retquery.data)
    return retquery.data;
  }

  