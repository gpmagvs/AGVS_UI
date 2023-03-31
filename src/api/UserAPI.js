import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export async function Login(user) {
  var ret = await axios_entity.post('api/User/Login', user)
  StoreToLocalStorage(ret.data)
  return ret.data
}

function StoreToLocalStorage(user) {
  user.LoginTime = Date.now()
  localStorage.setItem('user', JSON.stringify(user))
}
