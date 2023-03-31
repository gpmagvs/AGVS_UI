import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export class clsForkTesetOption {
  loopNum = 100
  up_limit_pose = 120.0
  down_limit_pose = 0.0
  speed = 1.0
}
export class clsForkTestState {}

let FORKTEST = {
  async Start(option) {
    console.warn(option)
    var ret = await axios_entity.post('/api/RDTEST/fork_test/start', option)
    return ret.data
  },
  async Abort() {
    var ret = await axios_entity.post('/api/RDTEST/fork_test/abort')
    return ret.data
  },
}

export { FORKTEST }
