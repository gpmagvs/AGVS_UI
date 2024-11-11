import { createStore } from 'vuex'
import { Login, StoreToLocalStorage, UserRouteChange } from '@/api/UserAPI';
import { GetAllSlotsOptions } from '@/api/WIPAPI'
import { clsUserLoginState } from '@/api/AuthHelper'
import MapAPI from '@/api/MapAPI'
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import { DeviceConfig } from '@/ViewModels/EndDeviceOption.js'
import { AGVSSystemConfigs } from '@/ViewModels/SystemConfigs'
import param from '@/gpm_param.js'
import axios from 'axios'
var cachesKeyMap = {
  agvStates: 'agv_states'
}

export default createStore({

  state: {
    websiteSetting: {
      FieldName: 'UMTC'
    },
    systemConfigs: new AGVSSystemConfigs(),
    vmsAppInfo: {
      AppVersion: "1.0.0"
    },
    regularHotRunStates: {
      state: 'stopped',
      scriptID: '',
      unloaderStates: {}
    },
    isCtrlPressing: false
  },
  getters: {
    GetWebsiteSetting: (state) => { return state.websiteSetting; },
    FieldName: (state) => { return state.websiteSetting.FieldName },
    APPVersion: (state) => { return state.websiteSetting.APPVersion }
  },
  mutations: {
    setAgvsystemConfigs(state, configs) {
      state.websiteSetting = configs
    },
    setSystemConfigs(state, configs) {
      state.systemConfigs = configs
    },
    setVmsAppInfo(state, info) {
      state.vmsAppInfo = info
    },
    setRegularHotRunState(state, info) {
      state.regularHotRunStates = info;
      console.log(state.regularHotRunStates);
    },
    setCtrlKeyPressing(state, isPressed) {
      state.isCtrlPressing = isPressed;
    }
  },
  actions: {
    async GetDynamicWebsiteData({ commit }, user) {
      var response = await axios.get(`${param.backend_host}/api/system/website`)

      commit('setAgvsystemConfigs', response.data)
      return response.data;
    },
    async DownloadSystemConfigs({ commit }) {
      var response = await axios.get(`${param.backend_host}/api/system/systemconfigs`)
      commit('setSystemConfigs', response.data)
      return response.data;
    },
    async DownloadVMSAppInfo({ commit }) {
      var response = await axios.get(`${param.vms_host}/api/system/GetVMSAppInfo`)
      commit('setVmsAppInfo', response.data)
      return response.data;
    }
  }
})

/**車輛狀態儲存 */
export const agv_states_store = createStore({
  state: {
    agv_states: [new clsAGVStateDto()],
    hotrun_states: [],

  },
  getters: {
    AGVStatesData: state => {
      if (state.agv_states) {

        return state.agv_states;
      }
      else {
        var _cache = localStorage.getItem(cachesKeyMap.agvStates)
        if (_cache != null) {
          var cacheData = JSON.parse(_cache)

          return cacheData;
        } else
          return [new clsAGVStateDto()]
      }
    },
    AGVNameList: state => {
      if (state.agv_states)
        return state.agv_states.map(agv => agv.AGV_Name)
      else
        return []
    },
    AGVIPCollection: state => {
      if (state.agv_states)
        return state.agv_states.map(agv => agv.IP)
      else
        return []
    },
    HotRunStates: state => state.hotrun_states,
    VehicleSize: state => (name) => {
      if (!state.agv_states)
        return [0, 0]
      var agv = state.agv_states.find(agv => agv.AGV_Name == name);
      if (agv)
        return [agv.VehicleLength, agv.VehicleWidth]
      else
        return [0, 0]
    }
  },
  mutations: {
    storeAgvStates(state, data) {
      state.agv_states = data;
    },
    setHotRunStates(state, data) {
      state.hotrun_states = data
    }
  }
})

/**系統參數設定狀態管理 */
export const agvs_settings_store = createStore({
  state: {
    sys_settings: {
      operations: {
        system_run_mode: false,
        host_online_mode: false,
        host_remote_mode: false,
        transfer_mode: false
      }
    }
  },
  mutations: {
    setOperations(state, operations) {
      state.sys_settings.operations = operations
    },
    setRunMode(state, actived) {
      state.sys_settings.operations.system_run_mode = actived
    },
    setHostOnline(state, actived) {
      state.sys_settings.operations.host_online_mode = actived
    },
    setHostRemote(state, actived) {
      state.sys_settings.operations.host_remote_mode = actived
    },
    setTransferRemote(state, actived) {
      state.sys_settings.operations.transfer_mode = actived
    }
  },
  actions: {

  },
  getters: {
    IsRunMode: state => {
      return state.sys_settings.operations.system_run_mode;
    },

  },
  // modules: {
  // }
})

/**用戶狀態管理 */
export const userStore = createStore({
  state: {
    user: new clsUserLoginState(),
    current_route: '',
    web_user_id: ''
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      StoreToLocalStorage(user)
    },
    setUserID(state, user_id) {
      state.web_user_id = user_id;
      console.log(user_id);
    },
    setRoute(state, route) {
      state.current_route = route;
      console.log(route);
    },
    updateCurrentUserPermission(state, newPermission) {
      state.user.Permission = newPermission;
    }
  },
  actions: {
    async login({ commit }, user) {
      var server_reply = await Login(user);
      var loginState = new clsUserLoginState();
      Object.assign(loginState, server_reply);
      if (loginState.Success) {
        loginState.LoginTime = Date.now();
      }
      commit('setUser', loginState);
      console.log(loginState);
      return { confirm: loginState.Success, message: loginState.Message }
    },

    logout({ commit }) {
      commit('setUser', new clsUserLoginState())
    },
    async user_route_change({ commit, state }, route) {
      commit('setRoute', route);
      var result = await UserRouteChange(state.web_user_id, route)
      return result
    }
  },
  getters: {
    // enum ERole
    // {
    //     VISITOR = -1,
    //     Operator = 0,
    //     Engineer = 1,
    //     Developer = 2,
    //     GOD = 3,
    // }
    IsLogin: state => {
      return state.user != null && state.user.Success;
    },
    IsOPLogining: (state, getters) => {
      if (!getters.IsLogin)
        return false;
      return state.user.Role == 0;
    },
    IsEngineerLogining: (state, getters) => {
      if (!getters.IsLogin)
        return false;
      return state.user.Role == 1;
    },
    IsDeveloperLogining: (state, getters) => {
      if (!getters.IsLogin)
        return false;
      if (state.user.Role != 2 && state.user.Role != 3)
        return false;
      return true;
    },
    level: state => {
      if (state.user)
        return state.user.Role
      else
        return -1
    },
    UserName: state => {
      if (state.user)
        return state.user.UserName
      else
        return ""
    },
    WebUserID: state => {
      return state.web_user_id;
    }

  },
})

export const UIStore = createStore({
  state: {
    locus: {
    },
    EqpAlarmShowState: false,
    SystemAlarmShowState: false,
    VMSAliveState: false
  },
  mutations: {
    IsSystemAlarmShowing(state, show) {
      state.SystemAlarmShowState = show
    },
    IsEqpAlarmShowing(state, show) {
      state.EqpAlarmShowState = show
    },
    SetVMSAlive(state, alive) {
      state.VMSAliveState = alive;
    }
  },
  getters: {
    SystemAlarmShowState: state => state.SystemAlarmShowState,
    EqpAlarmShowState: state => state.EqpAlarmShowState,
    VMSAlive: state => state.VMSAliveState
  }
})

/**設備狀態管理 */
export const EqStore = createStore({
  state: {
    EQ: [],
    ChargeStation: { 'charge1': {} },
    EqOptions: [DeviceConfig],
    WIPOptions: [],
    WIPsData: [],
    ChargeStationDataReceived: false,
    WIPSlotOptions: {
      2: ["1", "2", "3"] // key:TagNumber , value : string[]
    }
  },
  getters: {
    EQData: state => {
      return state.EQ;
    },
    ChargeStationData: state => {
      return state.ChargeStation;
    },
    EqOptions: state => state.EqOptions,
    WIPData: state => state.WIPsData,
    WIPOptions: state => state.WIPOptions,
    GetRowsByStationTag: state => (tag) => {
      return 3
    },
    GetWIPSlotsOptionsByStationTag: state => (tag) => {
      return state.WIPSlotOptions[tag]
    },
    AnyTwoLayerEqExist: state => {
      try {

        var tagExist = [...new Set(state.EqOptions.map(eq => eq.TagID))]
        var tagHeightCombine = [...new Set(state.EqOptions.map(eq => eq.TagID + '-' + eq.Height))]
        return tagExist.length != tagHeightCombine.length;
      } catch (error) {
        return false;
      }
    }
  },
  mutations: {
    setData(state, data) {
      state.EQ = data.EQPData
      state.ChargeStation = data.ChargeStationData
      state.WIPsData = data.WIPsData
      state.ChargeStationDataReceived = true
    },
    EqOptions(state, option) {
      state.EqOptions = option
    },
    WIPOptions(state, option) {
      state.WIPOptions = option
    },
    wipSlotOptions(state, options) {
      state.WIPSlotOptions = options;
      console.info(state.WIPSlotOptions)
    }
  },
  actions: {
    async FetchWIPSlotOptions({ commit }) {
      var result = await GetAllSlotsOptions()
      commit("wipSlotOptions", result)
    }
  }
})


/**任務狀態管理 */
export const TaskStore = createStore({
  state: {
    IncompletedTaskListData: [],
    CompletedTaskListData: []
  },
  getters: {
    IncompletedTaskList: state => state.IncompletedTaskListData,
    CompletedTaskList: state => state.CompletedTaskListData,
  },
  mutations: {
    StoreTaskData(state, payload) {
      state.CompletedTaskListData = payload.completeds;
      state.IncompletedTaskListData = payload.incompleteds;
    }
  }
})


/**異常管理 */
export const AlarmStore = createStore({
  state: {
    alarmsCollection: [],
  },
  getters: {
    alarms: state => state.alarmsCollection,
  },
  mutations: {
    StoreAlarmData(state, payload) {
      state.alarmsCollection = payload;
    }
  }
})
