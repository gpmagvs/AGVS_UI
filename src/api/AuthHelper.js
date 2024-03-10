import moment from 'moment'
// 在每次請求中包含驗證 token
export const getAuthHeaders = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const user_info = JSON.parse(user)
    return { Authorization: `Bearer ${user_info.token}` }
  }
  return {}
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
  constructor(isLogin, login_info) {
    this.isLogin = isLogin
    this.login_info = login_info
  }
}

export function IsLoginLastTime() {
  const user_state = GetUserStateFromLS()
  if (user_state) {
    return new LastLoginState(
      user_state.Role != 0 && IsExpires() == false,
      user_state,
    )
  } else return new LastLoginState(false, null)
}

/**是否過期 */
export function IsExpires() {
  const user_state = GetUserStateFromLS()
  if (user_state) {
    var loginTime = moment(user_state.LoginTime).add(1, 'day')
    var isExpire = Date.now() > loginTime
    return isExpire
  } else return true
}
function GetUserStateFromLS() {
  const user_json_str = localStorage.getItem('user')
  if (user_json_str) {
    const user_state = JSON.parse(user_json_str)
    return user_state
  }
}
