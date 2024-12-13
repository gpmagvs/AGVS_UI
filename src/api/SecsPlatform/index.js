import axios from 'axios'
import param from '@/gpm_param'
import { agv_states_store } from '@/store'
import { ElMessage } from 'element-plus'
var axios_entity = axios.create({
  baseURL: param.secs_platform_host,
})

let api = {
  async getSecsNewestMessages() {
    let response = await axios_entity.get('/api/LogHistory/newest')
    return response.data
  },
  async getConnectionState() {
    let response = await axios_entity.get('/api/HostMode/ConnectToHostStatus')
    return response.data
  }
}

export default api;