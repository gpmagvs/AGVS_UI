import axios from 'axios'
import param from '@/gpm_param'
import { getAuthHeaders, getJWTAuthorizationVal } from './AuthHelper'
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: {
    'Authorization': getJWTAuthorizationVal()
  }
})


export async function GetUsers() {
  var ret = await axios_entity.get('api/Auth/Users',)
  return ret.data
}

/**驗證身分 */
export async function Verify() {
  var ret = await axios_entity.post('api/Auth/Verify')
  return ret.data.Success
}
export async function Login(user) {
  try {
    var ret = await axios_entity.post('api/Auth/login', user)
    console.info(ret)
    StoreToLocalStorage(ret.data)
    return ret.data
  } catch (er) {
    return er.response.data
  }
}

export async function Modify(users) {
  var ret = await axios_entity.post('api/Auth/modify', users)
  return ret.data
}

/**刪除用戶 */
export async function Delete(user_name) {
  var ret = await axios_entity.delete(`api/Auth/Delete?user_name=${user_name}`)
  return ret.data
}

/**新增用戶 */
export async function Add(user) {
  var ret = await axios_entity.post(`api/Auth/Add`, user)
  return ret.data
}

export function StoreToLocalStorage(user) {
  user.LoginTime = Date.now()
  localStorage.setItem('user', JSON.stringify(user))
}

/**向後端回報路由跳轉狀態 */
export async function UserRouteChange(userID, route) {
  var ret = await axios_entity.get(`api/Auth/UserRouteChange?userID=${userID}&current_route=${route}`)
  return ret.data
}

