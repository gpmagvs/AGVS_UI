import axios from 'axios'
import param from '@/gpm_param'
import { getAuthHeaders, getJWTAuthorizationVal } from './AuthHelper'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export async function GetUsers() {
  const JWTAuthorizationVal = getJWTAuthorizationVal()
  var headers = {}
  headers['Authorization'] = JWTAuthorizationVal
  var ret = await axios_entity.get('api/Auth/Users', {
    headers: headers,
  })
  return ret.data
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
  const JWTAuthorizationVal = getJWTAuthorizationVal()
  var headers = {}
  headers['Authorization'] = JWTAuthorizationVal
  var ret = await axios_entity.post('api/Auth/modify', users, {
    headers: headers,
  })
  return ret.data
}

function StoreToLocalStorage(user) {
  user.LoginTime = Date.now()
  localStorage.setItem('user', JSON.stringify(user))
}
