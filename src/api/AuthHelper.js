import moment from 'moment'



// 在每次請求中包含驗證 token
export const getAuthHeaders = () => {
  var user = localStorage.getItem('user')
  console.log(user)
  if (user + '' == 'null')
    return {}
  const user_info = JSON.parse(user)
  return { Authorization: `Bearer ${user_info.token}` }
}
export const getJWTAuthorizationVal = () => {
  const user_state = GetUserStateFromLS()
  if (user_state) {
    return `Bearer ${user_state.token}`
  }
  return ''
}

export function ClearLoginCookie() {
  localStorage.removeItem('user')
}

class LastLoginState {
  constructor(isLogin, login_info = clsUserLoginState) {
    this.isLogin = isLogin
    this.login_info = login_info
  }
}

export function IsLoginLastTime() {
  var user_state = GetUserStateFromLS()
  if (!user_state)
    return new LastLoginState(false, new clsUserLoginState())

  const _isLoingAndNotExpires = user_state.Role != -1 && IsExpires() == false;
  if (_isLoingAndNotExpires) {
    user_state.LoginTime = Date.now();
  }
  return new LastLoginState(
    _isLoingAndNotExpires,
    user_state,
  )
}

/**是否過期 */
export function IsExpires() {
  var user_state = GetUserStateFromLS()
  console.log('IsExpires', user_state);
  if (user_state) {
    var loginTime = moment(user_state.LoginTime).add(1, 'day')
    var isExpire = Date.now() > loginTime
    return isExpire
  } else return true
}
function GetUserStateFromLS() {
  var userLoginState = new clsUserLoginState();
  const user_json_str = localStorage.getItem('user')
  if (user_json_str) {
    var user_state = JSON.parse(user_json_str)
    Object.assign(userLoginState, user_state)
  }
  return userLoginState
}

/**用戶登入狀態資訊 */
export class clsUserLoginState {
  constructor() {
    this.Role = -1;
    this.UserName = '';
    this.token = '';
    this.Success = false;
    this.Message = '';
    this.LoginTime = Date.now()
  }
}