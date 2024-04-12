import { createStore } from 'vuex'
<<<<<<< HEAD
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
=======
import { Login } from '@/api/UserAPI';
import UserInfo from '@/ViewModels/UserInfo.js'
import VMSData from '@/ViewModels/VMSData';
import clsSensorStatus from '@/ViewModels/clsSensorStatus';
import { ClearAlarm, GetWorkstationsData, WorkStationModbusIOTest, MapAPI } from '@/api/VMSAPI.js'
import bus from '@/event-bus';
import { ROS_STORE } from './ros_store';
export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})

export var UIStore = createStore({
  state: {
    UI_Version: "01.22.1",
    PreviousControllRoute: 'move',
    CurrentTabSelected: 0,
    ConnectionStateData: {},
  },
  getters: {
    CurrentUIVersion: state => {
      return state.UI_Version;
    },
    PreviousControllRoute: state => {
      return state.PreviousControllRoute;
    },
    CurrentTabSelected: state => state.CurrentTabSelected,
    ConnectionState: state => state.ConnectionStateData
  },
  mutations: {
    SetPreviousControllerRoute(state, route) {
      state.PreviousControllRoute = route;
    },
    SetCurrentTabSelected(state, tab) {
      state.CurrentTabSelected = tab;
    },
    StoreConnectionState(state, payload) {
      state.ConnectionStateData = payload;
    }
  },
  actions: {


  }
})

export var RDTestDataStore = createStore({
  state: {
    TestData: {
      move_test: {
        duration: 0,
        state: 0
      }
    }
  },
  getters: {
    testData: state => {
      return state.TestData;
    }
  },
  mutations: {
    SetData(state, data) {
      state.TestData = data;
    }
  },
  actions: {

  }
})

/**系統訊息STORE */
export var SystemMsgStore = createStore({
  state: {
    SysMessages: {
      ReportIndex: -1,
      Messages: []
    }
  },
  getters: {
    SysMessages: state => {
      return state.SysMessages.Messages;
    },
    ReportIndex: state => {
      return state.SysMessages.ReportIndex
    },
    LastReportIndex: state => {
      var index = localStorage.getItem('sys_msg_report_index');
      if (index)
        return parseInt(index)
      else
        return -1;
    }
  },
  mutations: {
    updateStatus(state, data) {
      if (state.SysMessages.ReportIndex != data.ReportIndex) {
        localStorage.setItem('sys_msg_report_index', data.ReportIndex + '')
      }
      state.SysMessages = data
    }
  },
  actions: {
    Update({ commit }, data) {
      commit('updateStatus', data)
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    }
  }
})

<<<<<<< HEAD
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
=======
/**AGV狀態STORE */
export var AGVStatusStore = createStore({
  state: {
    AGVStatus: new VMSData(),
    SensorStatus: {
      LaserFront: new clsSensorStatus('前方雷射', 0, 155),
      LaserBack: new clsSensorStatus('後方雷射', 0, -155, 'bottom'),
      LaserRight: new clsSensorStatus('右方雷射', 80, -125, 'right-bottom'),
      LaserLeft: new clsSensorStatus('左方雷射', -80, -125, 'left-bottom'),
      Bumper: new clsSensorStatus('Bumper', 70, 155, 'right-top'),
      Bumper_back: new clsSensorStatus('Bumper', 70, -155, 'right-bottom'),
      RightWheel: new clsSensorStatus('右輪馬達', 40, 30, 'right'),
      LeftWheel: new clsSensorStatus('左輪馬達', -35, 30, 'left'),
      VerticalWheel: new clsSensorStatus('垂直軸馬達', -35, -85, 'left'),
      Battery: new clsSensorStatus('電池', 15, -85, 'right', 30),
      ForkFrontendObstacle: new clsSensorStatus('牙叉障礙物', -40, 120, 'left-bottom'),
      // VerticalBelt: new clsSensorStatus('垂直軸馬達皮帶', 30, -85, 'right-top'),
      // ForkArmPosition: new clsSensorStatus('牙叉伸縮位置', 40, 120, 'right-bottom'),
      // SickLidar: new clsSensorStatus('Sick'),
    }
  },
  getters: {
    AGVStatus: state => {
      return state.AGVStatus;
    },
    AMCAGVSensorState: state => {
      return state.AGVStatus.AMCAGVSensorState
    },
    IsOnline: state => {
      return state.AGVStatus.OnlineMode == 1;
    },
    IsAuto: state => {
      return state.AGVStatus.AutoMode == 1;
    },
    IsAGVInitializing: state => {
      return state.AGVStatus.SubState == 'Initializing'
    },
    InitializingStatusText: state => {
      return state.AGVStatus.InitializingStatusText;
    },
    AGVName: state => {
      return state.AGVStatus.CarName;
    },
    AlarmCodes: state => {
      return state.AGVStatus.AlarmCodes.filter(alarm => alarm.Code != 0);
    },
    AlarmGroup: state => {
      return state.AGVStatus.AlarmsGroup;
    },
    /**是否為巡檢AGV */
    IsInspectionAGV: state => {
      return state.AGVStatus.Agv_Type == 2;
    },
    /**是否為Fork AGV */
    IsForkAGV: state => {
      return state.AGVStatus.Agv_Type == 0;
    },
    /**是否可伸縮牙叉 */
    IsForkExtenable: state => state.AGVStatus.IsForkExtenable,
    CurrentPose: state => {
      return state.AGVStatus.Pose;
    },
    CurrentAngle: state => {
      return state.AGVStatus.Angle;
    },
    BatteryStatus: (state, getters) => {
      return state.AGVStatus.BatteryStatus
    },
    Battery1Status: (state, getters) => {
      try {
        return getters.BatteryStatus.filter(bat => bat.BatteryID == 1)[0]
      } catch (error) {
        return undefined
      }
    },
    Battery2Status: (state, getters) => {
      try {
        return getters.BatteryStatus.filter(bat => bat.BatteryID == 2)[0]
      } catch (error) {
        return undefined
      }
    },
    Bat1Lockable: (state, getters) => {
      if (!getters.Battery1Status)
        return true;
      var bat_lock_sensor_info = getters.Battery1Status.SensorInfo;
      return bat_lock_sensor_info.IsUnlockSensorON || (!bat_lock_sensor_info.IsUnlockSensorON && !bat_lock_sensor_info.IsLockSensorON);

    },
    Bat1UnLockable: (state, getters) => {
      if (!getters.Battery1Status)
        return true;
      var bat_lock_sensor_info = getters.Battery1Status.SensorInfo;
      return bat_lock_sensor_info.IsLockSensorON || (!bat_lock_sensor_info.IsUnlockSensorON && !bat_lock_sensor_info.IsLockSensorON);

    },
    Bat2Lockable: (state, getters) => {
      if (!getters.Battery2Status)
        return true;
      var bat_lock_sensor_info = getters.Battery2Status.SensorInfo;
      return bat_lock_sensor_info.IsUnlockSensorON || (!bat_lock_sensor_info.IsUnlockSensorON && !bat_lock_sensor_info.IsLockSensorON);
    },
    Bat2UnLockable: (state, getters) => {
      if (!getters.Battery2Status)
        return true;
      var bat_lock_sensor_info = getters.Battery2Status.SensorInfo;
      return bat_lock_sensor_info.IsLockSensorON || (!bat_lock_sensor_info.IsUnlockSensorON && !bat_lock_sensor_info.IsLockSensorON);
    },
    ForkHeight: state => {
      return state.AGVStatus.ZAxisDriverState.position
    },
    AGV_Sensors_States: state => {
      if (DIOStore.getters.DIOStates.Inputs == undefined) {
        return {}
      }
      var agv_status = state.AGVStatus
      //aim : 整合DIO狀態給出AGV周邊設備狀態
      state.SensorStatus.LaserFront.active = !DIOStore.getters.IsLaserFrontByass;
      state.SensorStatus.LaserFront.status = DIOStore.getters.IsLaserFrontAlarm ? 2 : (DIOStore.getters.IsLaserFrontWarning ? 1 : 0);
      state.SensorStatus.LaserBack.active = !DIOStore.getters.IsLaserBackByass;
      state.SensorStatus.LaserBack.status = DIOStore.getters.IsLaserBackAlarm ? 2 : (DIOStore.getters.IsLaserBackWarning ? 1 : 0);


      state.SensorStatus.LaserRight.active = !DIOStore.getters.IsLaserRightByass;
      state.SensorStatus.LaserRight.status = DIOStore.getters.IsLaserRightAlarm ? 2 : 0;

      state.SensorStatus.LaserLeft.active = !DIOStore.getters.IsLaserLeftByass;
      state.SensorStatus.LaserLeft.status = DIOStore.getters.IsLaserLeftAlarm ? 2 : 0;


      state.SensorStatus.Bumper.status = DIOStore.getters.IsBumperTrigger ? 2 : 0;
      state.SensorStatus.Bumper_back.status = DIOStore.getters.IsBumperTrigger ? 2 : 0;
      //Drivers
      state.SensorStatus.RightWheel.status = DIOStore.getters.IsRightMotorAlarm ? 2 : 0;

      state.SensorStatus.LeftWheel.status = DIOStore.getters.IsLeftMotorAlarm ? 2 : 0;

      state.SensorStatus.VerticalWheel.status = DIOStore.getters.IsVerticalMotorAlarm ? 2 : 0;
      // state.SensorStatus.VerticalBelt.status = DIOStore.getters.IsVerticalBeltAlarm ? 2 : 0;
      state.SensorStatus.ForkFrontendObstacle.status = DIOStore.getters.IsForkFronendObstacle ? 2 : 0;
      // state.SensorStatus.ForkArmPosition.status = !DIOStore.getters.Fork_ARM_States.IsArmAtHomePose ? 1 : 0;


      var isForkAGV = state.AGVStatus.Agv_Type == 0;

      state.SensorStatus.VerticalWheel.visible = isForkAGV
      state.SensorStatus.ForkFrontendObstacle.visible = isForkAGV
      // state.SensorStatus.VerticalBelt.visible = isForkAGV
      // state.SensorStatus.ForkArmPosition.visible = isForkAGV

      // state.SensorStatus.LaserFront.always_show_info =
      //   state.SensorStatus.LaserBack.always_show_info =
      //   state.SensorStatus.LaserRight.always_show_info =
      //   state.SensorStatus.LaserLeft.always_show_info =


      var Module_Information = ROS_STORE.getters.Module_Information
      if (Module_Information.Wheel_Driver) {
        var Wheel_DriverStates = Module_Information.Wheel_Driver.driversState;
        if (Wheel_DriverStates) {
          var LeftWheelDriver = Wheel_DriverStates[0];
          var RightWheelDriver = Wheel_DriverStates[1];
          var VerticalDriver = Module_Information.Action_Driver;
          var Battery = Module_Information.Battery
          state.SensorStatus.VerticalWheel.module_data = `電壓:${VerticalDriver.voltage / 100.0}V,電流:${VerticalDriver.outCurrent}mA,異常碼:${VerticalDriver.errorCode}`
          state.SensorStatus.RightWheel.module_data = `電壓:${RightWheelDriver.voltage / 100.0}V,電流:${RightWheelDriver.outCurrent}mA,異常碼:${RightWheelDriver.errorCode}`
          state.SensorStatus.LeftWheel.module_data = `電壓:${LeftWheelDriver.voltage / 100.0}V,電流:${LeftWheelDriver.outCurrent}mA,異常碼:${LeftWheelDriver.errorCode}`
          state.SensorStatus.Battery.module_data = `電量:${Battery.batteryLevel}%,放電電流:${Battery.dischargeCurrent}mA,充電電流:${Battery.chargeCurrent}mA,異常碼:${Battery.errorCode}`

        }
      }


      state.SensorStatus.Battery.always_show_info =
        state.SensorStatus.VerticalWheel.always_show_info =
        state.SensorStatus.RightWheel.always_show_info =
        state.SensorStatus.LeftWheel.always_show_info = true

      return state.SensorStatus;
    },
    CurrentTag: state => {
      return state.AGVStatus.BCR_State_MoveBase.tagID
    },
    /**AGV是否在進行EQ(TR_REQ ON) */
    IsHandshaking: (state) => {
      var signals = state.AGVStatus.HandShakeSignals
      if (signals)
        return signals.AGV.AGV_TR_REQ;
      else
        return false;
    },
    Handshake_Signals: state => {
      var signals = state.AGVStatus.HandShakeSignals
      if (signals)
        return state.AGVStatus.HandShakeSignals
      else {
        return {
          AGV: {
            AGV_BUSY: false,
            AGV_COMPT: false,
            AGV_READY: false,
            AGV_TR_REQ: false,
            AGV_VALID: false,
          },
          EQ: {
            EQ_BUSY: false,
            EQ_L_REQ: false,
            EQ_READY: false,
            EQ_U_REQ: false,
            EQ_GO: false,
          }
        }
      }
    },
    CurrentLaserMode: state => {
      return state.AGVStatus.Current_LASER_MODE
    },
    HSTimers: state => {
      return state.AGVStatus.HandShakeTimers
    },
    SysLoading: state => {
      return state.AGVStatus.SysLoading
    },
    BatteryCount: state => {
      return state.AGVStatus.BatteryStatus.length;
    },
    MapUseState: state => {
      return {
        AGV_Name: state.AGVStatus.CarName,
        Current_Tag: state.AGVStatus.Tag,
        Rotation: state.AGVStatus.Angle,
        State: state.AGVStatus.MainState,
        IsOnline: state.AGVStatus.OnlineMode == 1,
        Coordination: [state.AGVStatus.Pose.position.x, state.AGVStatus.Pose.position.y],
        CargoExist: state.AGVStatus.CargoExist,
        CargoID: state.AGVStatus.CST_Data,
      }
    },
    AGV_Naving_Tags: state => {
      return state.AGVStatus.NavInfo.PathPlan;
    },
    IMUMaxMinRecord: state => {
      return state.AGVStatus.IMUMaxMinValRecord
    }


  },
  mutations: {
    updateStatus(state, data) {
      state.AGVStatus = data
    }
  },
  actions: {
    async clear_alarm_with_code({ commit, getters, state }, code) {
      await ClearAlarm(code);
    }
  }
})

/**系統參數STORE */
export var SystemSettingsStore = createStore({
  state: {
    Settings: {

    }
  },
  getters: {
    Settings: state => {
      return state.Settings
    }
  },
  mutations: {
    setSettings(state, settings) {
      state.Settings = settings
    }
  }
})
/**用戶狀態STORE */
export var UserStore = createStore({
  state: {
    UserState: {
      UserName: 'OPERATOR',
      Role: 0
    }
  },
  getters: {
    CurrentUserName: state => {
      if (state.UserState.UserName)
        return state.UserState.UserName;
      else
        return 'OPERATOR'
    },
    IsVisitor: state => {
      return state.UserState.Role == 0;
    },
    IsGodUser: state => {
      return state.UserState.Role == 3;
    },
    IsDevUser: state => {
      return state.UserState.Role == 2;
    },
    IsEngUser: state => {
      return state.UserState.Role == 1;
    },
    CurrentUserRole: state => {
      return state.UserState.Role;
    },
    Operationable: (state, getters) => {
      if (getters.IsGodUser)
        return true;
      return (getters.IsUserLogin && !AGVStatusStore.getters.IsAuto && !AGVStatusStore.getters.IsOnline)
    }

  },
  mutations: {
    setUser(state, user_info) {
      state.UserState = user_info
      localStorage.setItem('user', JSON.stringify(user_info))
    }
  },
  actions: {
    async Login({ commit }, login_info) {
      var response_data = await Login(login_info)
      if (response_data != undefined) {
        var _UserInfo = new UserInfo(response_data.UserName, response_data.Role);
        commit('setUser', _UserInfo)
      }
      else {
        commit('setUser', {})
      }

      return response_data;
    },
    Logout({ commit }) {
      commit('setUser', {
        UserName: 'OPERATOR',
        Role: 0
      }
      )
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    }
  }
})

<<<<<<< HEAD
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
=======

/**DIO狀態STORE */
export var DIOStore = createStore({
  state: {
    DIOStates: {
      Inputs: [],
      Outputs: []
    }
  },
  getters: {
    DIOStates: state => {
      return state.DIOStates;
    },
    IsE84UseEmu: state => {
      if (state.DIOStates.IsE84HsUseEmulator == undefined)
        return false;
      return state.DIOStates.IsE84HsUseEmulator
    },
    E84_AGV: state => {
      if (state.DIOStates.Outputs == undefined) {
        return [0, 0, 0, 0, 0, 0, 0, 0]
      }
      let outputs = [];
      var agv_e84_address = ['Y0020', 'Y0021', 'Y0022', 'Y0023', 'Y0024', 'Y0025', 'Y0026', 'Y0027']
      for (let index = 0; index < agv_e84_address.length; index++) {
        var address = agv_e84_address[index];
        var register_state = state.DIOStates.Outputs.find(reg => reg.Address + '' == address + '')
        outputs.push(register_state.State ? 1 : 0)
      }
      return outputs
    },
    DemoMiniAGVBatteryStatus: state => {

      var bat1_exist_1 = state.DIOStates.Inputs.find(reg => reg.Address + '' == 'X0017').State;
      var bat1_exist_2 = state.DIOStates.Inputs.find(reg => reg.Address + '' == 'X0018').State;

      var bat2_exist_1 = state.DIOStates.Inputs.find(reg => reg.Address + '' == 'X0010').State;
      var bat2_exist_2 = state.DIOStates.Inputs.find(reg => reg.Address + '' == 'X0011').State;

      var bat1Installed = !bat1_exist_1 && bat1_exist_2;
      var bat2Installed = !bat2_exist_1 && bat2_exist_2;

      var bat1Installing = bat1_exist_1 && bat1_exist_2;
      var bat2Installing = bat2_exist_1 && bat2_exist_2;

      var bat1Removed = bat1_exist_1 && !bat1_exist_2;
      var bat2Removed = bat2_exist_1 && !bat2_exist_2;

      var GetState = (isInstalled, isInstalling, IsRemoved) => {
        if (isInstalled)
          return 'installed';
        else if (isInstalling)
          return 'installing';
        else if (IsRemoved)
          return 'removed';
      }
      return {
        battery1: GetState(bat1Installed, bat1Installing, bat1Removed),
        battery2: GetState(bat2Installed, bat2Installing, bat2Removed),
      }

    },
    E84_EQ: state => {

      let outputs = [];
      if (state.DIOStates.IsE84HsUseEmulator) {
        if (state.DIOStates.Outputs == undefined) {
          return [0, 0, 0, 0, 0, 0, 0, 0]
        }
        var eq_e84_address = ['Y0000', 'Y0001', 'Y0002', 'Y0003', 'Y0004', 'Y0005', 'Y0006', 'Y0007']
        for (let index = 0; index < eq_e84_address.length; index++) {
          var address = eq_e84_address[index];
          var register_state = state.DIOStates.Outputs.find(reg => reg.Address + '' == address + '')
          outputs.push(register_state.State ? 1 : 0)
        }
      }
      else {
        if (state.DIOStates.Inputs == undefined) {
          return [0, 0, 0, 0, 0, 0, 0, 0]
        }
        var eq_e84_address = ['X0020', 'X0021', 'X0022', 'X0023', 'X0024', 'X0025', 'X0026', 'X0027']
        for (let index = 0; index < eq_e84_address.length; index++) {
          var address = eq_e84_address[index];
          var register_state = state.DIOStates.Inputs.find(reg => reg.Address + '' == address + '')
          outputs.push(register_state.State ? 1 : 0)
        }
      }

      return outputs
    },
    Fork_ARM_States: state => {

      if (state.DIOStates.Inputs == undefined) {
        return {
          IsArmAtHomePose: false,
          IsArmAtEndPose: true
        }
      }
      var Inputs = state.DIOStates.Inputs;
      var IsArmAtHomePose = !Inputs.find(reg => reg.Address == 'X0001').State
      var IsArmAtEndPose = !Inputs.find(reg => reg.Address == 'X0000').State

      return {
        IsArmAtHomePose: IsArmAtHomePose,
        IsArmAtEndPose: IsArmAtEndPose
      }
    },
    IsLaserFrontAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0032').State
    },

    IsLaserFrontWarning: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      var region1 = !Inputs.find(reg => reg.Address == 'X0030').State
      var region2 = !Inputs.find(reg => reg.Address == 'X0031').State
      var region3 = !Inputs.find(reg => reg.Address == 'X0032').State
      return (region1 | region2) & !region3
    },

    IsLaserBackAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0036').State
    },

    IsLaserBackWarning: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      var region1 = !Inputs.find(reg => reg.Address == 'X0034').State
      var region2 = !Inputs.find(reg => reg.Address == 'X0035').State
      var region3 = !Inputs.find(reg => reg.Address == 'X0036').State
      return (region1 | region2) & !region3
    },

    IsLaserRightAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X000F').State
    },

    IsLaserLeftAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X000E').State
    },

    IsLaserFrontByass: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Outputs = state.DIOStates.Outputs;
      return Outputs.find(reg => reg.Name == 'Front_LsrBypass').State
    },
    IsLaserBackByass: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Outputs = state.DIOStates.Outputs;
      return Outputs.find(reg => reg.Name == 'Back_LsrBypass').State
    },
    IsLaserLeftByass: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Outputs = state.DIOStates.Outputs;
      return Outputs.find(reg => reg.Name == 'Left_LsrBypass').State
    },
    IsLaserRightByass: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Outputs = state.DIOStates.Outputs;
      return Outputs.find(reg => reg.Name == 'Right_LsrBypass').State
    },
    IsBumperTrigger: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X000A').State
    },
    IsRightMotorAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0015').State
    },

    IsLeftMotorAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0017').State
    },

    IsVerticalMotorAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0019').State
    },
    IsVerticalBeltAlarm: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X002C').State
    },
    IsForkFronendObstacle: state => {
      if (state.DIOStates.Inputs == undefined)
        return false
      var Inputs = state.DIOStates.Inputs;
      return !Inputs.find(reg => reg.Address == 'X0011').State
    },


  },
  mutations: {
    updateStatus(state, data) {
      state.DIOStates = data
    }
  }
})

export var ForkTeachStore = createStore({
  state: {
    HasAnyChanged: false
  },
  getters: {
    IsAnyChanged: state => {
      return state.HasAnyChanged;
    }
  },
  mutations: {
    setIsAnyChanged(state, HasAnyChanged) {
      state.HasAnyChanged = HasAnyChanged;
    },
  }
})


export var WorkstationStore = createStore({
  state: {
    Workstations: {}
  },
  getters: {
    Workstations: state => {
      return state.Workstations;
    }
  },
  mutations: {
    setIsAnyChanged(state, HasAnyChanged) {
      state.HasAnyChanged = HasAnyChanged;
    },
    store(state, data) {
      state.Workstations = data;
    }
  },
  actions: {
    GetWorkStationData({ commit }) {
      GetWorkstationsData().then(workstation_data => {
        commit('store', workstation_data);
      })
    },
    ModbusIOTestStart({ commit }, tag) {
      return WorkStationModbusIOTest(tag).then(dat => {
        return dat
      })
    }
  }
})

export var map_store = createStore({
  state: {
    MapData: {}
  },
  getters: {
    GetMapData: state => {
      return state.MapData;
    }
  },
  mutations: {
    SetMapData(state, data) {
      var keys = Object.keys(data.Points);
      keys.forEach(key => {
        var point = data.Points[key];
        if (point && (point.X > 500 || point.Y > 500)) {
          console.log(`Point[${point.Graph.Display}] remove because coordination too large .(${point.X},${point.Y})`);
          delete data.Points[key]
        }
      });

      state.MapData = data;

      console.log('map stored', state.MapData)
    }
  },
  actions: {
    async ReloadMapFromAGVS({ commit }, currentMapName) {
      var res = await MapAPI.ReloadMapFromAGVS(currentMapName);
      console.log(res)

      if (!res || !res.confirm) {

      } else {
        commit("SetMapData", res.map)
      }

      return res;
    }
  }
})
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
