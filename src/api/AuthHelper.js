import moment from 'moment'
// 在每次請求中包含驗證 token
export const getAuthHeaders = () => {
  var user = localStorage.getItem('user')
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
    /**用戶角色, -1: 未登入, 0: Operator, 1: Engineer, 2: Developer, 3: GOD */
    this.Role = -1;
    this.UserName = '';
    this.token = '';
    this.Success = false;
    this.Message = '';
    this.LoginTime = Date.now();
    this.Permission = new WebViewPermission();
  }
}

export class WebViewPermission {
  constructor() {
    this.menu = {
      SystemAlarm: 1,
      WIPInfo: 0,
      VehicleManagnment: 0,
      Map: 0,
      DataQuery: 1,
      HotRun: 0,
      SystemConfiguration: 0,
    };
    this.dataQuerySubMenu = {
      TaskHistory: 1,
      AlarmHistory: 1,
      VehicleTrajectory: 0,
      InstrumentsMeasure: 0,
      Utilization: 1,
    }
    this.systemConfigurationSubMenu =
    {
      BatteryLevelManagnment: 0,
      EquipmentlManagnment: 0,
      RackManagnment: 0,
      UserManagnment: 0,
      ChargerManagnment: 0
    }
    this.systemModesOperations = {
      RunModeSwitch: 1,
      AutoTransferModeSwitch: 1,
      HostOnlineSwitch: 1,
      HostRemoteSwitch: 1,
    }
    this.chargeActionsPermission = {
      NormalCharge: 0,
      DeepCharge: 0,
      StopDeepCharge: 0,
    }
    this.taskDispatchPermission = {
      LocalOrderDispatchWhenHostRemote: 0
    }

  }
}