import { createStore } from 'vuex'
import { Login, StoreToLocalStorage, UserRouteChange } from '@/api/UserAPI';
import MapAPI from '@/api/MapAPI'
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"

var cachesKeyMap = {
  agvStates: 'agv_states'
}

export default createStore({

  state: {
    configs: {

    }
  },
  mutations: {
    setConfigs(state, configs) {
      state.configs = configs
    }
  },
  actions: {
    SetConfig({ commit }, configs) {
      commit('setConfigs', configs)
    }
  }
})

export const agv_states_store = createStore({
  state: {
    agv_states: undefined,
    hotrun_states: [],

  },
  getters: {
    AGVStatesData: state => {
      if (state.agv_states && state.agv_states.length != 0) {

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
      if (data.length > 0)
        localStorage.setItem(cachesKeyMap.agvStates, JSON.stringify(data));
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
    user: null,
    current_route: '',
    web_user_id: ''
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      if (user) {
        StoreToLocalStorage(user)
      } else {
        localStorage.removeItem('user')
      }
    },
    setUserID(state, user_id) {
      state.web_user_id = user_id;
      console.log(user_id);
    },
    setRoute(state, route) {
      state.current_route = route;
      console.log(route);
    },
  },
  actions: {
    async login({ commit }, user) {
      var server_reply = await Login(user);
      if (server_reply.Success) {
        commit('setUser', server_reply);
      } else {
        commit('setUser', null);
      }
      console.log(server_reply);
      return { confirm: server_reply.Success, message: server_reply.Message }
    },

    logout({ commit }) {
      commit('setUser', null)
    },
    async user_route_change({ commit, state }, route) {
      commit('setRoute', route);
      var result = await UserRouteChange(state.web_user_id, route)
      return result
    }
  },
  getters: {
    IsLogin: state => {
      return state.user != null;
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
    IsDeveloperLogining: state => {
      if (state.user == null)
        return false;
      if (state.user.Role != 2 && state.user.Role != 3)
        return false;
      return true;
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

export const EqStore = createStore({
  state: {
    EQ: [],
    ChargeStation: { 'charge1': {} },
    EqOptions: [],
    WIPOptions: [],
    WIPsData: []
  },
  getters: {
    EQData: state => {
      return state.EQ;
    },
    ChargeStationData: state => {
      return state.ChargeStation;
    },
    EqOptions: state => state.EqOptions,
    WIPData: state => state.WIPsData
  },
  mutations: {
    setData(state, data) {
      state.EQ = data.EQPData
      state.ChargeStation = data.ChargeStationData
      state.WIPsData = data.WIPsData
    },
    EqOptions(state, option) {
      state.EqOptions = option
    },
    WIPOptions(state, option) {
      state.WIPOptions = option
    }
  },
  actions: {
  }
})

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
