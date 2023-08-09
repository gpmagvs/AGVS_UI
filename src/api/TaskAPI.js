import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
    baseURL: param.backend_host,
})


/**查詢任務 */

export async function GetTasks(start, end, agvname) {
    var ret = await axios_entity.get(`/api/TaskQuery/GetTasks?agv_name=${agvname}&start=${start}&end=${end}`)
    return ret.data;
}

export async function GetTrajectory(taskID) {
    var ret = await axios_entity.get(`/api/TaskQuery/GetTrajectory?taskID=${taskID}`)
    return ret.data;
}