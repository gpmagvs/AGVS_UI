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
  useRandomPose = true
  initalizeBeforeTest = false
  pauseWhenReachQuarter = true
}
export class clsForkTestState { }

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
  async Continue() {
    var ret = await axios_entity.post('/api/RDTEST/fork_test/continue')
    return ret.data
  },
}

let MoveTEST = {
  /**開始測試 */
  async Start(option) {
    console.warn(option)
    var ret = await axios_entity.post('/api/RDTEST/MoveTest', option)
    return ret.data
  },
  /**停止測試 */
  async Stop() {
    var ret = await axios_entity.post('/api/RDTEST/MoveTest/Stop')
    return ret.data
  },
}

export { FORKTEST, MoveTEST }
